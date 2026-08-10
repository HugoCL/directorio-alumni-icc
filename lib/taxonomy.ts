export const AREAS = [
  "Software",
  "Datos e IA",
  "Producto",
  "Investigación",
  "Emprendimiento",
  "Academia",
] as const;

export type Area = (typeof AREAS)[number];

export const FIRST_GENERATION_YEAR = 1998;

export function buildGenerations(endYear = new Date().getFullYear()) {
  return Array.from(
    { length: endYear - FIRST_GENERATION_YEAR + 1 },
    (_, i) => String(FIRST_GENERATION_YEAR + i),
  );
}

export const GENERATIONS = buildGenerations() as readonly string[];

export function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value);
}

export function isGeneration(value: string): boolean {
  return GENERATIONS.includes(value);
}
