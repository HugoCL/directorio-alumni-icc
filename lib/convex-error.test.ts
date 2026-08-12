import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { convexErrorMessage } from "./convex-error.ts"

describe("convexErrorMessage", () => {
  it("returns the fallback for opaque Convex server errors", () => {
    assert.equal(
      convexErrorMessage(
        new Error(
          "[CONVEX A(verifications:submit)] [Request ID: abc] Server Error\nCalled by client"
        ),
        "fallback"
      ),
      "fallback"
    )
  })

  it("keeps the app message from a Convex error", () => {
    assert.equal(
      convexErrorMessage(
        new Error(
          "[CONVEX A(verifications:submit)] [Request ID: abc] URL de LinkedIn inválida\nCalled by client"
        ),
        "fallback"
      ),
      "URL de LinkedIn inválida"
    )
  })
})
