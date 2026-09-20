"use client"

import { hasStat, site } from "@/site.config"
import { FadeIn } from "@/components/motion"
import { CalendarTickIcon, FilmIcon, VettedIcon } from "./trust-icons"

/**
 * The standard we hold every job to: premium film, experienced installers,
 * and service that turns up on time. Figures come from site.config.
 */
export function GuaranteePanel({ compact = false }: { compact?: boolean }) {
  const years = site.stats.installerMinYears

  const lines = [
    {
      icon: FilmIcon,
      title: "Highest quality films",
      text: "We specify premium window films that last, reject heat and keep a clean, even finish.",
    },
    {
      icon: VettedIcon,
      title: "Highest-standard installers",
      text: hasStat(years)
        ? `We only work with insured installers who have at least ${years} years of tinting behind them and fit to our written standard.`
        : "We only work with insured installers who fit to our written standard — and we check their work.",
    },
    {
      icon: CalendarTickIcon,
      title: "Top-tier service",
      text: "Clear communication, fast replies and punctual arrivals. We treat your time the way we treat the glass.",
    },
  ]

  return (
    <FadeIn>
      <div className="rounded-3xl border border-trust/20 bg-trust-soft/60 p-6 md:p-10">
        {!compact && (
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-trust">Our standard</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Highest quality. Highest standard.
            </h2>
          </div>
        )}
        <ul className="grid gap-6 md:grid-cols-3">
          {lines.map((line) => (
            <li key={line.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-trust shadow-sm ring-1 ring-trust/15">
                <line.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{line.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{line.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  )
}
