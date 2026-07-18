"use client"

import Link from "next/link"
import { Show, UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type SiteHeaderProps = {
  className?: string
  variant?: "landing" | "app"
}

export function SiteHeader({ className, variant = "app" }: SiteHeaderProps) {
  const me = useQuery(api.users.me)

  return (
    <header
      className={cn(
        "border-b border-border bg-background",
        variant === "landing" &&
          "absolute inset-x-0 top-0 z-20 bg-background/90 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-editorial text-xl text-foreground">
          Red Alumni <span className="text-primary">ICC</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Show when="signed-in">
            <Link
              href="/directorio"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Directorio
            </Link>
            {me?.role === "alumni" || me?.role === "admin" ? (
              <Link
                href="/perfil"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Mi perfil
              </Link>
            ) : null}
            {me?.role === "admin" ? (
              <Link
                href="/admin"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Admin
              </Link>
            ) : null}
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Entrar
            </Link>
            <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
              Verificar cuenta
            </Link>
          </Show>
        </nav>
      </div>
    </header>
  )
}
