"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { usePaginatedQuery, useQuery } from "convex/react"
import {
  ArrowRightIcon,
  ExternalLinkIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { AREAS, GENERATIONS } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

const areaItems = [
  { label: "Todas las áreas", value: "all" },
  ...AREAS.map((value) => ({ label: value, value })),
]

const generationItems = [
  { label: "Todas las generaciones", value: "all" },
  ...GENERATIONS.map((value) => ({ label: `Generación ${value}`, value })),
]

type Profile = Doc<"profiles">

type DirectoryFiltersProps = {
  area: string
  generation: string
  searchInput: string
  onAreaChange: (value: string | null) => void
  onGenerationChange: (value: string | null) => void
  onSearchChange: (value: string) => void
  className?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function DirectoryFilters({
  area,
  generation,
  searchInput,
  onAreaChange,
  onGenerationChange,
  onSearchChange,
  className,
}: DirectoryFiltersProps) {
  return (
    <div className={cn("grid gap-3 lg:grid-cols-[1fr_13rem_13rem]", className)}>
      <div className="relative min-w-0">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre"
          className="pl-9"
          aria-label="Buscar por nombre"
        />
      </div>
      <Select items={areaItems} value={area} onValueChange={onAreaChange}>
        <SelectTrigger className="w-full" aria-label="Área">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {areaItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        items={generationItems}
        value={generation}
        onValueChange={onGenerationChange}
      >
        <SelectTrigger className="w-full" aria-label="Generación">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {generationItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

function ProfileDetail({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-start gap-4">
        <Avatar className="size-20">
          {profile.photoUrl ? (
            <AvatarImage
              src={profile.photoUrl}
              alt={`Foto de ${profile.fullName}`}
            />
          ) : null}
          <AvatarFallback>{initials(profile.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            {profile.fullName}
          </h2>
          <p className="mt-1 text-muted-foreground">{profile.title}</p>
          <p className="font-medium">{profile.company}</p>
        </div>
      </div>

      <dl className="border-y border-border text-sm">
        {[
          ["Generación", profile.generation],
          ["Área", profile.area],
          ["Ubicación", profile.location],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-border py-3 last:border-b-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-b border-border pb-7">
        <h3 className="font-semibold">Puede ayudarte con</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {profile.helpWith}
        </p>
      </div>

      <div>
        <h3 className="font-semibold">Conecta</h3>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`mailto:${profile.contactEmail}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-w-0 justify-start"
            )}
          >
            <MailIcon data-icon="inline-start" />
            <span className="truncate">{profile.contactEmail}</span>
          </a>
          {profile.linkedinUrl ? (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "justify-start"
              )}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              Ver perfil de LinkedIn
            </a>
          ) : null}
          {profile.phone ? (
            <a
              href={`tel:${profile.phone}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "justify-start"
              )}
            >
              <PhoneIcon data-icon="inline-start" />
              {profile.phone}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function DirectoryApp() {
  const me = useQuery(api.users.me)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [area, setArea] = useState("all")
  const [generation, setGeneration] = useState("all")
  const [selectedId, setSelectedId] = useState<Id<"profiles"> | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(() => setSearch(searchInput.trim()))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const filters = useMemo(
    () => ({
      search: search || undefined,
      area: area === "all" ? undefined : (area as (typeof AREAS)[number]),
      generation: generation === "all" ? undefined : generation,
    }),
    [search, area, generation]
  )

  const { results, status, loadMore } = usePaginatedQuery(
    api.profiles.listPublished,
    me ? filters : "skip",
    { initialNumItems: 20 }
  )

  const selected =
    results?.find((profile) => profile._id === selectedId) ??
    results?.[0] ??
    null

  useEffect(() => {
    if (results && results.length > 0 && !selectedId) {
      setSelectedId(results[0]!._id)
    }
  }, [results, selectedId])

  if (me === undefined) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
        >
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-8 h-72 w-full" />
        </main>
      </div>
    )
  }

  if (me === null) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Verifica tu cuenta</AlertTitle>
            <AlertDescription>
              Usa tu correo @alumnos.utalca.cl o solicita revisión si eres
              exalumno.
            </AlertDescription>
          </Alert>
          <Link href="/verificacion" className={cn(buttonVariants(), "mt-6")}>
            Ir a verificación
          </Link>
        </main>
      </div>
    )
  }

  const resultCount = results
    ? `${results.length}${status === "CanLoadMore" || status === "LoadingMore" ? "+" : ""} perfiles`
    : "Cargando perfiles"
  const hasActiveFilters =
    Boolean(search) || area !== "all" || generation !== "all"

  const filterProps = {
    area,
    generation,
    searchInput,
    onAreaChange: (value: string | null) => setArea(value ?? "all"),
    onGenerationChange: (value: string | null) => setGeneration(value ?? "all"),
    onSearchChange: setSearchInput,
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Personas
            </h1>
            <p className="mt-3 text-muted-foreground">
              Encuentra experiencia dentro de la comunidad.
            </p>
          </div>
          <p className="text-sm font-medium" aria-live="polite">
            {resultCount}
          </p>
        </header>

        {me.role === "alumni" && !me.profileComplete ? (
          <Alert className="mt-6 rounded-none border-x-0 px-0">
            <AlertTitle>Completa tu perfil</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>Ayuda a que la comunidad también pueda encontrarte.</span>
              <Link
                href="/perfil"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Completar perfil
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}

        <DirectoryFilters
          {...filterProps}
          className="mt-6 hidden border-b border-border pb-6 sm:grid"
        />

        <details className="group mt-6 border-y border-border sm:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-3 font-medium [&::-webkit-details-marker]:hidden">
            Buscar y filtrar
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          </summary>
          <DirectoryFilters {...filterProps} className="border-t py-4" />
        </details>

        <div className="mt-8 grid min-w-0 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
          <section className="min-w-0 lg:pr-9" aria-label="Perfiles">
            <div className="hidden grid-cols-[1fr_9rem_7rem_1.5rem] gap-4 border-b border-border px-4 pb-3 text-sm font-medium text-muted-foreground lg:grid">
              <span>Nombre</span>
              <span>Área</span>
              <span>Generación</span>
              <span />
            </div>
            <ul className="divide-y divide-border border-b border-border">
              {!results ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <li key={index} className="py-3">
                    <Skeleton className="h-16 w-full" />
                  </li>
                ))
              ) : results.length === 0 ? (
                <li className="py-12">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>
                        {hasActiveFilters
                          ? "Sin coincidencias"
                          : "Aún no hay perfiles publicados"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {hasActiveFilters
                          ? "Prueba otro nombre o limpia los filtros."
                          : "Los perfiles aparecerán aquí cuando alumni decidan compartirlos."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </li>
              ) : (
                results.map((profile) => {
                  const isSelected = selected?._id === profile._id
                  return (
                    <li key={profile._id}>
                      <button
                        type="button"
                        aria-current={isSelected ? "true" : undefined}
                        aria-controls="profile-panel"
                        className={cn(
                          "grid min-h-20 w-full grid-cols-[1fr_auto] gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset lg:grid-cols-[1fr_9rem_7rem_1.5rem] lg:items-center lg:gap-4",
                          isSelected && "bg-accent"
                        )}
                        onClick={() => {
                          setSelectedId(profile._id)
                          setMobileOpen(
                            !window.matchMedia("(min-width: 1024px)").matches
                          )
                        }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-12">
                            {profile.photoUrl ? (
                              <AvatarImage
                                src={profile.photoUrl}
                                alt={`Foto de ${profile.fullName}`}
                              />
                            ) : null}
                            <AvatarFallback>
                              {initials(profile.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {profile.fullName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {profile.title} · {profile.company}
                            </p>
                          </div>
                        </div>
                        <ArrowRightIcon className="self-center text-primary lg:order-last" />
                        <span className="col-span-2 ml-15 text-sm text-muted-foreground lg:col-span-1 lg:ml-0 lg:truncate">
                          {profile.area}
                        </span>
                        <span className="hidden text-sm text-muted-foreground lg:block">
                          {profile.generation}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            {status === "CanLoadMore" || status === "LoadingMore" ? (
              <Button
                variant="outline"
                className="mt-5 w-full"
                disabled={status === "LoadingMore"}
                onClick={() => loadMore(20)}
              >
                {status === "LoadingMore" ? "Cargando…" : "Cargar más"}
              </Button>
            ) : null}
          </section>

          <aside
            id="profile-panel"
            aria-live="polite"
            className="hidden border-l border-border pl-9 lg:block"
          >
            {selected ? (
              <ProfileDetail profile={selected} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecciona un perfil para ver el detalle.
              </p>
            )}
          </aside>
        </div>
      </main>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88svh] overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+1.5rem)] lg:hidden"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">
              {selected ? `Perfil de ${selected.fullName}` : "Perfil"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            {selected ? <ProfileDetail profile={selected} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
