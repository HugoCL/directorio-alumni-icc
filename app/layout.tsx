import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import type { Metadata } from "next"
import { Geist, Inter } from "next/font/google"
import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { SessionBootstrap } from "@/components/providers/session-bootstrap"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import "./globals.css"

const geistHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Red Alumni ICC",
    template: "%s · Red Alumni ICC",
  },
  description:
    "Directorio privado para que estudiantes de ICC contacten a alumni verificados.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={cn("font-sans", inter.variable, geistHeading.variable)}
    >
      <body className="icc-theme min-h-svh bg-background text-foreground antialiased">
        <ClerkProvider appearance={{ theme: shadcn }}>
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
