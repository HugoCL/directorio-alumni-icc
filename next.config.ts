import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next"
import { PROFILE_PHOTO_HOSTNAME } from "./lib/profile-photo"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL(`https://${PROFILE_PHOTO_HOSTNAME}/**`)],
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default withSentryConfig(nextConfig, {
  org: "mlh-pe-hackathon",
  project: "directorio-alumni-icc",
  silent: !process.env.CI,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
