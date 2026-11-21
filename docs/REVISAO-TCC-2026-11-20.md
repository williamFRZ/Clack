# Clack — revisão para a entrega do TCC II

**20/11/2026.** Base local da `main` em `1c6294b`, com alterações de marca e de exclusão/arquivamento de salas ainda na cópia de trabalho. Este parecer descreve a versão do computador de testes. O servidor e o MySQL estavam saudáveis no Compose. A última comunicação registrada para a tranca 204 era de **15/11/2026 às 20:20:22 UTC**.

**Parecer:** o servidor dispõe das funções necessárias para apresentar o protótipo de bancada. Há evidência de integração do software e de parte do funcionamento físico em versão anterior. Para encerrar a validação do conjunto atual, falta ligar as duas evidências em um ensaio da 204 com esta versão e registrar o resultado. Implantação institucional requer controles adicionais.

## O que sustenta cada objetivo do TCC I

| Objetivo do artigo (§3) | Evidência disponível | Como usar no texto |
|---|---|---|
| Protótipo RFID com gestão web centralizada | ESP32/RC522/MG90S, firmware de sala, painel React, API PHP, MySQL, perfis, mapa, gestão de cartões, intervenções e histórico. Transferência de responsabilidade testada na 204 em 09/11. | Descrever arquitetura, decisão local e sincronização. Distinguir tranca de sala, cadastrador e programa independente de armário. O autocadastro por 10 s pertence ao armário, não às salas do campus. |
| Usabilidade e impacto para docentes e limpeza | Fluxos implementados e testes de interface com dados simulados. Não localizei protocolo concluído com participantes e resultados observados no instituto. | Apresentar as tarefas suportadas e a demonstração. Reservar afirmações sobre redução de trabalho, satisfação ou tempo na rotina para dados com participantes. Definir com a equipe o comportamento esperado do perfil limpeza. |
| Integridade e resistência do chassi | Registro de consumo de 186 g de PETG para dois chassis e orçamento ilustrado. Sem série documentada de carga, ciclos ou desgaste da montagem final. | Relatar material, consumo e construção. Fotografar a peça e informar limites do ensaio. Impressão bem-sucedida não mede resistência ou vida útil. |
| Desempenho do servidor sob várias atualizações | Ensaio HTTP local com clientes simulados, descrito abaixo. A observação anterior de até 2 s entre ação e painel veio de bancada. | Apresentar os resultados em separado. A latência do endpoint não mede o tempo de leitura, servo, polling e atualização visual juntos. |
| Sincronização assíncrona durante falhas | Cache de permissões, fila persistente com limite de 64 eventos, confirmação por sequência, deduplicação e reconciliação. A integração testa repetição e preservação do estado. | Descrever a regra quando a fila fica cheia e a revogação que depende de sincronização. Reconexão depois de interrupção elétrica no mecanismo final continua como ensaio físico pendente. |
| Segurança lógica e privacidade no tráfego | Contas individuais, papéis, hash de senha, CSRF, identidade por dispositivo e auditoria. HTTP na rede local. Revisão de segurança de 20/11 identificou senha administrativa ativa igual ao padrão público. | Descrever controles e riscos residuais. Para evidências no artigo, usar nomes, matrículas e UIDs fictícios. Conformidade com a LGPD não foi avaliada formalmente. |

**Mudanças de escopo acordadas:** o protótipo usa HTTP autenticado em lugar de MQTT. A alimentação por baterias reaproveitadas foi adiada. A importação de PDFs de horários também ficou para uma etapa posterior. Hoje um professor autorizado pode assumir a sala pela permanência da tag, sem consulta à grade. O armário é cenário de demonstração; não substitui avaliação com os participantes do instituto.

## Medição do endpoint de sincronização

Também foi concluído um [ensaio com 50 trancas simuladas, 500 usos completos e consultas simultâneas do painel](ensaios/dia-ifsul-50-2026-11-20/README.md), com um cenário de aberturas e fechamentos distinto da medição de sincronização ociosa abaixo.

| Clientes simulados | Respostas válidas / medidas | Mediana | Percentil 95 | Máximo |
|---:|---:|---:|---:|---:|
| 1 | 20/20 | 27,1 ms | 39,4 ms | 43,2 ms |
| 5 | 100/100 | 32,4 ms | 65,3 ms | 78,7 ms |

Docker Desktop no Windows, motor 29.8.0, com 16 CPUs lógicas e aproximadamente 3,8 GiB disponíveis ao motor. MySQL 8.4 e serviço web criados pelo Compose do projeto em volumes vazios. Cinco salas fictícias, cada uma com uma identidade de dispositivo. Cada cliente enviou uma sincronização autenticada sem eventos ou permissões, pela interface de loopback. Uma rodada de aquecimento foi descartada em cada cenário. Nas 20 rodadas medidas, os clientes foram disparados em paralelo, aproximadamente uma vez por segundo por cliente. O tempo foi medido no cliente com relógio monotônico até a leitura e decodificação da resposta. O P95 usa o posto mais próximo superior.

