# Continuidade do projeto Clack

- Ao concluir uma alteração, atualize `docs/CHECKLIST.md`: marque apenas tarefas
  efetivamente concluídas e mantenha explícitas as pendências.
- Diferencie implementação/testes automatizados de cadastro real e validação
  física. API simulada e compilação não comprovam funcionamento do hardware.
- Se o fluxo de instalação, configuração ou uso mudar, atualize os passos dos
  guias afetados (`README.md`, `docs/DOCKER.md`, `docs/GESTAO.md` e
  `docs/PRIMEIRA-SALA.md`) e informe ao usuário o que mudou no tutorial.
- Preserve `.env`, configurações locais, credenciais e banco do usuário fora
  dos commits e de testes destrutivos; use dados descartáveis para integração.
