# Checklist Clack — 02/10/2026

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
- [x] Quadrados verde/amarelo/laranja/vermelho, consulta por mouse/teclado/toque de responsável, matrícula e início de uso.
- [x] Posicionamento por clique, coordenadas percentuais e indicação explícita de pontos provisórios.
- [x] Atualização idempotente para banco versão 3 (perfil TI e posições na planta).
- [x] Histórico com snapshots, ocorrência/recebimento e filtro por sala.
- [x] Firmware com OLED, cache offline e fila persistente com confirmação/deduplicação.
- [x] Modo armário sem servidor/tela, buzzer e um cartão configurado.

## Prioridade 1 — colocar uma unidade funcionando na bancada
- [x] Configurar o PlatformIO para usar LittleFS.
- [ ] Montar ESP32 + RC522 e confirmar os UIDs dos cartões reais.
- [ ] Ligar o MG90S em fonte externa de 5 V com GND comum e calibrar os ângulos sem carga.
- [ ] Ligar o buzzer com o circuito adequado ao modelo comprado.
- [ ] Gravar e testar o modo armário: primeiro toque abre; retirar e tocar novamente fecha.
- [ ] Montar o mecanismo do trinco e repetir o teste com carga.

## Prioridade 2 — instalar servidor e testar o fluxo completo
- [ ] Executar instalação no computador do William a partir de um clone limpo.
- [ ] Criar banco, conta administrativa e revisar/importar dados antigos.
- [ ] Cadastrar uma sala, uma tranca e o cadastrador da portaria.
- [ ] Inicializar LittleFS uma única vez e gravar o firmware completo.
- [ ] Validar RFID, OLED, servo, cadastro, permissões, transferência de professor, acesso da TI sem troca de responsável e intervenção da portaria.
- [ ] Testar corte de energia, reconexão, deduplicação do histórico e fila cheia em hardware.

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
