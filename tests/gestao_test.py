"""Integration against a disposable MySQL database and PHP HTTP server."""
import json, os, urllib.request, urllib.error, http.cookiejar
BASE=os.environ.get('CLACK_TEST_URL', 'http://127.0.0.1:8080/').rstrip('/')+'/'
jar=http.cookiejar.CookieJar()
client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
csrf=''
def request(path, body=None, code=200, token=None, use_csrf=True):
    headers={}
    if body is not None: headers['Content-Type']='application/json'
    if use_csrf: headers['X-CSRF-Token']=csrf
    if token: headers['Authorization']='Bearer '+token
    req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
    try:
        r=client.open(req); status=r.status; raw=r.read()
    except urllib.error.HTTPError as e: status=e.code; raw=e.read()
    assert status==code,(path,status,code,raw.decode())
    return json.loads(raw)
def api(action,b=None,code=200,**kw):return request('api.php?acao='+action,b,code,**kw)
api('painel',code=401)
s=api('login',{'login':'admin','senha':'test-password-123'})
csrf=s['csrf']
assert s['operador']['papel']=='admin'
assert 'senha' not in s['operador']
api('sala',{'nome':'101','andar':'Térreo','categoria':'aula','x':0,'y':0},403,use_csrf=False)
api('sala',{'nome':'101','andar':'Térreo','categoria':'aula','x':0,'y':0})
api('sala',{'nome':'Diretoria','andar':'Térreo','categoria':'administrativa','x':200,'y':0})
p=api('painel'); room=p['salas'][0]['id']; other=p['salas'][1]['id']
# Identify by name, not query ordering.
room=next(x['id'] for x in p['salas'] if x['nome']=='101')
other=next(x['id'] for x in p['salas'] if x['nome']=='Diretoria')
assert next(x for x in p['salas'] if x['id']==room)['mapa_x'] is None
api('posicao_sala',{'id':room,'mapa_x':43.125,'mapa_y':84.5})
positioned=next(x for x in api('painel')['salas'] if x['id']==room)
assert float(positioned['mapa_x'])==43.125 and float(positioned['mapa_y'])==84.5
api('posicao_sala',{'id':room,'mapa_x':101,'mapa_y':50},400)
api('posicao_sala',{'id':room,'mapa_x':None,'mapa_y':50},400)
api('posicao_sala',{'id':room,'mapa_x':'50','mapa_y':50},400)
api('sala',{'id':room,'nome':'101','andar':'Térreo','categoria':'aula'})
assert float(next(x for x in api('painel')['salas'] if x['id']==room)['mapa_x'])==43.125
d=api('dispositivo',{'nome':'Tranca 101','tipo':'tranca','sala':room})
r=api('dispositivo',{'nome':'Portaria','tipo':'cadastrador'})
def sync(device,extra=None,code=200):return request('dispositivo.php',{'dispositivo':device['id'],**(extra or {})},code,token=device['token'])
request('dispositivo.php',{'dispositivo':d['id']},401)
sync(r)
c=api('capturar',{'dispositivo':r['id']})['captura']
assert sync(r)['captura']==c
sync(r,{'captura':'0'*32,'uid':'01:02:03:04'},409)
sync(r,{'captura':c,'uid':'01:02:03:04'})
assert api('ler_captura',{'captura':c})['uid']=='01:02:03:04'
api('cartao',{'nome':'Professor Teste','matricula':'123','externo':False,'perfil':'professor','ativo':True,'salas':[room],'captura':c})
card=api('painel')['cartoes'][0]
api('cartao',{'nome':'Outro','matricula':'456','perfil':'aluno','salas':[room],'captura':c},400)
base={'sequencia':0,'estado':'disponivel','responsavel':None,'eventos':[],'versao':''}
snap=sync(d,base)
assert len(snap['cartoes'])==1
# Room permissions are scoped to device.
d2=api('dispositivo',{'nome':'Diretoria','tipo':'tranca','sala':other})
assert sync(d2,base)['cartoes']==[]
e={'sequencia':1,'resultado':'atividade_iniciada','uid':card['uid'],'nome':card['nome'],'perfil':card['perfil'],'timestamp':1735732800}
opened={**base,'sequencia':1,'estado':'em_uso','responsavel':card['id'],'eventos':[e]}
assert sync(d,opened)['confirmados']==[1]
occupied=next(x for x in api('painel')['salas'] if x['id']==room)
assert occupied['responsavel_perfil']=='professor' and occupied['responsavel_matricula']=='123'
assert occupied['uso_desde']=='2025-01-01 12:00:00'
sync(d,opened)
assert len(api('historico')['eventos'])==1
closed={**base,'sequencia':2,'eventos':[{**e,'sequencia':2,'resultado':'atividade_encerrada'}]}
sync(d,closed);sync(d,opened)
assert next(x for x in api('painel')['salas'] if x['id']==room)['estado']=='disponivel'
assert next(x for x in api('painel')['salas'] if x['id']==room)['uso_desde'] is None
assert len(api('historico')['eventos'])==2
api('comando',{'sala':room,'comando':'abrir'})
command=sync(d,{**closed,'eventos':[]})['comando']
assert command['acao']=='abrir'
api('comando',{'sala':room,'comando':'fechar'},409)
assert next(x for x in api('painel')['salas'] if x['id']==room)['estado']=='disponivel'
sync(d,{**closed,'eventos':[],'comando_confirmado':command['id']})
api('cartao',{**card,'nome':'Nome alterado','externo':False,'ativo':False,'salas':[room]})
assert sync(d,{**closed,'eventos':[]})['cartoes']==[]
assert api('historico')['eventos'][0]['nome']=='Professor Teste'
api('resetar_cartao',{'id':card['id']})
assert api('painel')['cartoes'][0]['uid'] is None
# TI tem acesso global, inclusive a salas novas, sem permissão selecionada.
c=api('capturar',{'dispositivo':r['id']})['captura']
sync(r,{'captura':c,'uid':'AA:BB:CC:DD'})
api('cartao',{'nome':'TI Teste','matricula':'TI123','perfil':'ti','ativo':True,'salas':[],'captura':c})
ti=next(c for c in api('painel')['cartoes'] if c['perfil']=='ti')
assert any(c['id']==ti['id'] for c in sync(d2,base)['cartoes'])
api('sala',{'nome':'Data center','andar':'Andar 2','categoria':'administrativa'})
datacenter=next(x['id'] for x in api('painel')['salas'] if x['nome']=='Data center')
ddc=api('dispositivo',{'nome':'Tranca Data center','tipo':'tranca','sala':datacenter})
assert [c['id'] for c in sync(ddc,base)['cartoes']]==[ti['id']]
api('sala',{'nome':'Estoque','andar':'Andar 3','categoria':'outra'})
stock=next(x['id'] for x in api('painel')['salas'] if x['nome']=='Estoque')
dst=api('dispositivo',{'nome':'Tranca Estoque','tipo':'tranca','sala':stock})
assert [c['id'] for c in sync(dst,base)['cartoes']]==[ti['id']]
# Em sala ocupada, a TI abre a tranca sem assumir a atividade nem alterar o marcador.
professor_event={'sequencia':1,'resultado':'atividade_iniciada','uid':'01:02:03:04','nome':'Professor Teste','perfil':'professor','timestamp':1735732800}
professor_occupied={**base,'sequencia':1,'estado':'em_uso','responsavel':card['id'],'eventos':[professor_event]}
sync(dst,professor_occupied)
before_ti_access=next(x for x in api('painel')['salas'] if x['id']==stock)
assert before_ti_access['responsavel_perfil']=='professor' and before_ti_access['responsavel_matricula']=='123'
ti_access={'sequencia':2,'resultado':'acesso_ti_liberado','uid':ti['uid'],'nome':ti['nome'],'perfil':'ti','timestamp':1735732860}
sync(dst,{**professor_occupied,'sequencia':2,'eventos':[ti_access]})
after_ti_access=next(x for x in api('painel')['salas'] if x['id']==stock)
assert after_ti_access['estado']=='em_uso' and after_ti_access['responsavel_perfil']=='professor'
assert after_ti_access['responsavel_nome']=='Professor Teste' and after_ti_access['uso_desde']==before_ti_access['uso_desde']
assert api('historico')['eventos'][0]['resultado']=='acesso_ti_liberado'
ti_event={'sequencia':1,'resultado':'atividade_iniciada','uid':ti['uid'],'nome':ti['nome'],'perfil':'ti'}
ti_opened={**base,'sequencia':1,'estado':'em_uso','responsavel':ti['id'],'eventos':[ti_event]}
sync(ddc,ti_opened)
ti_room=next(x for x in api('painel')['salas'] if x['id']==datacenter)
assert ti_room['responsavel_perfil']=='ti' and ti_room['responsavel_matricula']=='TI123'
assert ti_room['uso_desde'] is None and ti_room['uso_recebido_em'] is not None
# Negativa e replay não redefinem o horário da atividade.
denied={**ti_event,'sequencia':2,'resultado':'sala_indisponivel','timestamp':1735732801}
sync(ddc,{**ti_opened,'sequencia':2,'eventos':[denied]})
unchanged=next(x for x in api('painel')['salas'] if x['id']==datacenter)
assert unchanged['uso_recebido_em']==ti_room['uso_recebido_em'] and unchanged['uso_desde'] is None
sync(ddc,ti_opened)
assert next(x for x in api('painel')['salas'] if x['id']==datacenter)['uso_desde'] is None
# Troca de perfil retira o acesso global; não reaproveita a seleção automática.
api('cartao',{**ti,'perfil':'limpeza','externo':False,'ativo':True,'salas':[datacenter]})
assert sync(dst,base)['cartoes']==[]
assert next(x for x in api('painel')['salas'] if x['id']==datacenter)['responsavel_perfil']=='ti'
# Perfil da atividade é snapshot do evento, não muda ao editar o cartão.
assert sync(ddc,{**ti_opened,'sequencia':2,'eventos':[]})['cartoes'][0]['perfil']=='limpeza'
api('operador',{'nome':'Porteiro','login':'portaria','senha':'portaria-password','papel':'portaria'})
api('senha',{'atual':'errada','nova':'new-test-password'},403)
api('senha',{'atual':'test-password-123','nova':'new-test-password'})
rotated=api('rotacionar_dispositivo',{'id':d2['id']})
sync(d2,base,401)
d2['token']=rotated['token'];sync(d2,base)
api('logout',{})
s=api('login',{'login':'portaria','senha':'portaria-password'});csrf=s['csrf']
api('painel');api('operadores',code=403)
api('sala',{'nome':'Proibida','andar':'X','categoria':'aula'},403)
api('posicao_sala',{'id':room,'mapa_x':10,'mapa_y':10},403)
for path in ['api_hardware.php','api_acao.php','api_salas.php','api_logs.php']:request(path,code=410)
for path in ['config/config.local.php', '.git/config', 'sql/gestao.sql']:
    try:
        client.open(BASE+path)
        raise AssertionError('Arquivo interno exposto: '+path)
    except urllib.error.HTTPError as e:
        assert e.code==404,(path,e.code)
print('Gestão: autenticação, posições, perfis/horários de uso, TI global, deduplicação, replay, comandos e histórico OK.')
