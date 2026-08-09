"use client"

export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(event) => {
        const main = document.getElementById("main-content")
        if (!main) return
        event.preventDefault()
        main.tabIndex = -1
        main.focus()
        window.history.replaceState(null, "", "#main-content")
      }}
      className="fixed top-3 left-3 z-[60] -translate-y-24 bg-brand-ink px-4 py-3 font-semibold text-white focus:translate-y-0"
    >
      Saltar al contenido principal
    </a>
  )
}
