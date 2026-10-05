#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include "comando.h"
#if __has_include("config.local.h")
#include "config.local.h"
#elif defined(CLACK_CI)
#include "config.example.h"
#else
#error "Copie include/config.example.h para include/config.local.h e preencha a configuracao."
#endif

MFRC522 rfid(5, RFID_RST_PIN);
Servo travaServo;
int estadoAtualTrava = -1;
unsigned long ultimaConsulta = 0;
unsigned long ultimaConexao = 0;
constexpr unsigned long INTERVALO_CONSULTA = 2000;
constexpr unsigned long INTERVALO_RECONEXAO = 10000;

void conectarWiFi();
void consultarComando();

void prepararHttp(HTTPClient& http) {
  http.setConnectTimeout(2000);
  http.setTimeout(2000);
}

void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(0);
  travaServo.setPeriodHertz(50);
  travaServo.attach(SERVO_PIN, 500, 2400);
  // Comportamento de partida legado: ainda requer validacao mecanica e sensores.
  travaServo.write(SERVO_FECHADO);
  estadoAtualTrava = SERVO_FECHADO;
  SPI.begin(18, 19, 23, 5);
  rfid.PCD_Init();
  WiFi.mode(WIFI_STA);
  conectarWiFi();
  Serial.println("[Clack] Hardware inicializado; acesso offline ainda nao implementado.");
}

void conectarWiFi() {
  ultimaConexao = millis();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("[Wi-Fi] Tentando conectar...");
}

void consultarComando() {
  ultimaConsulta = millis();
  HTTPClient http;
  prepararHttp(http);
  String url = String(SERVER_URL) + "?acao=status&sala=" + String(SALA_ID);
  http.begin(url);
  int codigo = http.GET();
  String resposta = codigo == 200 ? http.getString() : "";
  resposta.trim();
  Comando comando = interpretarComando(codigo, resposta.c_str());
  http.end();
  if (comando == Comando::Ignorar) {
    Serial.printf("[HTTP] Sem comando valido (%d); mantendo a trava.\n", codigo);
    return;
  }
  int angulo = comando == Comando::Abrir ? SERVO_ABERTO : SERVO_FECHADO;
  if (angulo != estadoAtualTrava) {
    travaServo.write(angulo);
    estadoAtualTrava = angulo;
    Serial.printf("[Trava] Comando %s, angulo %d; sem sensor de confirmacao.\n",
      comando == Comando::Abrir ? "abrir" : "fechar", angulo);
  }
}

void loop() {
  unsigned long agora = millis();
  if (WiFi.status() != WL_CONNECTED) {
    if (agora - ultimaConexao >= INTERVALO_RECONEXAO) conectarWiFi();
    delay(10);
    return; // Etapa futura: validacao local e fila persistente.
  }
  if (agora - ultimaConsulta >= INTERVALO_CONSULTA) consultarComando();
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  String uid;
  for (byte i = 0; i < rfid.uid.size; ++i) {
    if (i) uid += ':';
    if (rfid.uid.uidByte[i] < 0x10) uid += '0';
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  Serial.println("[RFID] " + uid);
  HTTPClient http;
  prepararHttp(http);
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int codigo = http.POST("acao=ler_tag&sala=" + String(SALA_ID) + "&uid=" + uid);
  Serial.printf("[HTTP POST] %d\n", codigo);
  if (codigo > 0) Serial.println(http.getString());
  http.end();
  // O GET valida comando exato; o corpo do POST nunca e usado como comando.
  if (codigo == 200) consultarComando();
  // Sem reenvio automatico do POST: a regra legada alterna estado.
  delay(500);
}
