import { SignIn } from "@clerk/nextjs"
import { AuthSidePanel } from "@/components/auth/auth-side-panel"
import { SiteHeader } from "@/components/site-header"

export default function SignInPage() {
  return (
    <div className="min-h-svh bg-white">
      <SiteHeader />
      <main
        id="main-content"
        className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(28rem,1.18fr)]"
      >
        <AuthSidePanel mode="sign-in" />

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
