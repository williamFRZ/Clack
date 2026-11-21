# Instalação rápida do Clack no Windows

Este caminho prepara o **painel e o servidor**. Para gravar os ESP32, siga a
etapa de dispositivos ao final. Se você quer recuperar uma instalação anterior,
leia primeiro [Trocar de computador](#trocar-de-computador).

## 1. Preparar o computador

Para o protótipo com até 50 trancas simuladas, use como referência inicial um PC x86-64 com 4 processadores lógicos, 8 GB de RAM e 20 GB livres em SSD. Consulte as [medições e os limites do ensaio](ensaios/hardware-50-2026-11-20/README.md), especialmente se o computador também for usado como estação da portaria.

Instale [Git](https://git-scm.com/downloads) e
[Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/).
Abra o Docker Desktop, use containers Linux e espere a inicialização terminar.

## 2. Baixar e iniciar

Se ainda não baixou o projeto, abra o PowerShell na pasta onde deseja guardá-lo:

```powershell
git clone --branch main https://github.com/williamFRZ/Clack.git
```

Abra a pasta `Clack` e dê dois cliques em **Iniciar-Clack.cmd**. Nas próximas
vezes, basta abrir o Docker Desktop e executar esse mesmo arquivo.

Na primeira instalação, o iniciador:

1. Cria automaticamente as senhas internas do banco e as guarda em `.env`.
2. Pergunta o IPv4 deste computador. Para usar trancas ou outros aparelhos na
   rede, consulte `ipconfig` e informe o IPv4 da interface conectada à rede.
   Se pressionar Enter, somente este computador terá acesso inicialmente.
3. Prepara o servidor e pede o nome da primeira conta `admin`. A senha inicial
   é `20241SL.TDS0007`: altere-a no primeiro acesso, pois é pública.
4. Mostra o endereço e abre o painel. Em instalações posteriores, usa as contas
   e os dados existentes; não redefine a senha do administrador.

Para alterar o acesso à rede depois, edite `CLACK_BIND_IP` no `.env` e execute o
iniciador novamente. Acesse pelo endereço exibido, como
`http://IP_DO_COMPUTADOR:8080/painel/`; se configurou somente acesso local, use
`http://127.0.0.1:8080/painel/`. O `localhost` de outro aparelho aponta para
ele mesmo, não para o servidor.

Se a porta 8080 estiver ocupada **numa instalação nova**, execute o iniciador
com outra porta no PowerShell, por exemplo:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\bin\iniciar-clack.ps1 -Porta 8081
```

O parâmetro só é aplicado quando o `.env` é criado. Se uma tentativa anterior
já criou esse arquivo, altere `CLACK_PORT` nele e execute o iniciador novamente;
isso também vale para uma instalação existente. Uma política institucional pode
impedir o iniciador; nesse caso, use a [instalação manual](DOCKER.md).

## 3. Cadastrar a primeira tranca

1. Entre no painel e siga [Configurar a primeira sala](PRIMEIRA-SALA.md).
2. Cadastre o dispositivo e guarde o ID e o token exibidos uma única vez.
3. Configure Wi-Fi, endereço do servidor, ID e token no firmware e grave o
   ESP32 conforme o [guia de dispositivos](DOCKER.md#8-cadastrar-e-gravar-os-dispositivos).
4. Confirme que a tranca aparece online e teste cartão e comando na bancada.

O ESP32 precisa alcançar o servidor pela rede local; o Wi-Fi usado pela tranca
deve ser de 2,4 GHz. Se o painel abrir no computador, mas não em outro aparelho,
verifique isolamento da rede e firewall; uma regra explícita de bloqueio pode
prevalecer sobre uma liberação. Restrinja o acesso à rede autorizada e não
publique a porta na internet. A comunicação atual usa HTTP autenticado.

## Trocar de computador

O GitHub contém o código, **não os cadastros, o histórico, as senhas ou os
tokens da instalação anterior**. Se eles precisam ser preservados, faça backup
do banco e guarde o `.env` antigo em local privado; siga
[Backup e restauração](DOCKER.md#11-backup-e-restauração) antes de reconectar as
trancas. Teste a restauração em um banco descartável antes de depender dela.

Uma tranca já usada mantém dados próprios, inclusive a sequência de eventos e
os identificadores de comandos. Conectá-la a um banco vazio pode impedir
sincronizações ou comandos. Sem o backup anterior, será necessária uma
reconfiguração controlada e testes antes do uso; não apague sua memória para
contornar o problema. **Não execute `uploadfs` em uma tranca em uso.**

Se o iniciador encontrar um banco anterior sem `.env`, ele interrompe a
operação. Recupere a configuração original e siga o tutorial completo; não crie
novas senhas sobre um volume existente. Guarde backups e configuração em local
privado, pois contêm dados e credenciais.
