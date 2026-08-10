import { createClerkClient } from "@clerk/backend"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { action, internalMutation, mutation, query } from "./_generated/server"
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
import {
  getVerifiedStudentEmail,
  roleAfterSessionSync,
} from "./lib/verification"

async function ensureSessionInternal(
  ctx: MutationCtx,
  verifiedStudentEmail?: string
): Promise<Doc<"users"> | null> {
  const identity = await getIdentity(ctx)
  const clerkRole =
    roleFromIdentity(identity as unknown as Record<string, unknown>) ??
    (verifiedStudentEmail ? "student" : null)
  const email = verifiedStudentEmail
    ? normalizeEmail(verifiedStudentEmail)
    : identity.email
      ? normalizeEmail(identity.email)
      : null

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
export const ensureSessionFromClerk = internalMutation({
  args: { verifiedStudentEmail: v.optional(v.string()) },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await ensureSessionInternal(ctx, args.verifiedStudentEmail)
  },
})

export const ensureSession = action({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("No autenticado")

    let verifiedStudentEmail: string | undefined
    if (!roleFromIdentity(identity as unknown as Record<string, unknown>)) {
      const secretKey = process.env.CLERK_SECRET_KEY
      if (!secretKey) throw new Error("Falta CLERK_SECRET_KEY en el entorno")
      const clerkUser = await createClerkClient({ secretKey }).users.getUser(
        identity.subject
      )
      verifiedStudentEmail =
        getVerifiedStudentEmail(clerkUser.emailAddresses) ?? undefined
    }

    return await ctx.runMutation(internal.users.ensureSessionFromClerk, {
      verifiedStudentEmail,
    })
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
