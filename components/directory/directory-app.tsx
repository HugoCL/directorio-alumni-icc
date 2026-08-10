"use client"

import { useEffect, useId, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useAction, usePaginatedQuery, useQuery } from "convex/react"
import { toast } from "sonner"
import {
  RiArrowRightLine,
  RiLinkedinBoxFill,
  RiMailLine,
  RiPhoneLine,
  RiSearchLine,
} from "@remixicon/react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { AREAS, GENERATIONS } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import {
  AccessNotice,
  AppPage,
  PageHeader,
  Panel,
} from "@/components/app-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"

const areaItems = [
  { label: "Todas las áreas", value: "all" },
  ...AREAS.map((value) => ({ label: value, value })),
]

const generationItems = [
  { label: "Todas las generaciones", value: "all" },
  ...GENERATIONS.map((value) => ({ label: `Generación ${value}`, value })),
]

type Profile = Omit<Doc<"profiles">, "contactEmail"> & {
  contactEmail?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function PrivateMessageDialog({ profile }: { profile: Profile }) {
  const send = useAction(api.contacts.send)
  const messageId = useId()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)
    try {
      await send({ profileId: profile._id, message })
      setMessage("")
      setOpen(false)
      toast.success(`Le enviamos tu mensaje a ${profile.fullName}`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar el mensaje. Vuelve a intentarlo."
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="w-full justify-start" />}
      >
        <RiMailLine data-icon="inline-start" />
        Enviar un mensaje
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Escríbele a {profile.fullName}</DialogTitle>
            <DialogDescription>
              Le llegará tu nombre, tu correo institucional y tu mensaje, para
              que pueda responderte directamente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={messageId}>
              Tu mensaje
            </label>
            <Textarea
              id={messageId}
              required
              minLength={10}
              maxLength={1200}
              rows={6}
              value={message}
              placeholder="Cuéntale brevemente por qué te gustaría conversar."
              onChange={(event) => setMessage(event.target.value)}
            />
            <span className="text-right text-xs text-muted-foreground tabular-nums">
              {message.length}/1200
            </span>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={sending}>
              {sending ? "Enviando…" : "Enviar mensaje"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProfileDetail({
  profile,
  viewerRole,
}: {
  profile: Profile
  viewerRole: Doc<"users">["role"]
}) {
  const facts = [
    ["Generación", profile.generation],
    ["Área", profile.area],
    ["Ubicación", profile.location],
  ] as const

  return (
    <div key={profile._id} className="flex animate-fade flex-col gap-7">
      <div className="flex items-start gap-4">
        <Avatar className="size-16 shrink-0">
          {profile.photoUrl ? (
            <AvatarImage
              src={profile.photoUrl}
              alt={`Foto de ${profile.fullName}`}
            />
          ) : null}
          <AvatarFallback className="font-heading font-semibold">
            {initials(profile.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl leading-snug font-semibold">
            {profile.fullName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.title} · {profile.company}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-4 rounded-lg bg-surface px-4 py-3.5">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 truncate text-sm font-medium" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="text-sm font-semibold">Puedes preguntarle sobre</h3>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {profile.helpWith}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Datos de contacto</h3>
        <div className="mt-3 flex flex-col gap-2">
          {profile.contactEmail ? (
            <a
              href={`mailto:${profile.contactEmail}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-w-0 justify-start"
              )}
            >
              <RiMailLine data-icon="inline-start" />
              <span className="truncate">{profile.contactEmail}</span>
            </a>
          ) : viewerRole === "student" ? (
            <PrivateMessageDialog profile={profile} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Prefiere recibir mensajes solo de estudiantes de la carrera.
            </p>
          )}
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
              <RiLinkedinBoxFill data-icon="inline-start" />
              Ver su LinkedIn
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
              <RiPhoneLine data-icon="inline-start" />
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
      <AppPage width="wide">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <Skeleton className="mt-8 h-12 w-full" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(22rem,0.85fr)]">
          <Skeleton className="h-[28rem]" />
          <Skeleton className="hidden h-96 lg:block" />
        </div>
      </AppPage>
    )
  }

  if (me === null) {
    return (
      <AccessNotice
        title="Te falta un paso para entrar"
        description="El directorio es solo para estudiantes y alumni de ICC. Confirma tu vínculo con la carrera y te abrimos la puerta."
        action={{ href: "/verificacion", label: "Confirmar mi acceso" }}
      />
    )
  }

  const hasActiveFilters =
    Boolean(search) || area !== "all" || generation !== "all"
  const resultCount = results
    ? `${results.length}${status === "CanLoadMore" || status === "LoadingMore" ? "+" : ""} ${results.length === 1 ? "persona" : "personas"}`
    : "Cargando…"

  return (
    <>
      <AppPage width="wide">
        <PageHeader
          title="Personas"
          description="Busca por nombre, área o generación y encuentra con quién conversar."
          meta={
            <p
              className="text-sm text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {resultCount}
            </p>
          }
        />

        {me.role === "alumni" && !me.profileComplete ? (
          <div className="mt-8 flex flex-col gap-4 rounded-xl bg-accent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-accent-foreground">
                Aún no te pueden encontrar
              </p>
              <p className="mt-0.5 text-sm text-accent-foreground/80">
                Completa tu perfil y aparecerás en esta misma lista.
              </p>
            </div>
            <Link
              href="/perfil"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0 bg-background"
              )}
            >
              Completar mi perfil
              <RiArrowRightLine data-icon="inline-end" />
            </Link>
          </div>
        ) : null}

        <div
          role="search"
          className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_15rem]"
        >
          <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <RiSearchLine
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre"
              className="pl-10"
              aria-label="Buscar por nombre"
            />
          </div>
          <Select
            items={areaItems}
            value={area}
            onValueChange={(value) => setArea(value ?? "all")}
          >
            <SelectTrigger className="w-full" aria-label="Filtrar por área">
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
            onValueChange={(value) => setGeneration(value ?? "all")}
          >
            <SelectTrigger
              className="w-full"
              aria-label="Filtrar por generación"
            >
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

        <div className="mt-6 grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(22rem,0.85fr)]">
          <section className="min-w-0" aria-label="Perfiles">
            <Panel>
              <div className="hidden grid-cols-[minmax(0,1fr)_10rem_7rem_2rem] gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs font-medium text-muted-foreground lg:grid">
                <span>Nombre</span>
                <span>Área</span>
                <span>Generación</span>
                <span className="sr-only">Abrir</span>
              </div>
              <ul className="divide-y divide-border">
                {!results ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <li key={index} className="px-5 py-4">
                      <Skeleton className="h-12 w-full" />
                    </li>
                  ))
                ) : results.length === 0 ? (
                  <li>
                    <Empty className="border-0 py-16">
                      <EmptyHeader>
                        <EmptyTitle>
                          {hasActiveFilters
                            ? "Nadie coincide con esa búsqueda"
                            : "El directorio recién está tomando forma"}
                        </EmptyTitle>
                        <EmptyDescription>
                          {hasActiveFilters
                            ? "Prueba con otro nombre, área o generación."
                            : "Los perfiles van apareciendo a medida que alumni se suman a la red."}
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
                            "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors duration-150 outline-none hover:bg-surface focus-visible:bg-surface lg:grid-cols-[minmax(0,1fr)_10rem_7rem_2rem]",
                            // Only mark the row on desktop, where the detail
                            // panel it points at is actually on screen.
                            isSelected && "lg:bg-accent lg:hover:bg-accent"
                          )}
                          onClick={() => {
                            setSelectedId(profile._id)
                            setMobileOpen(
                              !window.matchMedia("(min-width: 1024px)").matches
                            )
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-10 shrink-0">
                              {profile.photoUrl ? (
                                <AvatarImage
                                  src={profile.photoUrl}
                                  alt={`Foto de ${profile.fullName}`}
                                />
                              ) : null}
                              <AvatarFallback className="text-xs font-medium">
                                {initials(profile.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {profile.fullName}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {profile.title} · {profile.company}
                              </p>
                            </div>
                          </div>
                          <span className="col-start-1 text-sm text-muted-foreground lg:col-start-auto lg:truncate">
                            {profile.area}
                            <span className="lg:hidden">
                              {" · "}
                              {profile.generation}
                            </span>
                          </span>
                          <span className="hidden text-sm text-muted-foreground tabular-nums lg:block">
                            {profile.generation}
                          </span>
                          <RiArrowRightLine
                            aria-hidden="true"
                            className={cn(
                              "col-start-2 row-start-1 size-4 self-center justify-self-end text-muted-foreground transition-colors lg:col-start-auto lg:row-start-auto",
                              isSelected && "text-primary"
                            )}
                          />
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </Panel>

            {status === "CanLoadMore" || status === "LoadingMore" ? (
              <Button
                variant="outline"
                className="mt-4 w-full"
                disabled={status === "LoadingMore"}
                onClick={() => loadMore(20)}
              >
                {status === "LoadingMore" ? "Cargando…" : "Ver más personas"}
              </Button>
            ) : null}
          </section>

          <aside
            id="profile-panel"
            aria-live="polite"
            className="sticky top-24 hidden lg:block"
          >
            <Panel className="p-6">
              {selected ? (
                <ProfileDetail profile={selected} viewerRole={me.role} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Elige a alguien de la lista para ver su experiencia y cómo
                  contactarle.
                </p>
              )}
            </Panel>
          </aside>
        </div>
      </AppPage>

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
          <div className="px-5 pb-4">
            {selected ? (
              <ProfileDetail profile={selected} viewerRole={me.role} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
