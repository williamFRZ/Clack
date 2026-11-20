#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <Preferences.h>
#include <stddef.h>
#include "controle_armario.h"

// Mesma pinagem da montagem informada para a tranca 204.
constexpr int PINO_SS = 5, PINO_RST = 22, PINO_SCK = 18;
constexpr int PINO_MISO = 19, PINO_MOSI = 23, PINO_SERVO = 13;
constexpr int ANGULO_ABERTO = 0, ANGULO_FECHADO = 180;
constexpr uint8_t MAX_TAGS = 20;

struct TagSalva { uint8_t tamanho; uint8_t bytes[10]; };
struct Dados {
  uint32_t identificador;
  uint8_t versao, quantidade, aberto, reservado;
  TagSalva tags[MAX_TAGS];
  uint32_t verificacao;
};

MFRC522 leitor(PINO_SS, PINO_RST);
Servo servo;
Preferences memoria;
ControleArmario controle;
Dados dados = {};
bool memoriaOk = false;
uint32_t ultimaAmostra = 0;

uint32_t checksum(const Dados& valor) {
  const uint8_t* bytes = reinterpret_cast<const uint8_t*>(&valor);
  uint32_t soma = 2166136261u;
  for (size_t i = 0; i < offsetof(Dados, verificacao); ++i) soma = (soma ^ bytes[i]) * 16777619u;
  return soma;
}

bool salvar() {
  dados.verificacao = checksum(dados);
  if (memoria.putBytes("dados", &dados, sizeof(dados)) != sizeof(dados)) return false;
  Dados lidos = {};
  return memoria.getBytes("dados", &lidos, sizeof(lidos)) == sizeof(lidos)
      && memcmp(&dados, &lidos, sizeof(dados)) == 0;
}

bool carregar() {
  if (!memoria.begin("clack-armario", false)) return false;
  if (!memoria.isKey("dados")) {
    dados = {};
    dados.identificador = 0x434c4143u;
    dados.versao = 1;
    return salvar();
  }
  if (memoria.getBytesLength("dados") != sizeof(dados) ||
      memoria.getBytes("dados", &dados, sizeof(dados)) != sizeof(dados)) return false;
  if (dados.identificador != 0x434c4143u || dados.versao != 1 ||
      dados.quantidade > MAX_TAGS || dados.aberto > 1 || dados.verificacao != checksum(dados)) return false;
  for (uint8_t i = 0; i < dados.quantidade; ++i)
    if (!dados.tags[i].tamanho || dados.tags[i].tamanho > 10) return false;
  return true;
}

bool conhecida(const MFRC522::Uid& uid) {
  for (uint8_t i = 0; i < dados.quantidade; ++i)
    if (dados.tags[i].tamanho == uid.size && !memcmp(dados.tags[i].bytes, uid.uidByte, uid.size)) return true;
  return false;
}

void movimentar(bool abrir) {
  if (!servo.attached()) { servo.setPeriodHertz(50); servo.attach(PINO_SERVO, 500, 2400); }
  servo.write(abrir ? ANGULO_ABERTO : ANGULO_FECHADO);
  delay(450);
}

void executar(AcaoArmario acao, const MFRC522::Uid& uid) {
  if (acao == AcaoArmario::Nenhuma) return;
  if (!memoriaOk) { Serial.println("Falha de memoria: acesso bloqueado."); return; }
  bool abrir;
  if (acao == AcaoArmario::Cadastrar) {
    if (dados.quantidade >= MAX_TAGS) { Serial.println("Limite de tags atingido."); return; }
    TagSalva& tag = dados.tags[dados.quantidade++];
    tag.tamanho = uid.size;
    memcpy(tag.bytes, uid.uidByte, uid.size);
    abrir = true;
  } else {
    abrir = !dados.aberto;
  }
  dados.aberto = abrir;
  if (!salvar()) { memoriaOk = false; Serial.println("Falha ao salvar: acesso bloqueado."); return; }
  movimentar(abrir);
  Serial.println(acao == AcaoArmario::Cadastrar ? "Tag cadastrada; abertura acionada." :
                 abrir ? "Abertura acionada." : "Fechamento acionado.");
}

void setup() {
  Serial.begin(115200);
  SPI.begin(PINO_SCK, PINO_MISO, PINO_MOSI, PINO_SS);
  leitor.PCD_Init();
  Serial.printf("RC522: versao 0x%02X\n", leitor.PCD_ReadRegister(MFRC522::VersionReg));
  memoriaOk = carregar();
  Serial.println(memoriaOk ? "Armario offline pronto." : "Falha de memoria: acesso bloqueado.");
}

void loop() {
  uint32_t agora = millis();
  if (uint32_t(agora - ultimaAmostra) < 100) return;
  ultimaAmostra = agora;
  byte atqa[2], tamanho = sizeof(atqa);
  MFRC522::StatusCode status = leitor.PICC_WakeupA(atqa, &tamanho);
  if (status == MFRC522::STATUS_TIMEOUT) {
    controle.observar(AmostraArmario::Ausente, nullptr, false, millis());
    return;
  }
  if (status != MFRC522::STATUS_OK || !leitor.PICC_ReadCardSerial()) {
    controle.observar(AmostraArmario::Erro, nullptr, false, millis());
    return;
  }
  MFRC522::Uid uid = leitor.uid;
  leitor.PICC_HaltA();
  leitor.PCD_StopCrypto1();
  if (!uid.size || uid.size > 10) { controle.observar(AmostraArmario::Erro, nullptr, false, millis()); return; }
  char texto[30];
  size_t pos = 0;
  for (byte i = 0; i < uid.size; ++i)
    pos += snprintf(texto + pos, sizeof(texto) - pos, i ? ":%02X" : "%02X", uid.uidByte[i]);
  AcaoArmario acao = controle.observar(AmostraArmario::Presente, texto, conhecida(uid), millis());
  executar(acao, uid);
}
