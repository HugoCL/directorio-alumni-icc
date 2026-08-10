import assert from "node:assert/strict"
import test from "node:test"
import {
  directoryContactEmail,
  MAX_CONTACT_MESSAGE_LENGTH,
  normalizeContactMessage,
} from "./contact.ts"

test("oculta el correo privado y conserva perfiles existentes como visibles", () => {
  assert.equal(
    directoryContactEmail("alumni@example.com", "private"),
    undefined
  )
  assert.equal(
    directoryContactEmail("alumni@example.com", "visible"),
    "alumni@example.com"
  )
  assert.equal(
    directoryContactEmail("alumni@example.com", undefined),
    "alumni@example.com"
  )
})

test("normaliza mensajes privados válidos", () => {
  assert.equal(
    normalizeContactMessage("  ¿Podrías orientarme con mi práctica?  "),
    "¿Podrías orientarme con mi práctica?"
  )
})

test("rechaza mensajes demasiado cortos o largos", () => {
  assert.throws(() => normalizeContactMessage("Hola"), /10 caracteres/)
  assert.throws(
    () => normalizeContactMessage("x".repeat(MAX_CONTACT_MESSAGE_LENGTH + 1)),
    /1200 caracteres/
  )
})
