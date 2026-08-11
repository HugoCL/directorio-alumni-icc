import assert from "node:assert/strict"
import test from "node:test"
import { chooseCanonicalUser } from "./dedupeUsers.ts"

test("conserva el usuario dueño del perfil", () => {
  const users = [
    { _id: "new", _creationTime: 2, profileComplete: false },
    { _id: "profile-owner", _creationTime: 1, profileComplete: true },
  ]

  assert.equal(
    chooseCanonicalUser(users, new Set(["profile-owner"]))._id,
    "profile-owner"
  )
})
