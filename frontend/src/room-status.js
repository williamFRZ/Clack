export const ROOM_STATUSES = [
  { key: "available", label: "Disponível" },
  { key: "occupied", label: "Em uso" },
  { key: "it", label: "Em uso pela TI" },
  { key: "cleaning", label: "Em uso pela limpeza" },
];

export function roomStatus(room) {
  if (room.estado === "disponivel") return ROOM_STATUSES[0];
  if (room.estado === "manutencao") return { key: "maintenance", label: "Manutenção" };
  if (room.estado !== "em_uso") return { key: "unknown", label: "Verificar estado" };
  if (room.responsavel_perfil === "limpeza") return ROOM_STATUSES[3];
  if (room.responsavel_perfil === "ti") return ROOM_STATUSES[2];
  return ROOM_STATUSES[1];
}

export function usageDate(value) {
  if (!value) return "Horário não informado";
  const parsed = new Date(value.replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) return "Horário não informado";
  return parsed.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function roomUsage(room) {
  if (room.estado !== "em_uso") return null;
  return {
    name: room.responsavel_nome || (room.responsavel == null ? "Abertura pela portaria / sem responsável" : "Responsável não informado"),
    enrollment: Number(room.responsavel_externo) ? "NDA (pessoa externa)" : room.responsavel_matricula || "Não informada",
    since: room.uso_desde ? usageDate(room.uso_desde) : "Horário exato desconhecido",
    received: !room.uso_desde && room.uso_recebido_em ? usageDate(room.uso_recebido_em) : null,
  };
}

// Centros aproximados de ambientes visíveis. São sugestões de placeholder,
// NÃO uma associação validada entre os números das salas e a planta física.
const SUGGESTED_CENTERS = {
  "Andar 1": [[43, 84], [55, 84], [28, 84], [69, 78], [87, 51], [19, 42], [38, 40], [46, 19], [78, 15], [59, 57], [27, 59], [16, 20], [75, 89], [21, 78], [55, 28], [67, 24]],
  "Andar 2": [[41, 82], [51, 82], [22, 82], [10, 82], [10, 53], [10, 30], [27, 14], [40, 14], [50, 19], [60, 20], [42, 30], [53, 30], [78, 41], [82, 26], [19, 52], [72, 15], [75, 67]],
  "Andar 3": [[40, 78], [25, 78], [29, 52], [49, 48], [52, 16], [45, 24], [64, 17], [60, 26], [32, 15], [16, 20], [14, 41], [15, 52], [79, 38], [86, 26], [76, 66], [58, 37], [70, 17]],
};

export function hasMapPosition(room) {
  return room.mapa_x != null && room.mapa_y != null &&
    Number.isFinite(Number(room.mapa_x)) && Number.isFinite(Number(room.mapa_y)) &&
    Number(room.mapa_x) >= 0 && Number(room.mapa_x) <= 100 &&
    Number(room.mapa_y) >= 0 && Number(room.mapa_y) <= 100;
}

export function markerPosition(room, index, floor) {
  if (hasMapPosition(room)) return { x: Number(room.mapa_x), y: Number(room.mapa_y), provisional: false };
  const center = SUGGESTED_CENTERS[floor]?.[index];
  // Excedentes ficam na margem, em vez de inventar novos ambientes na planta.
  const [x, y] = center || [5 + (index % 19) * 5, 97];
  return { x, y, provisional: true };
}

export function relativePosition(clientX, clientY, rect) {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const clamp = value => Math.round(Math.max(0, Math.min(100, value)) * 1000) / 1000;
  return { mapa_x: clamp((clientX - rect.left) / rect.width * 100), mapa_y: clamp((clientY - rect.top) / rect.height * 100) };
}
