#!/bin/sh
# Uses its own Compose project and disposable volumes; never the normal clack project.
set -eu
export CLACK_DB_PASSWORD=docker-test-app-password
export CLACK_DB_ROOT_PASSWORD=docker-test-root-password
export CLACK_BIND_IP=127.0.0.1
export CLACK_PORT=${CLACK_TEST_PORT:-18080}
export CLACK_TEST_URL="http://127.0.0.1:$CLACK_PORT/"
project="clack-test-$(date +%s)-$$"
temporary=$(mktemp -d)
dc() { docker compose --env-file /dev/null -p "$project" "$@"; }
cleanup() {
    status=$?
    if [ "$status" -ne 0 ]; then dc logs --no-color; fi
    dc down --volumes --remove-orphans
    rm -f "$temporary/backup.sql"
    rmdir "$temporary"
}
trap cleanup EXIT
dc config --quiet
dc up --build --wait --wait-timeout 240
dc exec -T web sh -c 'test ! -e /opt/clack/config/config.local.php && test ! -e /opt/clack/.env && test ! -d /var/www/html/frontend'
printf '%s\n' 'test-password-123' | dc exec -T web php bin/configurar.php admin 'Admin Teste'
dc exec -T web php bin/configurar.php
python3 tests/gestao_test.py
# Persistence across removal/recreation, not merely a process restart.
dc down
dc up --wait --wait-timeout 180
python3 - <<'PY'
import json, os, urllib.request, http.cookiejar
base = os.environ['CLACK_TEST_URL']
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
body = json.dumps({'login': 'admin', 'senha': 'new-test-password'}).encode()
client.open(urllib.request.Request(base+'api.php?acao=login', data=body, headers={'Content-Type':'application/json'}))
panel = json.load(client.open(base+'api.php?acao=painel'))
assert any(r['nome']=='Data center' for r in panel['salas'])
assert any(float(r['mapa_x'] or 0)==43.125 for r in panel['salas'])
assert panel['cartoes'] and panel['dispositivos']
print('Docker: recriação preserva salas, cartões, dispositivos, posições e senha.')
PY
# Same portable backup/restore commands documented for PowerShell and Unix shells.
dc exec -T db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --user="$MYSQL_USER" --single-transaction --no-tablespaces "$MYSQL_DATABASE" > /tmp/clack-backup.sql'
dc cp db:/tmp/clack-backup.sql "$temporary/backup.sql"
test -s "$temporary/backup.sql"
dc cp "$temporary/backup.sql" db:/tmp/clack-restore.sql
dc exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root --execute="CREATE DATABASE clack_restore CHARACTER SET utf8mb4"'
dc exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root clack_restore < /tmp/clack-restore.sql'
dc exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql --user=root --batch --skip-column-names --execute="SELECT COUNT(*)=(SELECT COUNT(*) FROM clack.ambientes) FROM clack_restore.ambientes"' | grep -qx 1
echo 'Docker: build, API, arquivos privados, migração repetível, persistência e backup/restauração OK.'
