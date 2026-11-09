const { chromium } = require("../frontend/node_modules/playwright");
const { join } = require("node:path");
const screenshotDirectory = process.env.CLACK_SCREENSHOT_DIR || "/tmp";
(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CLACK_BROWSER ? { executablePath: process.env.CLACK_BROWSER, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {}) });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  let logged = false;
  let savedRoom = null;
  const historyRequests = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (dialog) => dialog.accept());
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
        ultimo_usuario_nome: "Última Pessoa",
        dispositivo_id: 1,
        mapa_x: 43,
        mapa_y: 84,
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
        responsavel: 2,
        responsavel_matricula: "012345",
        responsavel_perfil: "professor",
        uso_desde: "2026-10-02 13:00:00",
        mapa_x: 55,
        mapa_y: 84,
        dispositivo_id: 2,
      },
      {
        id: 4, nome: "Sala 103", andar: "Andar 1", estado: "em_uso", online: 1,
        categoria: "aula", mapa_x: 28, mapa_y: 84, responsavel: 4,
        responsavel_nome: "Equipe Limpeza", responsavel_perfil: "limpeza", responsavel_matricula: "L001",
        uso_desde: "2026-10-02 12:30:00",
      },
      {
        id: 5, nome: "Sala 104", andar: "Andar 1", estado: "em_uso", online: 0,
        categoria: "aula", mapa_x: 69, mapa_y: 78, responsavel: 5,
        responsavel_nome: "Técnico TI", responsavel_perfil: "ti", responsavel_externo: 1,
        uso_desde: null, uso_recebido_em: "2026-10-02 13:15:00",
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
    else if (action === "posicao_sala") {
      if (r.request().headers()["x-csrf-token"] !== "test") throw Error("CSRF ausente no posicionamento");
      const body = r.request().postDataJSON();
      const room = sample.salas.find(room => room.id === body.id);
      room.mapa_x = body.mapa_x; room.mapa_y = body.mapa_y;
      data = { ok: true };
    }
    else if (action === "sala") {
      if (r.request().headers()["x-csrf-token"] !== "test") throw Error("CSRF ausente no cadastro");
      savedRoom = r.request().postDataJSON();
      sample.salas.push({ ...savedRoom, id: 99, estado: "disponivel", online: 0 });
      data = { ok: true };
    } else if (action === "comando") {
      if (r.request().headers()["x-csrf-token"] !== "test") throw Error("CSRF ausente no comando");
      const body = r.request().postDataJSON();
      const room = sample.salas.find((item) => item.id === body.sala);
      room.estado = body.comando === "manutencao" ? "manutencao" : body.comando === "liberar" ? "disponivel" : room.estado;
      data = { ok: true };
    }
    else if (action === "historico") {
      historyRequests.push(new URL(r.request().url()).searchParams);
      data = { eventos: [], auditoria: [{ id: 1, operador: "Operador teste", acao: "comando_enviado", criado_em: "2026-10-14 12:00:00" }] };
    }
    else if (action === "operadores") data = { operadores: [] };
    await r.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("http://127.0.0.1:8090/painel/");
  const language = page.locator(".language-trigger");
  await language.click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("heading", { name: "Bienvenido a portería." }).waitFor();
  await page.getByLabel("Usuario", { exact: true }).waitFor();
  await page.reload();
  await page.getByRole("heading", { name: "Espacios del campus", exact: true }).waitFor();
  if (await language.getAttribute("data-language") !== "es-UY") throw Error("Preferencia de idioma no persistió al recargar");
  await language.click();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await page.getByLabel("Login", { exact: true }).fill("admin");
  await page.getByLabel("Senha", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.getByRole("heading", { name: "Ambientes do campus" }).waitFor();
  await page.getByText("CLACK / PÁGINA INICIAL", { exact: true }).waitFor();
  if (await page.locator(".account .language-picker").count() !== 1 || await page.locator("header .language-picker").count() !== 0) throw Error("Seletor de idioma fora da conta da barra lateral");
  const floors = page.getByRole("combobox", { name: "Andar", exact: true });
  if ((await floors.locator("option").allTextContents()).join(",") !== "Andar 1,Andar 2,Andar 3") throw Error("Seleção de andares incorreta");
  async function checkPlan(floor) {
    const img=page.getByRole("img",{name:`Planta baixa do IFSul — Andar ${floor}`,exact:true});
    await img.waitFor();
    await page.waitForFunction(() => { const i=document.querySelector('.floor-plan-image'); return i?.complete && i.naturalWidth>0; });
    if (!(await img.getAttribute("src")).includes(`andar-${floor}-`)) throw Error("Planta de outro andar");
    const stage = await page.locator('.floor-image-stage').boundingBox();
    const displayed = await img.boundingBox();
    if (stage.width <= stage.height || Math.abs(displayed.width-stage.width)>1 || Math.abs(displayed.height-stage.height)>1) throw Error("Planta horizontal desalinhada com os marcadores");
  }
  await checkPlan(1);
  if (await page.locator(".room-marker").count() !== 5) throw Error("Marcadores ausentes");
  if (await page.locator(".room-marker .door-marker-icon").count() !== 5) throw Error("Ícones de porta ausentes nos marcadores");
  for (const [id, color] of [[1, "available"], [2, "occupied"], [4, "cleaning"], [5, "it"], [3, "maintenance"]]) {
    if (!(await page.locator(`[data-room-id="${id}"]`).getAttribute("class")).includes(`occupancy-${color}`)) throw Error("Cor incorreta");
  }
  await page.locator('[data-room-id="2"]').hover();
  await page.locator(".room-map-preview").getByText("Professor Teste", { exact: true }).waitFor();
  await page.locator(".room-map-preview").getByText("012345", { exact: true }).waitFor();
  if (!(await page.locator(".room-map-preview").textContent()).includes("10:00:00")) throw Error("Horário da sala incorreto");
  await page.locator('[data-room-id="5"]').focus();
  await page.locator(".room-map-preview").getByText("NDA (pessoa externa)", { exact: true }).waitFor();
  await page.locator(".room-map-preview").getByText("Horário exato desconhecido", { exact: true }).waitFor();
  await page.locator('[data-room-id="2"]').click();
  await page.getByRole("dialog").getByText("012345", { exact: true }).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Fechar", exact: true }).click();
  await page.locator('[data-room-id="1"]').click();
  const availableDialog = page.getByRole("dialog");
  const lastUser = availableDialog.getByText("Último usuário: Última Pessoa", { exact: true });
  await lastUser.waitFor();
  if (!(await lastUser.getAttribute("class")).includes("last-room-user")) throw Error("Último usuário sem destaque laranja");
  const roomFloor = availableDialog.getByRole("heading", { name: "Térreo", exact: true });
  await roomFloor.waitFor();
  await availableDialog.locator(".room-environment-name").getByText("Sala 101", { exact: true }).waitFor();
  if (await availableDialog.getByRole("heading", { name: "Comandos recentes", exact: true }).count()) throw Error("Comandos recentes ainda aparecem no detalhe da sala");
  const maintenanceButton = availableDialog.getByRole("button", { name: "Trancar para manutenção", exact: true });
  if (await maintenanceButton.evaluate((button) => getComputedStyle(button).backgroundColor) !== "rgb(220, 38, 38)") throw Error("Ação de manutenção sem cor vermelha");
  await maintenanceButton.click();
  const endMaintenanceButton = availableDialog.getByRole("button", { name: "Encerrar manutenção", exact: true });
  await endMaintenanceButton.waitFor();
  if (await endMaintenanceButton.evaluate((button) => getComputedStyle(button).backgroundColor) !== "rgb(21, 128, 61)") throw Error("Ação para encerrar manutenção sem cor verde");
  await availableDialog.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("button",{name:"Aumentar zoom",exact:true}).click();
  if((await page.getByLabel("Nível de zoom",{exact:true}).textContent())!=="150%") throw Error("Zoom inválido");
  await page.getByRole("button",{name:"Ajustar",exact:true}).click();
  await page.getByRole("button", { name: "Posicionar salas", exact: true }).click();
  await page.getByLabel("Sala para posicionar", { exact: true }).selectOption("1");
  const surface = page.locator(".map-placement-surface");
  const box = await surface.boundingBox();
  await surface.click({ position: { x: box.width * .5, y: box.height * .5 } });
  await page.locator(".notice").filter({ hasText: "Posição na planta salva." }).waitFor();
  if (Math.abs(sample.salas[0].mapa_x - 50) > .2 || Math.abs(sample.salas[0].mapa_y - 50) > .2) throw Error("Posição relativa incorreta");
  await page.getByRole("button", { name: "Concluir posicionamento", exact: true }).click();
  await floors.selectOption("Andar 2");
  await checkPlan(2);
  await page.getByText("Nenhuma sala cadastrada neste andar.", { exact: true }).waitFor();
  if (await page.locator(".room-card").count()) throw Error("Salas de outro andar visíveis");
  await floors.selectOption("Andar 3");
  await checkPlan(3);
  await page.getByLabel("Planta baixa — Andar 3", { exact: true }).waitFor();
  await floors.selectOption("Andar 1");
  if (await page.locator(".room-card").count() !== 5) throw Error("Salas do térreo não preservadas");
  await page.screenshot({ path: join(screenshotDirectory, "clack-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Modo escuro" }).click();
  if ((await page.locator("html").getAttribute("data-theme")) !== "dark")
    throw Error("Theme failed");
  await page.getByRole("button", { name: "Cartões", exact: true }).click();
  await page.getByRole("heading", { name: "Cartões ativos", exact: true }).waitFor();
  await page.getByRole("button", { name: "Novo cartão" }).click();
  await page.getByLabel("Perfil", { exact: true }).selectOption("ti");
  if (await page.locator(".room-options input:not(:checked)").count() || await page.locator(".room-options input:not(:disabled)").count()) throw Error("TI não tem acesso global no formulário");
  await page.getByText("Acesso global da TI aplicado pelo servidor.", { exact: true }).waitFor();
  await page.getByLabel("Pessoa externa (NDA)").check();
  if (await page.getByLabel("Matrícula", { exact: true }).count())
    throw Error("NDA failed");
  await page.getByRole("dialog").getByRole("button", { name: "Fechar", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ambientes", exact: true }).click();
  await page.locator('[data-room-id="4"]').click();
  await page.getByRole("dialog").getByText("L001", { exact: true }).waitFor();
  await page.getByRole("dialog").getByRole("button", { name: "Fechar", exact: true }).click();
  await page.screenshot({ path: join(screenshotDirectory, "clack-mobile.png"), fullPage: true });
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Mobile overflow");
  await page.getByRole("button", { name: "Configurações", exact: true }).click();
  await page.getByRole("button", { name: "Cadastrar sala", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome", { exact: true }).fill("Sala nova");
  await dialog.locator('select[name="andar"]').selectOption("Andar 2");
  const draftSurface = dialog.getByRole("button", { name: "Definir posição da sala na planta", exact: true });
  let draftBox = await draftSurface.boundingBox();
  await draftSurface.click({ position: { x: draftBox.width * .25, y: draftBox.height * .6 } });
  if (Math.abs(Number(await dialog.getByLabel("X na planta (%)", { exact: true }).inputValue()) - 25) > .5) throw Error("Clique não preenche posição do cadastro");
  await dialog.locator('select[name="andar"]').selectOption("Andar 3");
  if (await dialog.getByLabel("X na planta (%)", { exact: true }).inputValue() !== "" || await dialog.locator('.map-placement-surface').count() !== 1) throw Error("Troca de andar mantém posição ou duplica planta");
  await dialog.getByRole("button", { name: "Aumentar zoom do cadastro", exact: true }).click();
  draftBox = await draftSurface.boundingBox();
  await draftSurface.click({ position: { x: draftBox.width * .6, y: draftBox.height * .4 } });
  await page.screenshot({ path: join(screenshotDirectory, "clack-cadastro-sala.png"), fullPage: true });
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  if (savedRoom?.andar !== "Andar 3" || Math.abs(savedRoom.mapa_x - 60) > .5 || Math.abs(savedRoom.mapa_y - 40) > .5) throw Error("Cadastro não envia coordenadas com zoom");
  await page.getByRole("button", { name: "Histórico", exact: true }).click();
  await page.getByRole("tab", { name: "Eventos dos dispositivos", exact: true }).waitFor();
  await page.getByRole("tab", { name: "Ações da portaria", exact: true }).click();
  await page.getByRole("tabpanel", { name: "Ações da portaria", exact: true }).waitFor();
  await page.getByText("Operador teste", { exact: true }).waitFor();
  await page.getByRole("tab", { name: "Eventos dos dispositivos", exact: true }).click();
  await page.getByLabel("Filtrar sala", { exact: true }).selectOption("2");
  const filteredHistory = page.waitForResponse((r) => {
    const url = new URL(r.url());
    return url.searchParams.get("acao") === "historico" && url.searchParams.has("inicio");
  });
  await page.getByLabel("Filtrar por dia", { exact: true }).fill("2026-10-14");
  await filteredHistory;
  const dayRequest = historyRequests.at(-1);
  if (dayRequest.get("sala") !== "2" || !dayRequest.get("inicio") || !dayRequest.get("fim") || dayRequest.get("fim") <= dayRequest.get("inicio")) throw Error("Filtro por dia não preserva a sala ou o intervalo");
  const generalHistory = page.waitForResponse((r) => {
    const url = new URL(r.url());
    return url.searchParams.get("acao") === "historico" && url.searchParams.get("sala") === "2" && !url.searchParams.has("inicio");
  });
  await page.getByRole("button", { name: "Todas as atividades", exact: true }).click();
  await generalHistory;
  if (historyRequests.at(-1).get("sala") !== "2" || historyRequests.at(-1).has("inicio") || historyRequests.at(-1).has("fim")) throw Error("Voltar às atividades gerais não preserva apenas o filtro de sala");
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    "UI: login, idioma PT/ES persistente, ícones/cores de portas, andares, mouse/teclado/toque, horário, posicionamento, TI global, tema e largura móvel OK (API simulada).",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
