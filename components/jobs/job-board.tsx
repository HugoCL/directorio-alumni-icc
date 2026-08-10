"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import {
  RiArrowRightLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiCloseLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiMailLine,
  RiMapPin2Line,
  RiRemoteControlLine,
  RiSearchLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import {
  AccessNotice,
  AppPage,
  PageHeader,
  Panel,
} from "@/components/app-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
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
  const ModeIcon = job.mode === "onsite" ? RiBuilding2Line : RiRemoteControlLine

  return (
    <div className="flex flex-col gap-6">
      {!hideHeading ? (
        <div>
          <h2 className="text-2xl leading-tight font-semibold">{job.title}</h2>
          <p className="mt-1 text-muted-foreground">{job.company}</p>
        </div>
      ) : null}

      <dl className="grid gap-3 rounded-lg bg-surface px-4 py-3.5 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2.5">
          <RiBriefcaseLine aria-hidden="true" className="size-4 text-primary" />
          <div className="min-w-0">
            <dt className="sr-only">Tipo</dt>
            <dd className="truncate">{kindLabels[job.kind]}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <ModeIcon aria-hidden="true" className="size-4 text-primary" />
          <div className="min-w-0">
            <dt className="sr-only">Modalidad</dt>
            <dd className="truncate">{modeLabels[job.mode]}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <RiMapPin2Line aria-hidden="true" className="size-4 text-primary" />
          <div className="min-w-0">
            <dt className="sr-only">Ubicación</dt>
            <dd className="truncate">{job.location}</dd>
          </div>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-medium">Sobre la oportunidad</h3>
        <p className="mt-2.5 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {job.description}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        {job.applicationUrl ? (
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants(), "sm:flex-1")}
          >
            Postular
            <RiExternalLinkLine data-icon="inline-end" />
          </a>
        ) : null}
        {job.contactEmail ? (
          <a
            href={`mailto:${job.contactEmail}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "sm:min-w-max sm:flex-1"
            )}
          >
            <RiMailLine data-icon="inline-start" />
            Escribir al contacto
          </a>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        Compartida por{" "}
        <span className="font-medium text-foreground">{job.authorName}</span> el{" "}
        {dateFormatter.format(job._creationTime)}.
      </p>

      {canClose ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start text-muted-foreground"
          disabled={closing}
          onClick={() => onClose(job._id)}
        >
          {closing ? (
            <RiLoader4Line data-icon="inline-start" className="animate-spin" />
          ) : null}
          {closing ? "Cerrando…" : "Ya no está vigente"}
        </Button>
      ) : null}
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
      toast.success("Listo, ya está en el tablero")
      onPublished(jobId)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos publicarla. Vuelve a intentarlo en un momento."
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Panel className="mt-6 p-6">
      <form id="publish-job" onSubmit={publish}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Comparte una oportunidad</h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Con el cargo, dónde es y cómo postular basta. Si puedes contar
              algo más del equipo, mejor.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mt-1 -mr-2 shrink-0"
            onClick={onCancel}
            aria-label="Cerrar formulario"
          >
            <RiCloseLine />
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-5">
            <AlertTitle>No se pudo publicar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="job-title">Cargo</FieldLabel>
              <Input
                id="job-title"
                name="title"
                autoFocus
                required
                minLength={3}
                maxLength={120}
                placeholder="Frontend Engineer"
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
                placeholder="Buk"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="job-kind">Tipo</FieldLabel>
              <Select name="kind" items={formKindItems} defaultValue="job">
                <SelectTrigger id="job-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {formKindItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
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
                <SelectTrigger id="job-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {formModeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="job-location">Ubicación</FieldLabel>
              <Input
                id="job-location"
                name="location"
                required
                minLength={2}
                maxLength={120}
                placeholder="Santiago"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="job-description">Descripción</FieldLabel>
            <Textarea
              id="job-description"
              name="description"
              required
              minLength={20}
              maxLength={3000}
              rows={6}
              placeholder="Qué hace el equipo, qué buscan y cualquier dato que ayude a decidir si postular."
              className="min-h-36"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={applicationInvalid || undefined}>
              <FieldLabel htmlFor="job-url">Enlace para postular</FieldLabel>
              <Input
                id="job-url"
                name="applicationUrl"
                type="url"
                maxLength={2048}
                placeholder="https://…"
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
                aria-invalid={applicationInvalid}
                onChange={() => setApplicationInvalid(false)}
              />
            </Field>
          </div>
          {applicationInvalid ? (
            <FieldError>
              Deja al menos una vía para postular: un enlace o un correo.
            </FieldError>
          ) : null}
        </FieldGroup>

        <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={publishing}>
            {publishing ? (
              <RiLoader4Line
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            {publishing ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </form>
    </Panel>
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
  const [closingId, setClosingId] = useState<Id<"jobs"> | null>(null)
  const [pendingClose, setPendingClose] = useState<Id<"jobs"> | null>(null)

  const queryArgs = useMemo(
    () => ({ kind: kind === "all" ? undefined : kind }),
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
  const hasActiveFilters = Boolean(search) || kind !== "all" || mode !== "all"

  function selectJob(jobId: Id<"jobs">) {
    setSelectedId(jobId)
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setMobileOpen(true)
    }
  }

  async function confirmClose() {
    const jobId = pendingClose
    setPendingClose(null)
    if (!jobId) return

    setClosingId(jobId)
    try {
      await closeJob({ jobId })
      setMobileOpen(false)
      setSelectedId(null)
      toast.success("La quitamos del tablero")
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "No pudimos cerrarla. Vuelve a intentarlo."
      )
    } finally {
      setClosingId(null)
    }
  }

  if (me === undefined) {
    return (
      <AppPage width="wide">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        <Skeleton className="mt-8 h-12 w-full" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.9fr)]">
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
        description="El tablero es solo para estudiantes y alumni de ICC. Confirma tu vínculo con la carrera y te abrimos la puerta."
        action={{ href: "/verificacion", label: "Confirmar mi acceso" }}
      />
    )
  }

  const resultCount = results
    ? `${visibleJobs.length} ${visibleJobs.length === 1 ? "oportunidad" : "oportunidades"}`
    : "Cargando…"

  return (
    <>
      <AppPage width="wide">
        <PageHeader
          title="Oportunidades"
          description="Empleos y prácticas que alguien de ICC quiso pasarle a la red."
          meta={
            <p
              className="hidden text-sm text-muted-foreground tabular-nums sm:block"
              aria-live="polite"
            >
              {resultCount}
            </p>
          }
          actions={
            canPost ? (
              <Button
                type="button"
                variant={formOpen ? "outline" : "default"}
                aria-expanded={formOpen}
                aria-controls="publish-job"
                onClick={() => setFormOpen((open) => !open)}
              >
                {formOpen ? "Cerrar" : "Publicar oportunidad"}
              </Button>
            ) : null
          }
        />

        {formOpen && canPost ? (
          <JobForm
            onCancel={() => setFormOpen(false)}
            onPublished={(jobId) => {
              setSelectedId(jobId)
              setFormOpen(false)
            }}
          />
        ) : null}

        <div
          role="search"
          className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_15rem]"
        >
          <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <RiSearchLine
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cargo o empresa"
              className="pl-10"
              aria-label="Buscar cargo o empresa"
            />
          </div>
          <Select
            items={kindItems}
            value={kind}
            onValueChange={(value) =>
              setKind((value ?? "all") as "all" | JobKind)
            }
          >
            <SelectTrigger className="w-full" aria-label="Filtrar por tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {kindItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
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
              className="w-full"
              aria-label="Filtrar por modalidad"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {modeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div
          className={cn(
            "mt-6 grid min-w-0 items-start gap-8",
            selected && "lg:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.9fr)]"
          )}
        >
          <section className="min-w-0" aria-label="Oportunidades">
            <Panel>
              <div
                className={cn(
                  "hidden grid-cols-[minmax(0,1fr)_7rem_7rem_9rem_2rem] gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs font-medium text-muted-foreground",
                  visibleJobs.length > 0 && "lg:grid"
                )}
              >
                <span>Cargo y empresa</span>
                <span>Tipo</span>
                <span>Modalidad</span>
                <span>Ubicación</span>
                <span className="sr-only">Abrir</span>
              </div>
              <ul className="divide-y divide-border">
                {results === undefined ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className="px-5 py-4">
                      <Skeleton className="h-12 w-full" />
                    </li>
                  ))
                ) : visibleJobs.length === 0 ? (
                  <li>
                    <Empty className="border-0 py-20">
                      <EmptyHeader>
                        <EmptyTitle>
                          {hasActiveFilters
                            ? "Nada coincide con esos filtros"
                            : "Todavía no hay oportunidades"}
                        </EmptyTitle>
                        <EmptyDescription>
                          {hasActiveFilters
                            ? "Prueba con otro cargo, empresa o modalidad."
                            : canPost
                              ? "Publica la primera y la verá toda la red."
                              : "Cuando alguien publique algo, aparecerá acá."}
                        </EmptyDescription>
                      </EmptyHeader>
                      {!hasActiveFilters && canPost && !formOpen ? (
                        <EmptyContent>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormOpen(true)}
                          >
                            Compartir una oportunidad
                          </Button>
                        </EmptyContent>
                      ) : null}
                    </Empty>
                  </li>
                ) : (
                  visibleJobs.map((job) => {
                    const isSelected = selected?._id === job._id
                    return (
                      <li key={job._id}>
                        <button
                          type="button"
                          aria-current={isSelected ? "true" : undefined}
                          aria-controls="job-detail-panel"
                          className={cn(
                            "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors duration-150 outline-none hover:bg-surface focus-visible:bg-surface lg:grid-cols-[minmax(0,1fr)_7rem_7rem_9rem_2rem]",
                            isSelected && "bg-accent hover:bg-accent"
                          )}
                          onClick={() => selectJob(job._id)}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{job.title}</p>
                            <p className="truncate text-sm text-muted-foreground">
                              {job.company}
                            </p>
                          </div>
                          <span className="col-start-1 text-sm text-muted-foreground lg:col-start-auto">
                            {kindLabels[job.kind]}
                            <span className="lg:hidden">
                              {" · "}
                              {modeLabels[job.mode]}
                              {" · "}
                              {job.location}
                            </span>
                          </span>
                          <span className="hidden text-sm text-muted-foreground lg:block">
                            {modeLabels[job.mode]}
                          </span>
                          <span className="hidden truncate text-sm text-muted-foreground lg:block">
                            {job.location}
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
          </section>

          {selected ? (
            <aside
              id="job-detail-panel"
              aria-live="polite"
              className="sticky top-24 hidden lg:block"
            >
              <Panel className="max-h-[calc(100svh-8rem)] overflow-y-auto p-6">
                <JobDetail
                  job={selected}
                  canClose={
                    me.role === "admin" || me._id === selected.authorUserId
                  }
                  closing={closingId === selected._id}
                  onClose={setPendingClose}
                />
              </Panel>
            </aside>
          ) : null}
        </div>
      </AppPage>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[90svh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <SheetClose
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "absolute top-3.5 right-4"
            )}
          >
            <RiCloseLine />
            <span className="sr-only">Cerrar detalle</span>
          </SheetClose>
          <SheetHeader className="pr-14">
            <SheetTitle className="text-xl">{selected?.title}</SheetTitle>
            <SheetDescription>{selected?.company}</SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            {selected ? (
              <JobDetail
                job={selected}
                hideHeading
                canClose={
                  me.role === "admin" || me._id === selected.authorUserId
                }
                closing={closingId === selected._id}
                onClose={setPendingClose}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={pendingClose !== null}
        onOpenChange={(open) => {
          if (!open) setPendingClose(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitarla del tablero?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejará de aparecer para el resto de la red. Siempre puedes
              publicarla de nuevo más adelante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mejor no</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>
              Sí, quitarla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
