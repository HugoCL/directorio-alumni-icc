import type { BrowserOptions } from "@sentry/nextjs"

/** Shared filters so browser-extension and transient network noise stay out of Sentry. */
export const sharedSentryOptions: Pick<
  BrowserOptions,
  "ignoreErrors" | "denyUrls"
> = {
  ignoreErrors: [
    "NetworkError",
    "Network Error",
    "Failed to fetch",
    "Load failed",
    "A network error occurred.",
    "$ is not defined",
  ],
  denyUrls: [
    /validation\.js/i,
    /extensions\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
  ],
}
