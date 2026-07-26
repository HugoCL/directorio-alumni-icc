import assert from "node:assert/strict"
import test from "node:test"
import { canManageJob, normalizeJobInput } from "./jobs.ts"

const validInput = {
  title: "  Frontend Developer  ",
  company: "  Empresa Demo  ",
  location: "  Remoto  ",
  description:
    "  Buscamos a alguien para construir productos digitales con React.  ",
  applicationUrl: " https://jobs.example.com/frontend ",
  contactEmail: " TALENTO@EXAMPLE.COM ",
}

test("normaliza una oportunidad válida", () => {
  assert.deepEqual(normalizeJobInput(validInput), {
    title: "Frontend Developer",
    company: "Empresa Demo",
    location: "Remoto",
    description:
      "Buscamos a alguien para construir productos digitales con React.",
    applicationUrl: "https://jobs.example.com/frontend",
    contactEmail: "talento@example.com",
  })
})

test("rechaza postulaciones inseguras o sin vía de contacto", () => {
  assert.throws(
    () =>
      normalizeJobInput({
        ...validInput,
        applicationUrl: "javascript:alert(1)",
        contactEmail: undefined,
      }),
    /http/
  )
  assert.throws(
    () =>
      normalizeJobInput({
        ...validInput,
        applicationUrl: "",
        contactEmail: "",
      }),
    /enlace o correo/
  )
  assert.throws(
    () =>
      normalizeJobInput({
        ...validInput,
        applicationUrl: undefined,
        contactEmail: "recruiter@example.com?bcc=attacker@example.com",
      }),
    /correo/
  )
})

test("solo el autor alumni o un admin pueden cerrar una oportunidad", () => {
  assert.equal(canManageJob("alumni", "user-1", "user-1"), true)
  assert.equal(canManageJob("admin", "admin-1", "user-1"), true)
  assert.equal(canManageJob("alumni", "user-2", "user-1"), false)
  assert.equal(canManageJob("student", "user-1", "user-1"), false)
})
