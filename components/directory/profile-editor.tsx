"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { AREAS, GENERATIONS, type Area } from "@/lib/taxonomy"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

type FormState = {
  fullName: string
  generation: string
  area: Area
  title: string
  company: string
  location: string
  helpWith: string
  contactEmail: string
  linkedinUrl: string
  phone: string
  photoUrl: string
  featuredOnLanding: boolean
  published: boolean
}

const emptyForm: FormState = {
  fullName: "",
  generation: GENERATIONS[GENERATIONS.length - 1]!,
  area: "Software",
  title: "",
  company: "",
  location: "",
  helpWith: "",
  contactEmail: "",
  linkedinUrl: "",
  phone: "",
  photoUrl: "",
  featuredOnLanding: false,
  published: true,
}

const acceptedPhotoTypes = ["image/jpeg", "image/png", "image/webp"]
const maxPhotoSize = 4 * 1024 * 1024

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

async function deletePhoto(url: string, token: string) {
  const response = await fetch("/api/profile-photo", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })
  if (!response.ok) throw new Error("No se pudo eliminar la foto anterior")
}

export function ProfileEditor() {
  const { getToken, sessionClaims } = useAuth()
  const me = useQuery(api.users.me)
  const canEdit = me?.role === "alumni" || me?.role === "admin"
  const profile = useQuery(api.profiles.getMine, canEdit ? {} : "skip")
  const upsert = useMutation(api.profiles.upsertMine)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (hydrated || profile === undefined) return
    if (profile) {
      setForm({
        fullName: profile.fullName,
        generation: profile.generation,
        area: profile.area,
        title: profile.title,
        company: profile.company,
        location: profile.location,
        helpWith: profile.helpWith,
        contactEmail: profile.contactEmail,
        linkedinUrl: profile.linkedinUrl ?? "",
        phone: profile.phone ?? "",
        photoUrl: profile.photoUrl ?? "",
        featuredOnLanding: profile.featuredOnLanding ?? false,
        published: profile.published,
      })
    } else if (me) {
      setForm((prev) => ({
        ...prev,
        fullName: me.name,
        contactEmail: me.email,
      }))
    }
    setHydrated(true)
  }, [profile, me, hydrated])

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function validate(): boolean {
    const next: typeof errors = {}
    if (form.fullName.trim().length < 2)
      next.fullName = "Nombre demasiado corto"
    if (!form.title.trim()) next.title = "Cuéntanos cuál es tu cargo o rol"
    if (!form.company.trim()) next.company = "Indica dónde trabajas hoy"
    if (!form.location.trim()) next.location = "Indica tu ciudad o país"
    if (form.helpWith.trim().length < 10) {
      next.helpWith = "Cuéntanos un poco más para que sepan cuándo contactarte"
    }
    if (!form.contactEmail.includes("@")) {
      next.contactEmail = "Correo inválido"
    }
    if (form.featuredOnLanding && !form.photoUrl && !photoFile) {
      next.photoUrl = "Agrega una foto para aparecer en la portada"
    }
    setErrors(next)
    const firstError = Object.keys(next)[0]
    if (firstError) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(firstError === "photoUrl" ? "photo" : firstError)
          ?.focus()
      })
      return false
    }
    return true
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error("Hay algunos datos por completar")
      return
    }
    setSaving(true)
    let uploadedPhotoUrl: string | undefined
    let authToken: string | null = null
    const previousPhotoUrl = profile?.photoUrl
    try {
      authToken =
        sessionClaims?.aud === "convex"
          ? await getToken()
          : await getToken({ template: "convex" })
      if (!authToken) throw new Error("No autenticado")

      let photoUrl = form.photoUrl || undefined
      if (photoFile) {
        const response = await fetch("/api/profile-photo", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": photoFile.type,
          },
          body: photoFile,
        })
        const result = (await response.json()) as {
          url?: string
          error?: string
        }
        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "No se pudo subir la foto")
        }
        uploadedPhotoUrl = result.url
        photoUrl = result.url
      }

      await upsert({
        fullName: form.fullName,
        generation: form.generation,
        area: form.area,
        title: form.title,
        company: form.company,
        location: form.location,
        helpWith: form.helpWith,
        contactEmail: form.contactEmail,
        linkedinUrl: form.linkedinUrl || undefined,
        phone: form.phone || undefined,
        photoUrl,
        featuredOnLanding: form.featuredOnLanding,
        published: form.published,
      })
      setForm((current) => ({ ...current, photoUrl: photoUrl ?? "" }))
      setPhotoFile(null)
      setPhotoPreview(null)
      if (previousPhotoUrl && previousPhotoUrl !== photoUrl) {
        void deletePhoto(previousPhotoUrl, authToken).catch(() =>
          toast.warning(
            "El perfil se guardó, pero no pudimos limpiar la foto anterior"
          )
        )
      }
      toast.success(form.published ? "Perfil publicado" : "Perfil guardado")
    } catch (error) {
      if (uploadedPhotoUrl && authToken) {
        void deletePhoto(uploadedPhotoUrl, authToken).catch(() => {})
      }
      toast.error(error instanceof Error ? error.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!acceptedPhotoTypes.includes(file.type)) {
      setPhotoFile(null)
      setPhotoPreview(null)
      setErrors((current) => ({
        ...current,
        photoUrl: "Usa una imagen JPG, PNG o WebP",
      }))
      event.target.value = ""
      return
    }
    if (file.size > maxPhotoSize) {
      setPhotoFile(null)
      setPhotoPreview(null)
      setErrors((current) => ({
        ...current,
        photoUrl: "La imagen debe pesar menos de 4 MB",
      }))
      event.target.value = ""
      return
    }
    setErrors((current) => ({ ...current, photoUrl: undefined }))
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoInputRef.current) photoInputRef.current.value = ""
    setErrors((current) => ({ ...current, photoUrl: undefined }))
    setForm((current) => ({
      ...current,
      photoUrl: "",
      featuredOnLanding: false,
    }))
  }

  if (me === undefined || (canEdit && profile === undefined)) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12"
        >
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-6 h-96 w-full" />
        </main>
      </div>
    )
  }

  if (!me) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Esta parte de la red es privada</AlertTitle>
            <AlertDescription>
              Confirma tu vínculo con ICC antes de crear o editar tu perfil.
            </AlertDescription>
            <div className="mt-4">
              <Link href="/verificacion" className={buttonVariants()}>
                Verificar mi acceso
              </Link>
            </div>
          </Alert>
        </main>
      </div>
    )
  }

  if (me.role === "student") {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <main id="main-content" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Tu cuenta no publica un perfil</AlertTitle>
            <AlertDescription>
              Puedes explorar el directorio y las oportunidades. Los perfiles
              personales están disponibles para alumni verificados.
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
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12"
      >
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Mi perfil
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Cuenta en qué estás hoy y en qué temas te gustaría dar una mano.
            </p>
          </div>
          <Link
            href="/directorio"
            className={buttonVariants({ variant: "outline" })}
          >
            Ver directorio
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_minmax(0,44rem)] lg:items-start lg:gap-16">
          <aside className="border-y border-border py-6 lg:sticky lg:top-24">
            <p className="text-sm font-semibold text-primary">
              Así te verá la red
            </p>
            <div className="mt-5 flex items-center gap-4">
              <Avatar className="size-16">
                {photoPreview || form.photoUrl ? (
                  <AvatarImage
                    src={photoPreview ?? form.photoUrl}
                    alt={`Foto de ${form.fullName || "perfil"}`}
                  />
                ) : null}
                <AvatarFallback>
                  {initials(form.fullName) || "ICC"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {form.fullName || "Tu nombre"}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {form.title || "Tu cargo"}
                </p>
              </div>
            </div>
            <dl className="mt-6 border-t border-border text-sm">
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Directorio</dt>
                <dd className="font-medium">
                  {form.published ? "Visible" : "Oculto"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-3">
                <dt className="text-muted-foreground">Portada</dt>
                <dd className="font-medium">
                  {form.featuredOnLanding ? "Autorizada" : "No autorizada"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">Acceso</dt>
                <dd className="text-right font-medium">Solo la red</dd>
              </div>
            </dl>
          </aside>

          <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-10">
            <FieldSet className="border-t border-border pt-7">
              <FieldLegend>Sobre ti</FieldLegend>
              <FieldGroup>
                <Field data-invalid={!!errors.fullName || undefined}>
                  <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    aria-invalid={!!errors.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                  />
                  {errors.fullName ? (
                    <FieldError>{errors.fullName}</FieldError>
                  ) : null}
                </Field>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="generation">Generación</FieldLabel>
                    <Select
                      value={form.generation}
                      onValueChange={(value) => {
                        if (value) setForm((f) => ({ ...f, generation: value }))
                      }}
                    >
                      <SelectTrigger id="generation" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {GENERATIONS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="area">Área</FieldLabel>
                    <Select
                      value={form.area}
                      onValueChange={(value) => {
                        if (value)
                          setForm((f) => ({ ...f, area: value as Area }))
                      }}
                    >
                      <SelectTrigger id="area" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {AREAS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet className="border-t border-border pt-7">
              <FieldLegend>Foto</FieldLegend>
              <FieldGroup>
                <Field data-invalid={!!errors.photoUrl || undefined}>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-20">
                      {photoPreview || form.photoUrl ? (
                        <AvatarImage
                          src={photoPreview ?? form.photoUrl}
                          alt={`Foto de ${form.fullName || "perfil"}`}
                        />
                      ) : null}
                      <AvatarFallback>
                        {initials(form.fullName) || "ICC"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <FieldLabel htmlFor="photo">Foto de perfil</FieldLabel>
                      <Input
                        ref={photoInputRef}
                        id="photo"
                        type="file"
                        accept={acceptedPhotoTypes.join(",")}
                        aria-invalid={!!errors.photoUrl}
                        onChange={onPhotoChange}
                      />
                    </div>
                  </div>
                  {errors.photoUrl ? (
                    <FieldError>{errors.photoUrl}</FieldError>
                  ) : (
                    <FieldDescription>
                      JPG, PNG o WebP, máximo 4 MB. La foto se almacena en una
                      URL pública no adivinable.
                    </FieldDescription>
                  )}
                  {photoPreview || form.photoUrl ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="self-start"
                      onClick={removePhoto}
                    >
                      Quitar foto
                    </Button>
                  ) : null}
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet className="border-t border-border pt-7">
              <FieldLegend>En qué estás</FieldLegend>
              <FieldGroup>
                <Field data-invalid={!!errors.title || undefined}>
                  <FieldLabel htmlFor="title">Cargo</FieldLabel>
                  <Input
                    id="title"
                    value={form.title}
                    aria-invalid={!!errors.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                  {errors.title ? (
                    <FieldError>{errors.title}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={!!errors.company || undefined}>
                  <FieldLabel htmlFor="company">Organización</FieldLabel>
                  <Input
                    id="company"
                    value={form.company}
                    aria-invalid={!!errors.company}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, company: e.target.value }))
                    }
                  />
                  {errors.company ? (
                    <FieldError>{errors.company}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={!!errors.location || undefined}>
                  <FieldLabel htmlFor="location">Ubicación</FieldLabel>
                  <Input
                    id="location"
                    value={form.location}
                    aria-invalid={!!errors.location}
                    placeholder="Ciudad, país"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                  />
                  {errors.location ? (
                    <FieldError>{errors.location}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={!!errors.helpWith || undefined}>
                  <FieldLabel htmlFor="helpWith">
                    ¿En qué puedes dar una mano?
                  </FieldLabel>
                  <Textarea
                    id="helpWith"
                    value={form.helpWith}
                    aria-invalid={!!errors.helpWith}
                    rows={4}
                    placeholder="Por ejemplo: cambio de carrera, entrevistas técnicas o revisión de portafolio."
                    onChange={(e) =>
                      setForm((f) => ({ ...f, helpWith: e.target.value }))
                    }
                  />
                  {errors.helpWith ? (
                    <FieldError>{errors.helpWith}</FieldError>
                  ) : (
                    <FieldDescription>
                      Escribe como si alguien de la carrera te hiciera la
                      pregunta directamente.
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSet className="border-t border-border pt-7">
              <FieldLegend>Contacto</FieldLegend>
              <FieldDescription className="mb-4">
                Tú eliges cómo contactarte. Estos datos solo los verá la red.
              </FieldDescription>
              <FieldGroup>
                <Field data-invalid={!!errors.contactEmail || undefined}>
                  <FieldLabel htmlFor="contactEmail">Correo</FieldLabel>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    aria-invalid={!!errors.contactEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contactEmail: e.target.value }))
                    }
                  />
                  {errors.contactEmail ? (
                    <FieldError>{errors.contactEmail}</FieldError>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={form.linkedinUrl}
                    placeholder="https://linkedin.com/in/…"
                    onChange={(e) =>
                      setForm((f) => ({ ...f, linkedinUrl: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono (opcional)</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </Field>
                <Field orientation="horizontal" className="items-center">
                  <Checkbox
                    id="published"
                    checked={form.published}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        published: checked === true,
                        featuredOnLanding:
                          checked === true ? f.featuredOnLanding : false,
                      }))
                    }
                  />
                  <FieldLabel htmlFor="published" className="font-normal">
                    Quiero aparecer en el directorio
                  </FieldLabel>
                </Field>
                <Field
                  orientation="horizontal"
                  className="items-start"
                  data-disabled={
                    !form.published ||
                    (!form.photoUrl && !photoFile) ||
                    undefined
                  }
                >
                  <Checkbox
                    id="featuredOnLanding"
                    checked={form.featuredOnLanding}
                    disabled={!form.published || (!form.photoUrl && !photoFile)}
                    onCheckedChange={(checked) =>
                      setForm((f) => ({
                        ...f,
                        featuredOnLanding: checked === true,
                      }))
                    }
                  />
                  <div className="flex flex-col gap-1">
                    <FieldLabel
                      htmlFor="featuredOnLanding"
                      className="font-normal"
                    >
                      Autorizo mostrar mi foto y datos profesionales en la
                      portada
                    </FieldLabel>
                    <FieldDescription>
                      Solo se mostrarán tu nombre, generación, cargo,
                      organización y foto.
                    </FieldDescription>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar perfil"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
