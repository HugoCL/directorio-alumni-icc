import Image from "next/image"
import Link from "next/link"
import { fetchQuery } from "convex/nextjs"
import { ArrowRightIcon } from "lucide-react"
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
    topic: "Carrera en datos",
  },
  {
    initials: "MR",
    area: "Producto",
    generation: "2020",
    topic: "Primer rol de producto",
  },
  {
    initials: "LC",
    area: "Software",
    generation: "2016",
    topic: "Liderazgo técnico",
  },
]

const steps = [
  {
    title: "Verifica tu cuenta",
    body: "Entra con tu correo institucional o solicita acceso como alumni.",
  },
  {
    title: "Completa tu perfil",
    body: "Cuenta en qué trabajas y en qué temas puedes orientar a la red.",
  },
  {
    title: "Conecta y participa",
    body: "Encuentra personas, comparte oportunidades y abre conversaciones.",
  },
]

function NetworkPreview() {
  return (
    <div className="border-y border-foreground">
      <div className="flex items-end justify-between gap-4 border-b border-border py-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            La red por dentro
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">
            Dos lugares para empezar
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">Acceso privado</span>
      </div>

      <Link
        href="/directorio"
        className="group grid gap-4 border-b border-border py-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <div>
          <p className="text-xl font-semibold">Personas</p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            Busca por área, generación o experiencia y encuentra a quién
            preguntarle.
          </p>
        </div>
        <ArrowRightIcon className="text-primary transition-transform group-hover:translate-x-1" />
      </Link>

      <Link
        href="/oportunidades"
        className="group grid gap-4 py-6 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <div>
          <p className="text-xl font-semibold">Oportunidades</p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
            Revisa empleos y prácticas compartidos directamente por alumni ICC.
          </p>
        </div>
        <ArrowRightIcon className="text-primary transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const featuredAlumni = await fetchQuery(
    api.profiles.listLandingFeatured,
    {}
  ).catch(() => [])

  return (
    <div className="min-h-svh">
      <SiteHeader variant="landing" />

      <main id="main-content">
        <section className="border-b border-border">
          <div className="mx-auto grid min-h-[calc(88svh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.78fr)] lg:gap-20">
            <div className="max-w-2xl">
              <h1 className="text-[clamp(3rem,7vw,5.8rem)] leading-[0.94] font-bold tracking-[-0.04em] text-balance">
                La red ICC,
                <br />
                en movimiento.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Encuentra personas, comparte oportunidades y mantén cerca a la
                comunidad que empezó aquí.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/directorio"
                  className={cn(buttonVariants({ size: "lg" }), "min-w-40")}
                >
                  Explorar la red
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
                <Link
                  href="/oportunidades"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Ver oportunidades
                </Link>
              </div>
            </div>

            <div className="min-w-0">
              {featuredAlumni.length >= 2 ? (
                <AlumniSpotlight profiles={featuredAlumni} />
              ) : (
                <NetworkPreview />
              )}
            </div>
          </div>
        </section>

        <section id="para-la-red" className="bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="max-w-5xl text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
              Personas, experiencia y oportunidades en un solo lugar.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-background/70">
              Una red privada para que el conocimiento y las oportunidades
              circulen entre generaciones de ICC.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <article className="grid gap-10 border-b border-border py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-20">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-primary">Directorio</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Encuentra experiencia dentro de la comunidad.
                </h3>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  Explora perfiles por área y generación. Cada persona decide
                  qué experiencia y formas de contacto compartir.
                </p>
                <Link
                  href="/directorio"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "mt-5 px-0"
                  )}
                >
                  Explorar personas
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>

              <div className="border-y border-border">
                {directoryPreview.map((profile) => (
                  <div
                    key={profile.topic}
                    className="grid gap-4 border-b border-border py-5 last:border-b-0 sm:grid-cols-[1fr_0.8fr_auto] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                        {profile.initials}
                      </span>
                      <div>
                        <p className="font-semibold">{profile.area}</p>
                        <p className="text-sm text-muted-foreground">
                          Generación {profile.generation}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{profile.topic}</p>
                    <ArrowRightIcon className="text-primary" />
                  </div>
                ))}
              </div>
            </article>

            <article className="grid gap-10 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-20">
              <div className="max-w-md">
                <p className="text-sm font-semibold text-signal">
                  Oportunidades
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Abre la próxima puerta para alguien de ICC.
                </h3>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  Alumni comparten empleos y prácticas. Toda la comunidad
                  verificada puede revisarlos y postular.
                </p>
                <Link
                  href="/oportunidades"
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "mt-5 px-0"
                  )}
                >
                  Ver oportunidades
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </div>

              <div className="border-y border-border">
                {[
                  ["Empleos", "Cargos compartidos por la red"],
                  ["Prácticas", "Primeras experiencias profesionales"],
                  ["Postulación directa", "Enlace o contacto en cada aviso"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="grid gap-2 border-b border-border py-6 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:items-baseline"
                  >
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Accede en tres pasos
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                La verificación mantiene los perfiles y oportunidades dentro de
                la comunidad.
              </p>
            </div>

            <ol className="mt-12 grid border-y border-border md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="border-b border-border py-8 last:border-b-0 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                >
                  <span
                    className={cn(
                      "text-sm font-bold",
                      index === 0
                        ? "text-signal"
                        : index === 1
                          ? "text-primary"
                          : "text-foreground"
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-border bg-foreground text-background">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  La comunidad ICC te espera.
                </h2>
                <p className="mt-3 text-background/70">
                  Verifica tu cuenta y empieza a participar.
                </p>
              </div>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "w-fit"
                )}
              >
                Iniciar sesión
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background py-9">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-lg font-semibold">Red Alumni ICC</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Una red privada para la comunidad ICC.
            </p>
          </div>
          <Link
            href="https://icc.utalca.cl"
            target="_blank"
            rel="noreferrer"
            aria-label="Sitio de Ingeniería Civil en Computación"
          >
            <Image
              src="/icc-logo.png"
              alt="Ingeniería Civil en Computación"
              width={139}
              height={132}
              className="h-auto w-32"
            />
          </Link>
        </div>
      </footer>
    </div>
  )
}
