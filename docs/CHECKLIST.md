# Checklist Clack — 20/09/2026

## Software desenvolvido nesta etapa (validar na bancada)
- [x] Instalação de banco não destrutiva, configuração fora do Git.
- [x] Login individual, administrador/portaria, CSRF e auditoria.
- [x] Cartões: nome, matrícula ou NDA, quatro perfis, salas editáveis, bloqueio e desvinculação.
- [x] Cadastrador dedicado com captura reservada por operador.
- [x] Responsabilidade por sala, transferência entre professores e restrição do aluno.
- [x] Comandos remotos com prazo e confirmação separada do estado físico.
- [x] Painel React, tema claro/escuro persistente, mapa esquemático por andar.
- [x] Histórico com snapshots, ocorrência/recebimento e filtro por sala.
- [x] Firmware com OLED, cache offline e fila persistente com confirmação/deduplicação.
- [x] Modo armário sem servidor/tela, buzzer e um cartão configurado.

## Próximas metas obrigatórias
- [ ] Executar instalação no computador do William e em clone limpo; revisar dados antigos.
- [ ] Regravar firmware + inicializar LittleFS uma vez; validar leitura dos cartões.
- [ ] Confirmar regra de limpeza e tempo/política de acesso offline.
- [ ] Fornecer planta e cadastrar posições reais dos andares/salas.
- [ ] Testar corte de energia, reconexão, histórico e fila cheia em hardware.
- [ ] Validar alimentação, UPS de 1 A e MG90S sob carga; definir proteções/fonte.
- [ ] Calibrar tranca, construir miniporta e imprimir peças em PETG.
- [ ] Melhorar recuperação de dispositivo, migração de dados.
- [ ] HTTPS local; MQTT se mantido no escopo final (não implementado nesta entrega).
- [ ] Testar armário real, montar roteiro/evidências da defesa e atualizar documento TCC II.

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
