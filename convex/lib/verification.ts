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

export function isValidGeneration(generation: string): boolean {
  return GENERATIONS.has(generation)
}
