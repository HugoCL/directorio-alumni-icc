import assert from "node:assert/strict"
import test from "node:test"
import { readBearerToken } from "./bearer-token.ts"

test("acepta únicamente un bearer token no vacío", () => {
  assert.equal(readBearerToken("Bearer token"), "token")
  assert.equal(readBearerToken("Bearer "), null)
  assert.equal(readBearerToken("bearer token"), null)
  assert.equal(readBearerToken(null), null)
})
