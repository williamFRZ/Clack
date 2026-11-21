# Diagrama de casos de uso do Clack

A figura [casos-de-uso-clack.png](casos-de-uso-clack.png) apresenta uma visão geral do controle de acesso às salas e do painel. O arquivo [casos-de-uso-clack.puml](casos-de-uso-clack.puml) é a fonte editável em PlantUML; a versão [SVG](casos-de-uso-clack.svg) é vetorial. O PNG pode ser enviado ao Overleaf e incluído com `\includegraphics`.

O limite do sistema abrange a tranca de sala e o painel. O **usuário autorizado** representa os perfis professor, aluno, limpeza, TI e completo, respeitadas as permissões de cada cartão. Em uma sala ocupada, a transferência de responsabilidade por permanência de três segundos é permitida aos perfis professor e completo. O perfil TI pode acessar sem assumir a responsabilidade. O administrador também pode executar as ações atribuídas ao operador de portaria, representado pela generalização entre atores.

“Gerenciar cartões e permissões” agrupa cadastro, alteração, revogação e desvinculação. A leitura para cadastro pode ser feita pelo cadastrador ou por inserção manual de UID. “Gerenciar salas e dispositivos” inclui cadastro, edição, posicionamento, exclusão ou arquivamento conforme os vínculos, cadastro de dispositivo e rotação de credencial. Comandos pelo painel dependem de comunicação com o dispositivo.

A decisão de acesso da tranca usa permissões armazenadas localmente. Quando o servidor está acessível, o dispositivo sincroniza permissões e envia eventos. O diagrama mostra as interações dos atores e não detalha protocolo, persistência nem a sequência interna de sincronização. O **armário offline de autocadastro** usa um firmware separado e não está representado nesta visão das salas. Importação de horários por PDF não consta na versão atual.

## Uso no Overleaf

Depois de incluir o PNG no projeto, um exemplo de figura para o modelo SBC é:

```latex
\begin{figure}[ht]
  \centering
  \includegraphics[width=0.65\textwidth]{casos-de-uso-clack.png}
  \caption{Diagrama de casos de uso do sistema Clack.}
  \label{fig:casos-de-uso-clack}
\end{figure}
```

Ajuste a largura após compilar o artigo e confira a legibilidade do texto da figura. O exemplo pressupõe que o arquivo PNG esteja na mesma pasta que o arquivo `.tex`. Conforme o padrão adotado para o artigo, acrescente a identificação de autoria da figura na legenda ou junto dela.

Fonte de desenvolvimento: `api.php`, `app/bootstrap.php`, `esp32/include/regras.h`, `esp32/src/main.cpp` e `docs/GESTAO.md` da cópia de trabalho de 21/11/2026. O gráfico representa o comportamento implementado na versão local, incluindo alterações ainda não publicadas; não substitui os registros de testes físicos em `docs/VALIDACAO.md`.

## Modelo entidade-relacionamento

O [modelo em PNG](modelo-er-clack.png) e a [versão vetorial SVG](modelo-er-clack.svg) apresentam as principais tabelas e relações do banco de gestão. O [arquivo PlantUML](modelo-er-clack.puml) é editável. A figura também foi inserida na primeira versão do artigo.

A fonte do modelo é [`sql/gestao.sql`](../../sql/gestao.sql), com a estrutura da cópia local de 21/11/2026. O diagrama é **uma visão lógica resumida**: apresenta as dez tabelas com relações por chave estrangeira e apenas alguns atributos de cada uma. As tabelas auxiliares `schema_versoes` e `tentativas_login` não possuem vínculos por chave estrangeira no esquema e são mencionadas na legenda. As tabelas legadas de `Clack_DB.sql` não compõem esta visão.

- Cada permissão relaciona um cartão e um ambiente; a chave composta evita a repetição do mesmo par.
- O campo `ambientes.responsavel` pode ser nulo; um cartão pode figurar como responsável em mais de um ambiente no modelo de dados.
- A relação entre ambiente e dispositivo é opcional e, pela restrição `UNIQUE` em `dispositivos.ambiente_id`, admite no máximo um dispositivo vinculado a cada ambiente.
- Eventos apontam para ambiente e dispositivo. O UID armazenado em um evento não é chave estrangeira para `cartoes`; a dupla dispositivo/sequência é única.
- Comandos e capturas apontam para um operador e um dispositivo. A auditoria aponta para um operador. Uma sala pode ou não ter registro em `salas_arquivadas`.

No símbolo de cardinalidade, o círculo indica zero, a barra indica um e o pé de galinha indica muitos. Para o conjunto completo de colunas, tipos e restrições, consultar o SQL; a figura não é uma especificação exaustiva do banco.
