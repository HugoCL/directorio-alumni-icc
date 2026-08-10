"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { GENERATIONS } from "@/lib/taxonomy"
import { AppPage, Panel } from "@/components/app-shell"
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
      toast.success("Recibimos tus datos")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar tus datos. Vuelve a intentarlo en un momento."
      )
    } finally {
      setSaving(false)
    }
  }

  if (!bootstrapped || me === undefined || request === undefined) {
    return (
      <AppPage width="narrow">
        <div aria-busy="true">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="mt-4 h-12 w-full" />
          <Skeleton className="mt-8 h-64 w-full" />
        </div>
      </AppPage>
    )
  }

  if (me) return null

  return (
    <AppPage width="narrow" className="sm:py-16">
      <h1 className="text-3xl leading-tight font-semibold text-balance sm:text-4xl">
        Una comprobación rápida y estás dentro
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Si todavía usas tu correo @alumnos.utalca.cl, entras al tiro. Si ya
        egresaste, cuéntanos quién eres y lo revisamos a mano.
      </p>

      {request?.status === "approved" ? (
        <Alert className="mt-8">
          <AlertTitle>Ya estás dentro</AlertTitle>
          <AlertDescription>Te estamos llevando a tu perfil…</AlertDescription>
        </Alert>
      ) : request?.status === "pending" ? (
        <Alert className="mt-8">
          <AlertTitle>Estamos revisando tus datos</AlertTitle>
          <AlertDescription>
            Ya los tenemos. Te escribimos a {request.email} apenas terminemos.
          </AlertDescription>
        </Alert>
      ) : request?.status === "rejected" && !request.notifiedAt ? (
        <Alert className="mt-8">
          <AlertTitle>Necesitamos revisar algo</AlertTitle>
          <AlertDescription>
            {request.rejectionReason}. Te enviaremos el detalle y podrás
            corregirlo y volver a enviarlo.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {request?.status === "rejected" ? (
            <Alert className="mt-8">
              <AlertTitle>Falta corregir algo</AlertTitle>
              <AlertDescription>
                {request.rejectionReason}. Ajusta los datos y vuelve a
                enviarlos.
              </AlertDescription>
            </Alert>
          ) : null}

          <Panel className="mt-8 p-6 sm:p-7">
            <form onSubmit={onSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="verification-name">
                    Nombre completo
                  </FieldLabel>
                  <Input
                    id="verification-name"
                    autoComplete="name"
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
                    autoComplete="url"
                    required
                    placeholder="https://www.linkedin.com/in/tu-perfil"
                    value={linkedinUrl}
                    onChange={(event) => setLinkedinUrl(event.target.value)}
                  />
                  <FieldDescription>
                    Solo lo usamos para confirmar tu paso por ICC.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                className="mt-7 w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? "Enviando…" : request ? "Reenviar" : "Enviar"}
              </Button>
            </form>
          </Panel>
        </>
      )}
    </AppPage>
  )
}
