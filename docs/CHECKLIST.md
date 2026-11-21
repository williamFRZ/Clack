# Checklist Clack — 07/10/2026

## Preparação do artigo do TCC II
- [x] Separar as referências de Gonçalves (2019), Costa (2020) e Silva (2022) em BibTeX e preparar um rascunho de citação.
- [x] Elaborar primeira versão do artigo no modelo SBC a partir do TCC I corrigido e dos resultados registrados, com as referências selecionadas e espaços para novas imagens.
- [x] Produzir modelo lógico resumido do banco de gestão em PlantUML, PNG e SVG, baseado em `sql/gestao.sql`.
- [ ] Revisar autoria, objetivos e texto com William e orientadores; inserir imagens reais e confirmar metadados das referências indicadas em `artigo-tcc2/LEIA-ME.md`.
- [ ] Confrontar e integrar o projeto original do artigo quando os arquivos forem fornecidos, e compilar a versão final.

## Software desenvolvido nesta etapa (validar na bancada)
- [x] Substituir a confirmação do navegador ao excluir ou arquivar uma sala por uma janela do painel, preservando os avisos de arquivamento.
- [x] Produzir diagrama PlantUML de casos de uso do controle de acesso às salas, com versões PNG e SVG para o artigo.
- [x] Ocultar a barra visual do resumo flutuante das salas.
- [x] Posicionar o resumo flutuante sem cobrir o marcador, usando o espaço disponível na tela.
- [x] Suavizar a mudança de cor dos ícones das salas.
- [x] Remover o círculo ao passar o cursor sobre o marcador, mantendo o foco visível para navegação por teclado.
- [x] Posicionar salas arrastando os marcadores, sem salto ao pressionar, e animar o símbolo e a cor ao mudar de estado; validação com API simulada e zoom.
- [x] Aplicar o símbolo Clack aos marcadores e legenda, com cadeado fechado em disponibilidade e aberto nos demais estados, preservando as cores.
- [x] Ocultar o quadro repetido abaixo da planta e preservar o resumo ao apontar, os detalhes ao clicar e a descrição acessível.
- [x] Solicitar confirmação antes de encerrar a sessão, em janela do painel com opção de cancelar.
- [x] Animar as contagens de estado para cima ao aumentar e para baixo ao diminuir, com suporte a movimento reduzido.
- [x] Aplicar fundos suaves aos cartões de estado, com cores conferidas nos temas claro e escuro.
- [x] Atualizar os cartões de estado com indicadores circulares discretos.
- [x] Simplificar a tela de login, removendo os textos introdutório e de uso local.
- [x] Simplificar o cadastro de dispositivo: exigir a sala somente para trancas e remover o indicador “Servidor local” do cabeçalho. Comportamento verificado no navegador.
- [x] Medir 50 trancas simuladas em dez períodos de uso, com verificação de histórico, estado das salas, latência e reinícios em Docker descartável.
- [x] Excluir salas vazias e arquivar salas com vínculos pelo painel administrativo; testar autorização, preservação do histórico e bloqueio da credencial em banco descartável.
- [x] Aplicar a marca oficial Clack v2 ao login, à navegação e ao ícone da aba. Login verificado no navegador em 1280 px (tema claro) e 390 px (tema escuro).
- [x] Instalação de banco não destrutiva, configuração fora do Git.
- [x] Login individual, administrador/portaria, CSRF e auditoria.
- [x] Limitar o tamanho real dos pedidos JSON, inclusive fragmentados sem Content-Length; validação em servidor descartável.
- [x] Cartões: nome, matrícula ou NDA, cinco perfis, salas editáveis, TI global, bloqueio e desvinculação.
- [x] Cadastrador dedicado com captura reservada por operador.
- [x] Responsabilidade por sala, transferência entre professores e restrição do aluno.
- [x] Implementar confirmação de 3 segundos para transferência, bloqueio até retirada e testes automatizados de temporização; firmware compilado e gravado na tranca 204.
- [x] Validar na tranca 204 o toque curto sem ação, transferência segurando a tag, permanência sem fechamento e nova aproximação para encerrar (09/11/2026, resultado físico informado pelo usuário e eventos conferidos).
- [ ] Implementar e validar importação de PDF e verificação de horários após definição dos requisitos e análise de um arquivo real.
- [x] TI com acesso global e abertura de sala ocupada sem assumir a atividade no painel.
- [x] Comandos remotos com prazo e confirmação separada do estado físico.
- [x] Painel React, tema claro/escuro persistente e seleção dos três andares.
- [x] Plantas estilizadas dos três andares integradas em orientação horizontal, com zoom e abertura da imagem completa.
- [x] Plantas com fundo externo transparente e sem os textos dos andares na imagem.
- [x] Indicadores na ordem Disponível → Em uso → Em uso pela TI → Em uso pela limpeza, preservando as cores.
- [x] Portas verde/amarelo/laranja/vermelho, consulta por mouse/teclado/toque de responsável, matrícula e início de uso.
- [x] Posicionamento por clique, coordenadas percentuais e indicação explícita de pontos provisórios.
- [x] Posicionamento no cadastro/edição da sala: planta por andar, clique, zoom e limpeza da seleção ao trocar de andar.
- [x] Tutorial específico da primeira sala, incluindo posicionamento antes de salvar.
- [x] Remoção da frase sobre sensores na tela de Ambientes; limites físicos mantidos na documentação técnica.
- [x] Atualização idempotente para banco versão 3 (perfil TI e posições na planta).
- [x] Docker Compose com build do painel, Apache/PHP, MySQL e volumes persistentes.
- [x] Tutorial completo de instalação/uso com Docker, rede do ESP32, atualização e backup/restauração.
- [x] Criar iniciador Windows e guia rápido, preservando a configuração existente e interrompendo quando há banco sem `.env`; instalação e reabertura ensaiadas em projetos Docker descartáveis.
- [x] Preparar orçamento ilustrado de uma tranca e um cadastrador em `Recursos`, com cotações e fórmulas; confirmar itens e quantidades ainda não informados.
- [x] Validar em banco descartável a senha inicial padrão de novas instalações e a preservação da senha existente após a configuração repetida.
- [ ] Validar o iniciador em outro computador e avaliar instalação de pré-requisitos e configuração de firewall com a TI da rede.
- [x] Histórico com snapshots, ocorrência/recebimento e filtro por sala.
- [x] Alinhar os filtros do histórico e atualizar eventos e ações a cada 3 segundos, preservando filtros e página de eventos anteriores.
- [x] Exibir o evento de transferência com a descrição legível “Responsabilidade transferida” no histórico, com tradução em espanhol.
- [x] Histórico: abas de eventos dos dispositivos e ações da portaria, filtro por dia nas duas listas e filtro por sala nos eventos; retorno ao período geral (API e build de produção validados em ambiente descartável; teste de navegação atualizado).
- [x] Mostrar em laranja o último usuário da sala disponível, com nome recuperado do evento de atividade mais recente (consulta validada por integração; build de produção concluído; teste de interface atualizado).
- [x] Firmware com OLED, cache offline e fila persistente com confirmação/deduplicação.
- [x] Modo armário sem servidor/tela, buzzer e um cartão configurado.
- [x] Criar programa separado de armário offline com cadastro de até 20 tags por permanência de 10 segundos e testes automatizados de temporização.
- [x] Gravar na tranca 204 o programa independente do armário e confirmar a inicialização e o acesso à memória (09/11/2026).
- [x] Confirmar na tranca 204 o cadastro de uma tag e movimento do servo; o monitor registrou comandos de abertura e fechamento (09/11/2026).
- [ ] Validar várias tags, retirada, reinício e movimentos com mecanismo montado; calibrar ângulos e investigar a possível intermitência nas conexões do RC522.

