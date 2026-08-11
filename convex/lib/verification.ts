const STUDENT_DOMAIN = "@alumnos.utalca.cl"
const FIRST_GENERATION_YEAR = 1998
const LATEST_KNOWN_GENERATION_YEAR = 2026
const lastGenerationYear = Math.max(
  LATEST_KNOWN_GENERATION_YEAR,
  new Date().getFullYear()
)
const GENERATIONS = new Set(
  Array.from(
    { length: lastGenerationYear - FIRST_GENERATION_YEAR + 1 },
    (_, index) => String(FIRST_GENERATION_YEAR + index)
  )
)

export function isStudentEmail(email: string | undefined): boolean {
  return email?.trim().toLowerCase().endsWith(STUDENT_DOMAIN) === true
}

export function isVerifiedStudentEmail(
  email: string | undefined,
  emailVerified: boolean | undefined
): boolean {
  return emailVerified === true && isStudentEmail(email)
}

export function getVerifiedStudentEmail(
  emails: Array<{
    emailAddress: string
    verification?: { status: string | null } | null
  }>
): string | null {
  return getVerifiedEmails(emails).find(isStudentEmail) ?? null
}

export function getVerifiedEmails(
  emails: Array<{
    emailAddress: string
    verification?: { status: string | null } | null
  }>
): string[] {
  return emails.flatMap((email) =>
    email.verification?.status === "verified"
      ? [email.emailAddress.trim().toLowerCase()]
      : []
  )
}

export function resolveVerifiedContactEmail(
  currentEmail: string | undefined,
  primaryEmail: string | undefined,
  verifiedEmails: string[]
): string | null {
  const current = currentEmail?.trim().toLowerCase()
  const primary = primaryEmail?.trim().toLowerCase()
  return (
    (current && verifiedEmails.includes(current) ? current : primary) ??
    verifiedEmails[0] ??
    null
  )
}

export function roleFromIdentity(identity: {
  role?: unknown
  email?: string
  emailVerified?: boolean
}): "admin" | "alumni" | "student" | null {
  if (
    identity.role === "admin" ||
    identity.role === "alumni" ||
    identity.role === "student"
  ) {
    return identity.role
  }
  return isVerifiedStudentEmail(identity.email, identity.emailVerified)
    ? "student"
    : null
}

export function roleAfterSessionSync(
  currentRole: "admin" | "alumni" | "student",
  clerkRole: "admin" | "alumni" | "student" | null
) {
  return currentRole === "alumni" && clerkRole === "student"
    ? "alumni"
    : (clerkRole ?? currentRole)
}

export function isValidGeneration(generation: string): boolean {
  return GENERATIONS.has(generation)
}
