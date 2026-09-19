# Clack — checklist de execução

Defesa prevista para dezembro de 2026, sem data exata. Prioridade: parte prática.
Marcações concluídas abaixo significam código alterado nesta branch, não homologação
no hardware nem merge na main.

## 1. Base reproduzível (etapa atual)
- [x] Centralizar conexão PHP e separar credenciais locais.
- [x] Corrigir divergência de matrícula entre banco e logs.
- [x] Remover DROP TABLE da instalação e fornecer migração não destrutiva.
- [x] Validar entradas e métodos; erro não vira comando de fechamento.
- [x] Usar transação para mudança de estado e histórico.
- [x] Declarar funções C++, configurar rede/pinos e limitar espera HTTP.
- [x] Escapar conteúdo do banco ao renderizar o painel.
- [x] Documentar instalação e atualização.
- [ ] Executar instalação em outro computador e testar ESP32 real.

## 2. Hardware (em paralelo)
- [x] Escolher OLED SSD1306 I2C 0,96, 128x64, compatível com 3,3 V.
- [x] Definir RST do RFID em GPIO27 após instalação do OLED; SDA21/SCL22.
- [x] Escolher UPS 1S 5 V/1 A para orçamento, pendente de teste.
- [ ] Testar OLED, RFID e servo juntos.
- [ ] Medir percurso da cremalheira e validar MG90S de posição.
- [ ] Conferir proteção da UPS e necessidade de BMS externo; escolher fonte.
- [ ] Testar célula reaproveitada, picos do servo e troca fonte/bateria.
- [ ] Definir sensor de porta/posição e relógio RTC.
- [ ] Medir autonomia e registrar limitações.

## 3. Perfis e regras (próxima etapa de software)
- [ ] Criar perfis: professor, limpeza, aluno autorizado, acesso completo.
- [ ] Permissões por sala, com predefinições e lista final personalizada.
- [ ] Professor abre e mantém livre; outro professor assume sem trancar.
- [ ] Responsável atual encerra ao apresentar o cartão novamente.
- [ ] Aluno autorizado inicia somente após a sala ser liberada; não assume
      diretamente de outro responsável; encerra seu próprio uso.
- [ ] Portaria intervém para abrir/trancar; sem fechamento automático por horário.
- [ ] Fechar regra da limpeza enquanto a sala está em uso (ainda não decidida).
- [ ] Impedir repetição enquanto o mesmo cartão permanece no leitor.
- [ ] Separar estado de uso, comando e confirmação física.

## 4. Offline e histórico
- [ ] Permissões e responsável persistentes na ESP32.
- [ ] Registrar eventos antes do envio; IDs únicos, confirmação e reenvio.
- [ ] Reconectar sem duplicar eventos ou impor estado antigo do servidor.
- [ ] Definir limite da fila e comportamento quando cheia.
- [ ] Definir política para permissões antigas e horário sem rede.

## 5. Comunicação
- [ ] Integrar MQTT/broker local (arquitetura proposta).
- [ ] Autenticar dispositivos e restringir comandos/tópicos.
- [ ] Mostrar conectividade, última comunicação e confirmação dos comandos.
- [ ] Expirar comandos antigos; testar reconexão.

## 6. Portaria e cadastrador
- [ ] Login individual; administrador gerencia contas e permissões do painel.
- [ ] Cadastro: nome, matrícula ou NDA, perfil, ambientes e cartão.
- [ ] Campo de busca de salas, predefinições e remoção individual.
- [ ] Montar leitor dedicado e capturar UID em sessão de cadastro.
- [ ] Bloquear/reassociar cartão sem apagar histórico da pessoa anterior.
- [ ] Registrar operador e mostrar distribuição pendente por tranca.

## 7. Interface
- [ ] Front-end React com componentes selecionados do 21st.
- [ ] Tema claro/escuro imediato e preferência persistente.
- [ ] Obter planta/rascunho dos andares do IFSul.
- [ ] Mapa interativo: disponível, em uso, manutenção e detalhes da sala.
- [ ] Exibir offline e horário do último estado conhecido separadamente.
- [ ] Histórico com filtros e telas de gestão.

## 8. Entregas físicas e defesa
- [ ] Mensagens no OLED para liberação, transferência, negativa e falhas.
- [ ] Versão básica para armários: sem servidor/tela, com buzzer.
- [ ] Miniporta e carcaça PETG.
- [ ] Medir latência, confiabilidade, autonomia e custo; guardar evidências.
- [ ] Demonstrar queda do servidor/rede e sincronização posterior.
- [ ] Escrever TCC II com o que foi efetivamente implementado/testado.

## Orçamento informado — uma tranca
| Item | Valor |
|---|---:|
| ESP32 DevKit | R$45,00 |
| MG90S | R$20,00 |
| RC522 | R$22,00 |
| OLED | R$23,00 |
| Bateria reaproveitada | R$0,00 |
| UPS 5 V/1 A (teste pendente) | R$19,00 |
| Subtotal | **R$129,00** |

Fonte, eventual proteção externa, fios/conectores, fixação e rolo PETG 1 kg:
preços pendentes. Rolo inteiro no desembolso; gramas usados no custo unitário.
