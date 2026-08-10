import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
