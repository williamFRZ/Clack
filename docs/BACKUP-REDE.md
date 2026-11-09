# Backup e uso em rede

## Backup Docker
Na pasta do Clack, execute `python bin/backup.py`. O resultado fica em `backups/`, com SQL e metadados JSON. Para outro destino, use `python bin/backup.py --destino D:/Backups/Clack`. Mantenha os dois arquivos juntos e uma cópia em outro dispositivo com acesso restrito: o SQL contém dados pessoais, permissões e hashes de autenticação.

Para conferir integridade: `python bin/backup.py --verificar backups/NOME.sql`. SHA-256 detecta alteração acidental; não comprova restauração nem protege contra adulteração simultânea dos dois arquivos. O utilitário não remove backups anteriores. Guarde o `.env` separadamente em local protegido; ele não faz parte do dump.

Para automatizar no Agendador de Tarefas do Windows, use o caminho completo do Python como programa e o caminho completo de `bin/backup.py` como argumento, sob a conta que opera o Docker Desktop. Docker e banco precisam estar ativos. Escolha horário e destino antes de cadastrar a tarefa; nenhuma tarefa foi instalada por esta mudança.

Antes de considerar a recuperação validada, restaure em outro projeto Docker com volume descartável, seguindo docs/DOCKER.md, seção Backup e restauração. Confira contas, salas, cartões, permissões e histórico. Nunca use o banco operacional para esse ensaio.

## Um servidor, vários navegadores
Use uma única instalação Docker e seu banco central. Reserve no roteador um IPv4 para o servidor e mantenha-o ligado e sem suspensão. Configure `CLACK_BIND_IP` no `.env` com esse IP. Uma variável `CLACK_BIND_IP` definida no PowerShell tem prioridade sobre o arquivo; ajuste-a também antes de `docker compose up -d`.

Os clientes acessam `http://IP_DO_SERVIDOR:8080/painel/`. Cada operador deve ter conta individual. O endereço localhost aponta para o próprio computador de quem navega. Na rede institucional, solicite à TI comunicação entre clientes, servidor e ESPs e uma regra de firewall restrita à sub-rede autorizada para TCP 8080. O firmware das ESPs precisa apontar para o servidor central.

Para uso permanente, defina com a TI um nome DNS e certificado TLS e coloque um proxy HTTPS à frente do painel. Essa configuração ainda não foi aplicada. O cookie de sessão depende da detecção de HTTPS no PHP: configure o proxy/backend corretamente, sem confiar em cabeçalhos encaminhados por clientes arbitrários. Planeje também o transporte das ESPs antes de exigir HTTPS em todos os endpoints.

Validação pendente: abrir o painel em dois computadores, usar contas diferentes, observar a mesma atualização de sala e verificar que comandos simultâneos são serializados (o segundo deve aguardar o pendente). Não houve teste multiusuário real nesta alteração.
