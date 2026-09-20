const { chromium } = require("../frontend/node_modules/playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  let logged = false;
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const sample = {
    salas: [
      {
        id: 1,
        nome: "Sala 101",
        andar: "Térreo",
        categoria: "aula",
        x: 100,
        y: 100,
        estado: "disponivel",
        online: 1,
        dispositivo_id: 1,
      },
      {
        id: 2,
        nome: "Sala 102",
        andar: "Térreo",
        categoria: "aula",
        x: 290,
        y: 100,
        estado: "em_uso",
        online: 1,
        responsavel_nome: "Professor Teste",
        dispositivo_id: 2,
      },
      {
        id: 3,
        nome: "Laboratório",
        andar: "Térreo",
        categoria: "aula",
        x: 480,
        y: 100,
        estado: "manutencao",
        online: 0,
      },
    ],
    cartoes: [],
    permissoes: [],
    dispositivos: [],
    comandos: [],
  };
  await page.route("**/api.php?*", async (r) => {
    const action = new URL(r.request().url()).searchParams.get("acao");
    let data = {};
    let status = 200;
    if (action === "sessao" && !logged) {
      data = { mensagem: "Entre" };
      status = 401;
    } else if (action === "login" || action === "sessao") {
      logged = true;
      data = {
        operador: { id: 1, nome: "Portaria Teste", papel: "admin" },
        csrf: "test",
      };
    } else if (action === "painel") data = sample;
    else if (action === "historico") data = { eventos: [], auditoria: [] };
    else if (action === "operadores") data = { operadores: [] };
    await r.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("http://127.0.0.1:8090/painel/");
  await page.getByLabel("Login", { exact: true }).fill("admin");
  await page.getByLabel("Senha", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("heading", { name: "Ambientes do campus" }).waitFor();
  const floors = page.getByRole("combobox", { name: "Andar", exact: true });
  if ((await floors.locator("option").allTextContents()).join(",") !== "Andar 1,Andar 2,Andar 3") throw Error("Seleção de andares incorreta");
  await page.getByText("Aguardando planta baixa", { exact: true }).waitFor();
  await floors.selectOption("Andar 2");
  await page.getByText("Nenhuma sala cadastrada neste andar.", { exact: true }).waitFor();
  if (await page.locator(".room-card").count()) throw Error("Salas de outro andar visíveis");
  await floors.selectOption("Andar 3");
  await page.getByLabel("Planta baixa — Andar 3", { exact: true }).waitFor();
  await floors.selectOption("Andar 1");
  if (await page.locator(".room-card").count() !== 3) throw Error("Salas do térreo não preservadas");
  await page.screenshot({ path: "/tmp/clack-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Modo escuro" }).click();
  if ((await page.locator("html").getAttribute("data-theme")) !== "dark")
    throw Error("Theme failed");
  await page.getByRole("button", { name: "Cartões", exact: true }).click();
  await page.getByRole("button", { name: "Novo cartão" }).click();
  await page.getByLabel("Pessoa externa (NDA)").check();
  if (await page.getByLabel("Matrícula", { exact: true }).count())
    throw Error("NDA failed");
  await page.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ambientes", exact: true }).click();
  await page.screenshot({ path: "/tmp/clack-mobile.png", fullPage: true });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Mobile overflow");
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    "UI: login, navegação, tema, NDA e largura móvel OK (API simulada).",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
