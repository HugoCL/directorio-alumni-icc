import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import {
  areaValidator,
  inviteStatusValidator,
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
    linkedinUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    published: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_published", ["published"])
    .index("by_published_and_area", ["published", "area"])
    .index("by_published_and_generation", ["published", "generation"])
    .searchIndex("search_directory", {
      searchField: "fullName",
      filterFields: ["published", "area", "generation"],
    }),

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
