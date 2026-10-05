# Clack

Protótipo acadêmico de controle de acesso do TCC: ESP32, RC522, MG90S e painel local da portaria em PHP/MySQL + React. Três modos de firmware: tranca com OLED, cadastrador e armário com buzzer.

## Começar

O caminho principal é **[o tutorial completo com Docker](docs/DOCKER.md)**:
download, senhas, primeiro acesso, salas e plantas, cartões, ESP32 na rede,
atualização, backup e restauração. A versão atual está na branch `main`.

Instale Git e Docker com Compose, abra o Docker Desktop com containers Linux
e execute:

```sh
git clone --branch main https://github.com/williamFRZ/Clack.git
cd Clack
```

Copie `.env.example` para `.env` (`Copy-Item .env.example .env` no PowerShell ou
`cp .env.example .env` no Linux/macOS) e preencha as duas senhas do banco.
Depois:

```sh
docker compose up -d --build --wait --wait-timeout 240
docker compose exec web php bin/configurar.php admin "Seu nome"
```

Digite a senha do administrador quando solicitado e abra
**[http://localhost:8080/painel/](http://localhost:8080/painel/)**.
O Docker recompila o painel, migra as tabelas e conserva banco/sessões em volumes.
Não há senha padrão nem cadastros de demonstração. Para ESP32 na LAN, configure
`CLACK_BIND_IP=0.0.0.0` conforme o tutorial. `docker compose down` preserva dados;
`down -v` apaga os volumes.

### Instalação sem Docker

Siga **[instalação e funcionamento](docs/GESTAO.md)**. Requisitos: PHP 8.2 com mysqli/mysqlnd, MySQL 8 e PlatformIO para o ESP32. O painel compilado está incluído: Node só é necessário para editar/recompilar a interface.

1. Importe `Clack_DB.sql` e configure `config/config.local.php` usando o exemplo.
2. Execute `php bin/configurar.php admin "Seu nome"`. O comando atualiza o banco sem apagar dados e cria o primeiro administrador. Informe a senha pela entrada padrão.
3. Execute `php -S 0.0.0.0:8080 router.php` e abra `http://localhost:8080/painel/`.
4. Cadastre ambientes/dispositivos e configure `esp32/include/config.local.h` com o IP LAN do servidor, ID e token do dispositivo.
5. Inicialize LittleFS somente na primeira instalação e grave o firmware conforme o guia.

**Atualize servidor e firmware juntos.** APIs antigas foram desativadas. As tabelas anteriores são preservadas; revise e cadastre as permissões na nova gestão. Não execute `uploadfs` sobre um dispositivo em uso: isso apaga sua fila e permissões locais.

## Recursos desta versão

Para começar os cadastros, siga **[Configurar a primeira sala](docs/PRIMEIRA-SALA.md)**.

- Contas individuais de portaria/admin, troca de senha, auditoria e rotação de tokens.
- Cartões com matrícula/NDA, cinco perfis, TI com acesso global e entrada em sala ocupada sem assumir a atividade; salas selecionáveis para os demais e leitura em cadastrador dedicado.
- Professor assume responsabilidade de sala em uso; aluno só inicia atividade em sala disponível.
- Comandos remotos com validade e confirmação; histórico sem duplicação na reconexão.
- Cache de permissões e até 64 eventos persistentes no ESP32; eventos sem hora conhecida ficam identificados.
- Interface clara/escura, plantas estilizadas por andar e quadrados de atividade com responsável, matrícula e início de uso; posição ajustável por clique.

A comunicação implementada é HTTP autenticado. MQTT não está implementado. Antes de uso real, avaliar HTTPS, clonagem de UID, política offline e realizar testes físicos. Estado exibido não confirma a posição mecânica: não há sensor de porta/trinco.

## Desenvolver e verificar

```sh
npm ci --prefix frontend
npm run build --prefix frontend
node tests/room_status_test.mjs
npm audit --prefix frontend
g++ -std=c++11 tests/regras_test.cpp -o /tmp/clack-regras
/tmp/clack-regras
```

O workflow `.github/workflows/verify.yml` verifica PHP/MySQL com banco descartável, instalação repetível, integração HTTP, regras C++, compilação do ESP32 e navegação desktop/mobile com API simulada. Também constrói e inicia o Docker, verifica persistência após recriação e faz backup/restauração em banco descartável. Os testes não substituem a validação do hardware.

[Checklist e orçamento](docs/CHECKLIST.md) · [Regras, pinagem e limitações](docs/GESTAO.md)

Para atualizar instalações existentes ao banco versão 3 sem Docker, execute `php bin/configurar.php` antes de abrir o novo painel. Com Docker, a migração roda na inicialização. [Guia para atualizar e integrar branches com segurança](docs/BRANCHES.md).
