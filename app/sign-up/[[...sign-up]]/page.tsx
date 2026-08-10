import { SignUp } from "@clerk/nextjs"
import { AuthSidePanel } from "@/components/auth/auth-side-panel"
import { SiteHeader } from "@/components/site-header"

export default function SignUpPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main
        id="main-content"
        className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(28rem,1.18fr)]"
      >
        <AuthSidePanel mode="sign-up" />

        <section
          aria-label="Formulario de creación de cuenta"
          className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:px-12"
        >
          <div className="mx-auto flex w-full max-w-[25rem] flex-col gap-5">
            <aside className="border-l-2 border-brand-teal px-4 py-1 text-sm leading-relaxed text-brand-ink">
              <p className="font-semibold">Estudiantes actuales</p>
              <p className="mt-1 text-brand-ink/80">
                Usa tu correo <strong>@alumnos.utalca.cl</strong> para
                verificarte automáticamente.
              </p>
              <p className="mt-2 text-xs text-brand-ink/60">
                ¿Ya tienes cuenta? Puedes agregarlo después en Administrar
                cuenta → Agregar correo electrónico.
              </p>
            </aside>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/verificacion"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
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
