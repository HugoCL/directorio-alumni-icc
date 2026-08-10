const copy = {
  "sign-in": {
    title: "Vuelve a la conversación.",
    body: "Encuentra a esa persona que puede orientarte, revisa lo nuevo en la bolsa o ponte al día con la red.",
  },
  "sign-up": {
    title: "Una comunidad para estudiantes y alumni.",
    body: "Conecta con personas de la carrera para aprender, orientar y compartir oportunidades.",
  },
} as const

export function AuthSidePanel({ mode }: { mode: keyof typeof copy }) {
  const { title, body } = copy[mode]
  const headingId = `${mode}-statement`
  const isSignUp = mode === "sign-up"

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate flex min-h-80 overflow-hidden bg-brand-ink px-6 py-9 text-white sm:px-10 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:min-h-0 lg:self-start lg:px-14 lg:py-12"
    >
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="auth-shape auth-shape-one" />
        <span className="auth-shape auth-shape-two" />
        <span className="auth-shape auth-shape-three" />
        <span className="auth-shape auth-shape-four" />
        <span className="auth-shape auth-shape-five" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col justify-between">
        <p className="rise relative text-sm font-semibold tracking-wide text-white/70">
          Red Alumni ICC
        </p>
        <div className="relative mt-24 max-w-lg lg:mt-auto">
          {isSignUp ? (
            <>
              <h1 id={headingId} className="sr-only">
                {title}
              </h1>
              <div
                aria-hidden="true"
                className="auth-message-stage rise relative h-28 sm:h-32 lg:h-36"
              >
                <p className="auth-message">
                  <span className="text-sm font-semibold tracking-wide text-brand-green">
                    Para estudiantes
                  </span>
                  <span className="mt-2 block text-3xl leading-[1.02] font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                    Empieza acompañado.
                  </span>
                </p>
                <p className="auth-message auth-message-alumni">
                  <span className="text-sm font-semibold tracking-wide text-brand-magenta">
                    Para alumni
                  </span>
                  <span className="mt-2 block text-3xl leading-[1.02] font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                    Tu experiencia abre caminos.
                  </span>
                </p>
              </div>
            </>
          ) : (
            <h1
              id={headingId}
              className="rise text-3xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
            >
              {title}
            </h1>
          )}
          <p
            className="rise mt-4 max-w-md text-base leading-relaxed text-white/72 sm:text-lg"
            style={{ "--rise-index": 1 } as React.CSSProperties}
          >
            {body}
          </p>
        </div>
      </div>
    </section>
  )
}
