import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import {
  clerkLookupErrorMessage,
  identityUsesConfiguredClerkInstance,
} from "./clerk.ts"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("identityUsesConfiguredClerkInstance", () => {
  it("acepta el issuer de la instancia configurada para este deployment", () => {
    process.env.CLERK_JWT_ISSUER_DOMAIN =
      "https://warm-jaybird-44.clerk.accounts.dev"
    process.env.CLERK_PRODUCTION_JWT_ISSUER_DOMAIN =
      "https://clerk.directorioicc.online"

    assert.equal(
      identityUsesConfiguredClerkInstance({
        subject: "user_1",
        issuer: "https://warm-jaybird-44.clerk.accounts.dev",
      }),
      true
    )
  })

  it("detecta una sesión de la otra instancia de Clerk", () => {
    process.env.CLERK_JWT_ISSUER_DOMAIN =
      "https://warm-jaybird-44.clerk.accounts.dev"
    process.env.CLERK_PRODUCTION_JWT_ISSUER_DOMAIN =
      "https://clerk.directorioicc.online"

    assert.equal(
      identityUsesConfiguredClerkInstance({
        subject: "user_1",
        issuer: "https://clerk.directorioicc.online",
        tokenIdentifier: "https://clerk.directorioicc.online|user_1",
      }),
      false
    )
  })

  it("usa tokenIdentifier si no hay issuer", () => {
    process.env.CLERK_JWT_ISSUER_DOMAIN =
      "https://warm-jaybird-44.clerk.accounts.dev"

    assert.equal(
      identityUsesConfiguredClerkInstance({
        subject: "user_1",
        tokenIdentifier: "https://warm-jaybird-44.clerk.accounts.dev|user_1",
      }),
      true
    )
  })

  it("devuelve null si no se puede comparar", () => {
    delete process.env.CLERK_JWT_ISSUER_DOMAIN

    assert.equal(
      identityUsesConfiguredClerkInstance({
        subject: "user_1",
      }),
      null
    )
  })
})

describe("clerkLookupErrorMessage", () => {
  it("no pide reingresar cuando el JWT es de otra instancia", () => {
    process.env.CLERK_JWT_ISSUER_DOMAIN =
      "https://warm-jaybird-44.clerk.accounts.dev"

    const message = clerkLookupErrorMessage(404, {
      subject: "user_1",
      issuer: "https://clerk.directorioicc.online",
    })
    assert.match(message, /otro entorno/)
    assert.doesNotMatch(message, /vuelve a entrar/)
  })

  it("pide reingresar solo si el 404 es de la instancia configurada", () => {
    process.env.CLERK_JWT_ISSUER_DOMAIN =
      "https://warm-jaybird-44.clerk.accounts.dev"

    assert.match(
      clerkLookupErrorMessage(404, {
        subject: "user_1",
        issuer: "https://warm-jaybird-44.clerk.accounts.dev",
      }),
      /vuelve a entrar/
    )
  })
})
