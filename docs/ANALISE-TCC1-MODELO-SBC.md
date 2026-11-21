# Análise do TCC I e preparação do artigo final

**Projeto:** Clack — controle de acesso acadêmico com trancas inteligentes  
**Data da análise:** 21/11/2026

## Objetivo desta análise

Esta análise compara o PDF corrigido do TCC I com os arquivos do modelo SBC fornecidos e com os registros disponíveis do projeto. O objetivo é preparar a continuidade do texto, preservando a proposta, os trabalhos correlatos e as referências do autor, com atualização das informações necessárias para descrever o protótipo executado.

**Material examinado:** `TCC_1__CLACK__Automatizando_o_Fluxo_de_Acesso_Acadêmico_Via_Trancas_Inteligentes_corrigido.pdf`, `main.tex`, `sbc-template.sty`, `sbc.bst`, `sbc-template.bib`, repositório local do Clack e relatórios dos ensaios. O PDF tem 11 páginas totais; a seção de referências começa na página 10 e continua na 11. A página 10 contém corpo do artigo e referências, portanto ela não pode ser contada integralmente como uma página exclusiva de referências.

O `main.tex` disponível é o documento de instruções genéricas da SBC. O arquivo-fonte LaTeX específico do TCC I e sua bibliografia `.bib` própria ainda não estavam entre os arquivos analisados. O `.bib` do modelo tem apenas três referências exemplificativas e não substitui a bibliografia do Clack. Esta análise foi feita a partir do conteúdo do PDF corrigido e dos arquivos recebidos, sem compilar a fonte original do artigo.

## 1. Comparação com o modelo SBC

| Item | Modelo fornecido | Observação sobre o PDF do TCC I | Encaminhamento para o artigo final |
|---|---|---|---|
| Formato | A4, uma coluna, margens superior de 3,5 cm, inferior de 2,5 cm e laterais de 3 cm; fonte base de 12 pt. | O PDF tem páginas A4 e apresenta uma coluna. A primeira página e a página 10 foram examinadas visualmente. | Usar o `.sty` fornecido. Verificar o PDF gerado antes da entrega, inclusive que não haja outro pacote sobrescrevendo a geometria. |
| Paginação | O `.sty` configura o documento sem números de página. | A primeira e a décima páginas examinadas não mostram numeração. | Manter a configuração, salvo orientação institucional diferente. |
| Título e autoria | Título, autores, instituições e e-mails na primeira página. | O PDF apresenta título, três nomes, uma instituição e três e-mails. As marcações de afiliação e as dos e-mails precisam ser conferidas na fonte. | Manter a identificação do trabalho e confirmar autores, papel de orientadores e afiliações com William antes da versão final. |
| Abstract e resumo | Para artigo em português, ambos na primeira página; até dez linhas cada. | Ambos aparecem na primeira página, seguidos por palavras-chave. O limite deve ser conferido na diagramação final, pois palavras-chave, quebras e metadados ocupam espaço na mesma área. | Atualizar os dois textos com objetivo, método, resultados realmente obtidos e conclusão sustentada. Não inferir se as palavras-chave contam no limite institucional sem confirmação. |
| Seções | O modelo demonstra comandos de seção e subseção, mas não impõe uma lista única de capítulos de pesquisa. | O TCC I contém introdução, correlatos, objetivos, revisão, metodologia, resultados parciais e cronograma. | Preservar essa base e reorganizá-la apenas quando necessário para inserir desenvolvimento, resultados, discussão e conclusão. |
| Figuras e tabelas | O arquivo demonstra figuras com legenda após a imagem e determina legenda de tabela antes da tabela. Legendas são centralizadas quando curtas e usam o estilo do template. | No PDF, as figuras 4 e 5 têm título acima e fonte abaixo. Isso difere da posição usada no exemplo de figura do `main.tex`, embora a orientação textual do exemplo não fixe expressamente a posição para todas as figuras. | Conferir o padrão com os orientadores; manter fontes e identificar autoria. Usar `\\caption` e `\\label`, com numeração gerada pelo LaTeX. |
| Referências | O exemplo usa `\\bibliographystyle{sbc}` e uma base `.bib`. | A lista do PDF registra 15 entradas, de Alves e Corrêa a WOKWI. | Preservar as entradas originais no material de trabalho, recuperar suas chaves BibTeX e conferir os dados e o vínculo de cada citação ao texto. |
| Extensão | O arquivo de exemplo remete ao limite estabelecido pelo evento. | O PDF do TCC I possui 11 páginas, incluindo a seção de referências iniciada na página 10. | Aplicar a orientação de William: **10 a 20 páginas de texto, sem contar as referências**. Conferir o entendimento de página mista com a coordenação/orientadores. |

