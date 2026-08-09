import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { SessionBootstrap } from "@/components/providers/session-bootstrap"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Red Alumni ICC",
    template: "%s · Red Alumni ICC",
  },
  description:
    "Directorio privado para que estudiantes de la carrera contacten a alumni verificados.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="icc-theme min-h-svh bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-[60] -translate-y-24 bg-brand-ink px-4 py-3 font-semibold text-white focus:translate-y-0"
        >
          Saltar al contenido principal
        </a>
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: {
              colorPrimary: "#007B70",
              colorForeground: "#050403",
              colorBackground: "#FFFFFF",
              colorInput: "#F2F4F3",
              colorInputForeground: "#050403",
              borderRadius: "0.375rem",
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
