# Clack — tutorial completo com Docker

Este guia instala o servidor e o painel do Clack a partir da `main`. Você não
precisa instalar XAMPP, PHP, MySQL ou Node no computador: o Docker prepara
Apache/PHP 8.2 com mysqli, recompila o painel React e inicia MySQL 8.4. O ESP32
continua sendo gravado separadamente com PlatformIO.

O banco começa vazio, com as três plantas incluídas no painel. Salas, cartões,
permissões e dispositivos são cadastrados por você; não existem senha padrão,
cartões liberados ou salas reais pré-cadastradas.

## 1. Preparar o computador

Instale Git e Docker com Compose:

- [Git](https://git-scm.com/downloads).
- Windows: [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/).
  Use containers Linux. Se escolher o backend WSL 2, siga os requisitos de WSL
  e virtualização indicados no instalador. Reinicie o computador se solicitado.
- macOS: [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/).
- Linux: [Docker Engine](https://docs.docker.com/engine/install/) com
  [plugin Compose](https://docs.docker.com/compose/install/linux/).

Abra o Docker Desktop e aguarde o motor iniciar. Em um terminal, confira:

```sh
git --version
docker version
docker compose version
```

`docker version` deve mostrar Client e Server. Se mostrar erro de conexão,
resolva a inicialização do Docker antes de seguir. Use Compose 2.20 ou posterior
(Compose 5 também é aceito), com suporte a `up --wait`.

No Windows, os comandos deste guia podem ser executados no PowerShell.
Nos demais sistemas, use o terminal. Mantenha os comandos na pasta do projeto.

## 2. Baixar o Clack

```sh
git clone --branch main https://github.com/williamFRZ/Clack.git
cd Clack
```

Se você já tem um clone com alterações próprias, confira `git status` e salve
essas alterações antes de trocar de branch. Para atualizar um clone limpo:

```sh
git fetch origin
git switch main
git pull --ff-only origin main
```

Não execute `reset --hard` para resolver uma divergência; compare os históricos
conforme [BRANCHES.md](BRANCHES.md).

## 3. Configurar senhas e porta

No PowerShell:

```powershell
Copy-Item .env.example .env
notepad .env
```

No Linux/macOS:

```sh
cp .env.example .env
```

Abra `.env` no editor e preencha:

```dotenv
CLACK_DB_PASSWORD=COLOQUE_SUA_SENHA_DO_BANCO
CLACK_DB_ROOT_PASSWORD=COLOQUE_OUTRA_SENHA_PARA_ROOT
CLACK_BIND_IP=127.0.0.1
CLACK_PORT=8080
```

Substitua os dois textos de exemplo por senhas diferentes, com pelo menos 20
caracteres. Use letras e números para evitar interpretação especial pelo
Compose. Essas senhas são do banco; a senha de login do painel será criada no
passo 5. Valores vazios impedem a inicialização.

O `.env` é ignorado pelo Git e não entra na imagem Docker. Guarde uma cópia
privada junto do backup do banco. `config/config.local.php` é usado somente
na instalação sem Docker; o container usa as variáveis deste `.env`.

Por padrão, só o próprio computador acessa o painel. Se a porta 8080 já estiver
ocupada, altere `CLACK_PORT` para, por exemplo, `8081` e use essa porta nos
endereços seguintes. O MySQL não publica a porta 3306 no computador.

## 4. Construir e iniciar

```sh
docker compose config --quiet
docker compose up -d --build --wait --wait-timeout 240
docker compose ps
```

A primeira execução baixa imagens e dependências; precisa de internet e pode
demorar alguns minutos. `db` e `web` devem ficar `healthy`. Se o prazo terminar,
consulte os logs e rode novamente; não apague o volume do banco.

```sh
docker compose logs --tail=100 db web
```

O banco é criado pelo MySQL. O configurador instala/migra as tabelas da gestão
para a versão 3 antes de iniciar Apache. O log inicial pode dizer
“Ainda não existe administrador”: é esperado até o próximo passo.
Não é necessário importar `Clack_DB.sql` para uma instalação Docker nova.

Os arquivos internos ficam em `/opt/clack`, fora da pasta servida pelo Apache.
Somente o painel compilado e os pontos de entrada da API ficam públicos.

## 5. Criar o primeiro administrador

```sh
docker compose exec web php bin/configurar.php admin "Seu nome completo"
```

Digite uma senha de **12 a 72 bytes** quando solicitado e pressione Enter.
A digitação aparece no terminal; evite fazê-lo durante compartilhamento de tela.
A senha é armazenada como hash. Não passe a senha como argumento do comando.

Abra [http://localhost:8080/painel/](http://localhost:8080/painel/) e entre com
login `admin` e a senha que você escolheu. Se mudou a porta, ajuste o endereço.

O configurador pode ser repetido: preserva dados, operadores e senhas.
Se já houver operadores, ele não cria nem redefine o administrador indicado.
Para criar outro administrador pela CLI, quando necessário:

```sh
docker compose exec web php bin/operador.php outroadmin "Nome do administrador"
```

Depois do primeiro acesso, crie contas individuais em Configurações → Contas
da portaria. Administradores configuram o sistema; portaria acompanha salas,
consulta históricos e envia comandos. Cada pessoa deve usar sua própria conta.

## 6. Cadastrar e posicionar os ambientes

1. Em Configurações, cadastre cada ambiente com nome, andar e categoria.
   Use Andar 1, Andar 2 ou Andar 3. “Térreo” de cadastros antigos é mostrado no
   Andar 1.
2. No formulário de cadastro, a planta muda conforme o andar escolhido.
   Clique no centro da sala para posicionar o quadrado antes de **Salvar**.
   Use zoom se necessário; X/Y são preenchidos automaticamente e podem ser
   editados pelo teclado. Trocar de andar limpa a posição anterior.
   Para ajustar depois, em Ambientes escolha o andar, clique em **Posicionar
   salas**, selecione a sala, clique na planta e finalize com **Concluir posicionamento**.
3. Faça isso para todas as salas. Marcadores tracejados são posições provisórias;
   a planta não identifica automaticamente a sala pelo cadastro.
4. Use zoom e confira os marcadores. As posições salvas acompanham o zoom e a
   tela do celular; também podem ser editadas em Configurações.

Para o primeiro cadastro, siga [Configurar a primeira sala](PRIMEIRA-SALA.md).

| Cor | Significado |
|---|---|
| Verde | Sala disponível |
| Amarelo | Atividade da limpeza |
| Laranja | Atividade da TI |
| Vermelho | Atividade de outro responsável |
| Cinza com `!` | Manutenção ou erro |

Passe o mouse, use foco pelo teclado ou toque no quadrado para consultar
responsável, matrícula/NDA e início da atividade. Consultar detalhes não abre
a tranca. Horário desconhecido fica identificado; o painel não inventa a hora.

## 7. Permitir acesso do ESP32 na rede local

Para usar o hardware ou abrir o painel em outro computador/celular:

1. No `.env`, altere `CLACK_BIND_IP=127.0.0.1` para `CLACK_BIND_IP=0.0.0.0`.
2. Recrie o serviço web:

   ```sh
   docker compose up -d --wait
   ```

3. Descubra o IPv4 da interface usada na rede. No Windows, execute `ipconfig`.
   Exemplo: `192.168.1.100`. Não use IP de VPN ou de interface virtual Docker.
4. No computador/celular da mesma rede, abra
   `http://192.168.1.100:8080/painel/`, ajustando IP e porta.
5. Se necessário, autorize a porta escolhida no firewall somente para a rede
   privada. Rede de convidados com isolamento de clientes pode bloquear acesso.
   Não configure encaminhamento de porta no roteador para a internet.

O ESP32 acessa o IP LAN do computador, não `localhost`, `db`, um IP interno
do container ou o caminho `/Clack` usado em instalações XAMPP.
Reserve o IP do computador no DHCP do roteador para evitar mudanças.

O protótipo usa HTTP autenticado. HTTP transmite senhas/tokens sem criptografia;
faça a demonstração em rede confiável. Docker não adiciona HTTPS. A implantação
em salas reais precisa das avaliações e testes descritos em [GESTAO.md](GESTAO.md).

## 8. Cadastrar e gravar os dispositivos

Em Configurações, cadastre uma tranca vinculada a uma sala ou um cadastrador
dedicado. Copie o ID e o token exibido uma única vez. Cada dispositivo deve ter
sua própria identidade.

Instale [PlatformIO](https://docs.platformio.org/en/latest/core/installation/index.html)
ou sua extensão no VS Code. O Docker deste guia cuida do servidor; a gravação
USB é feita no computador com PlatformIO.

Copie `esp32/include/config.example.h` para `esp32/include/config.local.h` e
preencha Wi-Fi, ID e token. Para Docker, o endereço deve ser:

```cpp
#define SERVER_URL "http://192.168.1.100:8080/dispositivo.php"
```

Ajuste o IP/porta, mantenha `/dispositivo.php` e escolha `DEVICE_MODE`:

- `0`: tranca com OLED e servo.
- `1`: cadastrador conectado por Wi-Fi, usado para capturar cartões.
- `2`: armário offline; usa `CABINET_UID`, sem a gestão online das salas.

Compile e grave, dentro da pasta do projeto:

```sh
pio run -d esp32
pio run -d esp32 -t uploadfs
pio run -d esp32 -t upload
pio device monitor -d esp32
```

**`uploadfs` é somente para a primeira instalação em um dispositivo novo.**
Em dispositivo já utilizado, ele apaga fila, sequência e permissões locais.
Para atualizar firmware/configuração, use apenas compilação e `upload`,
preservando LittleFS. A troca/reinicialização de hardware exige reprovisão
controlada; não reutilize uma identidade com a sequência zerada.

Confira pinagem, alimentação e calibração do servo em [GESTAO.md](GESTAO.md).
Antes de instalar em uma porta, teste RFID, OLED, movimento, falta de rede e
corte/retorno de energia na bancada.

## 9. Cadastrar cartões e usar o painel

1. Confira que o cadastrador está online. Em Cartões → Novo cartão, selecione
   o cadastrador e inicie a captura.
2. Aproxime o cartão do leitor. Preencha nome, matrícula ou pessoa externa
   (NDA), perfil e salas permitidas, e salve.
3. Para professor, aluno, limpeza e completo, confira as salas selecionadas.
   TI tem acesso global a todos os ambientes, inclusive os criados depois.
4. Aguarde a sincronização da tranca antes de testar um cartão novo.
5. Acompanhe Ambientes e Histórico. Em uma sala ocupada por outra pessoa,
   TI abre a tranca sem mudar o responsável, a cor ou o início da atividade.
6. Para intervenção da portaria, abra os detalhes da sala e envie o comando
   adequado. Comandos têm expiração e confirmação; o dispositivo precisa
   estar conectado para recebê-los.

Resetar um cartão desvincula seu UID do cadastro; não formata o chip RFID.
Uma tranca sem primeira sincronização não aceita cartões. Offline conserva
a última lista e até 64 eventos; revogações só chegam ao reconectar.
O estado da sala é lógico: não há sensor de porta/trinco para comprovar a
posição física. As regras completas e os limites estão em [GESTAO.md](GESTAO.md).

## 10. Parar, voltar e atualizar

Para desligar os serviços preservando os dados:

```sh
docker compose down
```

Para voltar:

```sh
docker compose up -d --wait
```

O banco e as sessões ficam nos volumes `clack_banco` e `clack_sessoes`.
Mantenha o mesmo projeto/pasta e `.env`. **Não use `down -v` nem remova o volume
do banco:** isso apaga os cadastros e o histórico. Volume persistente não é backup.

Para atualizar, primeiro faça o backup do passo 11. Depois:

```sh
git status
git pull --ff-only origin main
docker compose up -d --build --wait --wait-timeout 240
docker compose ps
```

Confirme árvore limpa antes do `pull`. O build recompila o painel e a
inicialização aplica migrações sem alterar senhas existentes.
Atualize também o firmware quando a versão exigir, preservando LittleFS.

As variáveis `MYSQL_*` inicializam apenas um volume vazio. Trocar as senhas no
`.env` não troca senhas de um banco já criado: faça uma rotação coordenada no
MySQL e no `.env`, com backup. Não apague o volume para corrigir um erro de senha.

## 11. Backup e restauração

### Fazer backup

Pare acessos ao painel/hardware durante a manutenção. Os comandos abaixo
funcionam em PowerShell e terminal Unix, sem redirecionar SQL pelo terminal do
Windows. O dump é feito dentro do container e depois copiado para o computador.

Crie uma pasta `backups` no gerenciador de arquivos ou com `mkdir backups`.
Escolha um nome novo a cada backup para não sobrescrever o anterior:

```sh
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --user="$MYSQL_USER" --single-transaction --no-tablespaces "$MYSQL_DATABASE" > /tmp/clack-backup.sql'
docker compose cp db:/tmp/clack-backup.sql ./backups/clack-backup.sql
```

Confira que o arquivo existe e não está vazio. Guarde uma cópia fora do
computador, protegida, junto do `.env` e das configurações dos ESP32.
O arquivo contém dados pessoais, hashes de senha e histórico; não o envie ao Git.

### Restaurar

Restauração substitui as tabelas do banco de destino. Faça backup do destino
antes e confirme que está no projeto correto. Para recuperar em outro
computador, baixe a mesma versão do código, restaure seu `.env` e execute o
passo 4 primeiro. Não crie um administrador novo antes de importar o backup.

```sh
docker compose stop web
docker compose cp ./backups/clack-backup.sql db:/tmp/clack-restore.sql
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --user="$MYSQL_USER" "$MYSQL_DATABASE" < /tmp/clack-restore.sql'
docker compose up -d --wait
```

Se a importação falhar, confira o erro antes de voltar a operar. A inicialização
do web migra o banco importado. Entre com uma conta preservada e confira salas,
cartões, dispositivos e históricos antes de reconectar o hardware.

Um banco antigo do XAMPP pode ser importado pelo mesmo procedimento, desde que
o dump seja do banco `clack`, sem comandos para criar outros bancos/usuários.
Tabelas antigas são preservadas, mas não viram permissões novas automaticamente:
revise os cadastros no painel conforme [GESTAO.md](GESTAO.md).

## 12. Resolver problemas comuns

| Problema | Verificação e ação |
|---|---|
| Docker não conecta / named pipe / erro 500 do motor | Abra Docker Desktop, confirme containers Linux e `docker version` com Server. Confira os requisitos de WSL/virtualização; não é erro do Clack. |
| Variável obrigatória ausente | Confirme `.env` na mesma pasta de `compose.yaml` e preencha as duas senhas. Não execute `docker compose config` sem `--quiet` ao compartilhar tela: pode exibir senhas. |
| Porta ocupada | Altere `CLACK_PORT` no `.env`, rode `docker compose up -d --wait` e ajuste o endereço do painel/ESP32. |
| `db` unhealthy | Leia `docker compose logs --tail=100 db`. Confira espaço em disco e senhas do volume existente. Não remova o volume como tentativa de reparo. |
| `web` unhealthy / falha na migração | Leia `docker compose logs --tail=100 web`. Confirme a conexão e compatibilidade do banco importado. |
| Login recusado na primeira instalação | Execute o passo 5. Não existe senha padrão. Em banco restaurado, use uma conta já existente. |
| Painel antigo depois da atualização | Execute `up -d --build --wait` e recarregue o navegador. Confirme que abriu a porta do Docker e não o endereço do XAMPP. |
| ESP32 não conecta | Confira `CLACK_BIND_IP=0.0.0.0`, IP LAN/porta em `SERVER_URL`, Wi-Fi, firewall, ID/token e se a rede isola os clientes. |
| Cartão novo recusado offline | Reconecte a tranca para sincronizar permissões; confira perfil e salas do cartão. |
| Dados parecem ter sumido | Confira o projeto/volume usado com `docker compose ps -a` e `docker volume ls`; não inicialize ou apague volumes até localizar o banco original. |

## 13. Desenvolvimento e verificação

O Dockerfile usa Node 22 somente na etapa de build. A imagem final contém
PHP/Apache e o painel compilado, sem Node, fontes da interface ou credenciais
locais. Alterações no código exigem `docker compose up -d --build --wait`;
não existe montagem automática do código do computador.

Para testar a instalação completa em Linux/CI, com Docker e Python 3:

```sh
sh tests/docker_test.sh
```

O teste cria seu próprio projeto e volumes descartáveis, usa porta 18080 e
verifica instalação, autenticação/API, arquivos privados, migração repetível,
persistência após recriação e backup/restauração. Ele remove apenas seus volumes
temporários ao terminar. Para outra porta, defina `CLACK_TEST_PORT`.

O workflow do repositório também testa PHP/MySQL, regras de acesso, compilação
ESP32 e navegação do painel. Esses testes não substituem a validação física.

Consulte [GESTAO.md](GESTAO.md) para instalação sem Docker, pinagem e regras;
[CHECKLIST.md](CHECKLIST.md) para pendências do protótipo.

### Diagnosticar um cadastrador offline

Abra o monitor serial a 115200 baud. O firmware informa modo/ID, endereço do
servidor, estado do Wi-Fi, IP/gateway e versão do RC522, sem imprimir senha ou
token. Para cadastrador use `DEVICE_MODE=1`. HTTP negativo indica falha de
transporte; 401 indica identidade/token recusados. Confirme acesso de rede ao
notebook e a porta do Docker. Redes de convidados podem isolar os aparelhos.
RC522 com versão `0x00` ou `0xFF` não responde: confira alimentação em 3,3 V,
GND comum e a pinagem SPI do guia; isso é separado da presença online.
Não teste presença enviando pedidos pelo computador em nome do ESP32: confira
conexões originadas no hardware. Atualize com `upload`, preservando LittleFS.

O MOSI usa GPIO 23 por padrão e pode ser ajustado em `RFID_MOSI_PIN`.
Se o leitor usar GPIO 21 para MOSI, configure `OLED_ENABLED=0`: o OLED do
guia usa esse mesmo pino como SDA e não pode compartilhar essa ligação.

### Usar o hotspot do próprio notebook

Se a rede de convidados bloquear comunicação entre aparelhos, o Windows pode
criar um **Hotspot móvel** em 2,4 GHz para o ESP32, mantendo o notebook na rede
com internet. Verifique primeiro se o adaptador suporta essa função.

1. Em Configurações → Rede e Internet → Hotspot móvel, compartilhe a conexão
   Wi-Fi, escolha a banda 2,4 GHz e configure nome/senha da rede local.
2. Ligue o hotspot e consulte seu IPv4 com `ipconfig`. O Windows normalmente
   usa `192.168.137.1`; confira o endereço efetivo antes de configurá-lo.
3. Defina `CLACK_BIND_IP` no `.env` como esse IP privado. Para manter o painel
   também em localhost, use um `compose.override.yaml` local com:

   ```yaml
   services:
     web:
       ports:
         - "127.0.0.1:8080:80"
   ```

   Mantenha esse arquivo fora do Git e aplique `docker compose up -d --wait`.
4. Configure no ESP32 o SSID/senha do hotspot e
   `SERVER_URL="http://IP_DO_HOTSPOT:8080/dispositivo.php"`, mantendo ID/token.
5. No firewall do Windows, permita TCP 8080 apenas no IP/interface do hotspot,
   com origem na sub-rede do hotspot. Uma regra explícita de bloqueio pode
   prevalecer sobre a liberação; revise apenas o bloqueio identificado.
6. Confirme pedidos reais do ESP32 e presença online no painel. Inicie uma
   captura em Cartões e aproxime um cartão para validar o RC522 fisicamente.

O hotspot precisa permanecer ligado durante o uso do dispositivo. O Clack
usa comunicação local; o cadastrador não precisa acessar a internet.

### Cadastrar cartões em sequência e revogar acesso

Em **Cartões → Novo cartão**, escolha o cadastrador e clique **Iniciar
leitura**. Ao receber o UID, o leitor fica disponível para outra leitura;
o UID recebido permanece disponível por dez minutos para salvar o formulário.
Use **Salvar e cadastrar outro** para salvar, limpar nome/matrícula e iniciar
a leitura seguinte, preservando perfil e seleção de salas. Retire a tag
anterior do RC522 antes de aproximar a seguinte.

**Cancelar leitura** ou fechar o formulário libera a captura daquela tela.
Se a tela for interrompida antes de cancelar, o mesmo operador pode recuperar
a leitura em andamento; outro operador aguarda a conclusão ou o prazo de dois
minutos. **Ler outro cartão** descarta a captura atual e inicia uma nova.

Para retirar o acesso sem perder o vínculo físico, abra **Cartões → Editar →
Revogar acesso**. O cartão fica inativo e perde as permissões, inclusive o
acesso global da TI; UID, pessoa e histórico são preservados. **Desvincular
cartão** também remove o UID, permitindo reutilizar a tag em outro cadastro.
As trancas aplicam a revogação ao sincronizar com o servidor; uma tranca
offline pode continuar usando o cache antigo até reconectar.

Todo novo login abre em **Ambientes**, mesmo após sair de outra aba ou trocar de usuário. **Configurações** é exibida e consultada apenas por administradores.
