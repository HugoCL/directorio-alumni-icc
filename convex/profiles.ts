import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server"
import { v } from "convex/values"
import type { Doc } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { canFeatureProfile, isOwnedProfilePhotoUrl } from "../lib/profile-photo"
import { requireAlumni, requireDirectoryAccess } from "./lib/auth"
import { directoryContactEmail } from "./lib/contact"
import { normalizeContactEmail } from "./lib/jobs"
import {
  areaValidator,
  contactPreferenceValidator,
  directoryProfileValidator,
  landingProfileValidator,
  profileValidator,
} from "./lib/validators"
import { isValidGeneration } from "./lib/verification"

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
  if (!isValidGeneration(args.generation)) {
    throw new Error("Generación inválida")
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

function forDirectory(profile: Doc<"profiles">) {
  const contactPreference = profile.contactPreference ?? "visible"
  return {
    ...profile,
    contactPreference,
    contactEmail: directoryContactEmail(
      profile.contactEmail,
      profile.contactPreference
    ),
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
    contactPreference: contactPreferenceValidator,
    linkedinUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    featuredOnLanding: v.optional(v.boolean()),
    published: v.boolean(),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const user = await requireAlumni(ctx)
    validateProfileInput(args)
    const contactEmail = normalizeContactEmail(args.contactEmail)
    if (!contactEmail) throw new Error("El correo de contacto es obligatorio")
    const linkedinUrl = normalizeLinkedIn(args.linkedinUrl)
    const phone = args.phone?.trim() || undefined
    const photoUrl = args.photoUrl?.trim() || undefined
    if (photoUrl && !isOwnedProfilePhotoUrl(photoUrl, user.clerkUserId)) {
      throw new Error("URL de foto inválida")
    }
    const featuredOnLanding = canFeatureProfile(
      args.published,
      photoUrl,
      args.featuredOnLanding
    )
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
      contactEmail,
      contactPreference: args.contactPreference,
      linkedinUrl,
      phone,
      photoUrl,
      featuredOnLanding,
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

export const listLandingFeatured = query({
  args: {},
  returns: v.array(landingProfileValidator),
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_landing_featured", (q) => q.eq("featuredOnLanding", true))
      .order("desc")
      .take(3)

    return profiles.flatMap((profile) =>
      profile.published && profile.photoUrl
        ? [
            {
              _id: profile._id,
              fullName: profile.fullName,
              generation: profile.generation,
              title: profile.title,
              company: profile.company,
              photoUrl: profile.photoUrl,
            },
          ]
        : []
    )
  },
})

export const listPublished = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    area: v.optional(areaValidator),
    generation: v.optional(v.string()),
  },
  returns: paginationResultValidator(directoryProfileValidator),
  handler: async (ctx, args) => {
    await requireDirectoryAccess(ctx)

    const search = args.search?.trim()
    let result

    if (search) {
      let q = ctx.db
        .query("profiles")
        .withSearchIndex("search_directory", (qi) => {
          let s = qi.search("fullName", search).eq("published", true)
          if (args.area) s = s.eq("area", args.area)
          if (args.generation) s = s.eq("generation", args.generation)
          return s
        })
      result = await q.paginate(args.paginationOpts)
    } else if (args.area) {
      result = await ctx.db
        .query("profiles")
        .withIndex("by_published_and_area", (q) =>
          q.eq("published", true).eq("area", args.area!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else if (args.generation) {
      result = await ctx.db
        .query("profiles")
        .withIndex("by_published_and_generation", (q) =>
          q.eq("published", true).eq("generation", args.generation!)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else {
      result = await ctx.db
        .query("profiles")
        .withIndex("by_published", (q) => q.eq("published", true))
        .order("desc")
        .paginate(args.paginationOpts)
    }

    return { ...result, page: result.page.map(forDirectory) }
  },
})

export const getPublished = query({
  args: { profileId: v.id("profiles") },
  returns: v.union(directoryProfileValidator, v.null()),
  handler: async (ctx, args) => {
    await requireDirectoryAccess(ctx)
    const profile = await ctx.db.get(args.profileId)
    if (!profile || !profile.published) {
      return null
    }
    return forDirectory(profile)
  },
})
