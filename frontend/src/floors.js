export const FLOORS = ["Andar 1", "Andar 2", "Andar 3"];

// Compatibilidade visual; os registros existentes não são alterados no banco.
export function normalizeFloor(value) {
  const text = String(value ?? "").trim().toLowerCase();
  if (["térreo", "terreo"].includes(text)) return "Andar 1";
  const match = text.match(/^(?:andar\s*)?([123])(?:º|°|o)?(?:\s*andar)?$/);
  return match ? `Andar ${match[1]}` : null;
}

const images = import.meta.glob("./assets/plantas/andar-*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
export function floorImage(floor) {
  const number = FLOORS.indexOf(floor) + 1;
  for (const extension of ["png", "jpg", "jpeg", "webp"]) {
    const url = images[`./assets/plantas/andar-${number}.${extension}`];
    if (url) return url;
  }
  return null;
}
