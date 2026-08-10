export const MAX_CONTACT_MESSAGE_LENGTH = 1200

export function directoryContactEmail(
  email: string,
  preference: "visible" | "private" | undefined
): string | undefined {
  return preference === "private" ? undefined : email
}

export function normalizeContactMessage(value: string): string {
  const message = value.trim()
  if (message.length < 10) {
    throw new Error("Escribe un mensaje de al menos 10 caracteres")
  }
  if (message.length > MAX_CONTACT_MESSAGE_LENGTH) {
    throw new Error(
      `El mensaje no puede superar ${MAX_CONTACT_MESSAGE_LENGTH} caracteres`
    )
  }
  return message
}
