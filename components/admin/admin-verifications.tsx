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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

  useEffect(() => {
    if (bootstrapped || me === undefined) return
    void syncAdmin({}).finally(() => setBootstrapped(true))
  }, [me, syncAdmin, bootstrapped])

  async function decide(request: Request, decision: Decision) {
    const rejectionReason =
      decision === "rejected"
        ? (request.rejectionReason ??
          window.prompt("Motivo del rechazo")?.trim())
        : undefined
    if (decision === "rejected" && !rejectionReason) return

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
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Solo administradores</AlertTitle>
            <AlertDescription>
              Asigna <code>{`{ "role": "admin" }`}</code> en el public metadata
              de Clerk y recarga.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-editorial text-4xl tracking-[-0.03em]">
          Verificaciones
        </h1>
        <div aria-hidden className="mt-3 h-0.5 w-10 bg-signal" />
        <p className="mt-3 text-sm text-muted-foreground">
          Revisa antecedentes de exalumnos y notifica el resultado por correo.
        </p>

        <div className="mt-8 overflow-x-auto border border-border">
          {requests === undefined ? (
            <div className="p-6">
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Generación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No hay solicitudes.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.email}
                        </p>
                        <a
                          href={request.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          LinkedIn <ExternalLinkIcon className="size-3" />
                        </a>
                      </TableCell>
                      <TableCell>{request.generation}</TableCell>
                      <TableCell>
                        <Badge
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
                      </TableCell>
                      <TableCell>
                        {request.notifiedAt ? "Enviado" : "Pendiente"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                disabled={busyId === request._id}
                                onClick={() => void decide(request, "approved")}
                              >
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={busyId === request._id}
                                onClick={() => void decide(request, "rejected")}
                              >
                                Rechazar
                              </Button>
                            </>
                          ) : !request.notifiedAt ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === request._id}
                              onClick={() =>
                                void decide(
                                  request,
                                  request.status === "approved"
                                    ? "approved"
                                    : "rejected"
                                )
                              }
                            >
                              Reintentar correo
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  )
}