O limite de páginas foi informado pelo autor e não decorre do exemplo da SBC. Não foi localizada, entre os arquivos fornecidos, norma institucional complementar que determine se uma página compartilhada com o início das referências entra na contagem. A diagramação final deve ser revisada com essa regra em mente.

## 2. Mapa de continuidade do TCC I

| Parte do TCC I | Conteúdo a preservar | Atualização necessária para o TCC II |
|---|---|---|
| **Resumo e abstract** | O problema de gestão de chaves no campus, o objetivo do controle de acesso e a combinação entre RFID, ESP32 e gerenciamento web. | Reescrever após os resultados, distinguindo o que foi desenvolvido e testado. Manter as versões equivalentes em português e inglês. |
| **1. Introdução** | Contexto institucional, motivação, necessidade de organização dos acessos, objetivo e justificativa do projeto. | Distinguir necessidades observadas de efeitos medidos. Evitar afirmar que filas foram eliminadas ou que houve economia de tempo sem dados de usuários. Rever a descrição de rede e energia para refletir a implementação atual. |
| **2. Trabalhos correlatos** | Pesquisas e referências escolhidas no TCC I, inclusive os sistemas RFID, MQTT, gestão web e operação offline como pontos de comparação. | Conservar os trabalhos, resumindo sua contribuição e o que foi efetivamente confirmado em cada fonte. MQTT pode permanecer como tecnologia de outros estudos mesmo com HTTP no Clack. Distinguir diferenças de arquitetura e de testes. |
| **2.1 Diferencial da proposta** | Integração entre dispositivo, acesso local e gestão centralizada, além do interesse em fabricação acessível. | Reformular o diferencial conforme o projeto construído. A bateria reaproveitada foi adiada; o texto não deve atribuir ao protótipo uma autonomia energética que não foi implementada. Caracterizar PETG conforme o material efetivamente usado, sem presumir conteúdo reciclado ou benefício ambiental mensurado. |
| **3. Objetivos** | Objetivo geral e os cinco objetivos específicos do TCC I. | Manter os objetivos como referência do estudo e, na discussão, indicar o atendimento, as evidências e as limitações de cada um. Se houver mudança formal de escopo, alinhá-la com os orientadores. |
| **4. Revisão bibliográfica** | Fundamentação de IoT, ESP32, RFID/NFC, comunicação, segurança e tolerância a falhas; fontes já utilizadas. | Retirar repetições com os correlatos, sem suprimir referências dadas. Tratar NFC/HCE e MQTT como contexto quando aplicável, sem atribuir ao Clack recursos não demonstrados. Acrescentar HTTP/HTTPS para explicar a escolha implementada. |
| **5. Metodologia** | Pesquisa aplicada, consulta bibliográfica, desenvolvimento do protótipo, eletrônica, estrutura mecânica e software. | Descrever ações realizadas, hardware e versões, regras de acesso e topologia, procedimentos, ambiente, medições e critérios. Separar condições de bancada, simulação e eventual teste no instituto. |
| **6. Resultados parciais** | Fotografias, construção inicial e o que de fato já havia sido obtido no TCC I. | Transformar expectativas em uma seção de resultados e discussão com evidências datadas. Fotografias da montagem inicial permanecem úteis para documentar a evolução se identificadas como tal. |
| **7. Cronograma** | Registro do planejamento do TCC I. | Preservar o cronograma no histórico de trabalho. Sua presença no artigo final depende da orientação do curso e do espaço disponível; não há determinação no `main.tex` da SBC. |
| **Conclusão** | O TCC I apresenta projeções de resultados, sem uma seção de conclusão final autônoma. | Acrescentar síntese do que foi desenvolvido e testado, comparar com os objetivos e registrar limitações e trabalhos futuros, sem tratar previsões como medições. |

## 3. Pontos técnicos a reconciliar com o protótipo

