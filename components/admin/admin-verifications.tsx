"use client"

import { useEffect, useState } from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import { ExternalLinkIcon } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

type Decision = "approved" | "rejected"
type Request = Doc<"verificationRequests">

export function AdminVerifications() {
  const me = useQuery(api.users.me)
  const syncAdmin = useMutation(api.users.syncAdminRole)
  const requests = useQuery(
    api.verifications.list,
    me?.role === "admin" ? {} : "skip"
  )
  const review = useAction(api.verifications.review)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [busyId, setBusyId] = useState<Id<"verificationRequests"> | null>(null)
  const [rejectingId, setRejectingId] =
    useState<Id<"verificationRequests"> | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (bootstrapped || me === undefined) return
    void syncAdmin({}).finally(() => setBootstrapped(true))
  }, [me, syncAdmin, bootstrapped])

  async function decide(request: Request, decision: Decision, reason?: string) {
    const rejectionReason = decision === "rejected" ? reason?.trim() : undefined
    if (decision === "rejected" && !rejectionReason) {
      toast.error("Indica el motivo del rechazo")
      return
    }

    setBusyId(request._id)
    try {
      await review({
        requestId: request._id,
        decision,
        rejectionReason,
        expectedUpdatedAt: request.updatedAt,
      })
      toast.success(
        decision === "approved" ? "Solicitud aprobada" : "Solicitud rechazada"
      )
      setRejectingId(null)
      setRejectionReason("")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `${error.message}. Si la decisión quedó guardada, reintenta el correo.`
          : "No se pudo revisar"
      )
    } finally {
      setBusyId(null)
    }
  }

  if (me === undefined || !bootstrapped) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main
          id="main-content"
          aria-busy="true"
          className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
        >
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
          <Skeleton className="mt-8 h-64 w-full" />
        </main>
      </div>
    )
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Solo administradores</AlertTitle>
            <AlertDescription>
              Asigna <code>{`{ "role": "admin" }`}</code> en el public metadata
              de Clerk y recarga.
            </AlertDescription>
          </Alert>
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
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Verificaciones
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Revisa antecedentes de exalumnos y notifica el resultado por correo.
        </p>

        <section
          aria-label="Solicitudes de verificación"
          className="mt-8 border-y border-border"
        >
          {requests === undefined ? (
            <div className="py-6" aria-busy="true">
              <Skeleton className="h-40 w-full" />
            </div>
          ) : requests.length === 0 ? (
            <Empty className="rounded-none border-0 py-14">
              <EmptyHeader>
                <EmptyTitle>Sin solicitudes pendientes</EmptyTitle>
                <EmptyDescription>
                  Las nuevas solicitudes de alumni aparecerán aquí.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(0,1.5fr)_7rem_8rem_7rem_14rem] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-sm font-medium lg:grid">
                <span>Solicitante</span>
                <span>Generación</span>
                <span>Estado</span>
                <span>Correo</span>
                <span className="text-right">Acciones</span>
              </div>
              <ul className="divide-y divide-border">
                {requests.map((request) => {
                  const isBusy = busyId === request._id
                  const rejectionPanelId = `rejection-${request._id}`

                  return (
                    <li
                      key={request._id}
                      aria-busy={isBusy}
                      className="px-1 py-5 sm:px-4"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_7rem_8rem_7rem_14rem] lg:items-center">
                        <div className="min-w-0">
                          <p className="font-medium">{request.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {request.email}
                          </p>
                          <a
                            href={request.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={buttonVariants({
                              variant: "link",
                              size: "sm",
                              className: "mt-1 h-auto px-0",
                            })}
                          >
                            LinkedIn
                            <ExternalLinkIcon data-icon="inline-end" />
                          </a>
                        </div>
                        <div className="flex items-center justify-between gap-3 lg:block">
                          <span
                            aria-hidden="true"
                            className="text-sm text-muted-foreground lg:hidden"
                          >
                            Generación
                          </span>
                          <span
                            className="text-sm"
                            aria-label={`Generación ${request.generation}`}
                          >
                            {request.generation}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 lg:block">
                          <span
                            aria-hidden="true"
                            className="text-sm text-muted-foreground lg:hidden"
                          >
                            Estado
                          </span>
                          <Badge
                            aria-label={`Estado ${
                              request.status === "pending"
                                ? "pendiente"
                                : request.status === "approved"
                                  ? "aprobada"
                                  : "rechazada"
                            }`}
                            variant={
                              request.status === "pending"
                                ? "secondary"
                                : request.status === "approved"
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {request.status === "pending"
                              ? "Pendiente"
                              : request.status === "approved"
                                ? "Aprobada"
                                : "Rechazada"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-3 lg:block">
                          <span
                            aria-hidden="true"
                            className="text-sm text-muted-foreground lg:hidden"
                          >
                            Correo
                          </span>
                          <span
                            className="text-sm"
                            aria-label={`Correo ${
                              request.notifiedAt ? "enviado" : "pendiente"
                            }`}
                          >
                            {request.notifiedAt ? "Enviado" : "Pendiente"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                          {request.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                className="h-11 w-full sm:w-auto lg:h-7"
                                disabled={isBusy}
                                onClick={() => void decide(request, "approved")}
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-11 w-full sm:w-auto lg:h-7"
                                aria-expanded={rejectingId === request._id}
                                aria-controls={rejectionPanelId}
                                disabled={isBusy}
                                onClick={() => {
                                  setRejectingId(request._id)
                                  setRejectionReason("")
                                }}
                              >
                                Rechazar
                              </Button>
                            </>
                          ) : !request.notifiedAt ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-11 w-full sm:w-auto lg:h-7"
                              disabled={isBusy}
                              onClick={() =>
                                void decide(
                                  request,
                                  request.status === "approved"
                                    ? "approved"
                                    : "rejected",
                                  request.rejectionReason
                                )
                              }
                            >
                              Reintentar correo
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {request.status === "pending" &&
                      rejectingId === request._id ? (
                        <form
                          id={rejectionPanelId}
                          className="mt-5 border-t border-border pt-5"
                          onSubmit={(event) => {
                            event.preventDefault()
                            void decide(request, "rejected", rejectionReason)
                          }}
                        >
                          <FieldGroup className="gap-4">
                            <Field>
                              <FieldLabel
                                htmlFor={`${rejectionPanelId}-reason`}
                              >
                                Motivo del rechazo
                              </FieldLabel>
                              <Textarea
                                id={`${rejectionPanelId}-reason`}
                                autoFocus
                                required
                                value={rejectionReason}
                                onChange={(event) =>
                                  setRejectionReason(event.target.value)
                                }
                                placeholder="Explica qué antecedente debe corregir."
                              />
                              <FieldDescription>
                                Este texto se incluirá en el correo al
                                solicitante.
                              </FieldDescription>
                            </Field>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                type="submit"
                                variant="destructive"
                                className="h-11 w-full sm:w-auto lg:h-8"
                                disabled={isBusy}
                              >
                                {isBusy ? "Enviando…" : "Confirmar rechazo"}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="h-11 w-full sm:w-auto lg:h-8"
                                disabled={isBusy}
                                onClick={() => {
                                  setRejectingId(null)
                                  setRejectionReason("")
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </FieldGroup>
                        </form>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
