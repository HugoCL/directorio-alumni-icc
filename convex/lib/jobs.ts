export type JobInput = {
  title: string
  company: string
  location: string
  description: string
  applicationUrl?: string
  contactEmail?: string
}

function required(
  value: string,
  label: string,
  minimum: number,
  maximum: number
): string {
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new Error(
      `${label} debe tener entre ${minimum} y ${maximum} caracteres`
    )
  }
  return normalized
}

function applicationUrl(value: string | undefined): string | undefined {
  const normalized = value?.trim()
  if (!normalized) return undefined
  if (normalized.length > 2048) {
    throw new Error("El enlace de postulación es demasiado largo")
  }

  try {
    const url = new URL(normalized)
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname
    ) {
      throw new Error()
    }
    return url.toString()
  } catch {
    throw new Error("El enlace de postulación debe ser una URL http(s) válida")
  }
}

export function normalizeContactEmail(
  value: string | undefined
): string | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return undefined
  if (
    normalized.length > 254 ||
    !/^[a-z0-9.!#$'*+/=_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
      normalized
    )
  ) {
    throw new Error("El correo de contacto no es válido")
  }
  return normalized
}

export function normalizeJobInput(input: JobInput) {
  const normalized = {
    title: required(input.title, "El cargo", 3, 120),
    company: required(input.company, "La organización", 2, 120),
    location: required(input.location, "La ubicación", 2, 120),
    description: required(input.description, "La descripción", 20, 3000),
    applicationUrl: applicationUrl(input.applicationUrl),
    contactEmail: normalizeContactEmail(input.contactEmail),
  }

  if (!normalized.applicationUrl && !normalized.contactEmail) {
    throw new Error("Agrega un enlace o correo de postulación")
  }

  return normalized
}

export function canManageJob(
  role: "student" | "alumni" | "admin",
  actorUserId: string,
  authorUserId: string
): boolean {
  return role === "admin" || (role === "alumni" && actorUserId === authorUserId)
}