1. **Comunicação.** O TCC I prevê MQTT e broker. A versão local implementa HTTP autenticado entre dispositivo e servidor. Apresentar MQTT na literatura e registrar a mudança técnica como decisão do projeto. A avaliação anterior não estabeleceu comparação experimental de consumo ou latência entre os dois protocolos.
2. **Falha de rede e energia.** A tranca pode trabalhar com permissões locais e manter eventos para sincronizar após o retorno da rede, sujeita às condições do firmware. Isso não comprova funcionamento durante falta de energia. A bateria/no-break inicialmente proposta foi adiada.
3. **Segurança e dados pessoais.** A fundamentação sobre TLS e proteção do ESP32 deve permanecer atribuída aos trabalhos citados, sem afirmar que todos esses mecanismos estão ativos no Clack. A revisão local encontrou HTTP e senha administrativa padrão pública; a conformidade com a LGPD ainda não foi formalmente avaliada.
4. **Hardware e material.** O projeto atual documenta ESP32, RC522 e microservo MG90S; o usuário informou PETG verde F3D. Confirmar o modelo efetivamente montado e identificar fotos antigas como etapas de desenvolvimento. Não confundir PETG com PET reciclado ou afirmar resistência sem ensaio.
5. **NFC e celular.** O TCC I discute HCE como referência em trabalho correlato. Esse contexto pode ser preservado, desde que o artigo não descreva desbloqueio por celular como função do Clack sem evidência de implementação e teste.
6. **Responsabilidade e horários.** A versão atual permite a um professor autorizado assumir uma sala mantendo a tag por três segundos; a confirmação por grade de horários e a importação de PDFs não foram implementadas. O perfil completo também segue a regra de transferência no código. O acesso da TI a sala em uso mantém o responsável anterior.
7. **Estado da porta.** O painel registra estado lógico e confirmação do dispositivo. O protótipo não foi descrito com sensor que comprove a posição mecânica do trinco; não apresentar a informação como medição física direta.
8. **Economia.** O orçamento local estima uma tranca em R$ 135,31 e um cadastrador em R$ 99,93, com referência de novembro de 2026 e itens ainda não incluídos. Preço pesquisado, custo de material consumido e valor efetivamente pago são métricas diferentes. Comparações com produtos comerciais exigem modelos, datas e fontes compatíveis.

## 4. Objetivos originais e evidências a buscar

| Objetivo específico do TCC I | Material existente ou evidência necessária |
|---|---|
| Avaliar impacto operacional e usabilidade com docentes e equipe de limpeza | Registrar se houve teste com participantes, tarefas, número de pessoas, local, consentimento conforme a orientação institucional e resultados. Se não houve, apresentar apenas o que foi observado em bancada e indicar a avaliação em campo como pendente. |
| Investigar integridade física e resistência mecânica do chassi | Fotos e informações de impressão demonstram construção. Uma conclusão de resistência requer protocolo de ciclos, carga ou inspeção e seus resultados. Registrar a montagem e o que efetivamente foi possível testar. |
| Avaliar o desempenho do servidor sob várias requisições | Em ambiente local, 50 trancas simuladas enviaram 3.060 requisições em 60,04 s, sem erro e com 1.000 eventos esperados. Medianas de 127 ms para abertura, 131 ms para fechamento e 110 ms para consultas ao painel. Identificar que são respostas HTTP simuladas, medidas no cliente, e informar cenário e limitações. [Relatório do ensaio](ensaios/dia-ifsul-50-2026-11-20/README.md). |
| Desenvolver sincronização assíncrona durante falhas | Descrever cache local, fila persistente, identificadores de sequência e deduplicação conforme o firmware e a API. A integração simulada testa a lógica; registrar separadamente os resultados obtidos na placa física durante perda e retorno de rede. |
| Alinhar diretrizes de segurança e privacidade | Relatar contas, papéis, autenticação do dispositivo, controles de sessão e auditoria, incluindo as limitações encontradas. Não declarar que o sistema atende integralmente à LGPD sem avaliação e evidência próprias. |

A observação do usuário de cerca de dois segundos entre a ação e a atualização no painel pode ser relatada como **observação inicial de bancada**, com data e condições disponíveis. Não deve ser apresentada como média, percentil ou resultado estatístico, pois não há série de medições registrada para ela.

## 5. Inventário das referências que devem ser preservadas

As entradas abaixo reproduzem a identificação visível no PDF, para reconciliação com a futura bibliografia BibTeX. **Manter a base original e suas chaves quando o autor fornecer os arquivos.** As verificações pontuais aqui identificam fontes úteis ou pontos de atenção; não constituem uma auditoria completa de todas as afirmações de cada obra.

