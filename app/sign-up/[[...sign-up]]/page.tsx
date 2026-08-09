import { SignUp } from "@clerk/nextjs"
import { SiteHeader } from "@/components/site-header"

export default function SignUpPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main
        id="main-content"
        className="grid min-h-[calc(100svh-71px)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(28rem,1.18fr)]"
      >
        <section
          aria-labelledby="sign-up-statement"
          className="flex bg-brand-ink px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16"
        >
          <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
            <p className="text-sm font-semibold text-white/70">
              Red Alumni ICC
            </p>
            <div className="mt-12 lg:mt-auto">
              <h1
                id="sign-up-statement"
                className="max-w-lg text-3xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl"
              >
                Tu experiencia también mueve la red.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/72 sm:text-lg">
                Crea tu acceso para conectar con personas de la carrera,
                compartir lo que sabes y mantenerte cerca de la comunidad.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Formulario de creación de cuenta"
          className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/verificacion"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "w-full border-0 bg-transparent shadow-none",
                },
              }}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
