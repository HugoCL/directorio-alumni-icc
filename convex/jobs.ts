import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireAlumni, requireDirectoryAccess } from "./lib/auth"
import { canManageJob, normalizeJobInput } from "./lib/jobs"
import {
  jobKindValidator,
  jobModeValidator,
  jobValidator,
} from "./lib/validators"

export const list = query({
  args: {
    kind: v.optional(jobKindValidator),
  },
  returns: v.array(jobValidator),
  handler: async (ctx, args) => {
    await requireDirectoryAccess(ctx)

    // ponytail: collect the small open board; add indexed search if volume grows.
    if (args.kind) {
      return await ctx.db
        .query("jobs")
        .withIndex("by_status_and_kind", (q) =>
          q.eq("status", "open").eq("kind", args.kind!)
        )
        .order("desc")
        .collect()
    }

    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .collect()
  },
})

export const create = mutation({
  args: {
    kind: jobKindValidator,
    mode: jobModeValidator,
    title: v.string(),
    company: v.string(),
    location: v.string(),
    description: v.string(),
    applicationUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
  },
  returns: v.id("jobs"),
  handler: async (ctx, args) => {
    const user = await requireAlumni(ctx)
    const input = normalizeJobInput(args)

    return await ctx.db.insert("jobs", {
      authorUserId: user._id,
      authorName: user.name.trim() || "Alumni ICC",
      kind: args.kind,
      mode: args.mode,
      ...input,
      status: "open",
      updatedAt: Date.now(),
    })
  },
})

export const close = mutation({
  args: { jobId: v.id("jobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAlumni(ctx)
    const job = await ctx.db.get(args.jobId)
    if (!job) {
      throw new Error("Oportunidad no encontrada")
    }
    if (!canManageJob(user.role, user._id, job.authorUserId)) {
      throw new Error("No puedes cerrar esta oportunidad")
    }

    if (job.status === "open") {
      await ctx.db.patch(job._id, {
        status: "closed",
        updatedAt: Date.now(),
      })
    }
    return null
  },
})
