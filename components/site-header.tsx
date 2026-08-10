"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Show, UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { RiCloseLine, RiMenuLine } from "@remixicon/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const primaryLinks = [
  { href: "/directorio", label: "Personas" },
  { href: "/oportunidades", label: "Oportunidades" },
] as const

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function desktopLinkClass(active: boolean) {
  return cn(
    buttonVariants({ variant: "ghost", size: "sm" }),
    "h-9 px-3.5 text-[0.9375rem] font-normal text-muted-foreground hover:text-foreground",
    active && "bg-accent font-medium text-accent-foreground hover:bg-accent"
  )
}

function mobileLinkClass(active: boolean) {
  return cn(
    buttonVariants({ variant: "ghost" }),
    "h-auto min-h-13 w-full justify-between rounded-none px-5 text-base font-normal",
    active && "bg-accent font-medium text-accent-foreground"
  )
}

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname()
  const me = useQuery(api.users.me)
  const accountLinks = [
    ...(me?.role === "alumni" || me?.role === "admin"
      ? [{ href: "/perfil", label: "Mi perfil" }]
      : []),
    ...(me?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ]
  const signedInLinks = [...primaryLinks, ...accountLinks]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5"
          aria-label="Comunidad ICC, inicio"
        >
          <Image
            src="/icc-logo.png"
            alt=""
            width={46}
            height={44}
            priority
            className="h-8 w-auto shrink-0 object-contain"
          />
          <span className="truncate font-heading text-[1.0625rem] font-semibold">
            Comunidad ICC
          </span>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryLinks.map((item) => {
            const active = isCurrent(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={desktopLinkClass(active)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-1.5 lg:flex">
          <Show when="signed-in">
            {accountLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                className={desktopLinkClass(isCurrent(pathname, item.href))}
              >
                {item.label}
              </Link>
            ))}
            <div className="ml-1.5 flex size-9 items-center justify-center">
              <UserButton />
            </div>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              aria-current={
                pathname.startsWith("/sign-in") ? "page" : undefined
              }
              className={desktopLinkClass(pathname.startsWith("/sign-in"))}
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "sm" }), "ml-1.5 h-9 px-4")}
            >
              Crear mi cuenta
            </Link>
          </Show>
        </div>

        <div className="ml-auto flex lg:hidden">
          <Sheet>
            <SheetTrigger
              aria-label="Abrir menú"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "size-10"
              )}
            >
              <RiMenuLine aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[min(88vw,21rem)] p-0"
            >
              <SheetHeader className="flex-row items-center justify-between border-b border-border p-4">
                <SheetTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <Image
                    src="/icc-logo.png"
                    alt=""
                    width={38}
                    height={36}
                    className="h-7 w-auto object-contain"
                  />
                  Comunidad ICC
                </SheetTitle>
                <SheetClose
                  aria-label="Cerrar menú"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "size-10"
                  )}
                >
                  <RiCloseLine aria-hidden="true" />
                </SheetClose>
              </SheetHeader>

              <nav
                aria-label="Navegación móvil"
                className="flex min-h-0 flex-1 flex-col"
              >
                <Show when="signed-in">
                  <div className="divide-y divide-border border-b border-border">
                    {signedInLinks.map((item) => {
                      const active = isCurrent(pathname, item.href)
                      return (
                        <SheetClose
                          key={item.href}
                          nativeButton={false}
                          render={
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={mobileLinkClass(active)}
                            />
                          }
                        >
                          <span>{item.label}</span>
                        </SheetClose>
                      )
                    })}
                  </div>
                  <div className="mt-auto flex min-h-16 items-center justify-between border-t border-border px-5 py-4">
                    <span className="text-sm text-muted-foreground">
                      Tu cuenta
                    </span>
                    <div className="flex size-9 items-center justify-center">
                      <UserButton />
                    </div>
                  </div>
                </Show>

                <Show when="signed-out">
                  <div className="divide-y divide-border border-b border-border">
                    {primaryLinks.map((item) => {
                      const active = isCurrent(pathname, item.href)
                      return (
                        <SheetClose
                          key={item.href}
                          nativeButton={false}
                          render={
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={mobileLinkClass(active)}
                            />
                          }
                        >
                          <span>{item.label}</span>
                        </SheetClose>
                      )
                    })}
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/sign-in"
                          aria-current={
                            pathname.startsWith("/sign-in") ? "page" : undefined
                          }
                          className={mobileLinkClass(
                            pathname.startsWith("/sign-in")
                          )}
                        />
                      }
                    >
                      <span>Entrar</span>
                    </SheetClose>
                  </div>
                  <div className="p-5">
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/sign-up"
                          className={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full"
                          )}
                        />
                      }
                    >
                      Crear mi cuenta
                    </SheetClose>
                  </div>
                </Show>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
