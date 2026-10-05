#pragma once
// Copie para config.local.h; esse arquivo local e ignorado pelo Git.
constexpr char WIFI_SSID[] = "SUA_REDE";
constexpr char WIFI_PASSWORD[] = "SUA_SENHA";
constexpr char SERVER_URL[] = "http://192.168.0.100/clack/api_hardware.php";
constexpr int SALA_ID = 1;
// Preserve 22 na montagem atual. Ao instalar OLED, mova fisicamente RST para 27
// e altere este valor para 27. OLED: SDA 21, SCL 22.
constexpr int RFID_RST_PIN = 22;
constexpr int SERVO_PIN = 4;
constexpr int SERVO_FECHADO = 180;
constexpr int SERVO_ABERTO = 0;
