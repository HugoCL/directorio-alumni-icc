"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiPauseLine,
  RiPlayLine,
} from "@remixicon/react"
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
      className="rounded-2xl border border-border bg-surface p-2"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setInteractionPaused(false)
        }
      }}
    >
      <figure className="overflow-hidden rounded-xl bg-background">
        <div className="relative aspect-[16/11] overflow-hidden bg-muted">
          <Image
            key={current._id}
            src={current.photoUrl}
            alt={`Retrato de ${current.fullName}`}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 38vw"
            className="animate-fade object-cover"
          />
        </div>
        <figcaption
          aria-live={paused ? "polite" : "off"}
          aria-atomic="true"
          className="flex items-end justify-between gap-4 px-5 py-4"
        >
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold">
              {current.fullName}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {current.title} · {current.company}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium text-primary">
            Generación {current.generation}
          </p>
        </figcaption>
      </figure>

      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-label="Elegir alumni">
          {profiles.map((profile, index) => (
            <button
              key={profile._id}
              type="button"
              aria-label={`Mostrar a ${profile.fullName}`}
              aria-current={index === active ? "true" : undefined}
              className="group flex h-8 items-center px-0.5"
              onClick={() => setActive(index)}
            >
              <span
                aria-hidden
                className={cn(
                  "h-1 w-5 rounded-full bg-border transition-all duration-200 group-hover:bg-muted-foreground",
                  index === active && "w-8 bg-primary group-hover:bg-primary"
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Alumni anterior"
            onClick={() => move(-1)}
          >
            <RiArrowLeftLine />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={userPaused ? "Reanudar rotación" : "Pausar rotación"}
            onClick={() => setUserPaused((currentValue) => !currentValue)}
          >
            {userPaused ? <RiPlayLine /> : <RiPauseLine />}
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Siguiente alumni"
            onClick={() => move(1)}
          >
            <RiArrowRightLine />
          </Button>
        </div>
      </div>
    </section>
  )
}
