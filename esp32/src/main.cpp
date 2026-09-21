#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <Adafruit_SSD1306.h>
#include <time.h>
#include "regras.h"
#if __has_include("config.local.h")
#include "config.local.h"
#elif defined(CLACK_CI)
#include "config.example.h"
#else
#error "Copie config.example.h para config.local.h e configure o dispositivo."
#endif

MFRC522 rfid(5,RFID_RST_PIN);
Servo servo;
Adafruit_SSD1306 oled(128,64,&Wire,-1);
JsonDocument state;
bool healthy=false,displayReady=false;
int slot=-1;
unsigned long lastSync=0,lastWifi=0,lastRead=0,lastSeen=0;
String heldUid,capture;
constexpr int MAX_EVENTS=64;

void screen(const String& title,const String& detail="") {
 Serial.println(title+" "+detail);
 if(!displayReady)return;
 oled.clearDisplay();oled.setTextColor(SSD1306_WHITE);oled.setTextSize(1);
 oled.setCursor(0,0);oled.println("CLACK");oled.setCursor(0,18);oled.println(title);oled.println(detail);oled.display();
}
uint32_t checksum(const String& s){uint32_t n=2166136261u;for(size_t i=0;i<s.length();i++){n^=(uint8_t)s[i];n*=16777619u;}return n;}
bool readSlot(int index,JsonDocument& out){
 File f=LittleFS.open(index?"/state1.json":"/state0.json","r");if(!f)return false;
 JsonDocument wrapper;auto err=deserializeJson(wrapper,f);f.close();if(err)return false;
 String payload=wrapper["payload"].as<String>();
 if(checksum(payload)!=wrapper["checksum"].as<uint32_t>())return false;
 if(deserializeJson(out,payload))return false;
 return out["sequencia"].is<unsigned long>()&&out["estado"].is<const char*>()&&out["eventos"].is<JsonArray>();
}
bool persist(){
 state["generation"]=state["generation"].as<unsigned long>()+1;
 String payload;serializeJson(state,payload);JsonDocument wrapper;wrapper["payload"]=payload;wrapper["checksum"]=checksum(payload);
 int next=slot==0?1:0;File f=LittleFS.open(next?"/state1.json":"/state0.json","w");
 if(!f){healthy=false;screen("Falha de memoria","Acesso bloqueado");return false;}
 size_t expected=measureJson(wrapper),written=serializeJson(wrapper,f);f.flush();f.close();
 JsonDocument check;if(written!=expected||!readSlot(next,check)){healthy=false;screen("Falha de memoria","Acesso bloqueado");return false;}
 slot=next;return true;
}
void beep(bool ok){digitalWrite(BUZZER_PIN,HIGH);delay(ok?70:250);digitalWrite(BUZZER_PIN,LOW);}
bool event(const char* result,JsonObjectConst card=JsonObjectConst()){
 JsonArray events=state["eventos"].as<JsonArray>();
 if(events.size()>=MAX_EVENTS){screen("Historico cheio","Reconecte ao servidor");beep(false);return false;}
 unsigned long seq=state["sequencia"].as<unsigned long>()+1;state["sequencia"]=seq;
 JsonObject e=events.add<JsonObject>();e["sequencia"]=seq;e["resultado"]=result;
 if(!card.isNull()){e["uid"]=card["uid"];e["nome"]=card["nome"];e["perfil"]=card["perfil"];}
 time_t now=time(nullptr);if(now>=1704067200)e["timestamp"]=(long long)now;
 return true;
}
void actuate(bool open){
 // Attach only for a requested motion, never automatically on reboot.
 if(!servo.attached()){servo.setPeriodHertz(50);servo.attach(SERVO_PIN,500,2400);}
 servo.write(open?SERVO_ABERTO:SERVO_FECHADO);
 delay(450);
}
void finishMotion(bool open){
 if(!persist())return;actuate(open);state["pending"]=false;
 if(!persist())return;beep(true);
}
void readCard(const String& uid){
 if(DEVICE_MODE==1){
  if(capture.isEmpty()||WiFi.status()!=WL_CONNECTED){screen("Sem captura ativa");beep(false);return;}
  HTTPClient http;http.setConnectTimeout(1500);http.setTimeout(1500);http.begin(SERVER_URL);
  http.addHeader("Authorization",String("Bearer ")+DEVICE_TOKEN);http.addHeader("Content-Type","application/json");
  JsonDocument req;req["dispositivo"]=DEVICE_ID;req["captura"]=capture;req["uid"]=uid;
  String payload;serializeJson(req,payload);int code=http.POST(payload);http.end();screen(code==200?"Cartao capturado":"Falha na captura");beep(code==200);if(code==200)capture="";return;
 }
 if(!healthy){screen("Memoria indisponivel");beep(false);return;}
 if(state["eventos"].size()>=MAX_EVENTS){screen("Historico cheio","Reconecte ao servidor");beep(false);return;}
 JsonDocument person;
 for(JsonObjectConst c:state["cartoes"].as<JsonArrayConst>())if(uid==c["uid"].as<String>()){person.set(c);break;}
 if(person.isNull()){
  JsonDocument unknown;unknown["uid"]=uid;unknown["nome"]="Nao cadastrado";
  // An unknown card has no profile; retain only UID and a denial message.
  if(event("acesso_negado")){state["eventos"].as<JsonArray>()[state["eventos"].size()-1]["uid"]=uid;persist();}
  screen("Acesso negado");beep(false);return;
 }
 auto decision=decidir(state["estado"]|"erro",state["responsavel"]|0,person["id"]|0,person["perfil"]|"");
 const char* result=decision==Decisao::Abrir?"atividade_iniciada":decision==Decisao::Fechar?"atividade_encerrada":decision==Decisao::Transferir?"responsabilidade_transferida":"sala_indisponivel";
 if(!event(result,person.as<JsonObjectConst>()))return;
 if(decision==Decisao::Negar){persist();screen("Sala indisponivel");beep(false);return;}
 state["estado"]=decision==Decisao::Fechar?"disponivel":"em_uso";
 if(decision==Decisao::Fechar)state["responsavel"]=nullptr;else state["responsavel"]=person["id"];
 if(decision==Decisao::Transferir){if(persist()){screen("Responsavel alterado",person["nome"].as<String>());beep(true);}return;}
 state["pending"]=true;finishMotion(decision==Decisao::Abrir);
 screen(healthy?(decision==Decisao::Abrir?"Atividade iniciada":"Atividade encerrada"):"Falha de memoria");
}
void syncServer(){
 lastSync=millis();if(DEVICE_MODE==2||WiFi.status()!=WL_CONNECTED)return;
 JsonDocument req;req["dispositivo"]=DEVICE_ID;
 if(DEVICE_MODE==0){
  if(!healthy)return;
  req["eventos"]=state["eventos"];req["sequencia"]=state["sequencia"];req["estado"]=state["estado"];req["responsavel"]=state["responsavel"];
  req["versao"]=state["versao"];req["comando_confirmado"]=state["comando"];
 }
 String payload;serializeJson(req,payload);HTTPClient http;http.setConnectTimeout(1500);http.setTimeout(1500);http.begin(SERVER_URL);
 http.addHeader("Authorization",String("Bearer ")+DEVICE_TOKEN);http.addHeader("Content-Type","application/json");
 int code=http.POST(payload);String body=code==200?http.getString():"";http.end();
 if(code!=200){Serial.printf("Sync falhou: %d\n",code);return;}
 JsonDocument response;if(deserializeJson(response,body))return;
 if(DEVICE_MODE==1){capture=response["captura"].as<String>();if(capture=="null")capture="";screen(capture.isEmpty()?"Cadastrador pronto":"Aproxime o cartao");return;}
 if(!response["confirmados"].is<JsonArray>()||!response["cartoes"].is<JsonArray>()||!response["versao"].is<const char*>())return;
 if(response["ultima_sequencia"].as<unsigned long>()>state["sequencia"].as<unsigned long>()){
  healthy=false;screen("Sequencia divergente","Reprovisione a tranca");return;
 }
 bool changed=false;JsonArray events=state["eventos"].as<JsonArray>();
 for(int i=(int)events.size()-1;i>=0;i--)for(JsonVariantConst ack:response["confirmados"].as<JsonArrayConst>())if(events[i]["sequencia"].as<unsigned long>()==ack.as<unsigned long>()){events.remove(i);changed=true;break;}
 if(state["versao"].as<String>()!=response["versao"].as<String>()){
  if(response["cartoes"].size()>100)return;
  state["cartoes"]=response["cartoes"];state["versao"]=response["versao"];changed=true;
 }
 if(changed&&!persist())return;
 long long now=response["hora"]|0LL;if(now>1704067200){struct timeval tv={(time_t)now,0};settimeofday(&tv,nullptr);}
 JsonObjectConst cmd=response["comando"].as<JsonObjectConst>();
 if(cmd.isNull()||cmd["id"].as<unsigned long>()<=state["comando"].as<unsigned long>())return;
 String action=cmd["acao"].as<String>();
 if(action!="abrir"&&action!="fechar"&&action!="manutencao"&&action!="liberar")return;
 if(!event((String("portaria_")+action).c_str()))return;
 state["estado"]=action=="abrir"?"em_uso":action=="manutencao"?"manutencao":"disponivel";
 state["responsavel"]=nullptr;state["comando"]=cmd["id"];state["pending"]=true;
 finishMotion(action=="abrir");screen("Comando da portaria",action);
}
void setup(){
 Serial.begin(115200);pinMode(BUZZER_PIN,OUTPUT);digitalWrite(BUZZER_PIN,LOW);
 if(OLED_ENABLED&&DEVICE_MODE!=2){Wire.begin(21,22);displayReady=oled.begin(SSD1306_SWITCHCAPVCC,0x3C);}
 SPI.begin(18,19,23,5);rfid.PCD_Init();screen("Inicializando...");
 if(DEVICE_MODE!=1){
  if(!LittleFS.begin(false)){screen("LittleFS indisponivel","Veja README");}
  else{
   JsonDocument a,b;bool va=readSlot(0,a),vb=readSlot(1,b);
   if(va||vb){slot=va&&(!vb||a["generation"].as<unsigned long>()>=b["generation"].as<unsigned long>())?0:1;state.set(slot==0?a:b);healthy=true;}
   else if(!LittleFS.exists("/state0.json")&&!LittleFS.exists("/state1.json")){
    state["sequencia"]=0;state["generation"]=0;state["estado"]="disponivel";state["responsavel"]=nullptr;state["comando"]=0;state["pending"]=false;state["versao"]="";state["eventos"].to<JsonArray>();state["cartoes"].to<JsonArray>();healthy=persist();
   }
   if(healthy&&state["pending"].as<bool>()){
    state["estado"]="erro";state["responsavel"]=nullptr;state["comando"]=0;state["pending"]=false;
    if(event("reinicio_durante_movimento"))persist();else healthy=false;
    screen("Verificar tranca","Movimento interrompido");
   }
   if(healthy&&DEVICE_MODE==2){JsonArray cards=state["cartoes"].to<JsonArray>();auto c=cards.add<JsonObject>();c["id"]=1;c["nome"]="Armario";c["uid"]=CABINET_UID;c["perfil"]="completo";persist();}
  }
 }
 if(DEVICE_MODE!=2){WiFi.mode(WIFI_STA);WiFi.begin(WIFI_SSID,WIFI_PASSWORD);lastWifi=millis();}
 screen(healthy||DEVICE_MODE==1?"Pronto":"Verificar memoria","Aproxime o cartao");
}
void loop(){
 unsigned long now=millis();
 if(DEVICE_MODE!=2){
  if(WiFi.status()!=WL_CONNECTED&&now-lastWifi>=10000){WiFi.begin(WIFI_SSID,WIFI_PASSWORD);lastWifi=now;}
  if(now-lastSync>=2000)syncServer();
 }
 if(now-lastRead<100)return;lastRead=now;
 byte atqa[2],len=2;auto status=rfid.PICC_WakeupA(atqa,&len);
 if(status!=MFRC522::STATUS_OK&&status!=MFRC522::STATUS_COLLISION){if(now-lastSeen>700)heldUid="";return;}
 if(!rfid.PICC_ReadCardSerial())return;
 String uid;for(byte i=0;i<rfid.uid.size;i++){if(i)uid+=':';if(rfid.uid.uidByte[i]<16)uid+='0';uid+=String(rfid.uid.uidByte[i],HEX);}uid.toUpperCase();
 rfid.PICC_HaltA();rfid.PCD_StopCrypto1();lastSeen=now;
 if(uid==heldUid)return;heldUid=uid;
 // Cabinet has no server: retain a bounded rolling log instead of filling forever.
 if(DEVICE_MODE==2&&healthy&&state["eventos"].size()>=MAX_EVENTS)state["eventos"].as<JsonArray>().remove(0);
 readCard(uid);
}
