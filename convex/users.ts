import { createClerkClient } from "@clerk/backend"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import { action, internalMutation, query } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"
import type { Doc } from "./_generated/dataModel"
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
  verifiedEmail?: string,
  verifiedRole?: "admin" | "alumni" | "student"
): Promise<Doc<"users"> | null> {
  const identity = await getIdentity(ctx)
  const clerkRole =
    verifiedRole ??
    roleFromIdentity(identity as unknown as Record<string, unknown>) ??
    (verifiedEmail ? "student" : null)
  const email = verifiedEmail
    ? normalizeEmail(verifiedEmail)
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
  args: {
    verifiedEmail: v.optional(v.string()),
    verifiedRole: v.optional(
      v.union(v.literal("admin"), v.literal("alumni"), v.literal("student"))
    ),
  },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await ensureSessionInternal(
      ctx,
      args.verifiedEmail,
      args.verifiedRole
    )
  },
})

export const ensureSession = action({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("No autenticado")

    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) throw new Error("Falta CLERK_SECRET_KEY en el entorno")
    const clerkUser = await createClerkClient({ secretKey }).users.getUser(
      identity.subject
    )
    const verifiedRole =
      roleFromIdentity({ role: clerkUser.publicMetadata.role }) ?? undefined
    const verifiedEmail = verifiedRole
      ? (clerkUser.primaryEmailAddress?.emailAddress ?? undefined)
      : (getVerifiedStudentEmail(clerkUser.emailAddresses) ?? undefined)

    return await ctx.runMutation(internal.users.ensureSessionFromClerk, {
      verifiedEmail,
      verifiedRole,
    })
  },
})
