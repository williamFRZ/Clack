#!/usr/bin/env python3
"""Backup Docker do Clack. Usa credenciais internas do container, sem exibi-las."""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import uuid

ROOT = Path(__file__).resolve().parents[1]

def verify(path):
    metadata = json.loads(path.with_suffix('.json').read_text(encoding='utf-8'))
    content = path.read_bytes()
    if not content or hashlib.sha256(content).hexdigest() != metadata['sha256']:
        raise ValueError('Arquivo vazio ou checksum diferente do registrado.')
    print('Integridade SHA-256 confirmada. Isso nao substitui um teste de restauracao.')

def backup(destination):
    destination.mkdir(parents=True, exist_ok=True)
    name = 'clack-' + dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid.uuid4().hex[:8]
    temporary = destination / (name + '.partial')
    target = destination / (name + '.sql')
    command = ['docker', 'compose', 'exec', '-T', 'db', 'sh', '-c',
               'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --user="$MYSQL_USER" --single-transaction --no-tablespaces --hex-blob "$MYSQL_DATABASE"']
    try:
        with temporary.open('xb') as output:
            result = subprocess.run(command, cwd=ROOT, stdout=output, stderr=subprocess.PIPE, timeout=600)
        if result.returncode:
            raise RuntimeError('mysqldump falhou. Confira Docker, banco e credenciais; backup parcial descartado.')
        content = temporary.read_bytes()
        if not content or b'CREATE TABLE' not in content or b'operadores' not in content:
            raise ValueError('Dump nao contem as tabelas esperadas do Clack.')
        metadata = {'created_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
                    'sha256':hashlib.sha256(content).hexdigest(), 'bytes':len(content)}
        temporary.rename(target)
        target.with_suffix('.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
        verify(target)
        print('Backup criado: ' + str(target))
    finally:
        if temporary.exists():
            temporary.unlink()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destino', type=Path, default=ROOT / 'backups')
    parser.add_argument('--verificar', type=Path)
    args = parser.parse_args()
    try:
        if args.verificar:
            verify(args.verificar)
        else:
            backup(args.destino.resolve())
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.TimeoutExpired) as error:
        print('Falha: ' + str(error), file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    sys.exit(main())
