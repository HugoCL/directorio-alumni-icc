import { createClerkClient, type User } from "@clerk/backend"

type ClerkIdentity = {
  subject: string
  issuer?: string
  tokenIdentifier?: string
}

function issuerHost(value: string | undefined): string | null {
  if (!value) return null
  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`
    return new URL(normalized).host.toLowerCase()
  } catch {
    return (
      value
        .replace(/^https?:\/\//i, "")
        .split("/")[0]
        ?.toLowerCase() ?? null
    )
  }
}

function hostsMatch(left: string, right: string): boolean {
  return left === right || left.endsWith(`.${right}`) || right.endsWith(`.${left}`)
}

/** Whether this JWT belongs to the Clerk instance behind CLERK_SECRET_KEY. */
export function identityUsesConfiguredClerkInstance(
  identity: ClerkIdentity
): boolean | null {
  const identityHost =
    issuerHost(identity.issuer) ??
    issuerHost(identity.tokenIdentifier?.split("|")[0])
  const secretInstanceHost = issuerHost(process.env.CLERK_JWT_ISSUER_DOMAIN)
  if (!identityHost || !secretInstanceHost) return null
  return hostsMatch(identityHost, secretInstanceHost)
}

function clerkErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined
  if (!("status" in error)) return undefined
  const status = (error as { status: unknown }).status
  return typeof status === "number" ? status : undefined
}

export function clerkLookupErrorMessage(
  status: number | undefined,
  identity: ClerkIdentity
): string {
  const matchesSecretInstance = identityUsesConfiguredClerkInstance(identity)
  if (matchesSecretInstance === false) {
    return "Esta sesión pertenece a otro entorno de Clerk. Entra con la cuenta de este entorno."
  }
  if (status === 404) {
    return "No encontramos tu usuario en Clerk para esta sesión. Cierra sesión y vuelve a entrar."
  }
  if (status === 401 || status === 403) {
    return "La clave de Clerk en Convex no coincide con tu sesión. Revisa CLERK_SECRET_KEY."
  }
  return "No pudimos consultar tu cuenta en Clerk. Intenta de nuevo en un momento."
}

/** Load the Clerk user for the authenticated identity with clear Spanish errors. */
export async function getClerkUserForIdentity(
  identity: ClerkIdentity
): Promise<User> {
  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    throw new Error("Falta CLERK_SECRET_KEY en el entorno de Convex")
  }

  try {
    return await createClerkClient({ secretKey }).users.getUser(identity.subject)
  } catch (error) {
    const status = clerkErrorStatus(error)
    console.error("Clerk getUser failed", {
      subject: identity.subject,
      issuer: identity.issuer,
      status,
      message: error instanceof Error ? error.message : String(error),
    })
    throw new Error(clerkLookupErrorMessage(status, identity))
  }
}
