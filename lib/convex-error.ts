/** Extract a user-facing message from a Convex client error. */
export function convexErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!(error instanceof Error)) return fallback

  const withoutClient = error.message.replace(/\s+Called by client[\s\S]*$/, "")
  const detail = withoutClient
    .replace(/^\[CONVEX[^\]]*\]\s*(?:\[[^\]]*\]\s*)?/, "")
    .trim()

  if (!detail || detail === "Server Error") return fallback
  return detail
}
