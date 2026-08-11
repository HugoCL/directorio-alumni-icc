export type UserCandidate = {
  _id: string
  _creationTime: number
  profileComplete: boolean
}

export function chooseCanonicalUser<T extends UserCandidate>(
  users: T[],
  profileUserIds: Set<string>
): T {
  if (users.length === 0) throw new Error("No hay usuarios para consolidar")
  if (profileUserIds.size > 1) {
    throw new Error("Hay perfiles asociados a más de un usuario duplicado")
  }

  return users.toSorted(
    (a, b) =>
      Number(profileUserIds.has(b._id)) - Number(profileUserIds.has(a._id)) ||
      Number(b.profileComplete) - Number(a.profileComplete) ||
      a._creationTime - b._creationTime
  )[0]!
}