- [x] Diagnóstico serial de Wi-Fi/IP, transporte HTTP e comunicação RC522, sem expor senha/token (leitura física do Pelado validada; fluxo consecutivo e revogação em tranca real ainda pendentes).
- [ ] Verificar a sequência e os eventos locais da placa conectada em 15/11/2026, que apresentou divergência com o servidor da sala 204; não apagar a memória antes de entender a diferença.

- [x] Liberar reserva após leitura/cancelamento, recuperar leitura do mesmo operador e permitir cadastro consecutivo pelo painel (API e UI validadas em ambiente descartável).
- [x] Revogar acesso preservando UID/histórico, inclusive TI global (integração e interface validadas).
- [x] Separar cartões vinculados e desvinculados, com busca única por nome/matrícula/UID, filtro por perfil e ordenação alfabética/ordem de cadastro (build de produção validado; teste de interface atualizado).
- [ ] Validar fisicamente dois cartões diferentes no novo fluxo consecutivo e a revogação em uma tranca real sincronizada.

- [x] Reiniciar navegação em Ambientes ao sair/entrar e restringir renderização/consulta de Configurações ao administrador (trocas admin/portaria, mesma conta e restrição de Configurações validadas em navegador com API simulada).
- [x] Interface em português e espanhol do Uruguai, seletor na entrada e no painel, marca CLACK com porta azul, três marcas amarelas e wordmark sem subtítulo, e portas coloridas na planta (build de produção e alternância/persistência PT/ES verificadas no painel local; teste de interface ampliado).
- [x] Polimento visual moderado: acento de cor nos indicadores de disponibilidade, cartões de sala com elevação discreta, retorno tátil nos botões e respeito à preferência por movimento reduzido (assets do painel sincronizados; Vite não conseguiu iniciar o compilador neste ambiente: `spawn EPERM`).

