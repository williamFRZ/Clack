const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const script = html.split('<script>')[1].split('</script>')[0]
  .replace(/        carregarLogs\(\);\s*carregarSalas\(\);\s*$/, '');
const context = { setInterval() {}, fetch: async () => ({ok:false, json:async()=>({mensagem:'Falha controlada'})}) };
vm.createContext(context);
vm.runInContext(script, context);
assert.equal(context.escaparHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
assert.equal(context.escaparHtml(null), '');
(async () => {
  await assert.rejects(context.buscarJson('api_logs.php'), /Falha controlada/);
  console.log('Frontend: escape de HTML e erro HTTP aprovados.');
})().catch(e => { console.error(e); process.exit(1); });
