const assert = require('node:assert/strict');
const { chromium } = require(process.env.CLACK_PLAYWRIGHT || '../frontend/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CLACK_BROWSER ? { executablePath: process.env.CLACK_BROWSER } : {}) });
  try {
    const page = await browser.newPage();
    const sample = {
      salas: [],
      cartoes: [
        { id: 199, nome: 'Zeca', matricula: '199', uid: 'AA:BB:CC:199', perfil: 'professor', ativo: 1 },
        { id: 200, nome: 'Ána Silva', matricula: '200', uid: 'AA:BB:CC:200', perfil: 'professor', ativo: 1 },
        { id: 201, nome: 'Bruno', matricula: '201', uid: 'AA:BB:CC:201', perfil: 'aluno', ativo: 1 },
        { id: 202, nome: 'Ana Silva', matricula: '202', uid: null, perfil: 'professor', ativo: 0 },
      ],
      permissoes: [], dispositivos: [{ id: 2, nome: 'Leitor de teste', tipo: 'cadastrador' }], comandos: []
    };
    let capture = '', started = 0, cancelled = 0, saved = 0, nextCardId = 202;
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
        assert.ok(body.captura || body.uid, 'Cadastro deve enviar a leitura ou o UID manual');
        saved++;
        sample.cartoes.push({ ...body, id: ++nextCardId, uid: body.uid || `AA:BB:CC:${String(started).padStart(2, '0')}`, ativo: 1 });
        capture = '';
      }
      if (action === 'revogar_cartao') {
        sample.cartoes.find(c => c.id === body.id).ativo = 0;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto(process.env.CLACK_UI_URL || 'http://127.0.0.1:8090/painel/');
    await page.getByRole('button', { name: 'Cartões', exact: true }).click();
    const linked = page.locator('section[aria-labelledby="linked-cards-title"]');
    const unlinked = page.locator('section[aria-labelledby="unlinked-cards-title"]');
    assert.equal(await linked.locator('tbody tr').count(), 3, 'Cartões com UID ficam na primeira lista');
    assert.equal(await unlinked.locator('tbody tr').count(), 1, 'Cartões sem UID ficam na lista de desvinculados');
    assert.deepEqual(await linked.locator('tbody tr td:first-child strong').allTextContents(), ['Ána Silva', 'Bruno', 'Zeca'], 'Ordem alfabética é o padrão');
    assert.equal(await page.getByLabel('Buscar pessoa').count(), 0, 'A busca por pessoa foi incorporada à busca de cartão');
    await page.getByLabel('Buscar cartão').fill('ana');
    assert.equal(await linked.locator('tbody tr').count(), 1, 'Busca por nome ignora acentos e mostra os homônimos vinculados');
    assert.equal(await unlinked.locator('tbody tr').count(), 1, 'Busca por nome mostra também os homônimos desvinculados');
    await page.getByLabel('Buscar cartão').fill('201');
    assert.equal(await linked.locator('tbody tr').count(), 1, 'Busca única encontra pela matrícula');
    assert.equal(await unlinked.locator('tbody tr').count(), 0);
    await page.getByLabel('Buscar cartão').fill('AA:BB:CC:199');
    assert.equal(await linked.locator('tbody tr').count(), 1, 'Busca única encontra pelo UID');
    assert.equal(await linked.locator('tbody tr td:first-child strong').textContent(), 'Zeca');
    await page.getByLabel('Buscar cartão').fill('');
    await page.getByLabel('Ordenar cartões').selectOption('registration');
    assert.deepEqual(await linked.locator('tbody tr td:first-child strong').allTextContents(), ['Zeca', 'Ána Silva', 'Bruno'], 'Ordem de cadastro usa o ID crescente');
    await page.getByLabel('Ordenar cartões').selectOption('name');
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
    const firstCard = sample.cartoes.find(c => c.nome === 'Primeiro cartão');
    assert.equal(firstCard.ativo, 0);
    assert.equal(firstCard.uid, 'AA:BB:CC:02');
    await page.getByRole('button', { name: 'Novo cartão', exact: true }).click();
    await dialog.getByLabel('Nome', { exact: true }).fill('Cadastro manual');
    await dialog.getByLabel('Matrícula', { exact: true }).fill('300');
    await dialog.getByRole('tab', { name: 'Inserir UID manualmente' }).click();
    const manualUid = dialog.getByLabel('UID da tag');
    await manualUid.fill('39664ca3');
    assert.equal(await manualUid.inputValue(), '39:66:4C:A3', 'UID manual recebe dois-pontos e letras maiúsculas automaticamente');
    await dialog.getByRole('button', { name: 'Salvar cadastro', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(saved, 3, 'Cadastro manual envia UID sem depender de leitor');
    assert.equal(sample.cartoes.find(c => c.nome === 'Cadastro manual').uid, '39:66:4C:A3');
    assert.deepEqual(errors, []);
    console.log('UI: captura, cadastro manual de UID e revogação preservando UID OK (API simulada).');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
