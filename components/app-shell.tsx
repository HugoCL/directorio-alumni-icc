import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const widths = {
  /* Master-detail surfaces: use the screen instead of huddling in the middle. */
  wide: "max-w-[96rem]",
  default: "max-w-6xl",
  narrow: "max-w-2xl",
} as const

export type ShellWidth = keyof typeof widths

export function AppPage({
  width = "default",
  className,
  children,
}: {
  width?: ShellWidth
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main
        id="main-content"
        className={cn(
          "mx-auto w-full flex-1 px-5 py-8 sm:px-8 sm:py-12",
          widths[width],
          className
        )}
      >
        {children}
      </main>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: {
  title: string
  description?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-x-8 gap-y-5 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[1.75rem] leading-tight font-semibold sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions || meta ? (
        <div className="flex shrink-0 items-center gap-4">
          {meta}
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export function Panel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Shared "you're not in yet" state for every private surface. */
export function AccessNotice({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <AppPage width="narrow" className="flex items-center sm:py-20">
      <div className="w-full">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action ? (
          <Link href={action.href} className={cn(buttonVariants(), "mt-7")}>
            {action.label}
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        ) : null}
      </div>
    </AppPage>
  )
}
