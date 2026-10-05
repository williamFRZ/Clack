# Clack

Protótipo de controle de acesso com ESP32, RC522, servo, PHP e MySQL.

Esta etapa corrige instalação, configuração e tratamento de erros da base HTTP.
Ainda não implementa login, permissões por sala, troca entre professores, OLED,
MQTT nem operação offline. O comportamento legado de alternar o uso por qualquer
cartão autorizado continua presente até a etapa de regras de acesso.
Use esta versão apenas em bancada/rede de testes: as APIs ainda não autenticam
operadores ou dispositivos. Não instalar em uma porta de uso real nesta etapa.

## Requisitos

- PHP 8.1 ou superior, com mysqli e mysqlnd.
- MySQL 8.x, tabelas InnoDB; banco `clack` em UTF-8.
- PlatformIO, placa ESP32 DevKit V1 e bibliotecas em `esp32/platformio.ini`.
- Computador e ESP32 numa mesma rede local com comunicação entre dispositivos.

## Instalação nova

1. Coloque este repositório na pasta `clack` do servidor PHP, por exemplo
   `C:\xampp\htdocs\clack`. Apache e MySQL precisam estar funcionando.
2. Importe `Clack_DB.sql` pelo phpMyAdmin ou cliente MySQL. Este arquivo cria
   tabelas sem excluir dados. phpMyAdmin é apenas a interface de administração.
3. Copie `config/config.example.php` para `config/config.local.php` e preencha
   host, porta, usuário, senha e nome do banco. Use um usuário próprio do Clack
   com SELECT, INSERT, UPDATE e DELETE nesse banco. Migrações exigem ALTER.
4. Em banco vazio de bancada, pode importar `sql/demo.sql`. Ele cria a sala 1
   e um cartão fictício. Substitua o UID pelo mostrado no Monitor Serial para
   testar com seu cartão. Não há cartões reais autorizados automaticamente.
5. Abra `http://localhost/clack/` no computador. `api_salas.php` deve retornar
   um array JSON e `api_logs.php` um array, mesmo quando vazio.

## Atualização de uma instalação existente

1. Exporte o banco atual antes de atualizar.
2. Copie os arquivos da branch e crie a configuração local com os dados do banco
   existente. Não importe `sql/demo.sql` sobre o banco em uso.
3. Execute, na raiz do projeto, `php sql/migrate.php`. No Windows/XAMPP:
   `C:\xampp\php\php.exe sql\migrate.php`. O comando acrescenta `matricula` se
   ausente e não altera uma coluna já existente. Pode ser repetido.
4. Se o banco estiver com outro nome, configure esse nome no arquivo local;
   a migração atua no banco configurado. Não é necessário renomeá-lo.
5. Confirme se as tabelas existentes usam InnoDB antes dos testes de transação.
   O script não converte tabelas automaticamente.

A importação do SQL novo não atualiza colunas de tabelas existentes: execute a
migração. Os scripts não excluem nem substituem cadastros ou históricos.

## ESP32

1. Abra a pasta `esp32` no PlatformIO.
2. Copie `include/config.example.h` para `include/config.local.h`.
3. Preencha rede, senha, URL completa e SALA_ID, que precisa existir no banco.
   A URL usa o IPv4 do computador (veja `ipconfig`), nunca `localhost` na ESP32.
4. Confira o pino RST: o exemplo usa **22**, preservando a montagem atual.
   Para instalar o OLED, mova o fio RST para **27** e ajuste RFID_RST_PIN.
   Reserve GPIO21/22 para SDA/SCL do OLED. Tela ainda não implementada.
5. Compile com `pio run`, grave com `pio run -t upload` e acompanhe
   `pio device monitor` a 115200 baud.
6. Calibre os ângulos do servo com a mecânica livre; MG90S de posição não garante
   maior percurso. A partida ainda comanda a posição fechada, como na base.

Pinos RFID: SS=5, SCK=18, MISO=19, MOSI=23, RST configurável, VCC=3,3 V.
Servo: sinal=4; alimentação adequada e GND comum. Não alimentar servo pelo 3V3.

Libere o servidor no firewall somente na rede de testes. Se o painel funciona
no computador, mas a ESP32 não conecta, verifique IP, porta, caminho, firewall
ou isolamento entre clientes no roteador. Nunca versione os arquivos locais;
as credenciais anteriormente publicadas precisam ser substituídas.

## Comportamento dos erros

- GET do hardware retorna apenas `abrir` ou `fechar` quando há estado válido.
- Erro HTTP, resposta inesperada ou falha de rede não altera o último comando
  do servo enquanto a ESP32 continua ligada. Não há autorização offline ainda.
- Mudança de sala e registro de log acontecem na mesma transação.
- Datas dos logs são enviadas em UTC, com conversão pelo navegador.
- O painel representa estado solicitado, não posição física nem presença real.

## Verificações

- `g++ -std=c++11 tests/comando_test.cpp -o comando_test` e execute o binário.
- `node tests/frontend_test.js` (Node 18+).
- Sintaxe PHP: `php -l arquivo.php` para cada arquivo.
- Compilação real: `pio run -d esp32` após criar a configuração local.
- Teste integrado: veja `tests/integration.py`; execute **somente no banco
  descartável de testes**, após importar schema e demo. Ele altera a sala 1.

O workflow CI cria banco descartável, testa APIs e compila o firmware com
configuração fictícia. Não valida o circuito, movimento, corrente ou UPS.

Checklist e orçamento: [docs/CHECKLIST.md](docs/CHECKLIST.md).
