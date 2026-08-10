import Image from "next/image"
import Link from "next/link"
import { fetchQuery } from "convex/nextjs"
import { RiArrowRightLine } from "@remixicon/react"
import { AlumniSpotlight } from "@/components/landing/alumni-spotlight"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

const directoryPreview = [
  {
    initials: "AV",
    area: "Datos e IA",
    generation: "2018",
    topic: "Cómo entrar al mundo de los datos",
  },
  {
    initials: "MR",
    area: "Producto",
    generation: "2020",
    topic: "Pasar de dev a producto",
  },
  {
    initials: "LC",
    area: "Software",
    generation: "2016",
    topic: "Liderar un equipo técnico",
  },
  {
    initials: "PS",
    area: "Emprendimiento",
    generation: "2015",
    topic: "Levantar un proyecto propio",
  },
]

const jobPreview = [
  { role: "Frontend Engineer", org: "Buk", detail: "Santiago · Híbrido" },
  { role: "Práctica en Datos", org: "Grupo Kaufmann", detail: "Remoto" },
  {
    role: "Ingeniero de Plataforma",
    org: "NotCo",
    detail: "Santiago · Remoto",
  },
]

const steps = [
  {
    title: "Confirma tu vínculo",
    body: "Con tu correo institucional entras al instante. Si ya egresaste, revisamos tu solicitud a mano.",
  },
  {
    title: "Cuéntanos en qué andas",
    body: "Tu cargo, tu generación y los temas en los que te gustaría dar una mano. Nada más.",
  },
  {
    title: "Vuelve a la conversación",
    body: "Encuentra a la persona indicada, comparte una oportunidad o retoma el contacto con tu generación.",
  },
]

/** Fallback hero visual when nobody has opted into the landing page yet. */
function CommunityWall() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-2">
      <div className="rounded-xl bg-background p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-lg font-semibold">
            Quién está en la red
          </h2>
          <span className="text-sm text-muted-foreground">Acceso privado</span>
        </div>

        <ul className="mt-5 space-y-1.5">
          {directoryPreview.map((profile) => (
            <li
              key={profile.initials}
              className="flex items-center gap-3.5 rounded-lg px-2 py-2.5"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-semibold text-accent-foreground"
              >
                {profile.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{profile.topic}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {profile.area} · Generación {profile.generation}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
          Un ejemplo de lo que verás dentro. Los perfiles reales aparecen cuando
          inicias sesión.
        </p>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const featuredAlumni = await fetchQuery(
    api.profiles.listLandingFeatured,
    {}
  ).catch(() => [])

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        <section className="mx-auto grid w-full max-w-[96rem] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.85fr)] lg:gap-20 lg:py-28">
          <div className="max-w-2xl">
            <h1
              style={{ "--rise-index": 0 } as React.CSSProperties}
              className="rise text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance"
            >
              Bienvenid@ al espacio
              <br />
              de la comunidad ICC
            </h1>
            <p
              style={{ "--rise-index": 1 } as React.CSSProperties}
              className="rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Encuentra a quien ya recorrió el camino que estás empezando,
              comparte una oportunidad o vuelve a conversar con tu generación.
            </p>
            <div
              style={{ "--rise-index": 2 } as React.CSSProperties}
              className="rise mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/directorio"
                className={cn(buttonVariants({ size: "lg" }), "px-6")}
              >
                Explorar la red
                <RiArrowRightLine data-icon="inline-end" />
              </Link>
              <Link
                href="/oportunidades"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "px-6"
                )}
              >
                Ver oportunidades
              </Link>
            </div>
          </div>

          <div
            style={{ "--rise-index": 3 } as React.CSSProperties}
            className="rise min-w-0"
          >
            {featuredAlumni.length >= 2 ? (
              <AlumniSpotlight profiles={featuredAlumni} />
            ) : (
              <CommunityWall />
            )}
          </div>
        </section>

        <section className="bg-foreground text-background">
          <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-20">
            <h2 className="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-balance sm:text-[2.75rem]">
              Lo que sabemos vale más cuando lo compartimos
            </h2>
            <p className="text-lg leading-relaxed text-background/70">
              Este es el punto de encuentro entre quienes están comenzando,
              quienes llevan años de experiencia y quienes tienen ganas de
              aportar. Sin currículums ni formalidades: personas de ICC
              respondiendo preguntas de personas de ICC.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[96rem] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-10 sm:gap-12">
            <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
              <div className="max-w-md">
                <h2 className="text-3xl font-semibold text-balance sm:text-[2.125rem]">
                  Encuentra a la persona indicada para esa pregunta.
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Busca por área y generación. Cada persona cuenta en qué puede
                  ayudarte y elige cómo prefiere que la contacten.
                </p>
                <Link
                  href="/directorio"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "mt-3 px-0"
                  )}
                >
                  Explorar personas
                  <RiArrowRightLine data-icon="inline-end" />
                </Link>
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

            <div
              aria-hidden="true"
              className="h-px bg-border/70"
            />

            <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
              <div className="max-w-md">
                <h2 className="text-3xl leading-tight font-semibold text-balance sm:text-[2.125rem]">
                  Comparte y postula a oportunidades de la red
                </h2>
                <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
                  Publica empleos y prácticas que recomendarías de verdad. La
                  red verá la información y sabrá exactamente cómo postular.
                </p>
                <Link
                  href="/oportunidades"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "mt-3 px-0"
                  )}
                >
                  Ver oportunidades
                  <RiArrowRightLine data-icon="inline-end" />
                </Link>
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
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[96rem] px-5 py-20 sm:px-8 sm:py-24">
            <h2 className="max-w-lg text-3xl font-semibold sm:text-[2.125rem]">
              Entrar toma un par de minutos
            </h2>

            <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="font-heading text-sm font-semibold text-primary tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-foreground text-background">
          <div className="mx-auto flex max-w-[96rem] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-20">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Tu próxima conversación puede empezar aquí.
              </h2>
              <p className="mt-3 text-background/70">
                Entra a la red y descubre con quién vale la pena hablar.
              </p>
            </div>
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-fit px-6"
              )}
            >
              Iniciar sesión
              <RiArrowRightLine data-icon="inline-end" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:px-8">
          <div className="flex items-center gap-3.5">
            <Link
              href="https://icc.utalca.cl"
              target="_blank"
              rel="noreferrer"
              aria-label="Sitio de Ingeniería Civil en Computación"
              className="shrink-0"
            >
              <Image
                src="/icc-logo.png"
                alt="Ingeniería Civil en Computación"
                width={139}
                height={132}
                className="h-16 w-auto opacity-80 transition-opacity hover:opacity-100"
              />
            </Link>
            <div>
              <p className="font-heading font-semibold">Comunidad ICC</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Un punto de encuentro para toda la comunidad ICC.
              </p>
            </div>
          </div>

          <div className="text-sm leading-relaxed text-muted-foreground sm:shrink-0 sm:text-right sm:whitespace-nowrap">
            <p>
              Creado por{" "}
              <Link
                href="https://hugocastro.dev"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Hugo Castro
              </Link>{" "}
              para la Comunidad ICC de la Universidad de Talca.
            </p>
            <p className="mt-1">
              Esta página no es un sitio oficial ni está afiliada a la
              Universidad de Talca.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
