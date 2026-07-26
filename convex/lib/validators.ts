import { v } from "convex/values"

export const areaValidator = v.union(
  v.literal("Software"),
  v.literal("Datos e IA"),
  v.literal("Producto"),
  v.literal("Investigación"),
  v.literal("Emprendimiento"),
  v.literal("Academia")
)

export const roleValidator = v.union(
  v.literal("student"),
  v.literal("alumni"),
  v.literal("admin")
)

export const verificationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
)

export const inviteStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("revoked")
)

export const jobKindValidator = v.union(
  v.literal("job"),
  v.literal("internship")
)

export const jobModeValidator = v.union(
  v.literal("onsite"),
  v.literal("hybrid"),
  v.literal("remote")
)

export const jobStatusValidator = v.union(
  v.literal("open"),
  v.literal("closed")
)

export const jobValidator = v.object({
  _id: v.id("jobs"),
  _creationTime: v.number(),
  authorUserId: v.id("users"),
  authorName: v.string(),
  kind: jobKindValidator,
  mode: jobModeValidator,
  title: v.string(),
  company: v.string(),
  location: v.string(),
  description: v.string(),
  applicationUrl: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  status: jobStatusValidator,
  updatedAt: v.number(),
})

export const profileValidator = v.object({
  _id: v.id("profiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
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
  photoUrl: v.optional(v.string()),
  featuredOnLanding: v.optional(v.boolean()),
  published: v.boolean(),
  updatedAt: v.number(),
})

export const landingProfileValidator = v.object({
  _id: v.id("profiles"),
  fullName: v.string(),
  generation: v.string(),
  title: v.string(),
  company: v.string(),
  photoUrl: v.string(),
})

export const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  clerkUserId: v.string(),
  email: v.string(),
  name: v.string(),
  role: roleValidator,
  inviteId: v.optional(v.id("invites")),
  profileComplete: v.boolean(),
  updatedAt: v.number(),
})

export const inviteValidator = v.object({
  _id: v.id("invites"),
  _creationTime: v.number(),
  email: v.string(),
  token: v.string(),
  status: inviteStatusValidator,
  createdByUserId: v.optional(v.id("users")),
  acceptedByUserId: v.optional(v.id("users")),
  acceptedAt: v.optional(v.number()),
  note: v.optional(v.string()),
})

export const verificationRequestValidator = v.object({
  _id: v.id("verificationRequests"),
  _creationTime: v.number(),
  clerkUserId: v.string(),
  tokenIdentifier: v.string(),
  email: v.string(),
  name: v.string(),
  generation: v.string(),
  linkedinUrl: v.string(),
  status: verificationStatusValidator,
  reviewedByUserId: v.optional(v.id("users")),
  reviewedAt: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),
  notifiedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
