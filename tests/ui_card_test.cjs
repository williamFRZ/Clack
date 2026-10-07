const assert = require('node:assert/strict');
const { chromium } = require(process.env.CLACK_PLAYWRIGHT || '../frontend/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CLACK_BROWSER ? { executablePath: process.env.CLACK_BROWSER } : {}) });
  try {
    const page = await browser.newPage();
    const sample = { salas: [], cartoes: [], permissoes: [], dispositivos: [{ id: 2, nome: 'Leitor de teste', tipo: 'cadastrador' }], comandos: [] };
    let capture = '', started = 0, cancelled = 0, saved = 0;
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api.php?*', async route => {
      const action = new URL(route.request().url()).searchParams.get('acao');
      const body = route.request().postDataJSON();
      let data = { ok: true };
      if (body) assert.equal(route.request().headers()['x-csrf-token'], 'test');
      if (action === 'sessao') data = { operador: { id: 1, nome: 'Teste', papel: 'admin' }, csrf: 'test' };
      if (action === 'painel') data = sample;
      if (action === 'capturar') { capture = `capture-${++started}`; data = { captura: capture }; }
      if (action === 'ler_captura') data = { uid: `AA:BB:CC:${String(started).padStart(2, '0')}` };
      if (action === 'cancelar_captura') { cancelled++; capture = ''; }
      if (action === 'cartao') {
        assert.ok(body.captura, 'Cadastro deve enviar a leitura correspondente');
        sample.cartoes.push({ ...body, id: ++saved, uid: `AA:BB:CC:${String(started).padStart(2, '0')}`, ativo: 1 });
        capture = '';
      }
      if (action === 'revogar_cartao') {
        sample.cartoes.find(c => c.id === body.id).ativo = 0;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto(process.env.CLACK_UI_URL || 'http://127.0.0.1:8090/painel/');
    await page.getByRole('button', { name: 'Cartões', exact: true }).click();
    await page.getByRole('button', { name: 'Novo cartão', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Iniciar leitura', exact: true }).click();
    await dialog.getByRole('button', { name: 'Cancelar leitura', exact: true }).waitFor();
    const cancellation = page.waitForResponse(r => r.url().includes('acao=cancelar_captura'));
    await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();
    await cancellation;
    assert.equal(cancelled, 1, 'Fechar deve liberar a reserva');
    await page.getByRole('button', { name: 'Novo cartão', exact: true }).click();
    await dialog.getByLabel('Nome', { exact: true }).fill('Primeiro cartão');
    await dialog.getByLabel('Pessoa externa (NDA)').check();
    await dialog.getByRole('button', { name: 'Iniciar leitura', exact: true }).click();
    await dialog.getByText('Cartão lido: AA:BB:CC:02', { exact: true }).waitFor();
    await dialog.getByRole('button', { name: 'Salvar e cadastrar outro', exact: true }).click();
    await dialog.getByText('Cartão lido: AA:BB:CC:03', { exact: true }).waitFor();
    assert.equal(await dialog.getByLabel('Nome', { exact: true }).inputValue(), '');
    await dialog.getByLabel('Nome', { exact: true }).fill('Segundo cartão');
    await dialog.getByRole('button', { name: 'Salvar cadastro', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(saved, 2, 'Cadastrar dois cartões sem fechar e reabrir o primeiro formulário');
    assert.equal(cancelled, 1, 'Salvar não deve cancelar a leitura seguinte');
    await page.getByRole('row').filter({ hasText: 'Primeiro cartão' }).getByRole('button', { name: 'Editar', exact: true }).click();
    page.once('dialog', d => d.accept());
    await dialog.getByRole('button', { name: 'Revogar acesso', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(sample.cartoes[0].ativo, 0);
    assert.equal(sample.cartoes[0].uid, 'AA:BB:CC:02');
    assert.deepEqual(errors, []);
    console.log('UI: liberar ao fechar, dois cadastros consecutivos e revogar acesso preservando UID OK (API simulada).');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
