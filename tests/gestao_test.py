"""Integration against a disposable MySQL database and PHP HTTP server."""
import json, urllib.request, urllib.error, http.cookiejar
BASE='http://127.0.0.1:8080/'
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
api('sala',{'nome':'101','andar':'Térreo','categoria':'aula','x':0,'y':0},403,use_csrf=False)
api('sala',{'nome':'101','andar':'Térreo','categoria':'aula','x':0,'y':0})
api('sala',{'nome':'Diretoria','andar':'Térreo','categoria':'administrativa','x':200,'y':0})
p=api('painel'); room=p['salas'][0]['id']; other=p['salas'][1]['id']
# Identify by name, not query ordering.
room=next(x['id'] for x in p['salas'] if x['nome']=='101')
other=next(x['id'] for x in p['salas'] if x['nome']=='Diretoria')
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
e={'sequencia':1,'resultado':'atividade_iniciada','uid':card['uid'],'nome':card['nome'],'perfil':card['perfil']}
opened={**base,'sequencia':1,'estado':'em_uso','responsavel':card['id'],'eventos':[e]}
assert sync(d,opened)['confirmados']==[1]
sync(d,opened)
assert len(api('historico')['eventos'])==1
closed={**base,'sequencia':2,'eventos':[{**e,'sequencia':2,'resultado':'atividade_encerrada'}]}
sync(d,closed);sync(d,opened)
assert next(x for x in api('painel')['salas'] if x['id']==room)['estado']=='disponivel'
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
for path in ['api_hardware.php','api_acao.php','api_salas.php','api_logs.php']:request(path,code=410)
print('Gestão: autenticação, CSRF, captura, permissões, deduplicação, replay, comandos e histórico OK.')
