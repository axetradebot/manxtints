import { Star } from "lucide-react"
import { fiveStarShare, platformRatings } from "@/content/reviews"
import { hasStat, site } from "@/site.config"
import { FacebookIcon, GoogleIcon, GuaranteeIcon, ShieldTickIcon } from "./trust-icons"
import { cn } from "@/lib/utils"

/**
 * One quiet line of proof under the hero CTAs: the star rating drawn from the
 * genuine reviews on file, then two short guarantees. Anything without data
 * behind it simply doesn't render.
 */
export function HeroProof({ className }: { className?: string }) {
  const platforms = platformRatings()
  const share = fiveStarShare()
  const insured = site.badges.some((b) => /insured/i.test(b))
  const years = site.guarantee.workmanshipYears

  const showRating = platforms.length > 0 && share > 0
  if (!showRating && !insured && !hasStat(years) && !site.guarantee.satisfactionPromise) return null

  const platformNames = platforms.map((p) => p.label).join(" & ")

  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3 text-sm", className)}>
      {showRating && (
        <a
          href={platforms[0].href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${share}% five-star rated on ${platformNames} — read the reviews`}
          className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur transition-colors hover:border-white/30 hover:bg-white/15"
        >
          <span className="flex -space-x-2">
            {platforms.map((p) => (
              <span
                key={p.source}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-2 ring-slate-900/50"
              >
                {p.source === "google" ? <GoogleIcon className="h-4 w-4" /> : <FacebookIcon className="h-7 w-7" />}
              </span>
            ))}
          </span>
          <span className="flex gap-px" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="whitespace-nowrap">
            <span className="font-semibold text-white">{share}% 5-star rated</span>
            <span className="hidden text-slate-300 sm:inline"> on {platformNames}</span>
          </span>
        </a>
      )}

      <span className="flex w-full flex-nowrap items-center justify-between gap-x-2 text-[11px] text-slate-300 sm:w-auto sm:justify-start sm:gap-x-4 sm:text-xs">
        {insured && (
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-1.5">
            <ShieldTickIcon className="h-3.5 w-3.5 text-trust-soft sm:h-4 sm:w-4" />
            Fully insured
          </span>
        )}
        {hasStat(years) && (
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-1.5">
            <GuaranteeIcon className="h-3.5 w-3.5 text-trust-soft sm:h-4 sm:w-4" />
            {years}-year Warranty
          </span>
        )}
        {site.guarantee.satisfactionPromise && (
          <span
            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-1.5"
            title={site.guarantee.satisfactionPromise}
          >
            <ShieldTickIcon className="h-3.5 w-3.5 text-trust-soft sm:h-4 sm:w-4" />
            Satisfaction guaranteed
          </span>
        )}
      </span>
    </div>
  )
}
