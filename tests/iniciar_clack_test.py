"""Teste isolado do iniciador Windows com Docker simulado, sem tocar em volumes."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

if sys.platform != 'win32':
    print('Teste disponível no Windows.')
    raise SystemExit(0)

source = Path(__file__).resolve().parents[1]
base = Path(os.environ.get('CLACK_TEST_TMP', tempfile.gettempdir())).resolve()
workspace = Path(tempfile.mkdtemp(prefix='clack-iniciador-teste-', dir=base)).resolve()
if workspace.parent != base:
    raise RuntimeError('Área temporária fora do diretório esperado.')

fake = r'''
import json, os, sys
a=sys.argv[1:]
with open(os.environ['CLACK_TEST_TRACE'],'a',encoding='utf-8') as f: f.write(json.dumps(a)+'\n')
if a[:2]==['compose','version']: print('Docker Compose test'); sys.exit(0)
if a[:1]==['version']:
    if os.environ.get('CLACK_TEST_DOWN')=='1': sys.exit(1)
    print('test'); sys.exit(0)
if a[:2]==['volume','ls']:
    if os.environ.get('CLACK_TEST_VOLUME')=='1': print('clack_simulado_banco')
    sys.exit(0)
if 'config' in a: sys.exit(0)
if 'up' in a: sys.exit(1 if os.environ.get('CLACK_TEST_UP_FAIL')=='1' else 0)
if 'exec' in a and 'bin/tem_admin.php' in a: sys.exit(2 if os.environ.get('CLACK_TEST_NO_ADMIN')=='1' else 0)
if 'exec' in a and 'bin/configurar.php' in a: sys.exit(0)
if 'port' in a: print('127.0.0.1:18090'); sys.exit(0)
sys.exit(1)
'''

try:
    fake_dir = workspace / 'fake'
    fake_dir.mkdir()
    (fake_dir / 'fake_docker.py').write_text(fake, encoding='utf-8')
    (fake_dir / 'docker.cmd').write_text('@echo off\r\n"%CLACK_TEST_PYTHON%" "%~dp0fake_docker.py" %*\r\n', encoding='ascii')
    trace = workspace / 'docker.jsonl'

    def case(name, answers='', **flags):
        root = workspace / name
        (root / 'bin').mkdir(parents=True)
        shutil.copy2(source / 'bin/iniciar-clack.ps1', root / 'bin/iniciar-clack.ps1')
        shutil.copy2(source / 'Iniciar-Clack.cmd', root / 'Iniciar-Clack.cmd')
        (root / 'compose.yaml').write_text('name: clack\n', encoding='utf-8')
        env = os.environ.copy()
        for key in ('CLACK_DB_PASSWORD','CLACK_DB_ROOT_PASSWORD','CLACK_BIND_IP','CLACK_PORT','COMPOSE_PROJECT_NAME'):
            env.pop(key, None)
        env.update(PATH=str(fake_dir)+os.pathsep+env['PATH'], CLACK_TEST_PYTHON=sys.executable,
                   CLACK_TEST_TRACE=str(trace), COMPOSE_PROJECT_NAME='clack_simulado')
        env.update(flags)
        return root, env, answers

    def run(root, env, answers=''):
        trace.write_text('', encoding='utf-8')
        exe = str(Path(os.environ['SystemRoot']) / 'System32/WindowsPowerShell/v1.0/powershell.exe')
        return subprocess.run([exe, '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
                               str(root/'bin/iniciar-clack.ps1'), '-Porta', '18090', '-NaoAbrirNavegador'],
                              cwd=root, env=env, input=answers, text=True, stdout=subprocess.PIPE,
                              stderr=subprocess.STDOUT, encoding='utf-8', errors='replace', timeout=40)

    root, env, answers = case('nova', '\n', CLACK_TEST_NO_ADMIN='1')
    result = run(root, env, answers+'Administrador Teste\n')
    assert result.returncode == 0, result.stdout
    config = (root/'.env').read_text(encoding='utf-8')
    values = dict(line.split('=',1) for line in config.splitlines() if '=' in line)
    assert values['COMPOSE_PROJECT_NAME'] == 'clack_simulado' and values['CLACK_PORT'] == '18090'
    assert len(values['CLACK_DB_PASSWORD']) == 64 and len(values['CLACK_DB_ROOT_PASSWORD']) == 64
    assert values['CLACK_DB_PASSWORD'] != values['CLACK_DB_ROOT_PASSWORD']
    assert all(values[key] not in result.stdout for key in ('CLACK_DB_PASSWORD','CLACK_DB_ROOT_PASSWORD'))
    calls = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines()]
    calls_config = [call for call in calls if 'bin/configurar.php' in call]
    assert len(calls_config) == 1 and '-T' in calls_config[0]
    assert '--senha-stdin' not in calls_config[0]

    env['CLACK_TEST_VOLUME']='1'
    env.pop('CLACK_TEST_NO_ADMIN')
    env.pop('COMPOSE_PROJECT_NAME')  # O nome salvo no .env deve bastar ao reabrir.
    result = run(root, env)
    assert result.returncode == 0 and (root/'.env').read_text(encoding='utf-8') == config, result.stdout
    calls = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines()]
    assert not any('bin/configurar.php' in call for call in calls)
    wrapper = subprocess.run([str(Path(os.environ['SystemRoot'])/'System32/cmd.exe'), '/c',
                              str(root/'Iniciar-Clack.cmd'), '-NaoAbrirNavegador'], cwd=root,
                             env=env, input='\n', text=True, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, encoding='utf-8', errors='replace', timeout=40)
    assert wrapper.returncode == 0 and (root/'.env').read_text(encoding='utf-8') == config, wrapper.stdout

    root, env, _ = case('banco_sem_config', CLACK_TEST_VOLUME='1')
    result = run(root, env)
    assert result.returncode != 0 and not (root/'.env').exists(), result.stdout
    calls = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines()]
    assert not any('up' in call for call in calls)

    root, env, _ = case('projeto_conflitante', CLACK_TEST_VOLUME='1')
    original='COMPOSE_PROJECT_NAME=projeto_diferente\nCLACK_DB_PASSWORD=senha-antiga\n'
    (root/'.env').write_text(original,encoding='utf-8')
    result = run(root, env)
    assert result.returncode != 0 and (root/'.env').read_text(encoding='utf-8') == original, result.stdout
    calls = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines()]
    assert not any('up' in call for call in calls)

    root, env, _ = case('config_sem_banco')
    original='CLACK_DB_PASSWORD=senha-antiga\nCLACK_DB_ROOT_PASSWORD=outra-senha\n'
    (root/'.env').write_text(original,encoding='utf-8')
    result = run(root, env, 'n\n')
    assert result.returncode != 0 and (root/'.env').read_text(encoding='utf-8') == original, result.stdout
    calls = [json.loads(line) for line in trace.read_text(encoding='utf-8').splitlines()]
    assert not any('up' in call for call in calls)

    root, env, _ = case('docker_parado', CLACK_TEST_DOWN='1')
    result = run(root, env)
    assert result.returncode != 0 and not (root/'.env').exists(), result.stdout

    root, env, _ = case('variavel_externa', CLACK_DB_PASSWORD='nao-exibir-esta-senha')
    result = run(root, env)
    assert result.returncode != 0 and not (root/'.env').exists(), result.stdout
    assert 'nao-exibir-esta-senha' not in result.stdout
    wrapper = subprocess.run([str(Path(os.environ['SystemRoot'])/'System32/cmd.exe'), '/c',
                              str(root/'Iniciar-Clack.cmd'), '-NaoAbrirNavegador'], cwd=root,
                             env=env, input='\n', text=True, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, encoding='utf-8', errors='replace', timeout=40)
    assert wrapper.returncode != 0 and not (root/'.env').exists(), wrapper.stdout
    assert 'nao-exibir-esta-senha' not in wrapper.stdout

    root, env, _ = case('ip_invalido')
    result = run(root, env, 'nao-e-ip\n')
    assert result.returncode != 0 and not (root/'.env').exists(), result.stdout

    # Uma falha ao subir o serviço não apaga nem regenera as senhas criadas.
    root, env, _ = case('falha_ao_iniciar', CLACK_TEST_UP_FAIL='1')
    result = run(root, env, '\n')
    assert result.returncode != 0 and (root/'.env').exists(), result.stdout
    config = (root/'.env').read_text(encoding='utf-8')
    env.pop('CLACK_TEST_UP_FAIL')
    env['CLACK_TEST_VOLUME']='1'
    result = run(root, env)
    assert result.returncode == 0 and (root/'.env').read_text(encoding='utf-8') == config, result.stdout

    # Exercita a escolha de rede com um IPv4 real do computador de teste,
    # quando houver uma interface além do loopback.
    exe = str(Path(os.environ['SystemRoot']) / 'System32/WindowsPowerShell/v1.0/powershell.exe')
    ips = subprocess.run([exe, '-NoProfile', '-Command',
                          "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress -First 1"],
                         text=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=20).stdout.strip()
    if ips:
        root, env, _ = case('ip_local')
        result = run(root, env, ips+'\n')
        assert result.returncode == 0, result.stdout
        assert 'CLACK_BIND_IP='+ips in (root/'.env').read_text(encoding='utf-8')
    print('Iniciador: instalação, reabertura, proteção de dados e falhas verificadas com Docker simulado.')
finally:
    if workspace.parent != base or not workspace.name.startswith('clack-iniciador-teste-'):
        raise RuntimeError('Área temporária inválida; nenhuma limpeza realizada.')
    shutil.rmtree(workspace)
