import type { AuthConfig } from "convex/server"

const domains = [
  process.env.CLERK_JWT_ISSUER_DOMAIN,
  process.env.CLERK_PRODUCTION_JWT_ISSUER_DOMAIN,
].filter((domain): domain is string => Boolean(domain))

export default {
  providers: domains.map((domain) => ({ domain, applicationID: "convex" })),
} satisfies AuthConfig
