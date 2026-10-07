const assert = require('node:assert/strict');
const { chromium } = require(process.env.CLACK_PLAYWRIGHT || '../frontend/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CLACK_BROWSER ? { executablePath: process.env.CLACK_BROWSER } : {}) });
  try {
    const page = await browser.newPage();
    let role = null;
    let forbiddenRequests = 0;
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/api.php?*', async route => {
      const action = new URL(route.request().url()).searchParams.get('acao');
      let data = { ok: true }, status = 200;
      if (action === 'login') role = route.request().postDataJSON().login;
      if (action === 'logout') role = null;
      if (action === 'login' || action === 'sessao') {
        if (!role) { status = 401; data = { mensagem: 'Entre' }; }
        else data = { operador: { id: role === 'admin' ? 1 : 2, nome: role, papel: role }, csrf: 'test' };
      }
      if (action === 'painel') data = { salas: [], cartoes: [], permissoes: [], dispositivos: [], comandos: [] };
      if (action === 'historico') data = { eventos: [], auditoria: [] };
      if (action === 'operadores') {
        if (role !== 'admin') { forbiddenRequests++; status = 403; data = { mensagem: 'Proibido' }; }
        else data = { operadores: [] };
      }
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    });
    const login = async user => {
      await page.getByLabel('Login', { exact: true }).fill(user);
      await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste');
      await page.getByRole('button', { name: 'Entrar', exact: true }).click();
      await page.getByRole('heading', { name: 'Ambientes do campus', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Ambientes', exact: true }).getAttribute('class'), 'selected');
    };
    const logout = async () => {
      await page.getByRole('button', { name: 'Sair', exact: true }).click();
      await page.getByLabel('Login', { exact: true }).waitFor();
    };
    await page.goto(process.env.CLACK_UI_URL || 'http://127.0.0.1:8090/painel/');
    await login('admin');
    await page.getByRole('button', { name: 'Configurações', exact: true }).click();
    await page.getByRole('button', { name: 'Cadastrar sala', exact: true }).waitFor();
    await logout();
    await login('portaria');
    assert.equal(await page.getByRole('button', { name: 'Configurações', exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Cadastrar sala', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Cartões', exact: true }).click();
    await logout();
    await login('portaria');
    await logout();
    await login('admin');
    await page.getByRole('button', { name: 'Configurações', exact: true }).click();
    await logout();
    await login('admin');
    assert.equal(forbiddenRequests, 0);
    assert.deepEqual(errors, []);
    console.log('UI: admin→portaria, portaria→portaria e admin→admin sempre entram em Ambientes; Configurações não aparece nem consulta operadores para portaria (API simulada).');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