O resultado descreve a sincronização ociosa em uma única execução local. Não representa capacidade máxima, cinco trancas físicas nem latência de abertura. Rede Wi-Fi, lotes de eventos, muitos cartões, históricos grandes e comandos simultâneos exigem ensaios separados. [Dados por requisição](ensaios/sincronizacao-2026-11-20.csv) · [Script de reprodução](../tests/medir_sincronizacao.py). Para repetir, use Python 3 e Docker Compose com a porta de loopback 18388 livre e rode `python tests/medir_sincronizacao.py`; a saída padrão é o CSV.

## Verificações técnicas e pendências

- **Servidor, API e banco.** A última execução da suíte Docker, com as alterações de salas já presentes, passou em banco descartável: autenticação, papéis, comandos, arquivamento sem perda de histórico, recriação dos containers e restauração do dump de teste. O backup da instalação em uso, com guarda de configuração e ensaio de restauração separado, ainda merece evidência própria. A atualização do painel não exige apagar volumes.
- **Painel.** Nesta revisão passaram o teste dos marcadores e os testes de navegador de login, cartões e histórico com API simulada. O roteiro geral `tests/ui_test.cjs` parou na troca por teclado de português para espanhol no login (linha 127). O seletor agenda foco por quadro de animação, e o teste envia as teclas imediatamente. Isso é uma hipótese de temporização; reproduzir com inspeção de foco, corrigir a causa e executar o roteiro inteiro antes de declarar a navegação bilíngue validada. No servidor PHP de desenvolvimento, `router.php` não inclui SVG na lista de arquivos permitidos do painel; as marcas agora usam esse formato. Verificar/corrigir o caminho sem Docker. O Apache do Docker já serve as marcas.
- **Firmware e hardware.** Cinco programas de teste C++ passaram nesta revisão: regras, interpretação de comando, confirmação por tag, indicação por LEDs e armário offline. Foram compilados para computador. A configuração local da placa ainda cita o IP anterior do servidor; a versão efetivamente gravada precisa ser identificada. Investigar conexão do leitor RC522 e a divergência de sequência anteriormente observada antes de regravar; preservar a fila local. LEDs instalados segundo o responsável; falta validar as três cores e o circuito de limitação de corrente. A confirmação de um comando é lógica; a montagem não tem sensor de posição do trinco.
- **Instalação, documentação e reprodutibilidade.** O iniciador Windows e o guia existem. O checklist acumulou pendências antigas sobre criação do iniciador, instalação dos LEDs, decisão sobre MQTT e execução de testes Docker. Para a versão do texto, usar os resultados datados, identificar o firmware usado e registrar um commit que contenha as funções retratadas nas figuras. A posição sugerida de uma sala na planta é provisória até conferência física.
- **Orçamento.** Na [planilha de recursos](../Recursos/), uma tranca foi estimada em R$ 135,31 e um cadastrador em R$ 99,93. R$ 235,24 representa um conjunto e o material consumido. O valor não inclui frete, tags avulsas e materiais sem quantidade confirmada. Distinguir preço pesquisado de despesa efetivamente paga.
- **Operação em rede.** Antes do piloto institucional, tratar credencial inicial pública, HTTPS nos dois clientes, duração da sessão na portaria e validade do cache offline. Definir IP/DNS estável, alcance de rede, permissões para visualizar dados pessoais e recuperação após falhas. O relatório de segurança anterior detalha ainda dependências de desenvolvimento e cabeçalhos do navegador.

## Critério mínimo para fechar a bancada

1. Registrar versão do servidor e firmware, data, topologia, alimentação e estado inicial da 204. Confirmar contato recente sem zerar banco ou memória. Usar dois cartões de teste autorizados e um sem permissão.
2. Testar abertura com A, toque curto e transferência por 3 s com B, fechamento com B e negativa do cartão sem permissão. Em cada caso, anotar separadamente movimento observado, responsável no painel e evento do histórico.
3. Enviar um comando pelo painel com o mecanismo visível. Anotar tempos entre solicitação, movimento e atualização. Repetir com o mesmo procedimento e informar quantidade de tentativas, falhas e faixa observada.
4. Interromper somente a rede, realizar uma atividade por cartão e reconectar. Conferir quantidade e ordem de eventos e verificar se a atividade apareceu uma única vez. Revogar um cartão, sincronizar e confirmar a negativa na tranca.
5. Guardar evidências anonimizadas e anotar o que falhou. Se o hardware não estiver disponível antes da entrega, usar o resultado físico de 09/11 com a data e identificar esta rodada como integração de software. Manter ensaio de resistência e avaliação com usuários como resultados pendentes.
