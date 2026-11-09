const { chromium } = require("../frontend/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CLACK_BROWSER ? { executablePath: process.env.CLACK_BROWSER } : {}) });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const historyRequests = [];
  await page.route("**/api.php?*", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const action = params.get("acao");
    let data = {};
    if (action === "sessao") data = { operador: { id: 1, nome: "Teste", papel: "admin" }, csrf: "test" };
    if (action === "painel") data = { salas: [{ id: 2, nome: "Sala 2", andar: "Andar 1", estado: "disponivel" }], cartoes: [], permissoes: [], dispositivos: [] };
    if (action === "historico") {
      historyRequests.push(new URLSearchParams(params));
      const older = params.has("antes");
      const eventos = Array.from({ length: older ? 1 : 100 }, (_, i) => ({
        id: older ? 100 : 300 - i, sala: "Sala 2", nome: older ? "Evento antigo" : "Evento recente",
        resultado: "atividade_iniciada", ocorrido_em: "2026-10-14 12:00:00", recebido_em: "2026-10-14 12:00:01",
      }));
      data = { eventos, auditoria: [] };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });
  });
  await page.goto("http://127.0.0.1:8090/painel/");
  await page.getByRole("button", { name: "Histórico", exact: true }).click();
  const room = page.getByLabel("Filtrar sala", { exact: true });
  const day = page.getByLabel("Filtrar por dia", { exact: true });
  await room.selectOption("2");
  await day.fill("2026-10-14");
  await page.waitForFunction(() => document.querySelectorAll('#history-events-panel tbody tr').length === 100);
  const roomBox = await room.boundingBox();
  const dayBox = await day.boundingBox();
  if (Math.abs(roomBox.y - dayBox.y) > 1) throw Error("Filtros não estão alinhados");
  if (process.env.CLACK_HISTORY_SCREENSHOT) await page.screenshot({ path: process.env.CLACK_HISTORY_SCREENSHOT });
  const initial = historyRequests.length;
  await page.waitForTimeout(3300);
  if (historyRequests.length <= initial) throw Error("Histórico não atualizou automaticamente");
  const filtered = historyRequests.at(-1);
  if (filtered.get("sala") !== "2" || !filtered.has("inicio") || !filtered.has("fim")) throw Error("Atualização perdeu os filtros");
  await page.getByRole("button", { name: "Eventos anteriores", exact: true }).click();
  await page.getByText("Evento antigo", { exact: true }).waitFor();
  const olderCount = historyRequests.length;
  await page.waitForTimeout(3300);
  if (historyRequests.length <= olderCount || historyRequests.at(-1).get("antes") !== "201") throw Error("Atualização perdeu a página anterior");
  await page.getByText("Evento antigo", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Eventos mais recentes", exact: true }).click();
  await page.getByText("Evento recente", { exact: true }).first().waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileRoom = await room.boundingBox();
  const mobileDay = await day.boundingBox();
  if (mobileRoom.x < 0 || mobileDay.x < 0 || mobileRoom.x + mobileRoom.width > 390 || mobileDay.x + mobileDay.width > 390) throw Error("Filtros ultrapassam a tela móvel");
  await page.getByRole("button", { name: "Ambientes", exact: true }).click();
  const afterLeave = historyRequests.length;
  await page.waitForTimeout(3300);
  if (historyRequests.length !== afterLeave) throw Error("Histórico continuou consultando fora da seção");
  await browser.close();
  console.log("Histórico: alinhamento, atualização, filtros e paginação verificados com API simulada.");
})().catch((error) => { console.error(error); process.exit(1); });
