"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  ExternalLinkIcon,
  LaptopIcon,
  LoaderCircleIcon,
  MailIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

type Job = Doc<"jobs">
type JobKind = Job["kind"]
type JobMode = Job["mode"]

const kindItems = [
  { label: "Todos los tipos", value: "all" },
  { label: "Empleo", value: "job" },
  { label: "Práctica", value: "internship" },
]

const formKindItems = kindItems.slice(1)

const modeItems = [
  { label: "Todas las modalidades", value: "all" },
  { label: "Remoto", value: "remote" },
  { label: "Híbrido", value: "hybrid" },
  { label: "Presencial", value: "onsite" },
]

const formModeItems = modeItems.slice(1)

const kindLabels: Record<JobKind, string> = {
  job: "Empleo",
  internship: "Práctica",
}

const modeLabels: Record<JobMode, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function JobDetail({
  job,
  canClose,
  closing,
  hideHeading = false,
  onClose,
}: {
  job: Job
  canClose: boolean
  closing: boolean
  hideHeading?: boolean
  onClose: (jobId: Id<"jobs">) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {!hideHeading ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-signal">
            {kindLabels[job.kind]}
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.03em]">
            {job.title}
          </h2>
          <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
        </div>
      ) : null}

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <BriefcaseBusinessIcon className="size-4 text-signal" />
          {kindLabels[job.kind]}
        </li>
        <li className="flex items-center gap-2">
          {job.mode === "onsite" ? (
            <Building2Icon className="size-4 text-primary" />
          ) : (
            <LaptopIcon className="size-4 text-primary" />
          )}
          {modeLabels[job.mode]}
        </li>
        <li className="flex items-center gap-2">
          <MapPinIcon className="size-4 text-primary" />
          {job.location}
        </li>
      </ul>

      <div className="border-y border-border py-4 text-sm">
        <p>
          Compartido por <span className="font-medium">{job.authorName}</span>
        </p>
        <p className="mt-1 text-muted-foreground">
          {dateFormatter.format(job._creationTime)}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Descripción</h3>
        <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
          {job.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {job.applicationUrl ? (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 rounded-sm"
            )}
          >
            Postular en el sitio
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
        ) : null}
        {job.contactEmail ? (
          <a
            href={`mailto:${job.contactEmail}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "min-h-11 rounded-sm"
            )}
          >
            <MailIcon data-icon="inline-start" />
            Escribir al contacto
          </a>
        ) : null}
        {canClose ? (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="min-h-11 rounded-sm"
            disabled={closing}
            onClick={() => onClose(job._id)}
          >
            {closing ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            {closing ? "Cerrando…" : "Cerrar publicación"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function JobForm({
  onCancel,
  onPublished,
}: {
  onCancel: () => void
  onPublished: (jobId: Id<"jobs">) => void
}) {
  const createJob = useMutation(api.jobs.create)
  const [publishing, setPublishing] = useState(false)
  const [applicationInvalid, setApplicationInvalid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const data = new FormData(formElement)
    const applicationUrl = String(data.get("applicationUrl") ?? "").trim()
    const contactEmail = String(data.get("contactEmail") ?? "").trim()
    if (!applicationUrl && !contactEmail) {
      setApplicationInvalid(true)
      return
    }

    setPublishing(true)
    setError(null)
    try {
      const jobId = await createJob({
        kind: data.get("kind") as JobKind,
        mode: data.get("mode") as JobMode,
        title: String(data.get("title") ?? ""),
        company: String(data.get("company") ?? ""),
        location: String(data.get("location") ?? ""),
        description: String(data.get("description") ?? ""),
        applicationUrl: applicationUrl || undefined,
        contactEmail: contactEmail || undefined,
      })
      formElement.reset()
      toast.success("Oportunidad publicada")
      onPublished(jobId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo publicar")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <form
      id="publish-job"
      onSubmit={publish}
      className="border-b border-border py-7"
    >
      <FieldSet className="relative gap-5">
        <FieldLegend className="mb-0 pr-14">
          Publicar una oportunidad
        </FieldLegend>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Comparte un cargo o práctica vigente. La publicación quedará visible
          para los miembros verificados.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 size-11 rounded-sm"
          onClick={onCancel}
          aria-label="Cerrar formulario"
        >
          <XIcon />
        </Button>

        {error ? (
          <Alert variant="destructive" className="rounded-sm">
            <AlertTitle>No se pudo publicar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="job-kind">Tipo</FieldLabel>
              <Select name="kind" items={formKindItems} defaultValue="job">
                <SelectTrigger
                  id="job-kind"
                  className="h-11 w-full rounded-sm border-border bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {formKindItems.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="min-h-11 rounded-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="job-mode">Modalidad</FieldLabel>
              <Select name="mode" items={formModeItems} defaultValue="remote">
                <SelectTrigger
                  id="job-mode"
                  className="h-11 w-full rounded-sm border-border bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {formModeItems.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="min-h-11 rounded-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="job-title">Cargo</FieldLabel>
              <Input
                id="job-title"
                name="title"
                autoFocus
                required
                minLength={3}
                maxLength={120}
                placeholder="Ej: Frontend Engineer"
                className="h-11 rounded-sm border-border bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-company">Organización</FieldLabel>
              <Input
                id="job-company"
                name="company"
                required
                minLength={2}
                maxLength={120}
                placeholder="Ej: Buk"
                className="h-11 rounded-sm border-border bg-background"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="job-location">Ubicación</FieldLabel>
            <Input
              id="job-location"
              name="location"
              required
              minLength={2}
              maxLength={120}
              placeholder="Ej: Santiago, Chile"
              className="h-11 rounded-sm border-border bg-background"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="job-description">Descripción</FieldLabel>
            <Textarea
              id="job-description"
              name="description"
              required
              minLength={20}
              maxLength={3000}
              rows={7}
              placeholder="Describe el rol, sus responsabilidades y lo que debería saber quien postule."
              className="min-h-40 rounded-sm border-border bg-background"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={applicationInvalid || undefined}>
              <FieldLabel htmlFor="job-url">Enlace de postulación</FieldLabel>
              <Input
                id="job-url"
                name="applicationUrl"
                type="url"
                maxLength={2048}
                placeholder="https://…"
                className="h-11 rounded-sm border-border bg-background"
                aria-invalid={applicationInvalid}
                onChange={() => setApplicationInvalid(false)}
              />
            </Field>
            <Field data-invalid={applicationInvalid || undefined}>
              <FieldLabel htmlFor="job-email">Correo de contacto</FieldLabel>
              <Input
                id="job-email"
                name="contactEmail"
                type="email"
                maxLength={254}
                placeholder="talento@empresa.cl"
                className="h-11 rounded-sm border-border bg-background"
                aria-invalid={applicationInvalid}
                onChange={() => setApplicationInvalid(false)}
              />
            </Field>
          </div>
          {applicationInvalid ? (
            <FieldError>
              Agrega al menos un enlace o un correo de postulación.
            </FieldError>
          ) : null}
        </FieldGroup>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 rounded-sm"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            className="min-h-11 rounded-sm"
            disabled={publishing}
          >
            {publishing ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            {publishing ? "Publicando…" : "Publicar oportunidad"}
          </Button>
        </div>
      </FieldSet>
    </form>
  )
}

function JobRow({
  job,
  selected,
  onSelect,
}: {
  job: Job
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        aria-controls="job-detail-panel"
        className={cn(
          "grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-x-4 px-3 py-4 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 lg:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem_1.5rem] lg:gap-3",
          selected && "bg-accent ring-1 ring-primary ring-inset"
        )}
        onClick={onSelect}
      >
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{job.title}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {job.company}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground lg:hidden">
            <span>{kindLabels[job.kind]}</span>
            <span>{modeLabels[job.mode]}</span>
            <span>{job.location}</span>
          </div>
        </div>
        <span className="hidden text-sm text-muted-foreground lg:block">
          {kindLabels[job.kind]}
        </span>
        <span className="hidden text-sm text-muted-foreground lg:block">
          {modeLabels[job.mode]}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground lg:block">
          {job.location}
        </span>
        <ArrowRightIcon aria-hidden className="size-5 text-muted-foreground" />
      </button>
    </li>
  )
}

export function JobBoard() {
  const me = useQuery(api.users.me)
  const closeJob = useMutation(api.jobs.close)
  const [search, setSearch] = useState("")
  const [kind, setKind] = useState<"all" | JobKind>("all")
  const [mode, setMode] = useState<"all" | JobMode>("all")
  const [selectedId, setSelectedId] = useState<Id<"jobs"> | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formMounted, setFormMounted] = useState(false)
  const [closingId, setClosingId] = useState<Id<"jobs"> | null>(null)

  const queryArgs = useMemo(
    () => ({
      kind: kind === "all" ? undefined : kind,
    }),
    [kind]
  )

  const results = useQuery(api.jobs.list, me ? queryArgs : "skip")

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es")
    return (results ?? []).filter((job) => {
      if (mode !== "all" && job.mode !== mode) return false
      if (!term) return true
      return [job.title, job.company, job.location].some((value) =>
        value.toLocaleLowerCase("es").includes(term)
      )
    })
  }, [results, search, mode])

  const selected =
    visibleJobs.find((job) => job._id === selectedId) ?? visibleJobs[0] ?? null
  const canPost = me?.role === "alumni" || me?.role === "admin"

  function selectJob(jobId: Id<"jobs">) {
    setSelectedId(jobId)
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobileOpen(true)
    }
  }

  async function close(jobId: Id<"jobs">) {
    if (
      !window.confirm(
        "¿Cerrar esta publicación? Dejará de aparecer en el tablero."
      )
    ) {
      return
    }

    setClosingId(jobId)
    try {
      await closeJob({ jobId })
      setMobileOpen(false)
      setSelectedId(null)
      toast.success("Publicación cerrada")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No se pudo cerrar")
    } finally {
      setClosingId(null)
    }
  }

  if (me === undefined) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
        >
          <Skeleton className="h-12 w-72 rounded-sm" />
          <Skeleton className="mt-8 h-12 w-full rounded-sm" />
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <Skeleton className="h-96 rounded-sm" />
            <Skeleton className="h-80 rounded-sm" />
          </div>
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
              Solo los miembros verificados pueden revisar oportunidades de la
              red.
            </AlertDescription>
          </Alert>
          <Link
            href="/verificacion"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 min-h-11 rounded-sm"
            )}
          >
            Ir a verificación
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <header className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Oportunidades
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Empleos y prácticas compartidos por la comunidad ICC.
            </p>
          </div>
          {canPost ? (
            <Button
              type="button"
              size="lg"
              className="min-h-11 w-full rounded-sm sm:w-auto"
              aria-expanded={formOpen}
              aria-controls="publish-job"
              onClick={() => {
                setFormMounted(true)
                setFormOpen((open) => !open)
              }}
            >
              <PlusIcon data-icon="inline-start" />
              {formOpen ? "Ocultar formulario" : "Publicar oportunidad"}
            </Button>
          ) : null}
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
          <section className="min-w-0">
            {formMounted && canPost ? (
              <div hidden={!formOpen}>
                <JobForm
                  onCancel={() => setFormOpen(false)}
                  onPublished={(jobId) => {
                    setSelectedId(jobId)
                    setFormOpen(false)
                  }}
                />
              </div>
            ) : null}

            <div
              role="search"
              className="grid gap-3 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_11rem_12rem]"
            >
              <label className="relative block">
                <span className="sr-only">Buscar cargo o empresa</span>
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar cargo o empresa"
                  className="h-11 rounded-sm border-border bg-background pl-10"
                />
              </label>
              <Select
                items={kindItems}
                value={kind}
                onValueChange={(value) =>
                  setKind((value ?? "all") as "all" | JobKind)
                }
              >
                <SelectTrigger
                  className="h-11 w-full rounded-sm border-border bg-background"
                  aria-label="Filtrar por tipo"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {kindItems.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="min-h-11 rounded-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                items={modeItems}
                value={mode}
                onValueChange={(value) =>
                  setMode((value ?? "all") as "all" | JobMode)
                }
              >
                <SelectTrigger
                  className="h-11 w-full rounded-sm border-border bg-background"
                  aria-label="Filtrar por modalidad"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {modeItems.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="min-h-11 rounded-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden grid-cols-[minmax(0,1fr)_7rem_7rem_8rem_1.5rem] gap-3 border-b border-border px-3 py-3 text-xs font-medium tracking-wide text-muted-foreground lg:grid">
              <span>Cargo y empresa</span>
              <span>Tipo</span>
              <span>Modalidad</span>
              <span>Ubicación</span>
              <span className="sr-only">Abrir</span>
            </div>

            <ul
              className="divide-y divide-border border-b border-border"
              aria-label="Oportunidades"
            >
              {results === undefined ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <li key={index} className="px-3 py-4">
                    <Skeleton className="h-12 w-full rounded-sm" />
                  </li>
                ))
              ) : visibleJobs.length === 0 ? (
                <li>
                  <Empty className="rounded-none py-16">
                    <EmptyHeader>
                      <EmptyTitle>
                        {results.length === 0 &&
                        !search &&
                        kind === "all" &&
                        mode === "all"
                          ? "Todavía no hay oportunidades"
                          : "No hay coincidencias"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {canPost && results.length === 0
                          ? "Publica la primera oportunidad para activar esta bolsa laboral."
                          : "Prueba otra búsqueda o cambia los filtros."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </li>
              ) : (
                visibleJobs.map((job) => (
                  <JobRow
                    key={job._id}
                    job={job}
                    selected={selected?._id === job._id}
                    onSelect={() => selectJob(job._id)}
                  />
                ))
              )}
            </ul>
          </section>

          <aside
            id="job-detail-panel"
            aria-live="polite"
            className="sticky top-6 hidden h-fit max-h-[calc(100svh-3rem)] min-h-96 overflow-y-auto border-l border-border pt-7 pr-2 pl-8 lg:block"
          >
            {selected ? (
              <JobDetail
                job={selected}
                canClose={
                  me.role === "admin" || me._id === selected.authorUserId
                }
                closing={closingId === selected._id}
                onClose={close}
              />
            ) : (
              <div className="pt-10 text-sm leading-6 text-muted-foreground">
                Selecciona una oportunidad para revisar el detalle y la vía de
                postulación.
              </div>
            )}
          </aside>
        </div>
      </main>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[90svh] overflow-y-auto overscroll-contain rounded-t-md pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <SheetClose
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "absolute top-3 right-3 size-11 rounded-sm"
            )}
          >
            <XIcon />
            <span className="sr-only">Cerrar detalle</span>
          </SheetClose>
          <SheetHeader className="border-b border-border pr-16">
            <SheetTitle className="text-2xl">{selected?.title}</SheetTitle>
            <SheetDescription>{selected?.company}</SheetDescription>
          </SheetHeader>
          <div className="p-6 pt-5">
            {selected ? (
              <JobDetail
                job={selected}
                hideHeading
                canClose={
                  me.role === "admin" || me._id === selected.authorUserId
                }
                closing={closingId === selected._id}
                onClose={close}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
