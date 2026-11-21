"""Ensaio HTTP local com 1 e 5 clientes simulados. Usa apenas volumes novos."""
import csv
import http.cookiejar
import json
import math
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import secrets
import statistics
import subprocess
import sys
import tempfile
import time
import urllib.request
import uuid

root = Path(__file__).resolve().parents[1]
project = "clack-medicao-" + uuid.uuid4().hex
with tempfile.TemporaryDirectory() as tmp:
    cfg = Path(tmp) / "settings.env"
    cfg.touch()
    env = dict(os.environ, CLACK_DB_PASSWORD=secrets.token_hex(24),
               CLACK_DB_ROOT_PASSWORD=secrets.token_hex(24),
               CLACK_BIND_IP="127.0.0.1", CLACK_PORT="18388")
    dc = ["docker", "compose", "-f", "compose.yaml", "--env-file", str(cfg), "-p", project]
    def compose(*args, **kwargs):
        return subprocess.run(dc + list(args), cwd=root, env=env, check=True, **kwargs)
    def post(client, endpoint, data, headers=None):
        req = urllib.request.Request("http://127.0.0.1:18388/"+endpoint,
                data=json.dumps(data).encode(), headers={"Content-Type":"application/json", **(headers or {})})
        with client.open(req, timeout=8) as response:
            return json.load(response)
    try:
        compose("up", "-d", "--build", "--wait", "--wait-timeout", "180", stdout=sys.stderr)
        password = secrets.token_hex(20)
        compose("exec", "-T", "web", "php", "bin/configurar.php", "admin", "Ensaio", "--senha-stdin",
                input=(password+"\n").encode(), stdout=sys.stderr)
        admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        def api(action, data, headers=None):
            return post(admin, "api.php?acao="+action, data, headers)
        headers = {"X-CSRF-Token":api("login", {"login":"admin","senha":password})["csrf"]}
        devices = []
        for i in range(5):
            name = f"Ensaio {i+1}"
            api("sala", {"nome":name,"andar":"Andar 1","categoria":"aula"}, headers)
            with admin.open("http://127.0.0.1:18388/api.php?acao=painel") as response:
                room = next(r["id"] for r in json.load(response)["salas"] if r["nome"]==name)
            devices.append(api("dispositivo", {"nome":name,"tipo":"tranca","sala":room}, headers))
        writer = csv.writer(sys.stdout, lineterminator="\n")
        writer.writerow(["clientes","rodada","cliente","ms"])
        for count in [1,5]:
            def poll(i):
                opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                device = devices[i]
                start = time.perf_counter()
                result = post(opener,"dispositivo.php",{"dispositivo":device["id"],"sequencia":0,"eventos":[]},
                              {"Authorization":"Bearer "+device["token"]})
                ms = (time.perf_counter()-start)*1000
                if result.get("confirmados")!=[] or result.get("ultima_sequencia")!=0 or result.get("cartoes")!=[]:
                    raise ValueError("Resposta diferente do estado vazio esperado.")
                return round(ms,3)
            samples = []
            with ThreadPoolExecutor(max_workers=count) as pool:
                for rnd in range(21):
                    start = time.perf_counter()
                    results = list(pool.map(poll,range(count)))
                    if rnd:
                        samples.extend(results)
                        writer.writerows((count,rnd,i+1,ms) for i,ms in enumerate(results))
                    time.sleep(max(0,1-(time.perf_counter()-start)))
            print(count,len(samples),statistics.median(samples),sorted(samples)[math.ceil(.95*len(samples))-1],max(samples),file=sys.stderr)
    finally:
        compose("down","--volumes","--remove-orphans",stdout=sys.stderr)
