"use client"

import Link from "next/link"
import { Check, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  NIGHT_TIME_NOTE,
  filmPresentation,
  rateFor,
  tiers,
  zoneHasTierChoice,
  type PropertyRateKey,
  type TierKey,
} from "@/lib/pricing.zones"
import { useZone } from "@/components/zone/zone-provider"
import { ZoneChip } from "@/components/zone/zone-chip"

interface TierCardsProps {
  /** Selected tier — cards act as a radio group. Omit for the read-only services layout. */
  value?: TierKey
  onChange?: (tier: TierKey) => void
  /** Which per-m² rate to show. Defaults to the residential headline rate. */
  rateType?: Extract<PropertyRateKey, "house" | "conservatory">
  /** Services page: each card links to the calculator with the tier pre-selected. */
  linkToCalculator?: boolean
  /** Hide the zone chip when the parent already renders one directly above. */
  hideChip?: boolean
  className?: string
}

/**
 * The two film tier cards, shared by the calculator's tier step and the
 * services page so the copy and prices can never drift apart. Prices are
 * zone-aware and always sit next to a zone chip.
 */
export function TierCards({
  value,
  onChange,
  rateType = "house",
  linkToCalculator = false,
  hideChip = false,
  className,
}: TierCardsProps) {
  const { zone } = useZone()
  const selectable = typeof onChange === "function"
  const choice = zoneHasTierChoice(zone)

  return (
    <div className={cn("space-y-4", className)}>
      {!hideChip && (
        <div className="flex justify-center">
          <ZoneChip />
        </div>
      )}
      <div
        role={selectable ? "radiogroup" : undefined}
        aria-label={selectable ? "Choose your film" : undefined}
        className={cn("grid gap-4", choice ? "sm:grid-cols-2" : "mx-auto max-w-md")}
      >
        {zone.tiers.map((key) => {
          const tier = tiers[key]
          const presented = filmPresentation(zone, key)
          const price = rateFor(zone, rateType, key)
          const isPremium = choice && key === "premium"
          const selected = value === key

          const body = (
            <>
              {choice && tier.badge && (
                <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-primary to-cyan-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-background shadow-md">
                  {tier.badge}
                </span>
              )}
              {selectable && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                  )}
                >
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
              )}
              <div className="mb-3 pr-8">
                {choice && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tier.film}</p>
                )}
                <h4 className="text-xl font-bold">{choice ? tier.label : presented.name}</h4>
                {choice && <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>}
              </div>
              <p className="mb-4 flex items-baseline gap-1" data-tier-price={key}>
                <span className="text-3xl font-bold">£{price}</span>
                <span className="text-sm text-muted-foreground">/m² inc VAT · {zone.label}</span>
              </p>
              <ul className="space-y-2 text-sm">
                {presented.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-start gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <Moon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {NIGHT_TIME_NOTE}
              </p>
            </>
          )

          const cardClass = cn(
            "relative flex h-full flex-col rounded-2xl border-2 bg-card/60 p-5 text-left transition-all",
            isPremium ? "border-primary/60 shadow-lg shadow-primary/10" : "border-border",
            selectable && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/70",
            selectable && selected && "border-primary bg-primary/5 shadow-xl shadow-primary/20",
            linkToCalculator && "hover:-translate-y-0.5 hover:border-primary/70"
          )

          if (selectable) {
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                data-tier-card={key}
                onClick={() => onChange(key)}
                className={cardClass}
              >
                {body}
              </button>
            )
          }

          if (linkToCalculator) {
            return (
              <Link key={key} href={choice ? `/quote?tier=${key}` : "/quote"} data-tier-card={key} className={cardClass}>
                {body}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {choice ? `Get a ${tier.label} quote →` : "Get a quote →"}
                </span>
              </Link>
            )
          }

          return (
            <div key={key} data-tier-card={key} className={cardClass}>
              {body}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Three-row Standard vs Premium comparison used on the services page.
 */
export function TierComparison({ className }: { className?: string }) {
  const rows: { label: string; standard: string; premium: string }[] = [
    { label: "Daytime privacy", standard: "✓", premium: "✓" },
    { label: "View from inside", standard: "Mirrored at night", premium: "Clear" },
    {
      label: "Guarantee",
      standard: `${tiers.standard.guaranteeYears} yrs`,
      premium: `${tiers.premium.guaranteeYears} yrs`,
    },
  ]

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60 bg-card/40", className)}>
      <div className="grid grid-cols-3 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div className="px-4 py-2.5" />
        <div className="px-4 py-2.5 text-center">{tiers.standard.label}</div>
        <div className="px-4 py-2.5 text-center text-primary">{tiers.premium.label}</div>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-3 border-t border-border/60 text-sm">
          <div className="px-4 py-3 font-medium">{row.label}</div>
          <div className="px-4 py-3 text-center text-muted-foreground">{row.standard}</div>
          <div className="px-4 py-3 text-center font-medium">{row.premium}</div>
        </div>
      ))}
    </div>
  )
}
