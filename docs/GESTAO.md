# Gestão Clack — instalação e limites

Esta versão substitui painel, API e firmware juntos. As quatro APIs antigas respondem 410 para impedir acesso sem autenticação. Não misture o firmware antigo com este servidor.

## Instalar

1. PHP 8.2 com mysqli/mysqlnd e MySQL 8. Crie o banco com `Clack_DB.sql` (sem apagar o anterior), copie `config/config.example.php` para `config/config.local.php` e configure um usuário MySQL próprio.
2. Execute `php sql/migrate.php` e `php bin/instalar.php`. A instalação de gestão é repetível. Tabelas antigas permanecem intactas; cadastros e permissões precisam ser revisados e cadastrados no novo painel, sem concessão automática de acesso.
3. Execute `php bin/operador.php admin "Seu nome"`. Digite uma senha de 12 a 72 bytes na entrada padrão. Ela aparece no terminal durante a digitação, mas é armazenada como hash no banco. Não coloque a senha no comando ou no Git.
4. Em desenvolvimento: `php -S 0.0.0.0:8080 router.php`. Acesse `http://localhost:8080/painel/`. Para Apache/XAMPP, habilite mod_rewrite e AllowOverride para aplicar `.htaccess`; não disponibilize os diretórios de configuração, fontes e banco. O servidor embutido do PHP serve apenas à demonstração em rede confiável, não à implantação pública.
5. O painel compilado está em `painel/`. Para alterar: `npm ci --prefix frontend` e `npm run build --prefix frontend`. Componentes próprios em React; não foram copiados componentes de terceiros do 21st.
6. Cadastre ambientes com nome, andar, categoria e coordenadas do mapa. A representação é esquemática até receber a planta real. Evite sobreposição das salas de 140 × 120 unidades.
7. Cadastre cada dispositivo. Copie o ID e token exibidos uma única vez para `esp32/include/config.local.h`, baseado no exemplo. Use o IP LAN do computador em SERVER_URL, nunca localhost no ESP32.
8. Compile com PlatformIO. Na primeira instalação, inicialize LittleFS com `pio run -d esp32 -t uploadfs`; depois `pio run -d esp32 -t upload`. **Não repita uploadfs em dispositivo em uso:** apaga fila, sequência e permissões. Para substituir/reinicializar hardware, é necessária reprovisão controlada; não reutilize uma identidade com sequência zerada.
9. Cadastre o leitor com DEVICE_MODE=1. No painel, inicie captura, aproxime o cartão e salve nome, matrícula ou NDA, perfil e salas. Não escrevemos dados no cartão: resetar significa desvincular seu UID do cadastro; não é formatação do chip.

## Regras implementadas

- Salas explicitamente autorizadas por cartão, inclusive perfil completo. Presets do painel preenchem seleções editáveis; não são permissão implícita.
- Professor ou completo inicia uma sala disponível, encerra a própria atividade ou assume a responsabilidade de sala em uso sem movimentar o servo.
- Aluno e limpeza iniciam apenas sala disponível e encerram a própria atividade. **Regra de limpeza provisória**, para confirmar com o usuário.
- Manutenção/erro recusam cartões; portaria intervém por comandos autenticados, auditados e com expiração de 30 segundos. Um comando por tranca fica pendente por vez. Não há trancamento automático por horário.
- Um cartão mantido sobre o leitor não deve alternar repetidamente a atividade; a detecção de retirada ainda precisa de teste real com RC522.
- Contas de portaria e admin separadas; só admin configura ambientes, dispositivos e contas. Sessão expira após 30 minutos sem requisições (o painel aberto renova a sessão com atualização automática). CSRF em mutações, hash de senha e limite de tentativas por IP/login.

Troca de senha está disponível na conta da portaria; outras sessões são invalidadas quando a senha muda. Administradores podem trocar o token de um dispositivo, invalidando a credencial anterior e comandos pendentes sem apagar sequência ou histórico. Atualize o token no firmware, preservando LittleFS.

## Offline e confirmação

O dispositivo conserva permissões, responsável, estado e até 64 eventos em LittleFS com duas cópias alternadas, geração e checksum. Eventos são persistidos antes da ação; somente IDs confirmados pelo servidor saem da fila. O servidor deduplica por dispositivo/sequência e não aplica snapshots de sequência anterior. Atualizações de heartbeat sem alteração não gravam a flash.

