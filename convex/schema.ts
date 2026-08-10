import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import {
  areaValidator,
  contactDeliveryStatusValidator,
  contactPreferenceValidator,
  inviteStatusValidator,
  jobKindValidator,
  jobModeValidator,
  jobStatusValidator,
  roleValidator,
  verificationStatusValidator,
} from "./lib/validators"

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    role: roleValidator,
    inviteId: v.optional(v.id("invites")),
    profileComplete: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_clerk_user", ["clerkUserId"]),

  invites: defineTable({
    email: v.string(),
    token: v.string(),
    status: inviteStatusValidator,
    createdByUserId: v.optional(v.id("users")),
    acceptedByUserId: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),
    note: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  jobs: defineTable({
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
    .index("by_status", ["status"])
    .index("by_status_and_kind", ["status", "kind"]),

  profiles: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    generation: v.string(),
    area: areaValidator,
    title: v.string(),
    company: v.string(),
    location: v.string(),
    helpWith: v.string(),
    contactEmail: v.string(),
    contactPreference: v.optional(contactPreferenceValidator),
    linkedinUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    featuredOnLanding: v.optional(v.boolean()),
    published: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_published", ["published"])
    .index("by_landing_featured", ["featuredOnLanding", "updatedAt"])
    .index("by_published_and_area", ["published", "area"])
    .index("by_published_and_generation", ["published", "generation"])
    .searchIndex("search_directory", {
      searchField: "fullName",
      filterFields: ["published", "area", "generation"],
    }),

  contactMessages: defineTable({
    senderUserId: v.id("users"),
    recipientUserId: v.id("users"),
    recipientProfileId: v.id("profiles"),
    status: contactDeliveryStatusValidator,
    providerMessageId: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  }).index("by_sender_and_created", ["senderUserId", "createdAt"]),

  verificationRequests: defineTable({
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
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_status", ["status"]),
})
