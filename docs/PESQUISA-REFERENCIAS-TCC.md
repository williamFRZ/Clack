# Pesquisa de referências para o TCC II do Clack

**Consulta:** 21 de novembro de 2026.  
**Objetivo:** encontrar trabalhos correlatos e fundamentação complementar, preservando as referências do TCC I.

O acesso automatizado ao Google Acadêmico apresentou uma página de verificação. Por isso, a seleção abaixo foi feita por busca acadêmica na web e conferida nas páginas de periódicos, anais e repositórios institucionais. Ela não representa um levantamento sistemático nem uma lista extraída diretamente do Google Acadêmico. Os links levam aos registros ou textos originais. É possível pesquisar os títulos no Google Acadêmico para encontrar outras versões e citações.

Em 21/11/2026, William selecionou **Gonçalves (2019), Costa (2020) e Silva (2022)** para adicionar às referências do TCC II. As demais novas obras seguem como opções de leitura. A seleção complementa e preserva as referências do TCC I; é necessário integrar as entradas ao projeto original quando seus arquivos estiverem disponíveis.

## 1. Trabalhos já presentes no TCC I

### Alves e Corrêa (2022) — salas em instituto federal

**Desenvolvimento de um sistema de controle de acesso a salas por RFID com reservas via Web.** [Texto no repositório do IFRS](https://repositorio.ifrs.edu.br/bitstream/handle/123456789/1208/1234567891208.pdf?isAllowed=y&sequence=1).

O trabalho trata de laboratórios do IFRS, integra a liberação de acesso a um sistema de reservas e relata instalação em uma sala do campus. Descreve também sensoriamento para verificar a condição da porta. É muito próximo do contexto institucional do Clack e pode fundamentar uma comparação entre propostas e entre procedimentos de teste.

**Diferenças a registrar:** na versão atual do Clack descrita nos documentos locais, a consulta à grade de horários e a importação de PDFs são futuras; a confirmação da tranca não mede diretamente a posição mecânica da porta. Não atribuir ao Clack recursos do outro trabalho.

### Dantas (2025) — Slocked

**Slocked: sistema para gerenciamento de trancas eletrônicas via web e mobile.** [Trabalho no repositório do IFRN](https://memoria.ifrn.edu.br/handle/1044/3180).

É uma referência existente no TCC I sobre gestão de trancas por interfaces web e móvel. Vale preservá-la nos trabalhos correlatos e retomar a descrição do texto original ao comparar a gestão de dispositivos e ambientes. Verificar no texto integral quais funções estão efetivamente implementadas e testadas antes de montar uma tabela detalhada.

## 2. Novos trabalhos semelhantes ao servidor e às trancas do Clack

### Gonçalves (2019) — ESP32, RFID, HTTP, MySQL e gestão web

**Sistema de controle de acesso utilizando autenticação por RFID e gerenciamento por meio de software Web.** Monografia de graduação, Universidade Federal de Ouro Preto. [Registro e texto](https://monografias.ufop.br/handle/35400000/2222?locale=pt_BR).

Um dos trabalhos mais próximos da arquitetura do Clack: usa ESP32, RFID, API por HTTP, MySQL e gerenciamento pela web. Seu resumo informa hospedagem na Amazon EC2 e também o uso de teclado numérico e display. No Clack, o servidor descrito no repositório roda localmente, e o funcionamento da tranca inclui permissões locais.

**Onde usar:** trabalhos correlatos e descrição comparativa da arquitetura.  
**Limite:** o resumo consultado não permite concluir como o trabalho lida com perda de rede; verificar o texto antes de compará-lo nesse ponto.

### Costa (2020) — servidor Apache, PHP e MySQL

**ESP32, RFID e MySQL a porta deve abrir? Sim ou não?** Trabalho de conclusão de curso, Pontifícia Universidade Católica de Goiás. [Registro institucional](https://repositorio.pucgoias.edu.br/jspui/handle/123456789/980).

O autor descreve ESP32, RFID, servidor Apache, processamento em PHP e consulta a banco de dados, com aplicativo móvel para cadastrar ou remover etiquetas. Isso permite comparar sua arquitetura de gestão com a API PHP, o banco MySQL e o painel web do Clack.

**Onde usar:** trabalhos correlatos, com foco no fluxo entre a leitura e o servidor.  
**Conferência:** o registro e o texto disponibilizado em formato DOCX foram consultados para confirmar autoria, título, instituição e características gerais.

### Freitas et al. (2023) — tranca integrada a servidor web

**Integrated electronic lock system with web server for enhanced security.** Artigo dos anais do IX Simpósio Internacional de Inovação e Tecnologia, p. 124–131. DOI: 10.5151/siintec2023-305721. [Página da publicação](https://www.proceedings.blucher.com.br/article-details/integrated-electronic-lock-system-with-web-server-for-enhanced-security-38878) · [PDF](https://pdf.blucher.com.br/engineeringproceedings/siintec2023/305721.pdf).

O protótipo combina ESP32, RFID, senha, chave e uma interface web de gestão de permissões e histórico. O artigo descreve Firebase e WebSockets na comunicação com o banco. O Clack também integra tranca RFID e gestão web, mas a versão examinada usa HTTP e MySQL.

**Onde usar:** trabalhos correlatos, comparação de arquitetura e alternativas de autenticação.  
**Limite:** senha digitada na tranca, chave e Firebase são características do trabalho citado, não devem ser apresentadas como recursos já implementados no Clack.

### Azizi, Purwantoro e Susilawati (2026) — sala em campus e painel web

**Sistem keamanan ruangan berbasis IoT dengan autentikasi RFID dan monitoring akses melalui web server di LPM UNSIKA.** *Jurnal Informatika dan Teknik Elektro Terapan*, v. 14, n. 3. DOI: 10.23960/jitet.v14i3.9941. [Página do periódico](https://journal.eng.unila.ac.id/index.php/jitet/article/view/9941).

O artigo descreve uma sala em ambiente universitário e um sistema com ESP32, RC522, React e MySQL, além de solenoide, câmera e outros componentes. Os autores relatam testes funcionais em 16 cenários e avaliação de aceitação com 30 participantes.

**Onde usar:** trabalhos correlatos e desenho de um protocolo de avaliação funcional e com usuários.  
**Limite:** os resultados e participantes são dos autores, não do Clack. A presença de câmera e os resultados de aceitação não podem ser atribuídos ao projeto de William.

### Silva (2022) — controle de acesso para um instituto federal

**IF Access: sistema de controle de acesso eletrônico utilizando tecnologia RFID e microcontrolador.** Trabalho de conclusão de curso, Instituto Federal da Paraíba. [Registro institucional](https://repositorio.ifpb.edu.br/handle/177683/2464).

O estudo foi proposto para ambientes do IFPB e utiliza RFID e microcontrolador. O resumo relata simulações de gerenciamento de usuários, ambientes e horários de acesso. O contexto institucional e os horários oferecem um paralelo útil com o uso previsto para o Clack.

**Onde usar:** trabalhos correlatos, em conjunto com Alves e Corrêa.  
**Limite:** identificar os testes do IF Access como simulações, conforme o resumo, e tratar a verificação por horário no Clack como futura.

### Outra leitura: Nordin e Alduais (2025)

O trabalho descreve fechadura RFID, ESP8266, gestão web, Laravel e MySQL. [Página do periódico](https://periodical.uthm.edu.my/index.php/aitcs/article/view/20362) · [PDF](https://periodical.uthm.edu.my/index.php/aitcs/article/download/20362/6833/126618).

Pode enriquecer uma comparação internacional sobre painel, usuários e histórico. Há, porém, uma **diferença na ordem das palavras do título** entre a página do periódico e o PDF. Por essa razão, foi deixado fora do `.bib` complementar até a conferência dos metadados definitivos.

## 3. Referências para fundamentar e discutir o projeto

### Naik (2017) — escolha de protocolos

**Choice of effective messaging protocols for IoT systems: MQTT, CoAP, AMQP and HTTP.** Artigo no IEEE International Systems Engineering Symposium. DOI: 10.1109/SysEng.2017.8088251. [Registro e cópia autorizada na University of Portsmouth](https://researchportal.port.ac.uk/en/publications/choice-of-effective-messaging-protocols-for-iot-systems-mqtt-coap/).

Compara características de protocolos e ajuda a contextualizar a mudança entre o MQTT previsto no TCC I e o HTTP utilizado no Clack. Não é prova de que HTTP seja mais rápido, mais seguro ou melhor para o Clack: tais conclusões exigiriam testes próprios comparáveis.

### Shi et al. (2016) — processamento próximo ao dispositivo

**Edge computing: vision and challenges.** *IEEE Internet of Things Journal*, v. 3, n. 5, p. 637–646. DOI: 10.1109/JIOT.2016.2579198. [PDF acadêmico](https://cse.buffalo.edu/faculty/tkosar/cse710_spring20/shi-iot16.pdf).

Apresenta o conceito de processamento próximo à origem dos dados. Pode dar contexto à decisão local de acesso da tranca quando o servidor ou a rede estão indisponíveis. A fila e sua sincronização devem ser descritas com base no código e em testes do Clack, não atribuídas ao artigo de revisão.

### Sandhu et al. (1996) — papéis e permissões

**Role-based access control models.** *Computer*, v. 29, n. 2, p. 38–47. DOI: 10.1109/2.485845. [Registro da IEEE](https://doi.org/10.1109/2.485845) · [texto acadêmico](https://www.cs.toronto.edu/~jm/2507S/Readings/13.Sandhu96.pdf).

Fundamenta a ideia de associar permissões a papéis. Pode ajudar a apresentar os perfis do painel e das pessoas autorizadas no Clack, sem afirmar conformidade formal com todos os modelos descritos no artigo.

### Garcia et al. (2008) — limites de segurança de cartões

**Dismantling MIFARE Classic.** Anais do ESORICS, p. 97–114. DOI: 10.1007/978-3-540-88313-5_7. [Texto dos pesquisadores](https://www.cs.ru.nl/~rverdult/Dismantling_MIFARE_Classic-ESORICS_2008.pdf) · [registro bibliográfico](https://research.tue.nl/nl/publications/dismantling-mifare-classic/).

O estudo analisa vulnerabilidades específicas do cartão MIFARE Classic e mostra a importância de discutir autenticação e clonagem em sistemas RFID. Não identifica o tipo das tags do Clack nem demonstra, por si só, que esse ataque foi executado contra o projeto. O uso do UID no Clack deve ser discutido com a análise do próprio firmware e do tipo de cartão efetivamente utilizado.

### Azcaray et al. (2026) — estrutura impressa em PETG

**Anisotropy and defect tolerance of FFF-manufactured PETG: a combined tensile, compressive and mode I fracture study.** *Applied Sciences*, v. 16, n. 19, artigo 9401. DOI: 10.3390/app16199401. [Artigo aberto](https://www.mdpi.com/2076-3417/16/19/9401).

Examina a influência da orientação de impressão em propriedades mecânicas de amostras de PETG. É útil para a discussão da estrutura e para justificar a necessidade de ensaios do chassi.

**Limite:** os resultados são de corpos de prova e condições dos autores. Não equivalem a medições da peça Clack nem comprovam a resistência do filamento F3D usado no projeto.

### Bangor, Kortum e Miller (2008) — avaliação de usabilidade

**An empirical evaluation of the System Usability Scale.** *International Journal of Human–Computer Interaction*, v. 24, n. 6, p. 574–594. DOI: 10.1080/10447310802205776. [Página do periódico](https://www.tandfonline.com/doi/abs/10.1080/10447310802205776).

Apresenta uma avaliação da escala SUS para percepção de usabilidade. Pode embasar um procedimento futuro de avaliação com professores, portaria ou equipe de limpeza, se realizado. Não inventar pontuação ou afirmar satisfação de participantes sem coleta de dados.

## 4. Prioridade de leitura sugerida

1. **Alves e Corrêa**, já no TCC I: contexto de instituto federal, reservas e sensor físico.
2. **Gonçalves, Costa e Silva**, selecionados por William: arquitetura web, integração de dispositivos e contexto de instituto federal.
3. **Freitas et al.** e **Azizi et al.**, se houver espaço para uma comparação adicional com outros sistemas.
4. **Naik** e as demais referências teóricas, se forem necessárias aos tópicos efetivamente desenvolvidos.

Pode ser suficiente incluir algumas das novas referências, desde que cada uma sustente uma afirmação ou comparação pertinente. Manter os trabalhos já utilizados no TCC I como base e reconciliar suas chaves quando a bibliografia original estiver disponível. Antes da entrega, conferir o texto integral, os metadados e a formatação de todas as obras efetivamente citadas.

## 5. Arquivo para o Overleaf

O arquivo [referencias-selecionadas-clack.bib](referencias-selecionadas-clack.bib) contém apenas as três entradas escolhidas. O [rascunho de trabalhos correlatos](trecho-trabalhos-correlatos.tex) apresenta uma sugestão de uso dessas referências na seção existente. O arquivo [referencias-adicionais-clack.bib](referencias-adicionais-clack.bib) continua sendo o catálogo de opções e contém as mesmas três chaves: **não incluir os dois arquivos `.bib` na compilação ao mesmo tempo**, pois isso duplicaria as entradas.

Ao receber o `.bib` original do TCC I, conferir possíveis duplicatas e integrá-lo às referências selecionadas. O estilo SBC fornecido usa os campos comuns do BibTeX e não imprime os campos `doi` e `url` por conta própria; os endereços foram incluídos no campo `note` com `\url`, previsto pelo `main.tex` enviado.

Esta pesquisa não altera o texto do artigo nem incorpora citações automaticamente. O material poderá ser aproveitado gradualmente na redação.
