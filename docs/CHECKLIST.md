# Checklist Clack — 07/10/2026

## Software desenvolvido nesta etapa (validar na bancada)
- [x] Instalação de banco não destrutiva, configuração fora do Git.
- [x] Login individual, administrador/portaria, CSRF e auditoria.
- [x] Cartões: nome, matrícula ou NDA, cinco perfis, salas editáveis, TI global, bloqueio e desvinculação.
- [x] Cadastrador dedicado com captura reservada por operador.
- [x] Responsabilidade por sala, transferência entre professores e restrição do aluno.
- [x] TI com acesso global e abertura de sala ocupada sem assumir a atividade no painel.
- [x] Comandos remotos com prazo e confirmação separada do estado físico.
- [x] Painel React, tema claro/escuro persistente e seleção dos três andares.
- [x] Plantas estilizadas dos três andares integradas em orientação horizontal, com zoom e abertura da imagem completa.
- [x] Plantas com fundo externo transparente e sem os textos dos andares na imagem.
- [x] Indicadores na ordem Disponível → Em uso → Em uso pela TI → Em uso pela limpeza, preservando as cores.
- [x] Quadrados verde/amarelo/laranja/vermelho, consulta por mouse/teclado/toque de responsável, matrícula e início de uso.
- [x] Posicionamento por clique, coordenadas percentuais e indicação explícita de pontos provisórios.
- [x] Posicionamento no cadastro/edição da sala: planta por andar, clique, zoom e limpeza da seleção ao trocar de andar.
- [x] Tutorial específico da primeira sala, incluindo posicionamento antes de salvar.
- [x] Remoção da frase sobre sensores na tela de Ambientes; limites físicos mantidos na documentação técnica.
- [x] Atualização idempotente para banco versão 3 (perfil TI e posições na planta).
- [x] Docker Compose com build do painel, Apache/PHP, MySQL e volumes persistentes.
- [x] Tutorial completo de instalação/uso com Docker, rede do ESP32, atualização e backup/restauração.
- [x] Histórico com snapshots, ocorrência/recebimento e filtro por sala.
- [x] Firmware com OLED, cache offline e fila persistente com confirmação/deduplicação.
- [x] Modo armário sem servidor/tela, buzzer e um cartão configurado.

- [x] Diagnóstico serial de Wi-Fi/IP, transporte HTTP e comunicação RC522, sem expor senha/token (leitura física do Pelado validada; fluxo consecutivo e revogação em tranca real ainda pendentes).

- [x] Liberar reserva após leitura/cancelamento, recuperar leitura do mesmo operador e permitir cadastro consecutivo pelo painel (API e UI validadas em ambiente descartável).
- [x] Revogar acesso preservando UID/histórico, inclusive TI global (integração e interface validadas).
- [ ] Validar fisicamente dois cartões diferentes no novo fluxo consecutivo e a revogação em uma tranca real sincronizada.

- [x] Reiniciar navegação em Ambientes ao sair/entrar e restringir renderização/consulta de Configurações ao administrador (trocas admin/portaria, mesma conta e restrição de Configurações validadas em navegador com API simulada).

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
- [x] Aplicar regra TCP 8080 restrita ao IP/interface e sub-rede do hotspot; confirmar presença online do Pelado com pedidos reais HTTP 200.
- [x] Validar captura física de UID pelo RC522 do Pelado, recebido pelo servidor; cartão permanente não cadastrado.
- [ ] Revisar/importar dados antigos, se necessários.
- [ ] Cadastrar uma sala, uma tranca e o cadastrador da portaria.
- [ ] Inicializar LittleFS uma única vez e gravar o firmware completo.
- [ ] Validar RFID, OLED, servo, cadastro, permissões, transferência de professor, acesso da TI sem troca de responsável e intervenção da portaria.
- [ ] Testar corte de energia, reconexão, deduplicação do histórico e fila cheia em hardware.

Próximo passo: [configurar a primeira sala](PRIMEIRA-SALA.md), posicionar na
planta e conectar uma tranca e um cadastrador. Marcar cadastros e testes físicos
somente após executá-los com os dispositivos reais. A validação automatizada do
formulário usa API simulada e não cria salas no banco de demonstração.

## Prioridade 3 — fechar decisões e apresentação
- [ ] Confirmar a regra definitiva do perfil limpeza.
- [ ] Definir por quanto tempo uma permissão continua válida sem conexão.
- [ ] Identificar salas nas plantas e cadastrar suas posições/áreas clicáveis.
- [ ] Confirmar localização dos pontos provisórios e verificar horário após troca de responsável em hardware.
- [ ] Decidir se será adicionado sensor de porta/trinco; sem ele o estado continua apenas lógico.
- [ ] Melhorar recuperação/troca de dispositivo e migração dos dados legados.
- [ ] Calibrar a tranca final, construir a miniporta e imprimir peças em PETG.
- [ ] Medir consumo, autonomia e transição da UPS de 1 A com o MG90S sob carga.
- [ ] Montar roteiro, registrar evidências da demonstração e atualizar o documento do TCC II.

## Depois do protótipo
- [ ] Implementar HTTPS para uso além da bancada/rede isolada.
- [ ] Decidir se MQTT continua no escopo; a versão atual usa HTTP autenticado.
- [ ] Avaliar proteção contra clonagem de UID para eventual implantação real.

## Orçamento conhecido: uma tranca completa
| Componente | Valor informado |
|---|---:|
| ESP32 DevKit | R$ 45 |
| MG90S | R$ 20 |
| RC522 | R$ 22 |
| OLED | R$ 23 |
| Bateria reaproveitada | R$ 0 |
| UPS 1S 5 V/1 A | R$ 19 |
| **Subtotal** | **R$ 129** |

Ainda cotar: fonte, proteção/acionamento adequado, buzzer, conectores/fios, fixações, mecanismo, miniporta e **um rolo de PETG**. Cadastrador e armário têm orçamentos separados; não confundir subtotal acima com custo final instalado.
