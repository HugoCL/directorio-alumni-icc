import assert from "node:assert/strict"
import test from "node:test"
import {
  getVerifiedEmails,
  getVerifiedStudentEmail,
  isStudentEmail,
  isValidGeneration,
  isVerifiedStudentEmail,
  resolveVerifiedContactEmail,
  roleAfterSessionSync,
  roleFromIdentity,
} from "./verification.ts"

test("devuelve únicamente los correos verificados de Clerk", () => {
  assert.deepEqual(
    getVerifiedEmails([
      {
        emailAddress: " Alumni@Example.com ",
        verification: { status: "verified" },
      },
      {
        emailAddress: "pendiente@example.com",
        verification: { status: "unverified" },
      },
    ]),
    ["alumni@example.com"]
  )
})

test("conserva un correo verificado o usa el primario como reemplazo", () => {
  const verified = ["principal@example.com", "contacto@example.com"]
  assert.equal(
    resolveVerifiedContactEmail(
      "CONTACTO@example.com",
      "principal@example.com",
      verified
    ),
    "contacto@example.com"
  )
  assert.equal(
    resolveVerifiedContactEmail(
      "externo@example.com",
      "principal@example.com",
      verified
    ),
    "principal@example.com"
  )
})

test("obtiene únicamente un correo institucional verificado por Clerk", () => {
  assert.equal(
    getVerifiedStudentEmail([
      {
        emailAddress: "personal@example.com",
        verification: { status: "verified" },
      },
      {
        emailAddress: " ALUMNO@ALUMNOS.UTALCA.CL ",
        verification: { status: "verified" },
      },
    ]),
    "alumno@alumnos.utalca.cl"
  )
  assert.equal(
    getVerifiedStudentEmail([
      {
        emailAddress: "alumno@alumnos.utalca.cl",
        verification: { status: "unverified" },
      },
    ]),
    null
  )
})

test("reconoce correos estudiantiles aunque todavía no estén verificados", () => {
  assert.equal(isStudentEmail(" ANA@ALUMNOS.UTALCA.CL "), true)
  assert.equal(isStudentEmail("ana@otroalumnos.utalca.cl"), false)
})

test("clasifica únicamente correos estudiantiles verificados", () => {
  assert.equal(isVerifiedStudentEmail("ana@alumnos.utalca.cl", true), true)
  assert.equal(isVerifiedStudentEmail("ANA@ALUMNOS.UTALCA.CL", true), true)
  assert.equal(isVerifiedStudentEmail("ana@otroalumnos.utalca.cl", true), false)
  assert.equal(isVerifiedStudentEmail("ana@alumnos.utalca.cl", false), false)
  assert.equal(isValidGeneration("1998"), true)
  assert.equal(isValidGeneration("2013"), true)
  assert.equal(isValidGeneration("2026"), true)
  assert.equal(isValidGeneration(String(new Date().getFullYear())), true)
  assert.equal(isValidGeneration("1997"), false)
})

test("acepta roles administrados por Clerk", () => {
  assert.equal(roleFromIdentity({ role: "alumni" }), "alumni")
  assert.equal(roleFromIdentity({ role: "admin" }), "admin")
  assert.equal(roleFromIdentity({ role: "student" }), "student")
  assert.equal(
    roleFromIdentity({ email: "ana@alumnos.utalca.cl", emailVerified: true }),
    "student"
  )
  assert.equal(roleFromIdentity({ role: "otro" }), null)
})

test("no baja a student un alumni aprobado", () => {
  assert.equal(roleAfterSessionSync("alumni", "student"), "alumni")
  assert.equal(roleAfterSessionSync("student", "alumni"), "alumni")
})
