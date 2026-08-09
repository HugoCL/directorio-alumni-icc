"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Show, UserButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { MenuIcon, XIcon } from "lucide-react"
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

type SiteHeaderProps = {
  className?: string
  variant?: "landing" | "app"
}

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
    "h-10 rounded-lg px-3 text-[0.9375rem] text-brand-ink hover:bg-secondary",
    active && "bg-accent font-semibold text-brand-ink"
  )
}

function mobileLinkClass(active: boolean) {
  return cn(
    buttonVariants({ variant: "ghost" }),
    "h-auto min-h-14 w-full justify-between rounded-none px-6 text-base",
    active && "bg-accent font-semibold text-brand-ink"
  )
}

export function SiteHeader({ className }: SiteHeaderProps) {
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
    <>
      <header
        className={cn(
          "relative z-40 w-full bg-white text-brand-ink",
          className
        )}
      >
        <div className="mx-auto grid h-[68px] max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg font-semibold tracking-[-0.02em]"
            aria-label="Red Alumni ICC, inicio"
          >
            <Image
              src="/icc-logo.png"
              alt=""
              width={46}
              height={44}
              priority
              className="h-11 w-auto shrink-0 object-contain"
            />
            <span className="truncate text-base sm:text-lg">Red Alumni</span>
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

          <div className="hidden items-center justify-end gap-2 lg:flex">
            <Show when="signed-in">
              {accountLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isCurrent(pathname, item.href) ? "page" : undefined
                  }
                  className={desktopLinkClass(isCurrent(pathname, item.href))}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex size-11 items-center justify-center">
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
                className={cn(
                  buttonVariants(),
                  "h-11 rounded-lg bg-brand-ink px-4 text-white hover:bg-brand-ink/85"
                )}
              >
                Verificar cuenta
              </Link>
            </Show>
          </div>

          <div className="flex justify-end lg:hidden">
            <Sheet>
              <SheetTrigger
                aria-label="Abrir menú"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "size-11 rounded-lg border-brand-ink/20 bg-white"
                )}
              >
                <MenuIcon aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="right"
                showCloseButton={false}
                className="w-[min(88vw,22rem)] border-brand-ink/15 bg-white p-0 text-brand-ink shadow-none"
              >
                <SheetHeader className="flex-row items-center justify-between border-b border-brand-ink/15 p-4">
                  <SheetTitle className="flex items-center gap-3 text-base font-semibold">
                    <Image
                      src="/icc-logo.png"
                      alt=""
                      width={38}
                      height={36}
                      className="h-9 w-auto object-contain"
                    />
                    Red Alumni
                  </SheetTitle>
                  <SheetClose
                    aria-label="Cerrar menú"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-11 rounded-lg"
                    )}
                  >
                    <XIcon aria-hidden="true" />
                  </SheetClose>
                </SheetHeader>

                <nav
                  aria-label="Navegación móvil"
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <Show when="signed-in">
                    <div className="divide-y divide-brand-ink/15 border-b border-brand-ink/15">
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
                            {active ? (
                              <span
                                aria-hidden="true"
                                className="size-2 rounded-full bg-brand-teal"
                              />
                            ) : null}
                          </SheetClose>
                        )
                      })}
                    </div>
                    <div className="mt-auto flex min-h-16 items-center justify-between border-t border-brand-ink/15 px-6 py-4">
                      <span className="font-medium">Cuenta</span>
                      <div className="flex size-11 items-center justify-center">
                        <UserButton />
                      </div>
                    </div>
                  </Show>

                  <Show when="signed-out">
                    <div className="divide-y divide-brand-ink/15 border-b border-brand-ink/15">
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
                              pathname.startsWith("/sign-in")
                                ? "page"
                                : undefined
                            }
                            className={mobileLinkClass(
                              pathname.startsWith("/sign-in")
                            )}
                          />
                        }
                      >
                        <span>Entrar</span>
                      </SheetClose>
                      <SheetClose
                        nativeButton={false}
                        render={
                          <Link
                            href="/sign-up"
                            aria-current={
                              pathname.startsWith("/sign-up")
                                ? "page"
                                : undefined
                            }
                            className={mobileLinkClass(
                              pathname.startsWith("/sign-up")
                            )}
                          />
                        }
                      >
                        <span>Verificar cuenta</span>
                      </SheetClose>
                    </div>
                  </Show>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="icc-signal-track" aria-hidden="true">
          <span className="bg-brand-magenta" />
          <span className="bg-brand-teal" />
          <span className="bg-brand-green" />
        </div>
      </header>
    </>
  )
}
