# Clack — primeira versão do artigo de TCC II

Esta é uma **primeira versão para revisão**, preparada em 21/11/2026 a partir do PDF corrigido do TCC I, dos arquivos do modelo SBC fornecidos, dos trabalhos enviados por William e da documentação da cópia local do projeto. Os arquivos `.tex` e `.bib` próprios do TCC I ainda não foram recebidos; o `main.tex` anteriormente fornecido é o exemplo genérico da SBC. Por isso, o texto e a bibliografia foram reconstruídos e devem ser confrontados com o projeto original quando ele estiver disponível.

Na compilação desta versão, as referências começam em uma página separada: são **14 páginas anteriores às referências** e duas páginas de referências. Essa contagem pode mudar com as próximas imagens e alterações no texto.

## Arquivos

- `main.pdf`: versão compilada para leitura.
- `main.tex`: texto editável no modelo SBC.
- `referencias.bib`: bibliografia reconstruída, incluindo as três referências adicionais escolhidas por William.
- `sbc-template.sty` e `sbc.bst`: arquivos do modelo fornecido.
- `figuras/casos-de-uso-clack.png`: diagrama de casos de uso, com fonte em `docs/diagramas/casos-de-uso-clack.puml`.
- `figuras/modelo-er-clack.png`: visão resumida do banco de gestão, com fonte e versão SVG em `docs/diagramas/`.
- `Clack-artigo-overleaf.zip`: pacote dos arquivos necessários para abrir e editar no Overleaf.

O projeto usa o estilo `sbc` e `\bibliography{referencias}`. O arquivo `referencias.bib` já contém as três entradas selecionadas: não inclua simultaneamente os arquivos de pesquisa `referencias-selecionadas-clack.bib` ou `referencias-adicionais-clack.bib`, pois as chaves seriam duplicadas. O `main.tex` do exemplo genérico não deve substituir este texto.

Para editar no Overleaf, crie um projeto pela opção de importar um ZIP e envie `Clack-artigo-overleaf.zip`. O arquivo principal é `main.tex`; mantenha a pasta `figuras` e os arquivos de estilo e bibliografia no projeto. As fontes `.puml` e as versões SVG dos diagramas também estão nessa pasta para edição fora do Overleaf.

## Pontos para revisão com William

1. **Autoria:** nomes, vínculo institucional e e-mails foram transcritos do TCC I. Confirmar nomes, ordem, papéis de orientação e dados antes da entrega.
2. **Objetivos:** foram preservadas as linhas do TCC I e detalhadas as atividades de desenvolvimento. O ensaio mecânico, a avaliação com docentes e limpeza e a avaliação de privacidade seguem como objetivos sem resultado conclusivo. Confirmar a formulação com os orientadores.
3. **Figuras pendentes:** substituir os dois espaços identificados no texto por fotografia da tranca montada e captura do painel com dados fictícios ou autorizados. Verificar versão, data, autoria das fotografias e legendas. Imagens dos componentes podem ser adicionadas após a seleção dos arquivos e a confirmação de origem e licença.
4. **Modelo do banco:** o diagrama representa as principais tabelas do esquema de gestão de `sql/gestao.sql`, não todos os atributos ou as tabelas legadas. A explicação das cardinalidades está em `docs/diagramas/README.md`.
5. **Resultados:** o cenário de 50 trancas é uma simulação de software executada por cerca de um minuto em acesso local. O teste físico de transferência corresponde à sala 204 em 09/11/2026. Revalidar a versão de hardware e acrescentar medições e testes físicos adicionais apenas quando existirem registros.
6. **Extensão:** contar novamente as páginas do texto, sem referências, após acrescentar imagens e resultados. As figuras de rascunho ocupam espaço; substituí-las pode alterar a paginação.

## Conferência das referências

O PDF do TCC I continha 15 entradas. A base deste rascunho as preserva, além de Gonçalves, Costa e Silva e do trabalho de Barbosa e Machado enviado por William; a identificação de Trancadura 2.0 foi atualizada para corresponder ao artigo enviado. As chaves foram criadas para esta reconstrução e podem ser diferentes das usadas no Overleaf original.

- O PDF enviado de **Trancadura 2.0** identifica o artigo como parte da XBASE 2025. O TCC I o registrava como trabalho de 2024. A versão do artigo utiliza 2025 e o classifica como artigo de evento, preservando o estudo; conferir com o registro final do evento.
- O periódico de **Pawar et al.** informa páginas 393–398, enquanto o TCC I registrava 393–400. A base utiliza os dados da página do periódico.
- **Cruz Junior (2024)** e **Fornaciari (2023)** permanecem com os dados do TCC I, pois sua fonte primária ainda não foi identificada de maneira inequívoca. O **regulamento do IFSul Campus Gravataí** também precisa da identificação do documento original. Para preservar essas três entradas sem atribuir a elas afirmações não verificadas, elas são listadas provisoriamente por `\nocite`; revisar sua permanência e citá-las apenas quando pertinentes.
- O registro institucional de **Slocked** apresenta o título “web e mobile”; outro arquivo no mesmo repositório apresenta “desktop e mobile”. O rascunho preserva o título do TCC I e do registro institucional. Confirmar qual versão foi utilizada.
- Dos sete arquivos enviados por William, o arquivo `00006aa4.pdf` é de Barbosa e Machado, sobre Raspberry Pi e comando de voz; ele não foi identificado na lista de referências do PDF do TCC I. O trabalho foi acrescentado como referência adicional, com `s.d.` porque o ano não foi identificado no PDF consultado. Confirmar a data antes da entrega.
- As referências devem ser verificadas e relacionadas a afirmações pertinentes antes da versão definitiva. A seleção final precisa seguir a orientação do curso e o modelo SBC.

## Limites de interpretação

O protótipo descrito usa HTTP e não comprova comunicação criptografada de ponta a ponta. O uso de UID não é, por si só, autenticação criptográfica forte. A operação sem rede depende de energia, de permissões previamente sincronizadas e de espaço na fila; a bateria de contingência, a importação de horários e a confirmação mecânica por sensor não foram apresentadas como funções implementadas.

Para reproduzir o ensaio citado, consulte `docs/ensaios/dia-ifsul-50-2026-11-20/README.md`. Os dados registrados no ensaio são artificiais.
