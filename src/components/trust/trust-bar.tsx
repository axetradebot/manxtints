"use client"

import { BoltIcon, CalendarTickIcon, FilmIcon, SmileIcon } from "./trust-icons"
import { FadeIn } from "@/components/motion"

interface Highlight {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  detail: string
}

/**
 * Four quick reasons to choose ManxTints. Deliberately distinct from the
 * guarantee / insurance proof in the hero and guarantee panel so the strip
 * adds information rather than repeating it.
 */
const highlights: Highlight[] = [
  { icon: FilmIcon, title: "Premium films", detail: "Top-grade, made to last" },
  { icon: BoltIcon, title: "Instant quotes", detail: "Priced online in 60 seconds" },
  { icon: CalendarTickIcon, title: "Hassle-free booking", detail: "Pick a date, we do the rest" },
  { icon: SmileIcon, title: "Friendly local team", detail: "Real people, quick replies" },
]

export function TrustBar() {
  return (
    <section aria-label="Why choose ManxTints" className="border-y border-slate-200 bg-slate-50/60">
      <div className="container mx-auto px-4">
        <FadeIn>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-4 py-5 sm:gap-x-6 sm:gap-y-5 sm:py-8 lg:flex lg:items-center lg:justify-between lg:gap-0 lg:divide-x lg:divide-slate-200 lg:py-7">
            {highlights.map((h) => (
              <li key={h.title} className="flex min-w-0 items-center gap-2 sm:gap-3 lg:flex-1 lg:justify-center lg:px-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
                  <h.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="whitespace-nowrap text-[13px] font-semibold leading-tight text-slate-900 sm:text-base">
                    {h.title}
                  </span>
                  <span className="hidden text-sm leading-snug text-slate-500 sm:block">{h.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  )
}
