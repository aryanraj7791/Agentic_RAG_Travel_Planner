import destinationImages from "../data/destinationImages";

function normalizePlaceName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function resolvePlaceImage(title) {
  if (typeof title !== "string" || !title.trim()) return null;

  const normalizedTitle = normalizePlaceName(title);
  return destinationImages.find((place) => (
    place.names.some((name) => normalizePlaceName(name) === normalizedTitle)
  )) || null;
}
