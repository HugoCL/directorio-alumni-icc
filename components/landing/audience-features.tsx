"use client"

import { useState } from "react"
import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type DirectoryPreview = {
  initials: string
  area: string
  generation: string
  topic: string
}

type JobPreview = {
  role: string
  org: string
  detail: string
}

const audienceCopy = {
  student: {
    directory: {
      title: "Encuentra a quien ya recorrió ese camino.",
      body: "Busca alumni por área y generación. Cada persona cuenta en qué puede orientarte y cómo prefiere que la contacten.",
      action: "Encontrar orientación",
      href: "/directorio",
    },
    jobs: {
      title: "Descubre prácticas y primeras oportunidades.",
      body: "Revisa empleos y prácticas compartidos por personas de la carrera, con información clara para postular.",
      action: "Ver oportunidades",
      href: "/oportunidades",
    },
  },
  alumni: {
    directory: {
      title: "Haz visible en qué puedes ayudar.",
      body: "Cuenta tu experiencia, los temas que conoces y cómo prefieres que estudiantes y alumni se contacten contigo.",
      action: "Actualizar mi perfil",
      href: "/perfil",
    },
    jobs: {
      title: "Abre una oportunidad para alguien de la carrera.",
      body: "Publica empleos y prácticas que recomendarías de verdad para que lleguen a la comunidad indicada.",
      action: "Publicar una oportunidad",
      href: "/oportunidades",
    },
  },
} as const

function FeatureLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "link" }), "mt-3 px-0")}
    >
      {children}
      <RiArrowRightLine data-icon="inline-end" />
    </Link>
  )
}

function AudiencePanel({
  audience,
  directoryPreview,
  jobPreview,
}: {
  audience: keyof typeof audienceCopy
  directoryPreview: readonly DirectoryPreview[]
  jobPreview: readonly JobPreview[]
}) {
  const content = audienceCopy[audience]

  return (
    <div className="flex animate-fade flex-col gap-10 sm:gap-12">
      <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-balance sm:text-[2.125rem]">
            {content.directory.title}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {content.directory.body}
          </p>
          <FeatureLink href={content.directory.href}>
            {content.directory.action}
          </FeatureLink>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {directoryPreview.slice(0, 3).map((profile) => (
            <li
              key={profile.initials}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-semibold text-accent-foreground"
              >
                {profile.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{profile.area}</p>
                <p className="truncate text-sm text-muted-foreground">
                  Generación {profile.generation}
                </p>
              </div>
              <p className="hidden max-w-48 truncate text-sm text-muted-foreground sm:block">
                {profile.topic}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid items-center gap-6 border-t border-border/70 pt-10 sm:pt-12 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="max-w-md">
          <h2 className="text-3xl leading-tight font-semibold text-balance sm:text-[2.125rem]">
            {content.jobs.title}
          </h2>
          <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
            {content.jobs.body}
          </p>
          <FeatureLink href={content.jobs.href}>
            {content.jobs.action}
          </FeatureLink>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {jobPreview.map((job) => (
            <li
              key={job.role}
              className="flex items-center justify-between gap-4 px-5 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{job.role}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {job.org}
                </p>
              </div>
              <p className="shrink-0 text-sm text-muted-foreground">
                {job.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function AudienceFeatures({
  directoryPreview,
  jobPreview,
}: {
  directoryPreview: readonly DirectoryPreview[]
  jobPreview: readonly JobPreview[]
}) {
  const [audience, setAudience] = useState<keyof typeof audienceCopy>("student")

  return (
    <section className="mx-auto max-w-[96rem] px-5 py-14 sm:px-8 sm:py-16">
      <Tabs
        value={audience}
        onValueChange={(value) =>
          setAudience(value === "alumni" ? "alumni" : "student")
        }
        className="min-w-0 gap-10 sm:gap-12"
      >
        <div className="flex w-full min-w-0 justify-center">
          <TabsList
            aria-label="Elige tu relación con la carrera"
            className="w-full max-w-full sm:w-fit sm:max-w-none"
          >
            <TabsTrigger value="student">Soy estudiante</TabsTrigger>
            <TabsTrigger value="alumni">Soy alumni</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="student">
          <AudiencePanel
            audience="student"
            directoryPreview={directoryPreview}
            jobPreview={jobPreview}
          />
        </TabsContent>
        <TabsContent value="alumni">
          <AudiencePanel
            audience="alumni"
            directoryPreview={directoryPreview}
            jobPreview={jobPreview}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
