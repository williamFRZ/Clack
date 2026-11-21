"""Dia letivo comprimido. Uso: python tests/simular_dia_ifsul.py PASTA_NOVA"""
import csv
import datetime as dt
import http.cookiejar
import json
import math
import os
from pathlib import Path
import secrets
import statistics
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor


def run(output, hardware=False):
    output.mkdir(parents=True, exist_ok=False)
    root = Path(__file__).resolve().parents[1]
    project = 'clack-dia-' + uuid.uuid4().hex
    env = dict(os.environ, CLACK_BIND_IP='127.0.0.1', CLACK_PORT='0',
               CLACK_DB_PASSWORD=secrets.token_hex(24), CLACK_DB_ROOT_PASSWORD=secrets.token_hex(24))
    with tempfile.TemporaryDirectory() as tmp:
        cfg = Path(tmp, 'env')
        cfg.touch()
        files = ['-f', 'compose.yaml']
        if hardware:
            override = Path(tmp, 'limites.yaml')
            override.write_text("services:\n  web:\n    cpus: 1\n    mem_limit: 512m\n    memswap_limit: 512m\n  db:\n    cpus: 1\n    mem_limit: 1g\n    memswap_limit: 1g\n", encoding='utf-8')
            files += ['-f', str(override)]
        def dc(*args, **kw):
            return subprocess.run(['docker','compose',*files,'--env-file',str(cfg),'-p',project,*args],
                                  cwd=root,env=env,check=True,text=True,**kw)
        try:
            dc('up','-d','--build','--wait','--wait-timeout','180')
            address = dc('port','web','80',capture_output=True).stdout.strip()
            if not address.startswith('127.0.0.1:'):
                raise RuntimeError('O ambiente de ensaio deve usar loopback.')
            base = 'http://' + address + '/'
            password = secrets.token_hex(20)
            dc('exec','-T','web','php','bin/configurar.php','admin','Simulação','--senha-stdin',
               input=password+'\n',capture_output=True)
            direct = urllib.request.ProxyHandler({})
            admin = urllib.request.build_opener(direct,urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
            def request(client,path,data=None,headers=None):
                req = urllib.request.Request(base+path, data=json.dumps(data).encode() if data is not None else None,
                                             headers={'Content-Type':'application/json',**(headers or {})})
                with client.open(req,timeout=10) as res:
                    return json.load(res)
            csrf = {}
            def api(action,data=None):
                return request(admin,'api.php?acao='+action,data,csrf)
            csrf['X-CSRF-Token'] = api('login',{'login':'admin','senha':password})['csrf']
            for i in range(50):
                api('sala',{'nome':f'Sim-{i:02}','andar':'Andar 1','categoria':'aula'})
            rooms = sorted(api('painel')['salas'],key=lambda r:r['nome'])
            assert len(rooms)==50
            devices = []
            for i,room in enumerate(rooms):
                dev = api('dispositivo',{'nome':room['nome'],'tipo':'tranca','sala':room['id']})
                dev.update(uid=f'AB:CD:00:{i:02X}',client=urllib.request.build_opener(urllib.request.ProxyHandler({})))
                devices.append(dev)
                api('cartao',{'nome':f'Docente {i:02}','matricula':f'SIM{i:03}','perfil':'professor',
                              'ativo':True,'uid':dev['uid'],'salas':[room['id']]})
            cards = {c['uid']:c for c in api('painel')['cartoes']}
            day = dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).replace(hour=8,minute=0,second=0,microsecond=0)-dt.timedelta(days=1)
            def health():
                ids=dc('ps','-q',capture_output=True).stdout.split()
                data=json.loads(subprocess.check_output(['docker','inspect',*ids]))
                return {c['Config']['Labels']['com.docker.compose.service']:[c['Id'],c['RestartCount'],c['State']['Health']['Status']] for c in data}
            before=health()
            phase='repouso'
            stop=threading.Event()
            def sample():
                with (output/'hardware.csv').open('w',newline='',encoding='utf-8') as f:
                    w=csv.writer(f); w.writerow(['fase','servico','cpu_pct','memoria','bloco_acumulado'])
                    while not stop.is_set():
                        current=phase
                        values=subprocess.check_output(['docker','stats','--no-stream','--format','{{.CPUPerc}}|{{.MemUsage}}|{{.BlockIO}}',before['web'][0],before['db'][0]],text=True)
                        for svc,line in zip(('web','db'),values.splitlines()):
                            cpu,mem,io=line.split('|')
                            w.writerow([current,svc,cpu.rstrip('%'),mem.split('/')[0].strip(),io])
                        f.flush()
            if hardware:
                def disk():
                    return int(dc('exec','-T','db','du','-sk','/var/lib/mysql',capture_output=True).stdout.split()[0])
                initial_kib=disk()
                monitor=threading.Thread(target=sample,daemon=True)
                monitor.start()
                time.sleep(12)
                phase='carga'
            rows=[]
            bad_snapshots=0
            start=time.perf_counter()
            with ThreadPoolExecutor(max_workers=51) as pool:
                for period in range(10):
                    for step in range(6):
                        operation='abertura' if step==0 else 'fechamento' if step==5 else 'consulta'
                        seq=2*period+(2 if step==5 else 1)
                        event='atividade_encerrada' if step==5 else 'atividade_iniciada'
                        instant=int((day+dt.timedelta(hours=period,minutes=50 if step==5 else 0)).timestamp())
                        gate=threading.Barrier(51,timeout=15)
                        def perform(i):
                            gate.wait()
                            t=time.perf_counter()
                            error=''
                            try:
                                if i==50:
                                    if len(api('painel')['salas'])!=50: raise ValueError('painel incompleto')
                                else:
                                    dev=devices[i]; card=cards[dev['uid']]
                                    events=[] if step in range(1,5) else [dict(sequencia=seq,resultado=event,uid=dev['uid'],
                                                                                nome=card['nome'],perfil='professor',timestamp=instant)]
                                    body=dict(dispositivo=dev['id'],sequencia=seq,eventos=events,estado='disponivel' if step==5 else 'em_uso',
                                              responsavel=None if step==5 else card['id'])
                                    result=request(dev['client'],'dispositivo.php',body,{'Authorization':'Bearer '+dev['token']})
                                    if (result['ultima_sequencia']!=seq or result['confirmados']!=([seq] if events else [])
                                        or [c['uid'] for c in result['cartoes']]!=[dev['uid']]):
                                        raise ValueError('confirmação ou permissões divergentes')
                            except Exception as exc:
                                error=str(exc)
                            return (period+1,step+1,i+1,'painel' if i==50 else operation,round((t-start)*1000,3),
                                    round((time.perf_counter()-t)*1000,3),error)
                        tick=time.perf_counter()
                        rows.extend(pool.map(perform,range(51)))
                        if step in (0,5):
                            states={r['id']:r for r in api('painel')['salas']}
                            for room,dev in zip(rooms,devices):
                                r=states[room['id']]
                                if (r['estado'],r['responsavel'])!=(('disponivel',None) if step==5 else ('em_uso',cards[dev['uid']]['id'])):
                                    bad_snapshots+=1
                        time.sleep(max(0,1-(time.perf_counter()-tick)))
                    print('Período concluído',period+1,flush=True)
            elapsed=round(time.perf_counter()-start,2)
            if hardware:
                stop.set();monitor.join()
                (output/'disco.json').write_text(json.dumps(dict(mysql_antes_KiB=initial_kib,mysql_depois_KiB=disk())))
            with (output/'requisicoes.csv').open('w',encoding='utf-8',newline='') as f:
                w=csv.writer(f); w.writerow(['periodo','rodada','cliente','operacao','inicio_ms','duracao_ms','erro']); w.writerows(rows)
            mismatches=0; total_events=0
            for room,dev in zip(rooms,devices):
                events=api('historico&sala='+str(room['id']))['eventos']
                total_events+=len(events)
                expected=[(s,dev['id'],dev['uid'],'atividade_iniciada' if s%2 else 'atividade_encerrada') for s in range(1,21)]
                actual=sorted((e['sequencia'],e['dispositivo_id'],e['uid'],e['resultado']) for e in events)
                mismatches+=actual!=expected
            after=health()
            stats={}
            for op in ('abertura','consulta','fechamento','painel','trancas'):
                group=[r for r in rows if r[3]==op or (op=='trancas' and r[3]!='painel')]
                ms=sorted(r[5] for r in group)
                stats[op]=dict(n=len(ms),erros=sum(bool(r[6]) for r in group),mediana_ms=statistics.median(ms),
                               p95_ms=ms[math.ceil(.95*len(ms))-1],p99_ms=ms[math.ceil(.99*len(ms))-1],max_ms=max(ms))
            summary=dict(data_simulada=day.date().isoformat(),duracao_s=elapsed,estatisticas=stats,eventos=total_events,
                         salas_com_historico_divergente=mismatches,estados_divergentes=bad_snapshots,
                         servicos={k:dict(saude=a[2],reinicios=a[1]-before[k][1],mesmo_container=a[0]==before[k][0]) for k,a in after.items()})
            (output/'resultado.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
            print(json.dumps(summary,ensure_ascii=False))
        finally:
            dc('down','--volumes','--remove-orphans')

if __name__=='__main__':
    run(Path(sys.argv[1]), '--hardware' in sys.argv[2:])
