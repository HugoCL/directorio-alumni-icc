"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { AREAS, GENERATIONS, type Area } from "@/lib/taxonomy"
import { SiteHeader } from "@/components/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
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
  published: true,
}

export function ProfileEditor() {
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

  function validate(): boolean {
    const next: typeof errors = {}
    if (form.fullName.trim().length < 2)
      next.fullName = "Nombre demasiado corto"
    if (!form.title.trim()) next.title = "Obligatorio"
    if (!form.company.trim()) next.company = "Obligatorio"
    if (!form.location.trim()) next.location = "Obligatorio"
    if (form.helpWith.trim().length < 10) {
      next.helpWith = "Escribe al menos 10 caracteres"
    }
    if (!form.contactEmail.includes("@")) {
      next.contactEmail = "Correo inválido"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error("Revisa los campos marcados")
      return
    }
    setSaving(true)
    try {
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
        published: form.published,
      })
      toast.success(form.published ? "Perfil publicado" : "Perfil guardado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  if (me === undefined || (canEdit && profile === undefined)) {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-6 h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!me || me.role === "student") {
    return (
      <div className="min-h-svh">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
          <Alert>
            <AlertTitle>Sin acceso</AlertTitle>
            <AlertDescription>
              Los perfiles públicos están disponibles solo para alumni
              verificados.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-editorial text-4xl tracking-[-0.03em]">
              Mi perfil
            </h1>
            <div aria-hidden className="mt-3 h-0.5 w-10 bg-signal" />
            <p className="mt-3 text-sm text-muted-foreground">
              Quiénes pueden verlo: miembros autenticados de la red. Puedes
              editarlo cuando quieras.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/directorio" />}
            nativeButton={false}
          >
            Ver directorio
          </Button>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-8 border border-border bg-card p-6 shadow-[6px_6px_0_0_var(--border)] sm:p-8"
        >
          <FieldSet>
            <FieldLegend>Identidad</FieldLegend>
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
                  <FieldDescription className="text-destructive">
                    {errors.fullName}
                  </FieldDescription>
                ) : null}
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Generación</FieldLabel>
                  <Select
                    value={form.generation}
                    onValueChange={(value) => {
                      if (value) setForm((f) => ({ ...f, generation: value }))
                    }}
                  >
                    <SelectTrigger className="w-full">
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
                  <FieldLabel>Área</FieldLabel>
                  <Select
                    value={form.area}
                    onValueChange={(value) => {
                      if (value) setForm((f) => ({ ...f, area: value as Area }))
                    }}
                  >
                    <SelectTrigger className="w-full">
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

          <FieldSet>
            <FieldLegend>Experiencia</FieldLegend>
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
              </Field>
              <Field data-invalid={!!errors.helpWith || undefined}>
                <FieldLabel htmlFor="helpWith">Puede ayudarte con</FieldLabel>
                <Textarea
                  id="helpWith"
                  value={form.helpWith}
                  aria-invalid={!!errors.helpWith}
                  rows={4}
                  placeholder="Mentoría de carrera, revisión de portafolio, consejos de entrevistas…"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, helpWith: e.target.value }))
                  }
                />
                {errors.helpWith ? (
                  <FieldDescription className="text-destructive">
                    {errors.helpWith}
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    Sé concreto: esto es lo que los estudiantes leerán primero.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Contacto</FieldLegend>
            <FieldDescription className="mb-4">
              Solo miembros autenticados de la red verán estos datos.
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
              </Field>
              <Field>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn</FieldLabel>
                <Input
                  id="linkedinUrl"
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
                    setForm((f) => ({ ...f, published: checked === true }))
                  }
                />
                <FieldLabel htmlFor="published" className="font-normal">
                  Publicar en el directorio
                </FieldLabel>
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
    </div>
  )
}
