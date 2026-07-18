import type { Doc } from "../_generated/dataModel"
import type { MutationCtx, QueryCtx } from "../_generated/server"
import { roleFromIdentity } from "./verification"

type Ctx = QueryCtx | MutationCtx

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function getIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("No autenticado")
  }
  return identity
}

/** Resolve the app user from Clerk identity, including legacy rows with empty token. */
export async function getCurrentUserOrNull(
  ctx: Ctx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()
  if (!user) {
    user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .unique()
  }

  if (!user && identity.email) {
    user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", normalizeEmail(identity.email!))
      )
      .unique()
  }

  if (user?.role === "student" && roleFromIdentity(identity) !== "student") {
    return null
  }

  return user
}

/** Keep tokenIdentifier / clerkUserId in sync after a successful lookup. */
export async function healUserIdentity(
  ctx: MutationCtx,
  user: Doc<"users">
): Promise<Doc<"users">> {
  const identity = await getIdentity(ctx)
  const email = identity.email ? normalizeEmail(identity.email) : user.email
  const patch: Partial<Doc<"users">> = {}

  if (user.tokenIdentifier !== identity.tokenIdentifier) {
    patch.tokenIdentifier = identity.tokenIdentifier
  }
  if (user.clerkUserId !== identity.subject) {
    patch.clerkUserId = identity.subject
  }
  if (email && user.email !== email) {
    patch.email = email
  }
  if (identity.name && user.name !== identity.name) {
    patch.name = identity.name
  }

  if (Object.keys(patch).length === 0) {
    return user
  }

  patch.updatedAt = Date.now()
  await ctx.db.patch(user._id, patch)
  const updated = await ctx.db.get(user._id)
  if (!updated) {
    throw new Error("Usuario no encontrado tras actualizar sesión")
  }
  return updated
}

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUserOrNull(ctx)
  if (!user) {
    throw new Error("Usuario no verificado")
  }
  return user
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUserOrNull(ctx)
  if (!user || user.role !== "admin") {
    throw new Error("Se requiere acceso de administrador")
  }
  return user
}

export async function requireDirectoryAccess(ctx: Ctx): Promise<Doc<"users">> {
  return await getCurrentUser(ctx)
}

export async function requireAlumni(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx)
  if (user.role === "student") {
    throw new Error("Los perfiles están disponibles solo para alumni")
  }
  return user
}

export { normalizeEmail, roleFromIdentity }