## Prioridade 1 — colocar uma unidade funcionando na bancada
- [x] Configurar o PlatformIO para usar LittleFS.
- [ ] Montar ESP32 + RC522 e confirmar os UIDs dos cartões reais.
- [ ] Ligar o MG90S em fonte externa de 5 V com GND comum e calibrar os ângulos sem carga.
- [ ] Ligar o buzzer com o circuito adequado ao modelo comprado.
- [ ] Gravar e testar o modo armário: primeiro toque abre; retirar e tocar novamente fecha.
- [ ] Montar o mecanismo do trinco e repetir o teste com carga.

## Prioridade 2 — instalar servidor e testar o fluxo completo
- [x] Iniciar Docker no computador do William, configurar .env e validar login/painel.
- [x] Criar banco persistente e primeiro administrador no Docker.
- [x] Ajustar MOSI do cadastrador Pelado para GPIO 21, gravar firmware e confirmar resposta RC522 0x92 na COM23.
- [x] Aplicar exceção TCP 8080 ao bloqueio público do Docker, mantendo as demais portas bloqueadas e liberação restrita à interface Wi-Fi/sub-rede local.
- [x] Configurar hotspot Clack-Pelado em 2,4 GHz no notebook, preservar conexão UTEC-Invitados, publicar Docker no IP privado e confirmar associação real do ESP32.
- [x] Configurar início do hotspot ao entrar no Windows (com rede disponível); iniciador executado com sucesso, reinício do Windows ainda não validado.
- [x] Aplicar regra TCP 8080 restrita ao IP/interface e sub-rede do hotspot; confirmar presença online do Pelado com pedidos reais HTTP 200 (cadastrador depois desmontado para reaproveitar as peças na tranca Clack).
- [x] Validar captura física de UID pelo RC522 do Pelado, recebido pelo servidor; cartão permanente não cadastrado (cadastrador desmontado depois).
- [x] Atualizar o painel em 1 s e enviar eventos do firmware imediatamente; build Vite/Docker concluído e serviço saudável.
- [x] Evitar consultas sobrepostas no painel, reduzir para 5 s quando a aba fica oculta e retirar a lista de comandos não usada da resposta periódica da API.
- [x] Fazer a tranca consultar o servidor a cada 1 s e publicar estado/confirmação logo após executar um comando remoto (firmware compilado; gravação e medição física pendentes).
- [x] Instalar PlatformIO Core 6.2.0 no ambiente virtual do usuário e compilar o firmware atualizado da tranca 204.
- [ ] Gravar o firmware atualizado na tranca 204 e medir na bancada o tempo entre comando/leitura e atualização visual do painel.
- [x] Implementar no firmware da tranca a sinalização por três LEDs: verde disponível, vermelho ocupado/indisponível e amarelo piscando a cada 500 ms sem sincronização válida (compilação PlatformIO validada).
- [x] Implementar indicação temporária da troca em vermelho/amarelo/verde e confirmação local com três piscadas verdes de 200 ms ligado e 200 ms desligado; testes automatizados, compilação e gravação na tranca 204 concluídos em 09/11/2026.
- [ ] Instalar os LEDs e validar fisicamente a sequência, cancelamento, abertura/fechamento e retorno da sinalização de conexão, inclusive offline.
- [ ] Ligar e validar fisicamente os três LEDs da tranca 204, incluindo queda e retorno da conexão ao servidor.
- [ ] Revisar/importar dados antigos, se necessários.
- [ ] Criar cadastrador dedicado para a portaria, substituindo o Pelado desmontado para virar a tranca Clack; montar e cadastrar o novo dispositivo/token.
- [x] Cadastrar a sala 204 e a tranca Clack; integração física e abertura/fechamento validados.
- [ ] Inicializar LittleFS uma única vez e gravar o firmware completo.
- [x] Validar fisicamente leitura RFID, abertura/fechamento do servo e integração com o Clack na tranca 204.
- [ ] Validar LEDs de status, cadastro/revogação, permissões, transferência de professor, acesso da TI sem troca de responsável e intervenção da portaria.
- [ ] Testar corte de energia, reconexão, deduplicação do histórico e fila cheia em hardware.

