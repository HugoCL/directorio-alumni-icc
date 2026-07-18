export const AREAS = [
  "Software",
  "Datos e IA",
  "Producto",
  "Investigación",
  "Emprendimiento",
  "Academia",
] as const;

export type Area = (typeof AREAS)[number];

export const GENERATIONS = Array.from({ length: 14 }, (_, i) =>
  String(2013 + i),
) as readonly string[];

export function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value);
}

export function isGeneration(value: string): boolean {
  return GENERATIONS.includes(value);
}
