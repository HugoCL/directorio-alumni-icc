"use client"

import { useEffect, useState } from "react"
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react"
import { RiExternalLinkLine } from "@remixicon/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import {
  AccessNotice,
  AppPage,
  PageHeader,
  Panel,
} from "@/components/app-shell"
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
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
  const me = useQuery(api.users.me)
  const syncAdmin = useAction(api.users.ensureSession)
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
    if (bootstrapped || me === undefined || isAuthLoading) return
    if (me?.role === "admin" || !isAuthenticated) {
      setBootstrapped(true)
      return
    }
    void syncAdmin({}).finally(() => setBootstrapped(true))
  }, [me, syncAdmin, bootstrapped, isAuthenticated, isAuthLoading])

  async function decide(request: Request, decision: Decision, reason?: string) {
    const rejectionReason = decision === "rejected" ? reason?.trim() : undefined
    if (decision === "rejected" && !rejectionReason) {
      toast.error("Cuéntale qué necesita corregir")
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
        decision === "approved"
          ? "Aprobada, ya le avisamos"
          : "Rechazada, ya le avisamos"
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
      <AppPage>
        <div aria-busy="true">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
          <Skeleton className="mt-8 h-64 w-full" />
        </div>
      </AppPage>
    )
  }

  if (!me || me.role !== "admin") {
    return (
      <AccessNotice
        title="Esta sección es del equipo"
        description="Aquí se revisan las solicitudes de acceso. Si crees que deberías tener permisos, escríbele a quien administra la red."
        action={{ href: "/directorio", label: "Ir al directorio" }}
      />
    )
  }

  const pendingCount = requests?.filter((r) => r.status === "pending").length

  return (
    <AppPage>
      <PageHeader
        title="Solicitudes de acceso"
        description="Confirma que cada persona tenga un vínculo real con ICC. Cuando decidas, le avisamos por correo."
        meta={
          pendingCount !== undefined ? (
            <p
              className="text-sm text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {pendingCount} por revisar
            </p>
          ) : null
        }
      />

      <Panel className="mt-8" aria-label="Solicitudes de verificación">
        {requests === undefined ? (
          <div className="p-6" aria-busy="true">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : requests.length === 0 ? (
          <Empty className="border-0 py-14">
            <EmptyHeader>
              <EmptyTitle>Todo al día</EmptyTitle>
              <EmptyDescription>
                Cuando alguien pida acceso, aparecerá acá para que lo revises.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.5fr)_7rem_8rem_7rem_14rem] gap-4 border-b border-border bg-surface px-5 py-2.5 text-xs font-medium text-muted-foreground lg:grid">
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
                    className="px-5 py-4"
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
                          Ver LinkedIn
                          <RiExternalLinkLine data-icon="inline-end" />
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
                              className="w-full sm:w-auto"
                              disabled={isBusy}
                              onClick={() => void decide(request, "approved")}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
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
                            className="w-full sm:w-auto"
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
                            <FieldLabel htmlFor={`${rejectionPanelId}-reason`}>
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
                              placeholder="Por ejemplo: no pudimos confirmar la generación, o el perfil de LinkedIn no abre."
                            />
                            <FieldDescription>
                              Esto va tal cual en el correo, así que apunta a
                              qué necesita corregir.
                            </FieldDescription>
                          </Field>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="submit"
                              variant="destructive"
                              className="w-full sm:w-auto"
                              disabled={isBusy}
                            >
                              {isBusy ? "Enviando…" : "Confirmar rechazo"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full sm:w-auto"
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
      </Panel>
    </AppPage>
  )
}
