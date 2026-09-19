"""Somente banco descartável, schema + sql/demo.sql, php -S 127.0.0.1:8080.
Executar: python3 tests/integration.py
Altera sala 1 e gera logs. Não usar no banco real.
"""
import json
import urllib.error
import urllib.parse
import urllib.request

BASE = 'http://127.0.0.1:8080/'
def request(path, data=None, expected=200):
    encoded = urllib.parse.urlencode(data).encode() if data is not None else None
    try:
        response = urllib.request.urlopen(BASE + path, encoded, timeout=5)
    except urllib.error.HTTPError as error:
        response = error
    body = response.read().decode()
    assert response.status == expected, (path, response.status, body)
    return body

def state():
    return json.loads(request('api_salas.php'))[0]['status']

request('api_acao.php', {'sala_id':1, 'acao':'fechar'})
assert request('api_hardware.php?acao=status&sala=1') == 'fechar'
before = len(json.loads(request('api_logs.php')))
request('api_acao.php', {'sala_id':1, 'acao':'abrirr'}, 400)
request('api_acao.php', {'sala_id':'1abc', 'acao':'abrir'}, 400)
request('api_acao.php', {'sala_id':99999, 'acao':'abrir'}, 404)
request('api_acao.php', expected=405)
request('api_hardware.php', {'acao':'ler_tag', 'sala':1, 'uid':'<bad>'}, 400)
assert state() == 'disponivel'
assert len(json.loads(request('api_logs.php'))) == before
request('api_hardware.php', {'acao':'ler_tag', 'sala':1, 'uid':'AA:BB:CC:DD'}, 403)
assert state() == 'disponivel'
request('api_hardware.php', {'acao':'ler_tag', 'sala':1, 'uid':'01:02:03:04'})
assert state() == 'em_uso'
assert request('api_hardware.php?acao=status&sala=1') == 'abrir'
request('api_hardware.php', {'acao':'ler_tag', 'sala':1, 'uid':'01:02:03:04'})
assert state() == 'disponivel'
logs = json.loads(request('api_logs.php'))
assert len(logs) == before + 3
assert all(row['data_hora'].endswith('Z') for row in logs)
assert any('matricula' in row for row in logs)
print('APIs: entradas invalidas, sala ausente, negacao, abertura, fechamento e logs aprovados.')