Próximo passo: montar e cadastrar um novo cadastrador para substituir o Pelado.
Depois, validar cadastro consecutivo e revogação na tranca real; ligar e testar
os LEDs da tranca 204 (GPIO 26/32/33, com resistores), incluindo perda/retorno
do servidor; medir a latência percebida; e concluir os testes físicos de
permissões, persistência e mecanismo sob carga. Marcar testes físicos somente
após executá-los nos dispositivos reais.

## Prioridade 3 — fechar decisões e apresentação
- [ ] Confirmar a regra definitiva do perfil limpeza.
- [ ] Definir por quanto tempo uma permissão continua válida sem conexão.
- [ ] Identificar salas nas plantas e cadastrar suas posições/áreas clicáveis.
- [ ] Confirmar localização dos pontos provisórios e verificar horário após troca de responsável em hardware.
- [ ] Decidir se será adicionado sensor de porta/trinco; sem ele o estado continua apenas lógico.
- [ ] Melhorar recuperação/troca de dispositivo e migração dos dados legados.
- [ ] Calibrar a tranca final, construir a miniporta e imprimir peças em PETG.
- [ ] Montar roteiro, registrar evidências da demonstração e atualizar o documento do TCC II.

## Depois do protótipo
- [ ] Implementar HTTPS para uso além da bancada/rede isolada.
- [x] Registrar a decisão para o protótipo do TCC II: usar HTTP autenticado. MQTT era a proposta inicial.
- [ ] Avaliar proteção contra clonagem de UID para eventual implantação real.

## Upgrades futuros para o mestrado
- [ ] Adicionar display OLED à tranca.
- [ ] Adicionar bateria/UPS e medir consumo, autonomia e transição com o MG90S sob carga.

## Orçamento conhecido: uma tranca completa
| Componente | Valor informado |
|---|---:|
| ESP32 DevKit | R$ 45 |
| MG90S | R$ 20 |
| RC522 | R$ 22 |
| Bateria reaproveitada | R$ 0 |
| **Subtotal do protótipo atual** | **R$ 87** |

Upgrades adiados para o mestrado: display OLED (R$ 23) e UPS 1S 5 V/1 A (R$ 19).

Ainda cotar: fonte, proteção/acionamento adequado, buzzer, conectores/fios, fixações, mecanismo, miniporta e **um rolo de PETG**. Cadastrador e armário têm orçamentos separados; não confundir subtotal acima com custo final instalado.

- [x] Implementar acompanhamento do último comando e tempo até confirmação no painel (resolução de segundos).
- [ ] Validar build e testar confirmação/expiração com a tranca real; medir latência antes de alterar os intervalos.

- [x] Implementar diagnóstico por sala: sem dispositivo, primeiro contato, online e sem comunicação recente; idade do último contato calculada pelo servidor.
- [ ] Compilar e validar diagnóstico em português/espanhol.
- [x] Disponibilizar o iniciador Windows e o guia de instalação rápida.

- [x] Implementar backup Docker com nomes únicos, tratamento de falhas e checksum; documentar servidor central.
- [ ] Executar backup real e ensaio de restauração em banco descartável.
- [ ] Definir horário/destino e ativar agendamento de backup.
- [ ] Definir IP/DNS institucional, configurar HTTPS e validar duas máquinas simultâneas.

- [x] Executar testes de estado/posicionamento das salas.
- [x] Reforçar isolamento da suíte e adicionar verificações dos campos de acompanhamento de comandos.
- [x] Executar integração Docker em ambiente descartável e registrar medição da sincronização com 1 e 5 clientes simulados na [revisão do TCC](REVISAO-TCC-2026-11-20.md).
- [ ] Concluir os cenários físicos pendentes na matriz de validação, identificando a versão da placa.
