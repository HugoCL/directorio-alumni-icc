import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import type { Doc, Id } from "./_generated/dataModel"
import {
  getCurrentUserOrNull,
  getIdentity,
  healUserIdentity,
  normalizeEmail,
  roleFromIdentity,
} from "./lib/auth"
import { userValidator } from "./lib/validators"
import { roleAfterSessionSync } from "./lib/verification"

async function ensureSessionInternal(
  ctx: MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await getIdentity(ctx)
  const clerkRole = roleFromIdentity(
    identity as unknown as Record<string, unknown>
  )
  const email = identity.email ? normalizeEmail(identity.email) : null

  let user = await getCurrentUserOrNull(ctx)

  if (user) {
    user = await healUserIdentity(ctx, user)
    const nextRole = roleAfterSessionSync(user.role, clerkRole)
    if (user.role !== nextRole) {
      await ctx.db.patch(user._id, {
        role: nextRole,
        updatedAt: Date.now(),
      })
      user = (await ctx.db.get(user._id))!
    }
    return user
  }

  if (!clerkRole) {
    return null
  }

  if (!email) {
    throw new Error("Tu cuenta de Clerk no tiene un correo asociado")
  }

  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    clerkUserId: identity.subject,
    email,
    name: identity.name ?? email.split("@")[0]!,
    role: clerkRole,
    profileComplete: clerkRole !== "alumni",
    updatedAt: Date.now(),
  })

  return await ctx.db.get(userId)
}

export const me = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx)
  },
})

/** Repair Clerk ↔ Convex linking and sync roles from Clerk public metadata. */
export const ensureSession = mutation({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    return await ensureSessionInternal(ctx)
  },
})

export const syncAdminRole = mutation({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx): Promise<Id<"users"> | null> => {
    const user = await ensureSessionInternal(ctx)
    return user?._id ?? null
  },
})
