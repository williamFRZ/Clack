# Juntar branches do Clack com segurança

Branch é uma linha de trabalho. `main` deve representar a versão validada; uma
branch de funcionalidade permite testar mudanças antes de incorporá-las.
Commit registra alterações; push envia commits ao GitHub; Pull Request (PR)
propõe incorporar uma branch na outra. Merge faz essa incorporação.

## Antes de juntar

1. Faça backup do banco e dos arquivos de configuração locais, fora do Git.
2. Confirme a branch com `git branch --show-current` e as alterações com
   `git status`. Preserve mudanças não commitadas antes de trocar de branch.
3. Valide login, cadastro, TI em data center/estoque, mapa, posicionamento e o
   fluxo físico da tranca. CI verde não substitui o teste do ESP32 real.
4. Atualize as referências com `git fetch origin` no computador autorizado.
5. Confira a situação: `git log --oneline --graph --decorate --all` e
   `git rev-list --left-right --count origin/feat/gestao-acessos...feat/gestao-acessos`.
   Se os dois números forem maiores que zero, os históricos divergiram: pare
   para comparar os commits. Não faça force push ou rebase automático.

A atualização das plantas, marcadores e TI foi consolidada sobre a branch
remota `feat/gestao-acessos`, preservando seus commits anteriores. O PR dessa
branch continua separado da `main` até a revisão e integração.

Para atualizar um clone que já está nessa branch, com a árvore de trabalho limpa:

```sh
git fetch origin
git pull --ff-only origin feat/gestao-acessos
php bin/configurar.php
```

Se você trabalha em outra branch, confira `git status` e preserve suas alterações
antes de usar `git switch feat/gestao-acessos`. Esse procedimento atualiza o
servidor; o firmware precisa ser atualizado separadamente.

## Pelo GitHub (depois de validar e publicar os commits)

1. Abra o PR da funcionalidade e confira as branches indicadas:
   **base** é a que recebe o código; **compare** é a que entrega o código.
2. Se o PR ainda tiver base `fix/base-instalacao-clack`, ele é encadeado: primeiro
   conclua/revise a base para `main`; depois revise o destino do PR da gestão
   para `main`. Não mescle em uma branch intermediária achando que foi para main.
3. Revise a lista de arquivos e aguarde os testes. Se houver conflitos, resolva
   em uma branch de integração, preservando as configurações fora do repositório.
4. Com tudo conferido, use **Merge pull request**. Evite apagar a branch até
   confirmar a instalação a partir de `main`.
5. Só depois, no computador com a árvore de trabalho limpa:

   ```sh
   git switch main
   git pull --ff-only origin main
   php bin/configurar.php
   ```

O merge atualiza código, não o banco nem o firmware instalado. O painel compilado
em `painel/` precisa acompanhar o código-fonte. O configurador migra o banco; a
tranca recebe permissões na próxima sincronização. Nunca repita `uploadfs` em
um dispositivo em uso para fazer essa atualização: apagaria sua fila local.

Este guia não executa push, merge nem altera os PRs. Cada integração deve ser
confirmada depois dos testes e da comparação dos históricos.
