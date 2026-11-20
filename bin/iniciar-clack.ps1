param(
    [ValidateRange(1, 65535)][int]$Porta = 8080,
    [switch]$NaoAbrirNavegador
)

$ErrorActionPreference = 'Stop'
$clackRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $clackRoot

function Encerrar([string]$mensagem) {
    Write-Host "`n$mensagem" -ForegroundColor Yellow
    exit 1
}

function NovaSenhaBanco {
    $bytes = New-Object byte[] 32
    $gerador = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $gerador.GetBytes($bytes) } finally { $gerador.Dispose() }
    return [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
}

Write-Host 'Clack - iniciar o painel'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Encerrar 'Docker não encontrado. Instale e abra o Docker Desktop e execute novamente.'
}
& docker compose version *> $null
if ($LASTEXITCODE -ne 0) { Encerrar 'Docker Compose não está disponível. Confira a instalação do Docker Desktop.' }
& docker version --format '{{.Server.Version}}' *> $null
if ($LASTEXITCODE -ne 0) { Encerrar 'O Docker ainda não está pronto. Abra o Docker Desktop, aguarde a inicialização e tente novamente.' }

# Variáveis do processo prevalecem sobre .env e podem apontar para outro banco.
foreach ($nomeVariavel in @('CLACK_DB_PASSWORD','CLACK_DB_ROOT_PASSWORD','CLACK_BIND_IP','CLACK_PORT')) {
    if ([Environment]::GetEnvironmentVariable($nomeVariavel, 'Process')) {
        Encerrar "A variável $nomeVariavel está definida nesta janela e pode substituir a configuração local. Abra uma nova janela sem essa variável e tente novamente."
    }
}

$configPath = Join-Path $clackRoot '.env'
if ((Test-Path -LiteralPath $configPath) -and -not [IO.File]::Exists($configPath)) {
    Encerrar 'Existe um item chamado .env que não é um arquivo. Confira a pasta antes de continuar.'
}
$configExistente = [IO.File]::Exists($configPath)
$projetoArquivo = $null
if ($configExistente) {
    foreach ($linha in [IO.File]::ReadAllLines($configPath)) {
        if ($linha -match '^\s*COMPOSE_PROJECT_NAME\s*=') {
            if ($linha -notmatch '^\s*COMPOSE_PROJECT_NAME\s*=\s*([a-z0-9][a-z0-9_-]*)\s*$') {
                Encerrar 'Não foi possível identificar o projeto Docker no .env. Consulte o tutorial completo.'
            }
            $projetoArquivo = $Matches[1]
        }
    }
}
$projetoProcesso = [Environment]::GetEnvironmentVariable('COMPOSE_PROJECT_NAME', 'Process')
if ($projetoProcesso -and $projetoArquivo -and $projetoProcesso -ne $projetoArquivo) {
    Encerrar 'O projeto Docker desta janela difere do projeto no .env. Abra uma nova janela e tente novamente.'
}
$projeto = if ($projetoProcesso) { $projetoProcesso } elseif ($projetoArquivo) { $projetoArquivo } else { 'clack' }
if ($projeto -cnotmatch '^[a-z0-9][a-z0-9_-]*$') { Encerrar 'O nome do projeto Docker é inválido. Consulte o tutorial completo.' }
$volumes = @(& docker volume ls --format '{{.Name}}')
if ($LASTEXITCODE -ne 0) { Encerrar 'Não foi possível conferir os dados existentes no Docker.' }
$volumeExiste = $volumes -contains ($projeto + '_banco')

