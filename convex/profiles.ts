import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireAlumni, requireDirectoryAccess } from "./lib/auth"
import { areaValidator, profileValidator } from "./lib/validators"

const GENERATIONS = new Set(
  Array.from({ length: 14 }, (_, i) => String(2013 + i))
)

function normalizeLinkedIn(url: string | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined
  try {
    const parsed = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    )
    if (
      !parsed.hostname.includes("linkedin.com") &&
      !parsed.hostname.includes("lnkd.in")
    ) {
      throw new Error("invalid")
    }
    return parsed.toString()
  } catch {
    throw new Error("URL de LinkedIn inválida")
  }
}

function validateProfileInput(args: {
  fullName: string
  generation: string
  area: string
  title: string
  company: string
  location: string
  helpWith: string
  contactEmail: string
}) {
  if (args.fullName.trim().length < 2) {
    throw new Error("El nombre debe tener al menos 2 caracteres")
  }
  if (!GENERATIONS.has(args.generation)) {
    throw new Error("Generación inválida")
  }
  if (!args.contactEmail.includes("@")) {
    throw new Error("Correo de contacto inválido")
  }
  if (args.helpWith.trim().length < 10) {
    throw new Error("Describe en al menos 10 caracteres en qué puedes ayudar")
  }
  if (args.title.trim().length < 2) {
    throw new Error("El cargo es obligatorio")
  }
  if (args.company.trim().length < 2) {
    throw new Error("La organización es obligatoria")
  }
  if (args.location.trim().length < 2) {
    throw new Error("La ubicación es obligatoria")
  }
}

export const getMine = query({
  args: {},
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx) => {
    const user = await requireAlumni(ctx)
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique()
  },
})

export const upsertMine = mutation({
  args: {
    fullName: v.string(),
    generation: v.string(),
    area: areaValidator,
    title: v.string(),
    company: v.string(),
    location: v.string(),
    helpWith: v.string(),
    contactEmail: v.string(),
    linkedinUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    published: v.boolean(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const user = await requireAlumni(ctx)
    validateProfileInput(args)
    const linkedinUrl = normalizeLinkedIn(args.linkedinUrl)
    const phone = args.phone?.trim() || undefined
    const now = Date.now()

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique()

    const payload = {
      userId: user._id,
      fullName: args.fullName.trim(),
      generation: args.generation,
      area: args.area,
      title: args.title.trim(),
      company: args.company.trim(),
      location: args.location.trim(),
      helpWith: args.helpWith.trim(),
      contactEmail: args.contactEmail.trim().toLowerCase(),
      linkedinUrl,
      phone,
      published: args.published,
      updatedAt: now,
    }

    let profileId
    if (existing) {
      await ctx.db.patch(existing._id, payload)
      profileId = existing._id
    } else {
      profileId = await ctx.db.insert("profiles", payload)
    }

    await ctx.db.patch(user._id, {
      profileComplete: true,
      name: payload.fullName,
      updatedAt: now,
    })

    return profileId
  },
})

export const listPublished = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    area: v.optional(areaValidator),
    generation: v.optional(v.string()),
  },
  returns: paginationResultValidator(profileValidator),
  handler: async (ctx, args) => {
    await requireDirectoryAccess(ctx)

    const search = args.search?.trim()

    if (search) {
      let q = ctx.db
        .query("profiles")
        .withSearchIndex("search_directory", (qi) => {
          let s = qi.search("fullName", search).eq("published", true)
          if (args.area) s = s.eq("area", args.area)
          if (args.generation) s = s.eq("generation", args.generation)
          return s
        })
      return await q.paginate(args.paginationOpts)
    }

    if (args.area) {
      return await ctx.db
        .query("profiles")
        .withIndex("by_published_and_area", (q) =>
          q.eq("published", true).eq("area", args.area!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }

    if (args.generation) {
      return await ctx.db
        .query("profiles")
        .withIndex("by_published_and_generation", (q) =>
          q.eq("published", true).eq("generation", args.generation!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .paginate(args.paginationOpts)
  },
})

export const getPublished = query({
  args: { profileId: v.id("profiles") },
  returns: v.union(profileValidator, v.null()),
  handler: async (ctx, args) => {
    await requireDirectoryAccess(ctx)
    const profile = await ctx.db.get(args.profileId)
    if (!profile || !profile.published) {
      return null
    }
    return profile
  },
})