Quando lota a fila ou falha a memória, novas operações são bloqueadas e o OLED informa. O protótipo precisa ser ensaiado com corte de energia durante gravação e movimento. Sem primeira sincronização, a tranca não tem cartões autorizados. Limite atual: 100 cartões por sala. A revogação de um cartão só chega ao dispositivo ao reconectar; não existe revogação instantânea offline nem expiração automática da lista.

O horário é obtido do servidor. Após reinício sem rede, eventos têm horário desconhecido e sequência preservada. RTC não foi incluído sem escolha de módulo. O histórico distingue ocorrência e recebimento. Nomes/perfis do evento são snapshots, para não mudar ao editar cadastro.

Estado da sala é lógico. Não existe sensor de porta/trinco. No boot não se movimenta automaticamente o servo; se houve interrupção durante movimento registrado, o dispositivo entra em erro e requer intervenção. Mesmo com confirmação de comando, posição física requer verificação. Teste e ajuste SERVO_ABERTO/SERVO_FECHADO ao mecanismo antes de instalar.

Comunicação desta entrega: **HTTP autenticado**, no servidor local. MQTT ainda não está implementado. Em LAN compartilhada é necessário HTTPS com validação de certificado antes de uso real: HTTP não protege tokens, senhas nem eventos de escuta/alteração. UID RC522 também não é credencial resistente a clonagem; esta etapa é protótipo acadêmico.

## Modos e fios

| Função | GPIO ESP32 DevKit V1 |
|---|---:|
| RC522 SS/SCK/MISO/MOSI | 5 / 18 / 19 / 23 |
| RC522 RST | 27 |
| OLED SDA/SCL | 21 / 22 |
| Servo sinal | 4 |
| Buzzer ativo (circuito adequado) | 25 |

RC522 e OLED em 3,3 V; terras comuns. Servo em alimentação de 5 V adequada, não no pino 3,3 V. Buzzer com corrente incompatível com GPIO exige transistor/driver. Conferir módulo exato e medir corrente: UPS 5 V/1 A selecionada **ainda não validada** sob pico do MG90S nem em transição de energia.

- DEVICE_MODE=0: tranca; OLED_ENABLED=1 (endereço 0x3C). Se seu OLED responder em 0x3D, ajuste antes de testar.
- DEVICE_MODE=1: cadastrador dedicado; Wi-Fi obrigatório para captura; OLED opcional.
- DEVICE_MODE=2: armário sem rede/tela, buzzer, um UID autorizado configurado em CABINET_UID. Histórico local circular de 64 eventos. Cadastro local de múltiplos cartões ainda não implementado.

## Pendências de entrega física e implantação

- Planta dos andares, identificação real de salas e definição final de limpeza.
- Calibração MG90S, curso do trinco, miniporta e caixa PETG.
- Medições da UPS de 1 A, proteção de bateria, autonomia e queda/retorno de energia.
- Testes de bancada com RC522/OLED/servo/buzzer, persistência e fila cheia.
- Política e fluxo de recuperação/troca de dispositivo, importação revisada dos cadastros antigos.
- HTTPS local e eventual migração MQTT com autenticação/ACL; testes de carga/limites e revisão de segurança antes de uso em salas reais.
- Demonstração e evidências do TCC II, depois atualização do texto.

## Plantas por andar

O painel tem seleção fixa de Andar 1, Andar 2 e Andar 3, com placeholder individual e salas filtradas. Adicione `andar-1.png`, `andar-2.png` e `andar-3.png` em `frontend/src/assets/plantas/` e recompile o painel. JPG/JPEG/WebP também são aceitos. As imagens aparecem inteiras; o mapeamento de áreas clicáveis sobre a planta depende da identificação das salas. Cadastros antigos chamados Térreo aparecem no Andar 1, sem alteração automática no banco.

As plantas dos três andares foram recebidas em 21/09/2026 e integradas à cópia local, com zoom de 100% a 300%, ajuste à visualização e abertura do JPG original. A publicação dos três JPGs no repositório público foi autorizada explicitamente pelo usuário em 21/09/2026. As áreas das salas ainda precisam ser identificadas para associar pontos clicáveis à planta real.
