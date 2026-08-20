#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>

// 1. Configurações de Rede
const char* ssid = "Meireles";
const char* password = "65144392091";

// Substitua pelo IPv4 do computador (ipconfig)
const char* serverBase = "http://192.168.0.119/clack/api_hardware.php";

// 2. Configuração dos Pinos do Leitor RFID (VSPI)
#define SS_PIN  5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

// 3. Configuração do Servo Motor SG90
#define PINO_SERVO 4
Servo travaServo;

// Ângulos da trava mecânica (Invertidos para bater com o físico)
const int ANGULO_TRANCADO = 180;   // Porta trancada
const int ANGULO_ABERTO   = 0;     // Porta destrancada
int estadoAtualTrava = -1;         // Guarda o último estado aplicado

// 4. Variáveis de Controle
const int ID_SALA = 1; // Sala 204
unsigned long tempoAnterior = 0;
const long intervaloPolling = 2000;

// Variáveis para controle da reconexão Wi-Fi sem travar o código
unsigned long ultimaTentativaConexao = 0;
const long intervaloTentativaConexao = 10000; // Tenta reconectar a cada 10 segundos se cair

void conectarWiFi() {
  Serial.print("Conectando ao Wi-Fi");
  WiFi.begin(ssid, password);
  
  // Timeout curto no setup para não travar infinito se o roteador demorar
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 20) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Conectado com sucesso!");
    Serial.print("[Wi-Fi] IP da ESP32: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Falha na conexao inicial. Tentando em segundo plano...");
  }
}

void setup() {
  Serial.begin(115200);

  // Inicialização segura do Servo no setup para posição inicial
  ESP32PWM::allocateTimer(0);
  travaServo.setPeriodHertz(50); 
  travaServo.attach(PINO_SERVO, 500, 2400); 
  travaServo.write(ANGULO_TRANCADO);
  delay(300);
  travaServo.detach(); // Alivia o motor logo na inicialização
  estadoAtualTrava = ANGULO_TRANCADO;

  // Conexão Wi-Fi Inicial
  conectarWiFi();

  // Inicializa RFID
  SPI.begin();
  rfid.PCD_Init();
  
  Serial.println("[Sistema] RFID e Servo prontos. Clack online!");
}

void loop() {
  unsigned long tempoAtual = millis();

  // VERIFICAÇÃO CONTÍNUA DE WI-FI: Se caiu, tenta reconectar sem travar o loop
  if (WiFi.status() != WL_CONNECTED) {
    if (tempoAtual - ultimaTentativaConexao >= intervaloTentativaConexao) {
      ultimaTentativaConexao = tempoAtual;
      Serial.println("[Wi-Fi] Conexão perdida. Tentando reconectar...");
      WiFi.disconnect();
      WiFi.begin(ssid, password);
    }
    return; // Pula o loop se estiver sem internet para evitar travamentos de HTTP
  }

  // TAREFA 1: Polling do Servidor para Movimentar o Servo com Alívio (Detach)
  if (tempoAtual - tempoAnterior >= intervaloPolling) {
    tempoAnterior = tempoAtual;

    HTTPClient http;
    String url = String(serverBase) + "?acao=status&sala=" + String(ID_SALA);
    
    http.begin(url);
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();

      if (payload.indexOf("abrir") >= 0) {
        if (estadoAtualTrava != ANGULO_ABERTO) {
          travaServo.attach(PINO_SERVO, 500, 2400); // Liga o sinal PWM do motor
          travaServo.write(ANGULO_ABERTO);
          delay(350); // Tempo para o motor girar até o fim do curso
          travaServo.detach(); // Desliga o sinal PWM para aliviar a corrente da ESP32
          
          estadoAtualTrava = ANGULO_ABERTO;
          Serial.println("[Trava] Girando para ABERTO (0 graus) e aliviado.");
        }
      } else {
        if (estadoAtualTrava != ANGULO_TRANCADO) {
          travaServo.attach(PINO_SERVO, 500, 2400); // Liga o sinal PWM do motor
          travaServo.write(ANGULO_TRANCADO);
          delay(350); // Tempo para o motor girar até o fim do curso
          travaServo.detach(); // Desliga o sinal PWM para aliviar a corrente da ESP32
          
          estadoAtualTrava = ANGULO_TRANCADO;
          Serial.println("[Trava] Girando para FECHADO (180 graus) e aliviado.");
        }
      }
    } else {
      Serial.printf("[HTTP GET] Falha: %d\n", httpCode);
    }
    http.end();
  }

  // TAREFA 2: Leitura do Cartão NFC
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uidCard = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      uidCard += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
      uidCard += String(rfid.uid.uidByte[i], HEX);
      if (i < rfid.uid.size - 1) uidCard += ":";
    }
    uidCard.toUpperCase();

    Serial.println("\n[RFID] Tag detectada: " + uidCard);

    HTTPClient http;
    http.begin(serverBase);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String dadosPost = "acao=ler_tag&sala=" + String(ID_SALA) + "&uid=" + uidCard;
    int postCode = http.POST(dadosPost);

    if (postCode > 0) {
      String resposta = http.getString();
      Serial.println("[Servidor] " + resposta);
    } else {
      Serial.printf("[HTTP POST] Falha: %d\n", postCode);
    }
    http.end();

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(1000);
  }
}