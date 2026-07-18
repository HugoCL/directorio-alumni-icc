"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { GENERATIONS } from "@/lib/taxonomy"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
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
import { Skeleton } from "@/components/ui/skeleton"

export default function VerificationPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const me = useQuery(api.users.me)
  const request = useQuery(api.verifications.mine)
  const ensureSession = useMutation(api.users.ensureSession)
  const submit = useMutation(api.verifications.submit)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [name, setName] = useState("")
  const [generation, setGeneration] = useState(GENERATIONS.at(-1)!)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [hydratedRequestId, setHydratedRequestId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!isLoaded || !user || bootstrapped) return
    void ensureSession({}).finally(() => setBootstrapped(true))
  }, [isLoaded, user, bootstrapped, ensureSession])

  useEffect(() => {
    if (!request || hydratedRequestId === request._id) return
    setName(request.name)
    setGeneration(request.generation)
    setLinkedinUrl(request.linkedinUrl)
    setHydratedRequestId(request._id)
  }, [request, hydratedRequestId])

  useEffect(() => {
    if (!me) return
    router.replace(me.role === "alumni" ? "/perfil" : "/directorio")
  }, [me, router])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await submit({ name, generation, linkedinUrl })
      toast.success("Solicitud enviada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar")
    } finally {
      setSaving(false)
    }
  }

  if (!bootstrapped || me === undefined || request === undefined) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </div>
    )
  }

  if (me) return null

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Verificación
        </p>
        <h1 className="font-editorial mt-3 text-4xl tracking-[-0.03em]">
          Confirma que eres parte de ICC
        </h1>
        <div aria-hidden className="mt-3 h-0.5 w-10 bg-signal" />
        <p className="mt-3 text-muted-foreground">
          Los correos @alumnos.utalca.cl se aprueban automáticamente. Si eres
          exalumno, revisaremos estos antecedentes.
        </p>

        {request?.status === "approved" ? (
          <Alert className="mt-8">
            <AlertTitle>Cuenta aprobada</AlertTitle>
            <AlertDescription>Preparando tu acceso…</AlertDescription>
          </Alert>
        ) : request?.status === "pending" ? (
          <Alert className="mt-8">
            <AlertTitle>Solicitud en revisión</AlertTitle>
            <AlertDescription>
              Te enviaremos el resultado a {request.email}.
            </AlertDescription>
          </Alert>
        ) : request?.status === "rejected" && !request.notifiedAt ? (
          <Alert variant="destructive" className="mt-8">
            <AlertTitle>Solicitud rechazada</AlertTitle>
            <AlertDescription>
              {request.rejectionReason}. Estamos enviando el resultado; podrás
              corregir y reenviar la solicitud después.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {request?.status === "rejected" ? (
              <Alert variant="destructive" className="mt-8">
                <AlertTitle>Solicitud rechazada</AlertTitle>
                <AlertDescription>
                  {request.rejectionReason}. Puedes corregir los datos y
                  reenviarla.
                </AlertDescription>
              </Alert>
            ) : null}

            <form
              onSubmit={onSubmit}
              className="mt-8 border border-border bg-card p-6 shadow-[6px_6px_0_0_var(--border)]"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="verification-name">
                    Nombre completo
                  </FieldLabel>
                  <Input
                    id="verification-name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="verification-generation">
                    Generación
                  </FieldLabel>
                  <Select
                    value={generation}
                    onValueChange={(value) => value && setGeneration(value)}
                  >
                    <SelectTrigger
                      id="verification-generation"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {GENERATIONS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="verification-linkedin">
                    LinkedIn
                  </FieldLabel>
                  <Input
                    id="verification-linkedin"
                    type="url"
                    required
                    placeholder="https://www.linkedin.com/in/tu-perfil"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                  />
                  <FieldDescription>
                    Lo usaremos únicamente para validar tu vínculo con ICC.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button type="submit" className="mt-6" disabled={saving}>
                {saving
                  ? "Enviando…"
                  : request
                    ? "Reenviar solicitud"
                    : "Solicitar revisión"}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
