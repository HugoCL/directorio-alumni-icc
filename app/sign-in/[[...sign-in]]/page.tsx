import { SignIn } from "@clerk/nextjs"
import { SiteHeader } from "@/components/site-header"

export default function SignInPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main
        id="main-content"
        className="grid min-h-[calc(100svh-71px)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(28rem,1.18fr)]"
      >
        <section
          aria-labelledby="sign-in-statement"
          className="flex bg-brand-ink px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16"
        >
          <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
            <p className="text-sm font-semibold text-white/70">
              Red Alumni ICC
            </p>
            <div className="mt-12 lg:mt-auto">
              <h1
                id="sign-in-statement"
                className="max-w-lg text-3xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl"
              >
                Vuelve a la conversación.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/72 sm:text-lg">
                Encuentra a esa persona que puede orientarte, revisa lo nuevo en
                la bolsa o ponte al día con la red.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Formulario de inicio de sesión"
          className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:px-12"
        >
          <div className="w-full max-w-md">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
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
