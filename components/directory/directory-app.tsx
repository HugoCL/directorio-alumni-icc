"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { usePaginatedQuery, useQuery } from "convex/react"
import { ExternalLinkIcon, MailIcon, PhoneIcon, SearchIcon } from "lucide-react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { AREAS, GENERATIONS } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

type Profile = Doc<"profiles">

function ProfileDetail({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {profile.fullName}
        </h2>
        <p className="mt-1 text-muted-foreground">
          {profile.title} · {profile.company}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">Gen. {profile.generation}</Badge>
          <Badge variant="outline">{profile.area}</Badge>
          <Badge variant="outline">{profile.location}</Badge>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground">
          Puede ayudarte con
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {profile.helpWith}
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Contacto</h3>
        <p className="text-xs text-muted-foreground">
          Visible solo para miembros de la red. Puedes editar tu propio perfil
          en cualquier momento.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <Button
            variant="outline"
            className="justify-start"
            render={<a href={`mailto:${profile.contactEmail}`} />}
            nativeButton={false}
          >
            <MailIcon data-icon="inline-start" />
            {profile.contactEmail}
          </Button>
          {profile.linkedinUrl ? (
            <Button
              variant="outline"
              className="justify-start"
              render={
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              nativeButton={false}
            >
              <ExternalLinkIcon data-icon="inline-start" />
              LinkedIn
            </Button>
          ) : null}
          {profile.phone ? (
            <Button
              variant="outline"
              className="justify-start"
              render={<a href={`tel:${profile.phone}`} />}
              nativeButton={false}
            >
              <PhoneIcon data-icon="inline-start" />
              {profile.phone}
            </Button>
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
  const [area, setArea] = useState<string>("all")
  const [generation, setGeneration] = useState<string>("all")
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
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      </div>
    )
  }

  if (me === null) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Verifica tu cuenta</AlertTitle>
            <AlertDescription>
              Usa tu correo @alumnos.utalca.cl o solicita revisión si eres
              exalumno.
            </AlertDescription>
          </Alert>
          <Button
            className="mt-6"
            render={<Link href="/verificacion" />}
            nativeButton={false}
          >
            Ir a verificación
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {me.role === "alumni" && !me.profileComplete ? (
          <Alert className="mb-6">
            <AlertTitle>Completa tu perfil</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>
                Publica cómo pueden contactarte para desbloquear todo el
                directorio con contexto.
              </span>
              <Button
                size="sm"
                render={<Link href="/perfil" />}
                nativeButton={false}
              >
                Ir a mi perfil
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-editorial text-4xl tracking-[-0.03em]">
              Directorio
            </h1>
            <div aria-hidden className="mt-3 h-0.5 w-10 bg-signal" />
            <p
              className="mt-1 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {results
                ? `${results.length}${status === "CanLoadMore" || status === "LoadingMore" ? "+" : ""} perfiles`
                : "Cargando…"}
            </p>
          </div>
        </div>

        <div className="sticky top-0 z-10 mt-6 flex flex-col gap-3 border-y border-border bg-background py-4 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre"
              className="pl-9"
              aria-label="Buscar por nombre"
            />
          </div>
          <Select value={area} onValueChange={(v) => setArea(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44" aria-label="Área">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {AREAS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={generation}
            onValueChange={(v) => setGeneration(v ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label="Generación">
              <SelectValue placeholder="Generación" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas</SelectItem>
                {GENERATIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    Gen. {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="min-w-0">
            <div className="mb-2 hidden grid-cols-[1fr_7rem_7rem] gap-3 px-3 text-xs font-medium text-muted-foreground lg:grid">
              <span>Nombre</span>
              <span>Área</span>
              <span>Generación</span>
            </div>
            <ul
              className="divide-y divide-border border border-border"
              role="listbox"
              aria-label="Resultados"
            >
              {!results ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="p-3">
                    <Skeleton className="h-12 w-full" />
                  </li>
                ))
              ) : results.length === 0 ? (
                <li className="p-8">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>Sin coincidencias</EmptyTitle>
                      <EmptyDescription>
                        Prueba otro nombre, limpia los filtros o publica tu
                        propio perfil.
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
                        role="option"
                        aria-selected={isSelected}
                        aria-controls="profile-panel"
                        className={cn(
                          "grid w-full grid-cols-1 gap-1 px-3 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none lg:grid-cols-[1fr_7rem_7rem] lg:items-center lg:gap-3",
                          isSelected && "bg-accent"
                        )}
                        onClick={() => {
                          setSelectedId(profile._id)
                          setMobileOpen(
                            !window.matchMedia("(min-width: 1024px)").matches
                          )
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {profile.fullName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {profile.title} · {profile.company}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground lg:truncate">
                          {profile.area}
                        </span>
                        <span className="text-sm text-muted-foreground">
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
                className="mt-4 w-full"
                disabled={status === "LoadingMore"}
                onClick={() => loadMore(20)}
              >
                {status === "LoadingMore" ? "Cargando…" : "Cargar más"}
              </Button>
            ) : null}
          </div>

          <aside
            id="profile-panel"
            aria-live="polite"
            className="hidden border border-border bg-card p-6 shadow-[6px_6px_0_0_var(--border)] lg:block"
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
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85svh] overflow-y-auto lg:hidden"
        >
          <SheetHeader>
            <SheetTitle>{selected?.fullName ?? "Perfil"}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {selected ? <ProfileDetail profile={selected} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