if (-not $configExistente) {
    if ($volumeExiste) {
        Encerrar 'Já existe um banco do Clack, mas o arquivo .env não foi encontrado. Recupere a configuração anterior antes de continuar; nenhum dado foi alterado.'
    }
    Write-Host "`nPrimeira instalação. As senhas internas do banco serão criadas automaticamente."
    Write-Host 'Para usar trancas ou outro computador na rede local, informe o IPv4 deste computador.'
    $ipEscolhido = (Read-Host 'IPv4 local (Enter para acessar somente neste computador)').Trim()
    if (-not $ipEscolhido) { $ipEscolhido = '127.0.0.1' }
    if ($ipEscolhido -ne '127.0.0.1') {
        $endereco = $null
        if (-not [System.Net.IPAddress]::TryParse($ipEscolhido, [ref]$endereco) -or $endereco.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
            Encerrar 'Endereço IPv4 inválido. Execute novamente e informe um IPv4 deste computador.'
        }
        $enderecosLocais = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop | ForEach-Object { $_.IPAddress })
        if ($enderecosLocais -notcontains $ipEscolhido -or $ipEscolhido -eq '0.0.0.0' -or $ipEscolhido -like '169.254.*') {
            Encerrar 'O endereço informado não é um IPv4 disponível neste computador. Confira com ipconfig e tente novamente.'
        }
    }
    $senhaApp = NovaSenhaBanco
    $senhaRoot = NovaSenhaBanco
    $conteudo = "COMPOSE_PROJECT_NAME=$projeto`nCLACK_DB_PASSWORD=$senhaApp`nCLACK_DB_ROOT_PASSWORD=$senhaRoot`nCLACK_BIND_IP=$ipEscolhido`nCLACK_PORT=$Porta`n"
    try {
        $arquivo = [IO.File]::Open($configPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
        try {
            $gravador = [IO.StreamWriter]::new($arquivo, [Text.UTF8Encoding]::new($false))
            try { $gravador.Write($conteudo) } finally { $gravador.Dispose() }
        } finally { $arquivo.Dispose() }
    } catch {
        Encerrar 'Não foi possível criar a configuração sem sobrescrever outro arquivo. Confira a pasta e tente novamente.'
    }
    Write-Host 'Configuração criada. Guarde uma cópia privada do arquivo .env junto do backup.'
} elseif (-not $volumeExiste) {
    Write-Host "`nO arquivo .env existe, mas o banco do projeto '$projeto' não foi encontrado."
    $resposta = (Read-Host 'É uma instalação nova sem dados a recuperar? Digite S para continuar').Trim()
    if ($resposta -notmatch '^[sS]$') { Encerrar 'Inicialização cancelada. Para recuperar dados anteriores, siga a seção de backup e restauração do tutorial.' }
} else {
    Write-Host 'Configuração e banco existentes serão preservados.'
}

$argumentosCompose = @('compose','--project-directory',$clackRoot,'--env-file',$configPath,'-f',(Join-Path $clackRoot 'compose.yaml'))
& docker @argumentosCompose config --quiet
if ($LASTEXITCODE -ne 0) { Encerrar 'A configuração do Clack está incompleta ou inválida. Confira o .env sem compartilhar as senhas.' }
Write-Host "`nIniciando o Clack. Na primeira vez, a preparação pode levar alguns minutos..."
& docker @argumentosCompose up -d --build --wait --wait-timeout 240
if ($LASTEXITCODE -ne 0) { Encerrar 'Não foi possível iniciar o Clack. Confira o Docker Desktop e o tutorial completo; os dados existentes foram preservados.' }

& docker @argumentosCompose exec -T web php bin/tem_admin.php
$situacaoAdmin = $LASTEXITCODE
if ($situacaoAdmin -eq 2) {
    Write-Host "`nVamos criar o primeiro administrador. O login será admin."
    $nomeAdmin = (Read-Host 'Nome do administrador').Trim()
    if (-not $nomeAdmin) { $nomeAdmin = 'Administrador' }
    Write-Host 'A senha inicial padrão será aplicada. Altere-a após o primeiro acesso.'
    & docker @argumentosCompose exec -T web php bin/configurar.php admin $nomeAdmin
    if ($LASTEXITCODE -ne 0) { Encerrar 'O administrador não foi criado. Execute o iniciador novamente para tentar de novo.' }
} elseif ($situacaoAdmin -ne 0) {
    Encerrar 'Não foi possível verificar a conta do administrador. Consulte o tutorial completo.'
}

$enderecoPublicado = @(& docker @argumentosCompose port web 80)
if ($LASTEXITCODE -ne 0 -or $enderecoPublicado.Count -eq 0 -or $enderecoPublicado[0] -notmatch '^(\d+\.\d+\.\d+\.\d+):(\d+)$') {
    Encerrar 'O Clack iniciou, mas não foi possível identificar o endereço do painel. Consulte docker compose ps.'
}
$enderecoPainel = $Matches[1]
$portaPainel = $Matches[2]
if ($enderecoPainel -eq '0.0.0.0') { $enderecoPainel = '127.0.0.1' }
$urlPainel = "http://${enderecoPainel}:${portaPainel}/painel/"
Write-Host "`nClack pronto: $urlPainel"
Write-Host 'Se trancas ou outros aparelhos não acessarem o painel, confira a rede e o firewall no tutorial completo.'
if (-not $NaoAbrirNavegador) {
    try { Start-Process -FilePath $urlPainel }
    catch { Write-Host 'Não foi possível abrir o navegador automaticamente. Abra o endereço acima manualmente.' }
}
