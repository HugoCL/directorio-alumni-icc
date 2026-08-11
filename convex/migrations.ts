import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { internalMutation } from "./_generated/server"
import { chooseCanonicalUser } from "./lib/dedupeUsers"

export const dedupeUsersByClerkId = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.object({
    canonicalUserId: v.union(v.id("users"), v.null()),
    duplicatesRemoved: v.number(),
  }),
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", args.clerkUserId))
      .take(101)
    if (users.length === 0) {
      return { canonicalUserId: null, duplicatesRemoved: 0 }
    }
    if (users.length > 100) throw new Error("Demasiados usuarios duplicados")

    const profiles = (
      await Promise.all(
        users.map((user) =>
          ctx.db
            .query("profiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .take(2)
        )
      )
    ).flat()
    const canonical = chooseCanonicalUser(
      users,
      new Set(profiles.map((profile) => profile.userId))
    )
    const duplicateIds = new Set(
      users.filter((user) => user._id !== canonical._id).map((user) => user._id)
    )
    if (duplicateIds.size === 0) {
      return { canonicalUserId: canonical._id, duplicatesRemoved: 0 }
    }

    // ponytail: bound this one-off scan; add reference indexes before 1,000 rows.
    const relatedTables = await Promise.all([
      ctx.db.query("jobs").take(1001),
      ctx.db.query("invites").take(1001),
      ctx.db.query("contactMessages").take(1001),
      ctx.db.query("verificationRequests").take(1001),
    ])
    if (relatedTables.some((documents) => documents.length > 1000)) {
      throw new Error("La migración requiere índices para tablas grandes")
    }
    const [jobs, invites, messages, requests] = relatedTables
    const canonicalInviteId =
      canonical.inviteId ?? users.find((user) => user.inviteId)?.inviteId

    for (const profile of profiles) {
      if (duplicateIds.has(profile.userId)) {
        await ctx.db.patch(profile._id, { userId: canonical._id })
      }
    }
    for (const job of jobs) {
      if (duplicateIds.has(job.authorUserId)) {
        await ctx.db.patch(job._id, { authorUserId: canonical._id })
      }
    }
    for (const invite of invites) {
      const patch: {
        createdByUserId?: Id<"users">
        acceptedByUserId?: Id<"users">
      } = {}
      if (invite.createdByUserId && duplicateIds.has(invite.createdByUserId)) {
        patch.createdByUserId = canonical._id
      }
      if (
        invite.acceptedByUserId &&
        duplicateIds.has(invite.acceptedByUserId)
      ) {
        patch.acceptedByUserId = canonical._id
      }
      if (Object.keys(patch).length > 0) await ctx.db.patch(invite._id, patch)
    }
    for (const message of messages) {
      const patch: {
        senderUserId?: Id<"users">
        recipientUserId?: Id<"users">
      } = {}
      if (duplicateIds.has(message.senderUserId))
        patch.senderUserId = canonical._id
      if (duplicateIds.has(message.recipientUserId)) {
        patch.recipientUserId = canonical._id
      }
      if (Object.keys(patch).length > 0) await ctx.db.patch(message._id, patch)
    }
    for (const request of requests) {
      if (
        request.reviewedByUserId &&
        duplicateIds.has(request.reviewedByUserId)
      ) {
        await ctx.db.patch(request._id, { reviewedByUserId: canonical._id })
      }
    }

    await ctx.db.patch(canonical._id, {
      inviteId: canonicalInviteId,
      profileComplete: users.some((user) => user.profileComplete),
      updatedAt: Math.max(...users.map((user) => user.updatedAt)),
    })
    for (const duplicateId of duplicateIds) await ctx.db.delete(duplicateId)

    return {
      canonicalUserId: canonical._id,
      duplicatesRemoved: duplicateIds.size,
    }
  },
})
