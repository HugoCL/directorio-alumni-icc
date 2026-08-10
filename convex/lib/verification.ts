const STUDENT_DOMAIN = "@alumnos.utalca.cl"
const GENERATIONS = new Set(
  Array.from({ length: 14 }, (_, index) => String(2013 + index))
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
