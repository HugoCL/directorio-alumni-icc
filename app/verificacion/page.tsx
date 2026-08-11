"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import * as Sentry from "@sentry/nextjs"
import { useAction, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { isStudentEmail } from "@/convex/lib/verification"
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
  const ensureSession = useAction(api.users.ensureSession)
  const submit = useAction(api.verifications.submit)
  const [name, setName] = useState("")
  const [generation, setGeneration] = useState(GENERATIONS.at(-1)!)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [hydratedRequestId, setHydratedRequestId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!request || hydratedRequestId === request._id) return
    setName(request.name)
    setGeneration(request.generation)
    setLinkedinUrl(request.linkedinUrl)
    setHydratedRequestId(request._id)
  }, [request, hydratedRequestId])

  useEffect(() => {
    if (!me || me.role === "student") return
    router.replace(me.role === "alumni" ? "/perfil" : "/directorio")
  }, [me, router])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await submit({ name, generation, linkedinUrl })
      toast.success("Recibimos tus datos")
    } catch (error) {
      Sentry.captureException(error)
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar tus datos. Vuelve a intentarlo en un momento."
      )
    } finally {
      setSaving(false)
    }
  }

  const institutionalEmail = user?.emailAddresses.find((email) =>
    isStudentEmail(email.emailAddress)
  )

  async function activateInstitutionalEmail() {
    if (!user || !institutionalEmail) return
    if (user.primaryEmailAddressId !== institutionalEmail.id) {
      await user.update({ primaryEmailAddressId: institutionalEmail.id })
    }
    await user.reload()
    await ensureSession({})
    window.location.reload()
  }

  async function refreshInstitutionalAccess() {
    setVerifyingEmail(true)
    try {
      await activateInstitutionalEmail()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos actualizar tu acceso. Vuelve a intentarlo."
      )
      setVerifyingEmail(false)
    }
  }

  async function sendVerificationCode() {
    if (!institutionalEmail) return
    setVerifyingEmail(true)
    try {
      await institutionalEmail.prepareVerification({ strategy: "email_code" })
      setVerificationSent(true)
      toast.success(`Enviamos un código a ${institutionalEmail.emailAddress}`)
    } catch (error) {
      Sentry.captureException(error)
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos enviar el código. Vuelve a intentarlo."
      )
    } finally {
      setVerifyingEmail(false)
    }
  }

  async function verifyInstitutionalEmail(event: React.FormEvent) {
    event.preventDefault()
    if (!institutionalEmail) return
    setVerifyingEmail(true)
    try {
      const verified = await institutionalEmail.attemptVerification({
        code: verificationCode,
      })
      if (verified.verification.status !== "verified") {
        throw new Error("El código no es válido")
      }
      await activateInstitutionalEmail()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos verificar el correo. Vuelve a intentarlo."
      )
      setVerifyingEmail(false)
    }
  }

  if (!isLoaded || me === undefined || request === undefined) {
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

  if (me && me.role !== "student") return null

  const requestingAlumniRole = me?.role === "student"

  return (
    <AppPage width="narrow" className="sm:py-16">
      <h1 className="text-3xl leading-tight font-semibold text-balance sm:text-4xl">
        {requestingAlumniRole
          ? "Solicita tu cambio a alumni"
          : "Una comprobación rápida y estás dentro"}
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        {requestingAlumniRole
          ? "Si ya egresaste, cuéntanos quién eres y cambiaremos tu cuenta de estudiante a alumni después de revisarla."
          : "Si todavía usas tu correo @alumnos.utalca.cl, tu cuenta se verifica automáticamente. Si ya egresaste, cuéntanos quién eres y lo revisamos a mano."}
      </p>

      {institutionalEmail && !requestingAlumniRole ? (
        <Panel className="mt-8 p-6 sm:p-7">
          <h2 className="font-semibold">Verifica tu correo institucional</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {institutionalEmail.emailAddress}
          </p>
          {institutionalEmail.verification.status === "verified" ? (
            <Button
              type="button"
              className="mt-5"
              disabled={verifyingEmail}
              onClick={() => void refreshInstitutionalAccess()}
            >
              {verifyingEmail ? "Actualizando…" : "Actualizar mi verificación"}
            </Button>
          ) : verificationSent ? (
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={verifyInstitutionalEmail}
            >
              <Field className="flex-1">
                <FieldLabel htmlFor="institutional-email-code">
                  Código de verificación
                </FieldLabel>
                <Input
                  id="institutional-email-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                />
              </Field>
              <Button
                type="submit"
                className="self-end"
                disabled={verifyingEmail}
              >
                {verifyingEmail ? "Verificando…" : "Verificar"}
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              className="mt-5"
              disabled={verifyingEmail}
              onClick={() => void sendVerificationCode()}
            >
              {verifyingEmail ? "Enviando…" : "Enviar código de verificación"}
            </Button>
          )}
        </Panel>
      ) : null}

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
