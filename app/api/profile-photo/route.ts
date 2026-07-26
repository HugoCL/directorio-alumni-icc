import { del, put } from "@vercel/blob"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { readBearerToken } from "@/lib/bearer-token"
import { isOwnedProfilePhotoUrl } from "@/lib/profile-photo"

export const runtime = "nodejs"
export const preferredRegion = "gru1"

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])
const maxFileSize = 4 * 1024 * 1024

async function requireEditor(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"))
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!token) throw new Error("No autenticado")
  if (!convexUrl) throw new Error("Convex no configurado")

  const convex = new ConvexHttpClient(convexUrl)
  convex.setAuth(token)
  const user = await convex.query(api.users.me, {})
  if (!user || user.role === "student") throw new Error("Sin acceso")
  return user.clerkUserId
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Error inesperado"
  const status =
    message === "No autenticado" ? 401 : message === "Sin acceso" ? 403 : 400
  return Response.json({ error: message }, { status })
}

export async function POST(request: Request) {
  try {
    const userId = await requireEditor(request)
    const file = await request.blob()
    const extension = imageTypes.get(file.type)
    if (!extension) throw new Error("Usa una imagen JPG, PNG o WebP")
    if (file.size === 0 || file.size > maxFileSize) {
      throw new Error("La imagen debe pesar menos de 4 MB")
    }

    const blob = await put(
      `profile-photos/${userId}/avatar.${extension}`,
      file,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      }
    )
    if (!isOwnedProfilePhotoUrl(blob.url, userId)) {
      await del(blob.url)
      throw new Error("El store devolvió una URL de foto inesperada")
    }
    return Response.json({ url: blob.url })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireEditor(request)
    const { url } = (await request.json()) as { url?: string }
    if (!url || !isOwnedProfilePhotoUrl(url, userId)) {
      throw new Error("URL de foto inválida")
    }
    await del(url)
    return new Response(null, { status: 204 })
  } catch (error) {
    return errorResponse(error)
  }
}
