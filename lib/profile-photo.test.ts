import assert from "node:assert/strict"
import test from "node:test"
import {
  canFeatureProfile,
  isOwnedProfilePhotoUrl,
  PROFILE_PHOTO_HOSTNAME,
} from "./profile-photo.ts"

const userId = "user_123"
const validUrl = `https://${PROFILE_PHOTO_HOSTNAME}/profile-photos/${userId}/avatar-abc.webp`

test("acepta únicamente fotos del store y usuario esperados", () => {
  assert.equal(isOwnedProfilePhotoUrl(validUrl, userId), true)
  assert.equal(
    isOwnedProfilePhotoUrl(
      `https://${PROFILE_PHOTO_HOSTNAME}/profile-photos/user_456/avatar.webp`,
      userId
    ),
    false
  )
  assert.equal(
    isOwnedProfilePhotoUrl(
      `https://otro.public.blob.vercel-storage.com/profile-photos/${userId}/avatar.webp`,
      userId
    ),
    false
  )
})

test("solo destaca perfiles publicados con foto y consentimiento", () => {
  assert.equal(canFeatureProfile(true, validUrl, true), true)
  assert.equal(canFeatureProfile(false, validUrl, true), false)
  assert.equal(canFeatureProfile(true, undefined, true), false)
  assert.equal(canFeatureProfile(true, validUrl, false), false)
})
