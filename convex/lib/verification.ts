const STUDENT_DOMAIN = "@alumnos.utalca.cl"
const FIRST_GENERATION_YEAR = 1998
const GENERATIONS = new Set(
  Array.from(
    { length: new Date().getFullYear() - FIRST_GENERATION_YEAR + 1 },
    (_, index) => String(FIRST_GENERATION_YEAR + index),
  ),
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
    verification?: { status: string } | null
  }>
): string | null {
  return (
    emails
      .find(
        (email) =>
          email.verification?.status === "verified" &&
          isStudentEmail(email.emailAddress)
      )
      ?.emailAddress.trim()
      .toLowerCase() ?? null
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
