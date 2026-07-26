export function readBearerToken(value: string | null): string | null {
  return value?.match(/^Bearer (.+)$/)?.[1] ?? null
}
