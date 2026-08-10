import { v } from "convex/values"
import { internal } from "./_generated/api"
import { action, internalMutation } from "./_generated/server"
import { normalizeContactMessage } from "./lib/contact"

const MAX_MESSAGES_PER_HOUR = 3

export const prepare = internalMutation({
  args: {
    senderClerkUserId: v.string(),
    profileId: v.id("profiles"),
  },
  returns: v.object({
    deliveryId: v.id("contactMessages"),
    senderName: v.string(),
    senderEmail: v.string(),
    recipientName: v.string(),
    recipientEmail: v.string(),
  }),
  handler: async (ctx, args) => {
    const sender = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) =>
        q.eq("clerkUserId", args.senderClerkUserId)
      )
      .unique()
    if (!sender || sender.role !== "student") {
      throw new Error("Solo estudiantes verificados pueden enviar mensajes")
    }

    const profile = await ctx.db.get(args.profileId)
    if (
      !profile ||
      !profile.published ||
      profile.contactPreference !== "private"
    ) {
      throw new Error("Este perfil no acepta mensajes privados")
    }
    const recipient = await ctx.db.get(profile.userId)
    if (!recipient || recipient.role === "student") {
      throw new Error("Perfil de alumni no disponible")
    }

    const now = Date.now()
    const recent = await ctx.db
      .query("contactMessages")
      .withIndex("by_sender_and_created", (q) =>
        q.eq("senderUserId", sender._id).gte("createdAt", now - 60 * 60 * 1000)
      )
      .collect()
    if (recent.length >= MAX_MESSAGES_PER_HOUR) {
      throw new Error("Puedes enviar hasta 3 mensajes por hora")
    }

    const deliveryId = await ctx.db.insert("contactMessages", {
      senderUserId: sender._id,
      recipientUserId: recipient._id,
      recipientProfileId: profile._id,
      status: "pending",
      createdAt: now,
    })
    return {
      deliveryId,
      senderName: sender.name,
      senderEmail: sender.email,
      recipientName: profile.fullName,
      recipientEmail: profile.contactEmail,
    }
  },
})

export const finish = internalMutation({
  args: {
    deliveryId: v.id("contactMessages"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    providerMessageId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const delivery = await ctx.db.get(args.deliveryId)
    if (!delivery || delivery.status !== "pending") return null
    await ctx.db.patch(args.deliveryId, {
      status: args.status,
      providerMessageId: args.providerMessageId,
      sentAt: args.status === "sent" ? Date.now() : undefined,
    })
    return null
  },
})

export const send = action({
  args: {
    profileId: v.id("profiles"),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("No autenticado")
    const message = normalizeContactMessage(args.message)
    const delivery = await ctx.runMutation(internal.contacts.prepare, {
      senderClerkUserId: identity.subject,
      profileId: args.profileId,
    })

    try {
      const providerMessageId = await ctx.runAction(
        internal.emails.sendStudentMessage,
        { ...delivery, message }
      )
      await ctx.runMutation(internal.contacts.finish, {
        deliveryId: delivery.deliveryId,
        status: "sent",
        providerMessageId,
      })
    } catch {
      await ctx.runMutation(internal.contacts.finish, {
        deliveryId: delivery.deliveryId,
        status: "failed",
      })
      throw new Error("No pudimos enviar el mensaje. Intenta nuevamente.")
    }
    return null
  },
})
