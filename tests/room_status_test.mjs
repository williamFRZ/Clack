import assert from "node:assert/strict";
import { roomStatus, roomUsage, usageDate, hasMapPosition, markerPosition, relativePosition } from "../frontend/src/room-status.js";

assert.equal(roomStatus({ estado: "disponivel", responsavel_perfil: "limpeza" }).key, "available");
for (const [profile, key] of [["limpeza", "cleaning"], ["ti", "it"], ["professor", "occupied"], ["aluno", "occupied"], ["completo", "occupied"], [null, "occupied"]]) {
  assert.equal(roomStatus({ estado: "em_uso", responsavel_perfil: profile }).key, key);
}
assert.equal(roomStatus({ estado: "manutencao", responsavel_perfil: "ti" }).key, "maintenance");
assert.equal(roomStatus({ estado: "erro" }).key, "unknown");
assert.equal(roomUsage({ estado: "disponivel" }), null);
const occupied = { estado: "em_uso", responsavel: 1, responsavel_nome: "Professor", responsavel_matricula: "01234", uso_desde: "2026-10-02 13:00:00" };
assert.equal(roomUsage(occupied).enrollment, "01234");
assert.match(roomUsage(occupied).since, /10:00:00/);
assert.equal(roomUsage({ ...occupied, responsavel_externo: 1 }).enrollment, "NDA (pessoa externa)");
assert.equal(roomUsage({ ...occupied, uso_desde: null, uso_recebido_em: "2026-10-02 14:00:00" }).since, "Horário exato desconhecido");
assert.match(roomUsage({ ...occupied, uso_desde: null, uso_recebido_em: "2026-10-02 14:00:00" }).received, /11:00:00/);
assert.match(roomUsage({ estado: "em_uso" }).name, /portaria/);
assert.equal(usageDate("invalid"), "Horário não informado");
assert.equal(hasMapPosition({ mapa_x: null, mapa_y: null }), false);
assert.equal(hasMapPosition({ mapa_x: 101, mapa_y: 30 }), false);
assert.deepEqual(markerPosition({ mapa_x: "45.125", mapa_y: "80.000" }, 0, "Andar 1"), { x: 45.125, y: 80, provisional: false });
assert.equal(markerPosition({}, 0, "Andar 1").provisional, true);
assert.notDeepEqual(markerPosition({}, 0, "Andar 1"), markerPosition({}, 0, "Andar 2"));
for (const floor of ["Andar 1", "Andar 2", "Andar 3"]) {
  for (let i = 0; i < 200; i++) {
    const p = markerPosition({}, i, floor);
    assert.ok(p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100);
  }
}
// Coordenadas relativas são iguais com zoom, viewport deslocado e no celular.
assert.deepEqual(relativePosition(300, 150, { left: 100, top: 50, width: 400, height: 200 }), { mapa_x: 50, mapa_y: 50 });
assert.deepEqual(relativePosition(500, 250, { left: 100, top: 50, width: 800, height: 400 }), { mapa_x: 50, mapa_y: 50 });
assert.deepEqual(relativePosition(-10, 999, { left: 0, top: 0, width: 400, height: 200 }), { mapa_x: 0, mapa_y: 100 });
assert.equal(relativePosition(0, 0, { left: 0, top: 0, width: 0, height: 200 }), null);
console.log("Marcadores: cores, matrícula/NDA, horário UTC→Brasil, placeholders e coordenadas com zoom OK.");