| Referência presente no TCC I | Uso no trabalho ou providência |
|---|---|
| Alves e Corrêa (2022), *Desenvolvimento de um sistema de controle de acesso a salas por RFID com reservas via Web* | Manter nos correlatos. Há [texto no repositório do IFRS](https://repositorio.ifrs.edu.br/bitstream/handle/123456789/1208/1234567891208.pdf?isAllowed=y&sequence=1). Conferir os metadados bibliográficos e a afirmação específica sustentada em cada citação. |
| Bispo (2019), *Sistema de controle de acesso via RFID/NFC* | Manter em correlatos e no contexto de RFID/NFC e MQTT. O [trabalho da UFPE](https://repositorio.ufpe.br/bitstream/123456789/46991/1/BRENO%20CORDEIRO%20BISPO-SISTEMA%20DE%20CONTROLE%20DE%20ACESSO%20VIA%20RFID_NFC.pdf) identifica o autor e o título. |
| Borin e Perpétuo (2023), *Abertura de fechadura elétrica por aproximação com RFID passivo* | Manter como referência de RFID e fechadura. O [registro do UniCEUB](https://repositorio.uniceub.br/items/61177535-d8cb-44eb-ab61-45e3143ca2c1/full) foi localizado. |
| Cruz Junior (2024), *Sistema de controle de acesso utilizando internet das coisas e tecnologia RFID* | Manter nos correlatos. Pedir ou recuperar o arquivo original e confirmar os dados bibliográficos e os resultados antes de reutilizar valores e afirmações. |
| Dantas (2025), *Slocked: sistema para gerenciamento de trancas eletrônicas via web e mobile* | Manter nos correlatos. Há [cópia do TCC no IFRN](https://memoria.ifrn.edu.br/bitstream/handle/1044/3180/TCC%20-%20Emanuel%20Rangel%20-%20Vers%C3%A3o%20Final.pdf?isAllowed=y&sequence=1). |
| Filho e Santos (2024), *Sistema de controle de acesso integrado: utilização de RFID e Bluetooth com ESP32* | Preservar na base bibliográfica e avaliar sua citação em comparação técnica. O [texto apresentado na jornada](https://josif.ifsuldeminas.edu.br/ojs/index.php/anais/article/download/2541/1771/17110) foi localizado. |
| Fornaciari (2023), *Sistema para gerenciamento de acesso a ambientes utilizando fechadura digital sem fio* | Preservar. Confirmar título, autoria, periódico e acesso ao texto a partir dos arquivos ou links originais de William. Não foi confirmada a fonte primária nesta consulta pontual. |
| Instituto Federal Sul-Rio-Grandense (s. d.), *Regulamento geral de uso dos espaços de ensino e aprendizagem do IFSul câmpus Gravataí* | Preservar. Identificar o documento original e verificar se seu âmbito institucional sustenta a afirmação em que será citado. Não presumir que um regulamento de outro campus descreva a rotina específica de Sant’Ana do Livramento. |
| Lima et al. (2024), *Trancadura 2.0: fechadura eletrônica modular de baixo custo para ambientes educacionais* | Preservar a entrada para conferência. Não localizei fonte primária inequívoca com esses dados na consulta pontual. Existe uma [apresentação de 2024 com título semelhante e outros autores](https://erbase2024.ufba.br/assets/docs/xbase.pdf); isso, por si só, não comprova que seja a mesma obra. Solicitar o PDF ou link usado no TCC I antes de atribuir dados ou trocar autoria. |
| Moreira e Bonjardim (2022), *FACETAG* | Manter como comparação com autenticação facial e RFID. O [artigo no Ifes](https://repositorio.ifes.edu.br/bitstream/handle/123456789/2272/FACETAG_Folha_de_Aprovao_-_PCTI_-_2022_-_Xisto_e_Leandro-combinado.pdf?isAllowed=y&sequence=1) foi localizado. |
| Pawar, Deore, Savkar e Thakare (2026), *Smart door lock system with multi-level authentication* | Manter na discussão de operação offline. **Divergência pontual:** o PDF do TCC I informa páginas 393–400, enquanto a [página do periódico](https://ijsred.com/volume9/issue1/paper-details/IJSRED-V9I1P47.html) informa 393–398. Conferir o PDF do artigo e corrigir os metadados ao reconstruir a referência. |
| Rosa, Teixeira e Júnior (2022), *Comunicações seguras entre dispositivos IoT utilizando o ESP32* | Manter na fundamentação sobre TLS e proteção do firmware. O [artigo do CBPF](https://revistas.cbpf.br/index.php/NT/article/download/145/158) foi localizado. Distinguir os controles discutidos pelos autores dos adotados pelo Clack. |
| Santos et al. (2024), *Sistema de travamento eletromecânico por senha* | Preservar. O [trabalho da ETEC](https://ric.cps.sp.gov.br/bitstream/123456789/27483/1/mecatronica_2024_2_amandacarvalhodossantos_sistemadetravamentoeletromecanico.pdf) foi localizado. Rever se ele sustenta cada afirmação do TCC I sobre a rotina específica do IFSul, IoT e PETG; evidência de outro sistema não comprova automaticamente esses pontos locais. |
| Santos, Oliveira e Pedreira (2023), *Fechadura eletrônica de baixo custo* | Preservar como estudo de referência. O [registro do Centro Paula Souza](https://ric.cps.sp.gov.br/handle/123456789/14748?locale=pt_BR) foi localizado. |
| WOKWI (2026), *Wokwi simulator* | Preservar para a eventual discussão ou figura da simulação. Confirmar URL, data de acesso e qual figura foi gerada com a ferramenta. |

Algumas entradas aparecem na lista final do PDF, mas a extração de texto não permitiu identificar com segurança sua citação no corpo. Ao receber o `.tex` e o `.bib`, conferir o vínculo de cada chave e trabalhar para que as referências utilizadas estejam associadas a afirmações pertinentes. Manter uma cópia integral da bibliografia original durante a edição, mesmo que orientações formais sobre a lista final de referências venham a ser esclarecidas depois.

## 6. Figuras e resultados aproveitáveis

- **Figura 1 — ESP32** e **Figura 2 — RC522 e tag**: verificar arquivos originais, autoria e origem antes de manter as legendas. Não atribuir imagem externa ao autor sem confirmação.
- **Figura 3 — montagem inicial**: pode documentar o estágio inicial, desde que seja identificada como fotografia, simulação ou diagrama conforme seu arquivo original e sua origem.
- **Figura 4 — estrutura inicial da tranca**: preservar como evidência de evolução. Confirmar o componente fotografado e diferenciar a montagem inicial da atual.
- **Figura 5 — cronograma**: manter no acervo do projeto; decidir com os orientadores se deve integrar o artigo final.
- **Casos de uso Clack**: a figura PlantUML e seus arquivos editáveis estão em [docs/diagramas](diagramas/README.md). Ela é uma visão geral do sistema de salas, sem representar o armário independente.
- **Ensaios do servidor**: usar tabelas ou gráficos claros e numerados para resultados observados. Identificar o ambiente, a data, a amostra, os indicadores e a limitação de serem clientes simulados.
- **Protótipo e painel atuais**: fotografias da tranca montada e capturas de tela podem compor os resultados, desde que os dados exibidos sejam fictícios ou autorizados e que a versão seja identificada.

## 7. Proposta inicial de organização e extensão

A distribuição abaixo é uma referência para planejamento, não uma previsão exata da paginação. A contagem depende do texto, dos flutuantes do LaTeX, das figuras e da forma de contabilizar páginas com início de referências.

| Parte | Espaço inicial sugerido, sem referências |
|---|---:|
| Título, autoria, resumo e abstract | 0,5 a 1 página |
| Introdução e objetivos | 1 a 1,5 página |
| Trabalhos correlatos | 1 a 2 páginas |
| Fundamentação teórica | 1,5 a 2,5 páginas |
| Metodologia e desenvolvimento | 2 a 3 páginas |
| Resultados e discussão | 3 a 4 páginas |
| Conclusão e trabalhos futuros | 0,5 a 1 página |

A estimativa totaliza aproximadamente **9,5 a 15 páginas** antes das referências. Como o mínimo é de 10 páginas, será preciso conferir a versão compilada e desenvolver as seções com o detalhe necessário, incluindo a análise dos objetivos e figuras pertinentes. Não ampliar texto apenas para cumprir quantidade.

## 8. Informações para a próxima etapa

1. Arquivo `.tex` do TCC I e, se disponível, o `.bib` do trabalho, imagens e demais arquivos do projeto Overleaf. O `main.tex` SBC enviado é um modelo genérico.
2. Links ou PDFs usados para as referências ainda não confirmadas, em especial Fornaciari e Lima/Trancadura 2.0.
3. Critério institucional para a contagem das páginas quando a seção de referências começa na mesma página do corpo e eventual exigência sobre cronograma no artigo final.
4. Identificação final de autor, orientador e coorientador, afiliações, além dos testes físicos e de usuários que tenham sido realizados após os registros já disponíveis.

Nenhuma seção do artigo foi substituída por esta análise. O TCC I corrigido permanece o documento de origem, e suas referências serão mantidas como base de trabalho para a redação por partes.
