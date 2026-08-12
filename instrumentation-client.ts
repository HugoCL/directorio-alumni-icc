import * as Sentry from "@sentry/nextjs"
import { sharedSentryOptions } from "./lib/sentry-options"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
  ...sharedSentryOptions,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
