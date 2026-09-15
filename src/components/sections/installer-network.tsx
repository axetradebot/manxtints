"use client"

import { FadeIn } from "@/components/motion"
import { BadgeRow } from "@/components/trust/badge-row"
import { MapPinIcon, VettedIcon } from "@/components/trust/trust-icons"
import { hasStat, site } from "@/site.config"

export function InstallerNetwork() {
  const installers = site.stats.installersInNetwork
  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our installer network</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
              Local hands. One standard.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Every ManxTints installer is vetted, insured and works to our written standard. Your booking,
              deposit and guarantee are always with ManxTints.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {hasStat(installers) && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
                  <VettedIcon className="h-4 w-4 text-trust" />
                  {installers} vetted installers in the network
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
                <MapPinIcon className="h-4 w-4 text-primary" />
                Covering the {site.areasServed}
              </span>
            </div>
            <BadgeRow className="mt-8" />
          </FadeIn>

          <FadeIn delay={0.15} direction="left">
            <CoverageGraphic />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/** Simple, honest coverage graphic — no city lists, just the areas from config. */
function CoverageGraphic() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label={`Coverage: ${site.areasServed}`}>
        <defs>
          <pattern id="in-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#e8edf3" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#in-grid)" />
        {/* Stylised land masses */}
        <g fill="#e3eefb" stroke="#bcd3f2" strokeWidth="2" strokeLinejoin="round">
          <path d="M235 40 c40 -10 70 20 78 60 c8 40 -8 80 -20 110 c-12 30 -40 50 -70 44 c-30 -6 -34 -40 -30 -70 c4 -30 -16 -50 -4 -84 c8 -26 20 -50 46 -60Z" />
          <path d="M120 110 c14 -12 30 -6 34 12 c4 18 -6 40 -18 50 c-12 10 -30 4 -34 -12 c-4 -16 4 -38 18 -50Z" />
        </g>
        {/* Rings */}
        <g fill="none" stroke="#0066cc" strokeOpacity="0.18">
          <circle cx="132" cy="150" r="34" />
          <circle cx="132" cy="150" r="58" />
          <circle cx="262" cy="150" r="46" />
          <circle cx="262" cy="150" r="78" />
        </g>
        {/* Pins */}
        {[
          [132, 150],
          [262, 150],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="9" fill="#0066cc" opacity="0.15" />
            <circle cx={cx} cy={cy} r="5" fill="#0066cc" />
            <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
          </g>
        ))}
        <g fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="700" fill="#1e293b" textAnchor="middle">
          <text x="132" y="190">{site.areasServedList[0]}</text>
          <text x="262" y="240">{site.areasServedList[1]}</text>
        </g>
      </svg>
      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow ring-1 ring-slate-200 backdrop-blur">
        Installers across the {site.areasServed}
      </div>
    </div>
  )
}
