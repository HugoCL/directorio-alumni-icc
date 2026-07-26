export const PROFILE_PHOTO_HOSTNAME =
  "dgigyo0xd9owhrls.public.blob.vercel-storage.com"

export function isOwnedProfilePhotoUrl(
  value: string,
  clerkUserId: string
): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      url.hostname === PROFILE_PHOTO_HOSTNAME &&
      url.pathname.startsWith(`/profile-photos/${clerkUserId}/`)
    )
  } catch {
    return false
  }
}

export function canFeatureProfile(
  published: boolean,
  photoUrl: string | undefined,
  requested: boolean | undefined
): boolean {
  return published && Boolean(photoUrl) && requested === true
}
