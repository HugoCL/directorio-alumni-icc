import { v } from "convex/values"
import { internal } from "./_generated/api"
import { action, internalMutation, query } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import {
  getCurrentUserOrNull,
  getIdentity,
  normalizeEmail,
  requireAdmin,
} from "./lib/auth"
import { getClerkUserForIdentity } from "./lib/clerk"
import {
  verificationRequestValidator,
  verificationStatusValidator,
} from "./lib/validators"
import { isValidGeneration } from "./lib/verification"

function normalizeLinkedIn(value: string): string {
  try {
    const url = new URL(
      value.trim().startsWith("http") ? value.trim() : `https://${value.trim()}`
    )
    if (
      url.hostname !== "linkedin.com" &&
      !url.hostname.endsWith(".linkedin.com") &&
      url.hostname !== "lnkd.in"
    ) {
      throw new Error()
    }
    return url.toString()
  } catch {
    throw new Error("URL de LinkedIn inválida")
  }
}

export const mine = query({
  args: {},
  returns: v.union(verificationRequestValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    return await ctx.db
      .query("verificationRequests")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first()
  },
})

export const list = query({
  args: {},
  returns: v.array(verificationRequestValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx)
    return await ctx.db.query("verificationRequests").order("desc").take(100)
  },
})

export const submit = action({
  args: {
    name: v.string(),
    generation: v.string(),
    linkedinUrl: v.string(),
  },
  returns: v.id("verificationRequests"),
  handler: async (ctx, args): Promise<Id<"verificationRequests">> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("No autenticado")
    const clerkUser = await getClerkUserForIdentity(identity)
    const primaryEmail = clerkUser.primaryEmailAddress
    const verifiedEmail =
      (primaryEmail?.verification?.status === "verified"
        ? primaryEmail.emailAddress
        : clerkUser.emailAddresses.find(
            (email) => email.verification?.status === "verified"
          )?.emailAddress) ?? null
    if (!verifiedEmail) {
      throw new Error("Verifica tu correo en Clerk antes de continuar")
    }

    return await ctx.runMutation(internal.verifications.submitFromClerk, {
      ...args,
      verifiedEmail,
    })
  },
})

export const submitFromClerk = internalMutation({
  args: {
    name: v.string(),
    generation: v.string(),
    linkedinUrl: v.string(),
    verifiedEmail: v.string(),
  },
  returns: v.id("verificationRequests"),
  handler: async (ctx, args): Promise<Id<"verificationRequests">> => {
    const identity = await getIdentity(ctx)
    const existingUser = await getCurrentUserOrNull(ctx)
    const email = normalizeEmail(args.verifiedEmail)
    if (existingUser?.role === "alumni" || existingUser?.role === "admin") {
      throw new Error("Tu cuenta ya está verificada")
    }

    const name = args.name.trim()
    if (name.length < 2) throw new Error("Ingresa tu nombre completo")
    if (!isValidGeneration(args.generation)) {
      throw new Error("Generación inválida")
    }
    const linkedinUrl = normalizeLinkedIn(args.linkedinUrl)
    const previous = await ctx.db
      .query("verificationRequests")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", identity.subject))
      .first()

    if (previous?.status === "pending") {
      throw new Error("Ya tienes una solicitud pendiente")
    }
    if (previous?.status === "approved") {
      throw new Error("Tu solicitud ya fue aprobada")
    }
    if (previous?.status === "rejected" && !previous.notifiedAt) {
      throw new Error("El resultado aún está pendiente de notificación")
    }

    const payload = {
      clerkUserId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email,
      name,
      generation: args.generation,
      linkedinUrl,
      status: "pending" as const,
      reviewedByUserId: undefined,
      reviewedAt: undefined,
      rejectionReason: undefined,
      notifiedAt: undefined,
      updatedAt: Date.now(),
    }

    if (previous) {
      await ctx.db.patch(previous._id, payload)
      return previous._id
    }
    return await ctx.db.insert("verificationRequests", payload)
  },
})

export const applyReview = internalMutation({
  args: {
    requestId: v.id("verificationRequests"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
    reviewerClerkUserId: v.string(),
    expectedUpdatedAt: v.number(),
  },
  returns: v.object({
    email: v.string(),
    name: v.string(),
    status: verificationStatusValidator,
    rejectionReason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) =>
        q.eq("clerkUserId", args.reviewerClerkUserId)
      )
      .first()
    if (!admin || admin.role !== "admin") {
      throw new Error("Se requiere acceso de administrador")
    }

    const request = await ctx.db.get(args.requestId)
    if (!request) throw new Error("Solicitud no encontrada")
    if (request.updatedAt !== args.expectedUpdatedAt) {
      throw new Error("La solicitud cambió; recarga antes de continuar")
    }
    if (request.notifiedAt) throw new Error("La decisión ya fue notificada")
    if (request.status !== "pending" && request.status !== args.decision) {
      throw new Error("La solicitud ya fue revisada")
    }

    const rejectionReason = args.rejectionReason?.trim()
    if (args.decision === "rejected" && !rejectionReason) {
      throw new Error("Indica el motivo del rechazo")
    }

    if (args.decision === "approved") {
      const existingUsers = await ctx.db
        .query("users")
        .withIndex("by_clerk_user", (q) =>
          q.eq("clerkUserId", request.clerkUserId)
        )
        .collect()
      if (existingUsers.length > 0) {
        for (const existing of existingUsers) {
          await ctx.db.patch(existing._id, {
            tokenIdentifier: request.tokenIdentifier,
            email: request.email,
            name: request.name,
            role: existing.role === "admin" ? "admin" : "alumni",
            profileComplete:
              existing.role === "admin" ? existing.profileComplete : false,
            updatedAt: Date.now(),
          })
        }
      } else {
        await ctx.db.insert("users", {
          tokenIdentifier: request.tokenIdentifier,
          clerkUserId: request.clerkUserId,
          email: request.email,
          name: request.name,
          role: "alumni",
          profileComplete: false,
          updatedAt: Date.now(),
        })
      }
    }

    await ctx.db.patch(request._id, {
      status: args.decision,
      reviewedByUserId: admin._id,
      reviewedAt: Date.now(),
      rejectionReason:
        args.decision === "rejected" ? rejectionReason : undefined,
      updatedAt: Date.now(),
    })

    return {
      email: request.email,
      name: request.name,
      status: args.decision,
      rejectionReason:
        args.decision === "rejected" ? rejectionReason : undefined,
    }
  },
})

export const markNotified = internalMutation({
  args: {
    requestId: v.id("verificationRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId)
    if (!request || request.status !== args.status) {
      throw new Error("La solicitud cambió antes de registrar el correo")
    }
    await ctx.db.patch(args.requestId, {
      notifiedAt: Date.now(),
      updatedAt: Date.now(),
    })
    return null
  },
})

export const review = action({
  args: {
    requestId: v.id("verificationRequests"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
    expectedUpdatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("No autenticado")

    const result = await ctx.runMutation(internal.verifications.applyReview, {
      ...args,
      reviewerClerkUserId: identity.subject,
    })
    const approved = result.status === "approved"
    await ctx.runAction(internal.emails.sendVerificationResult, {
      idempotencyKey: `${args.requestId}-${args.decision}`,
      email: result.email,
      name: result.name,
      approved,
      rejectionReason: result.rejectionReason,
    })

    await ctx.runMutation(internal.verifications.markNotified, {
      requestId: args.requestId,
      status: args.decision,
    })
    return null
  },
})
