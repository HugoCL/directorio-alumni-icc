import { ClerkProvider } from "@clerk/nextjs"
import { esMX } from "@clerk/localizations"
import { shadcn } from "@clerk/ui/themes"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SkipLink } from "@/components/skip-link"
import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { SessionBootstrap } from "@/components/providers/session-bootstrap"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const clerkLocalization = {
  ...esMX,
  formFieldAction__forgotPassword: "¿Olvidaste tu contraseña?",
  formFieldInputPlaceholder__emailAddress: "tu-correo@ejemplo.com",
  formFieldInputPlaceholder__password: "Escribe tu contraseña",
  formFieldInputPlaceholder__signUpPassword: "Crea una contraseña",
  identityPreviewEditButton__emailAddress: "Cambiar correo",
  signIn: {
    ...esMX.signIn,
    start: {
      ...esMX.signIn?.start,
      actionLink: "Crear cuenta",
      actionText: "¿Primera vez por aquí?",
      subtitle: "Usa el correo con el que te registraste.",
    },
    emailCode: {
      ...esMX.signIn?.emailCode,
      formTitle: "Código de verificación",
      subtitle: "Escribe el código que enviamos para entrar.",
      title: "Revisa tu correo",
    },
  },
  signUp: {
    ...esMX.signUp,
    start: {
      ...esMX.signUp?.start,
      actionLink: "Entrar",
      actionText: "¿Ya tienes una cuenta?",
      subtitle: "Crea tu acceso a la red de ICC.",
    },
  },
}

export const metadata: Metadata = {
  title: {
    default: "Red Alumni ICC",
    template: "%s · Red Alumni ICC",
  },
  description:
    "La red privada de ICC para encontrar experiencia, compartir oportunidades y mantener el contacto.",
  icons: { icon: "/icc-logo.png" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="icc-theme min-h-svh bg-background text-foreground antialiased">
        <SkipLink />
        <ClerkProvider
          localization={clerkLocalization}
          appearance={{
            theme: shadcn,
            variables: {
              colorPrimary: "#007B70",
              colorForeground: "#050403",
              colorBackground: "#FFFFFF",
              colorInput: "#F2F4F3",
              colorInputForeground: "#050403",
              borderRadius: "0.625rem",
              fontFamily: "var(--font-inter)",
            },
          }}
        >
          <ConvexClientProvider>
            <SessionBootstrap />
            <TooltipProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </TooltipProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
