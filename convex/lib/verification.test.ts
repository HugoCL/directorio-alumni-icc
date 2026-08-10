import assert from "node:assert/strict"
import test from "node:test"
import {
  isStudentEmail,
  isValidGeneration,
  isVerifiedStudentEmail,
  roleAfterSessionSync,
  roleFromIdentity,
} from "./verification.ts"

test("reconoce correos estudiantiles aunque todavía no estén verificados", () => {
  assert.equal(isStudentEmail(" ANA@ALUMNOS.UTALCA.CL "), true)
  assert.equal(isStudentEmail("ana@otroalumnos.utalca.cl"), false)
})

test("clasifica únicamente correos estudiantiles verificados", () => {
  assert.equal(isVerifiedStudentEmail("ana@alumnos.utalca.cl", true), true)
  assert.equal(isVerifiedStudentEmail("ANA@ALUMNOS.UTALCA.CL", true), true)
  assert.equal(isVerifiedStudentEmail("ana@otroalumnos.utalca.cl", true), false)
  assert.equal(isVerifiedStudentEmail("ana@alumnos.utalca.cl", false), false)
  assert.equal(isValidGeneration("2013"), true)
  assert.equal(isValidGeneration("2026"), true)
  assert.equal(isValidGeneration("2012"), false)
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
