"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type FeaturedAlumni = {
  _id: Id<"profiles">
  fullName: string
  generation: string
  title: string
  company: string
  photoUrl: string
}

export function AlumniSpotlight({ profiles }: { profiles: FeaturedAlumni[] }) {
  const [active, setActive] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [interactionPaused, setInteractionPaused] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const paused = userPaused || interactionPaused || pageHidden || reducedMotion
  const current = profiles[active]!

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setPageHidden(document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener("change", updateMotion)
    document.addEventListener("visibilitychange", updateVisibility)
    return () => {
      media.removeEventListener("change", updateMotion)
      document.removeEventListener("visibilitychange", updateVisibility)
    }
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActive((currentIndex) => (currentIndex + 1) % profiles.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, profiles.length])

  function move(direction: number) {
    setActive(
      (currentIndex) =>
        (currentIndex + direction + profiles.length) % profiles.length
    )
  }

  return (
    <section
      aria-label="Alumni destacados"
      aria-roledescription="carrusel"
      className="border-y border-foreground"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteractionPaused(false)
        }
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border py-4">
        <div>
          <p className="text-sm font-semibold text-primary">Conoce a la red</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
            Alumni de la carrera
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {active + 1} / {profiles.length}
        </p>
      </div>

      <figure key={current._id}>
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={current.photoUrl}
            alt={`Retrato de ${current.fullName}`}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 38vw"
            className="object-cover"
          />
        </div>
        <figcaption
          aria-live={paused ? "polite" : "off"}
          aria-atomic="true"
          className="grid gap-3 border-t border-border py-5 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <div>
            <p className="text-xl font-semibold">{current.fullName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {current.title} · {current.company}
            </p>
          </div>
          <p className="text-sm font-medium text-primary">
            Generación {current.generation}
          </p>
        </figcaption>
      </figure>

      <div className="flex items-center justify-between gap-3 border-t border-border py-3">
        <div className="flex items-center" aria-label="Elegir alumni">
          {profiles.map((profile, index) => (
            <button
              key={profile._id}
              type="button"
              aria-label={`Mostrar a ${profile.fullName}`}
              aria-current={index === active ? "true" : undefined}
              className="flex size-11 items-center justify-center"
              onClick={() => setActive(index)}
            >
              <span
                aria-hidden
                className={cn(
                  "h-0.5 w-5 bg-border transition-colors",
                  index === active && "bg-primary"
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Alumni anterior"
            onClick={() => move(-1)}
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={userPaused ? "Reanudar rotación" : "Pausar rotación"}
            onClick={() => setUserPaused((currentValue) => !currentValue)}
          >
            {userPaused ? <PlayIcon /> : <PauseIcon />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Siguiente alumni"
            onClick={() => move(1)}
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  )
}
