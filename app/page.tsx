import Image from "next/image"
import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  SearchIcon,
  UserRoundIcon,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
    body: "Usa tu correo institucional o solicita revisión como exalumno.",
  },
  {
    title: "Completa tu perfil",
    body: "Cuenta tu experiencia y en qué puedes orientar.",
  },
  {
    title: "Conecta con contexto",
    body: "La red sabe cuándo y cómo contactarte.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-svh overflow-hidden">
      <SiteHeader variant="landing" />

      <main>
        <section className="relative border-b border-border pt-14">
          <div
            aria-hidden
            className="paper-grid absolute top-20 right-0 h-[70%] w-[38%] [mask-image:linear-gradient(to_left,black,transparent)] opacity-60 max-md:hidden"
          />

          <div className="relative mx-auto grid min-h-[calc(92svh-3.5rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
            <div className="max-w-2xl">
              <h1 className="reveal-up font-editorial text-[clamp(3.5rem,6.5vw,6.75rem)] leading-[0.88] tracking-[-0.04em] text-foreground">
                Encuentra a alguien que ya recorrió el camino.
              </h1>
              <div
                aria-hidden
                className="reveal-up reveal-up-delay-1 mt-7 h-1 w-16 bg-signal"
              />
              <p className="reveal-up reveal-up-delay-2 mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Explora la experiencia de alumni ICC y conecta con quienes
                pueden orientarte en tu siguiente decisión.
              </p>
              <div className="reveal-up reveal-up-delay-3 mt-9 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  render={<Link href="/directorio" />}
                  nativeButton={false}
                >
                  <SearchIcon data-icon="inline-start" />
                  Explorar el directorio
                </Button>
                <Button
                  size="lg"
                  variant="link"
                  render={<Link href="#para-la-red" />}
                  nativeButton={false}
                >
                  Conoce la red
                  <ArrowDownIcon data-icon="inline-end" />
                </Button>
              </div>
            </div>

            <div className="reveal-up reveal-up-delay-2 relative lg:pl-4">
              <div className="relative border border-border bg-card/95 p-5 shadow-[10px_10px_0_0_var(--border)] sm:p-8">
                <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Directorio privado
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                      Personas que pueden orientarte
                    </h2>
                  </div>
                  <SearchIcon className="size-5 text-muted-foreground" />
                </div>

                <div className="divide-y divide-border">
                  {directoryPreview.map((profile) => (
                    <div
                      key={profile.topic}
                      className="group grid gap-4 py-5 sm:grid-cols-[1fr_0.9fr] sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-accent font-heading text-sm font-semibold text-accent-foreground">
                          {profile.initials}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {profile.area}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Generación {profile.generation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:border-l sm:border-border sm:pl-6">
                        <p className="text-sm font-medium text-primary sm:text-base">
                          {profile.topic}
                        </p>
                        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="border-t border-border pt-5 text-center text-sm text-muted-foreground">
                  Busca por área, generación o experiencia
                </p>
              </div>
              <div
                aria-hidden
                className="absolute -right-3 -bottom-3 size-6 border-r-2 border-b-2 border-signal"
              />
            </div>
          </div>
        </section>

        <section id="para-la-red" className="border-b border-border">
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <div
              aria-hidden
              className="paper-grid absolute top-0 left-0 h-40 w-48 [mask-image:linear-gradient(to_bottom_right,black,transparent)] opacity-50"
            />
            <h2 className="font-editorial mx-auto max-w-4xl text-5xl leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Una red para pedir contexto, no favores.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Cada perfil deja claro qué experiencia tiene una persona, en qué
              puede ayudarte y cómo prefiere que la contacten.
            </p>
          </div>

          <div className="grid border-t border-border lg:grid-cols-2">
            <article className="bg-accent/60 px-6 py-14 sm:px-10 sm:py-20 lg:px-[max(2.5rem,calc((100vw-80rem)/2))] lg:pr-16">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-primary uppercase">
                <GraduationCapIcon className="size-5" />
                <span>Si eres estudiante</span>
              </div>
              <h3 className="font-editorial mt-10 max-w-xl text-4xl leading-none tracking-[-0.025em] sm:text-6xl">
                Llega a la conversación correcta.
              </h3>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Busca por área, generación o experiencia. Escribe con una
                pregunta concreta y el contexto de tu decisión.
              </p>
              <Button
                className="mt-8"
                variant="link"
                render={<Link href="/directorio" />}
                nativeButton={false}
              >
                Buscar alumni
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </article>

            <article className="border-t border-border px-6 py-14 sm:px-10 sm:py-20 lg:border-t-0 lg:border-l lg:px-[max(2.5rem,calc((100vw-80rem)/2))] lg:pl-16">
              <div className="flex items-center gap-3 text-sm font-semibold tracking-[0.14em] text-primary uppercase">
                <UserRoundIcon className="size-5" />
                <span>Si eres alumni</span>
              </div>
              <h3 className="font-editorial mt-10 max-w-xl text-4xl leading-none tracking-[-0.025em] sm:text-6xl">
                Comparte hasta donde quieras.
              </h3>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Publica los temas en los que puedes orientar y elige qué datos
                de contacto mantener visibles.
              </p>
              <Button
                className="mt-8"
                variant="link"
                render={<Link href="/perfil" />}
                nativeButton={false}
              >
                Completar mi perfil
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </article>
          </div>
        </section>

        <section id="como-funciona" className="relative">
          <div
            aria-hidden
            className="paper-grid absolute top-0 right-0 h-52 w-80 [mask-image:linear-gradient(to_bottom_left,black,transparent)] opacity-50"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              Cómo funciona
            </p>
            <div aria-hidden className="mt-4 h-0.5 w-10 bg-signal" />
            <h2 className="font-editorial mt-6 text-5xl leading-none tracking-[-0.035em] sm:text-7xl">
              Tres pasos. Sin ruido.
            </h2>

            <ol className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0">
              {steps.map((step, index) => (
                <li key={step.title} className="relative lg:pr-10">
                  <div className="flex items-center">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-foreground font-heading text-sm font-medium text-signal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {index < steps.length - 1 ? (
                      <Separator className="ml-3 hidden bg-foreground lg:block" />
                    ) : null}
                  </div>
                  <h3 className="font-editorial mt-7 text-3xl leading-tight tracking-[-0.02em]">
                    {String(index + 1).padStart(2, "0")} · {step.title}
                  </h3>
                  <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-primary text-primary-foreground">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.4fr_0.8fr_auto] lg:items-center">
              <h2 className="font-editorial max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
                Tu experiencia puede destrabar la siguiente decisión de alguien.
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
                Verifica tu correo institucional o solicita revisión para
                activar tu perfil de exalumno.
              </p>
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/sign-in" />}
                nativeButton={false}
              >
                Entrar a la red
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="font-editorial text-2xl">Red Alumni ICC</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Directorio privado · solo miembros verificados
            </p>
          </div>
          <Link
            href="https://icc.utalca.cl"
            target="_blank"
            rel="noreferrer"
            aria-label="Sitio de Ingeniería Civil en Computación, Universidad de Talca"
          >
            <Image
              src="/icc-utalca-logo.png"
              alt="Universidad de Talca e Ingeniería Civil en Computación"
              width={160}
              height={97}
              className="h-auto w-40"
            />
          </Link>
        </div>
      </footer>
    </div>
  )
}
