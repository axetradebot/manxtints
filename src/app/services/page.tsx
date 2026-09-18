"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Building2, Eye, EyeOff, Shield, Sun, Thermometer, Wind } from "lucide-react"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { WindowExplainer } from "@/components/explainer/window-explainer"
import { GuaranteePanel } from "@/components/trust/guarantee-panel"
import { FaqSection, type Faq } from "@/components/sections/faq-section"
import { CtaBand } from "@/components/sections/cta-band"
import { ZoneChip } from "@/components/zone/zone-chip"
import { useZone } from "@/components/zone/zone-provider"
import { TierCards, TierComparison } from "@/components/tiers/tier-cards"
import { guaranteeUpsell, MIN_JOB } from "@/lib/pricing"
import { tiers, type GuideRateKey } from "@/lib/pricing.zones"
import { hasStat, site } from "@/site.config"

/**
 * One calm card per product actually offered. Automotive is currently paused
 * and deliberately not listed. Prices are read from the customer's pricing
 * zone (src/lib/pricing.zones.ts) so they always match the calculator.
 */
const products: Array<{
  id: string
  icon: typeof EyeOff
  title: string
  benefit: string
  bestFor: string
  /** Key into zone.guide — omitted for products quoted per project. */
  rate?: GuideRateKey
  note?: string
  quoteHref?: string
}> = [
  {
    id: "privacy",
    icon: EyeOff,
    title: "One-way mirror & privacy film",
    benefit: "Daytime privacy without curtains — a mirror from outside, a clear view from inside.",
    bestFor: "Street-facing lounges, bedrooms, bathrooms and ground-floor offices.",
    rate: "privacy",
    note: "Reverses at night with lights on — ask about frosted film for all-hours privacy.",
  },
  {
    id: "solar",
    icon: Thermometer,
    title: "Solar & heat control film",
    benefit: `Rejects heat and glare${hasStat(site.filmSpec.heatRejectionPercent) ? ` — up to ${site.filmSpec.heatRejectionPercent}% of solar heat` : ""} — so rooms stay usable in summer.`,
    bestFor: "South- and west-facing rooms, home offices, big glazed extensions.",
    rate: "solar",
  },
  {
    id: "frosted",
    icon: Eye,
    title: "Frosted privacy film",
    benefit: "Soft, even light with full privacy — day and night, lights on or off.",
    bestFor: "Bathrooms, front doors, meeting rooms, glass partitions.",
    rate: "frosted",
  },
  {
    id: "safety",
    icon: Shield,
    title: "Safety & security film",
    benefit: "Holds broken glass together so it stays in the frame instead of falling in.",
    bestFor: "Doors, low-level glazing, shopfronts and anywhere children play.",
    rate: "securityResidential",
  },
  {
    id: "conservatory",
    icon: Sun,
    title: "Conservatory roof film",
    benefit: "Turns a greenhouse back into a room by reflecting heat and glare from the roof.",
    bestFor: "Glass and polycarbonate conservatory roofs, roof lanterns, skylights.",
    rate: "conservatory",
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial",
    benefit: "Cooler, glare-free workspaces and discreet privacy for offices and shopfronts.",
    bestFor: "Offices, retail, clinics, schools and public buildings.",
    rate: "commercialPrivacy",
    note: "Installed around your opening hours with minimal disruption.",
  },
  {
    id: "specialty",
    icon: Wind,
    title: "Specialist films",
    benefit: "Energy-saving, anti-fog, data-jammer and blast-mitigation films for specific problems.",
    bestFor: "Listed buildings, server rooms, government and high-security sites.",
    quoteHref: "/quote?tab=enquiry",
  },
]

/** Published price guide — rates per zone live in src/lib/pricing.zones.ts. */
const priceGuide: Array<{ name: string; rate: GuideRateKey }> = [
  { name: "Privacy film (one-way mirror)", rate: "privacy" },
  { name: "Decorative / frosted film", rate: "frosted" },
  { name: "Solar / heat-control film", rate: "solar" },
  { name: "Conservatory roof film", rate: "conservatory" },
  { name: "Commercial privacy film", rate: "commercialPrivacy" },
  { name: "UV blocking film (retail stock protection)", rate: "uvBlocking" },
  { name: "Security film (commercial)", rate: "securityCommercial" },
  { name: "Security film (residential)", rate: "securityResidential" },
  { name: "Energy saving film", rate: "energySaving" },
  { name: "Anti-fog film", rate: "antiFog" },
  { name: "Data jammer film", rate: "dataJammer" },
  { name: "Bomb blast protection film", rate: "blast" },
]

const faqs: Faq[] = [
  {
    question: "Which film do I need?",
    answer:
      "Tell us the problem — privacy, heat, glare, fading or safety — on the quote page and we'll recommend the film. Most homes choose one-way mirror film for privacy and heat, and frosted film for bathrooms and doors.",
  },
  {
    question: "What's the difference between Standard and Premium?",
    answer: `Both give the same one-way privacy by day — the difference is what you see from inside. ${tiers.standard.label} (${tiers.standard.film}) has a slight mirror look from indoors and comes with a ${tiers.standard.guaranteeYears}-year guarantee; ${tiers.premium.label} (${tiers.premium.film}) is clear and non-reflective from inside, rejects more heat and includes a ${tiers.premium.guaranteeYears}-year guarantee.`,
  },
  {
    question: "Does one-way mirror film work at night?",
    answer:
      "Not in the same way. The mirror effect follows the light: by day outside is brighter so people see a reflection; at night with your lights on, the inside is brighter and people can see in. For privacy at all hours choose frosted film.",
  },
  {
    question: "How long does installation take?",
    answer:
      "A typical home takes a few hours; larger commercial jobs may take a day or more. Your installer confirms timings when the booking is made and re-measures on the day before fitting.",
  },
  {
    question: "How long does window film last?",
    answer: `Quality film lasts 15–25 years indoors with normal care. Every installation includes a ${tiers.standard.guaranteeYears}-year guarantee; ${tiers.premium.label} film includes ${tiers.premium.guaranteeYears} years, and on ${tiers.standard.label} you can extend to ${guaranteeUpsell.years} years in the calculator for ${Math.round(guaranteeUpsell.pctOfTotal * 100)}% of the job total (minimum £${guaranteeUpsell.minPounds}).`,
  },
  {
    question: "Can I clean my windows after tinting?",
    answer:
      "Wait 3–5 days for the film to cure, then clean as normal with a soft cloth and an ammonia-free cleaner. Avoid abrasive pads or blades.",
  },
  {
    question: "Where do you install?",
    answer: `Our vetted installers cover the ${site.areasServed}. Quotes are done remotely from your measurements or photos, then we book the install with your local ManxTints installer.`,
  },
]

export default function ServicesPage() {
  const { zone } = useZone()

  return (
    <div className="relative bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 to-white pb-10 pt-24 md:pb-16 md:pt-32">
        <div className="container mx-auto px-4">
          <FadeIn immediate>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">Services</p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
                Window film, explained simply.
              </h1>
              <p className="mt-6 text-lg text-slate-600 md:text-xl">
                One thin layer on the inside of your glass. Depending on the film, it gives you privacy, cooler
                rooms, protection from fading, or glass that stays together if it breaks — fitted by your local
                ManxTints installer across the {site.areasServed}.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The explainer sits at the top */}
      <div className="pb-20 md:pb-28">
        <WindowExplainer
          heading="What the film actually does"
          intro="Same window, four jobs. Tap a benefit to see it."
          id="services-explainer"
        />
      </div>

      {/* Two film tiers — same cards as the calculator's tier step */}
      <section id="tiers" className="scroll-mt-24 pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Residential &amp; conservatory</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">Two films. One simple choice.</h2>
              <p className="mt-4 text-lg text-slate-600">
                Both give you one-way privacy by day. Premium keeps the view from inside clear and doubles the
                guarantee. Prices are per m² including VAT — the calculator gives you an exact figure.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mx-auto max-w-4xl space-y-8">
              <TierCards linkToCalculator />
              <TierComparison />
              <p className="text-center text-slate-600">
                Not sure? Most customers choose Premium for living rooms and Standard for bathrooms, garages and
                outbuildings.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={`/quote?tier=premium`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                >
                  Quote with {tiers.premium.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/quote?tier=standard`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:border-primary hover:text-primary"
                >
                  Quote with {tiers.standard.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product cards */}
      <section id="residential" className="scroll-mt-24 bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">What we fit</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">Pick the job. We&apos;ll pick the film.</h2>
              <p className="mt-4 text-lg text-slate-600">All prices include VAT. Every job is guaranteed by ManxTints.</p>
              <div className="mt-5 flex justify-center">
                <ZoneChip />
              </div>
            </div>
          </FadeIn>

          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.07}>
            {products.map((product) => {
              const href = product.quoteHref ?? "/quote"
              const price = product.rate ? zone.guide[product.rate] : null
              return (
                <StaggerItem key={product.id}>
                  {/* Stretched-link card: the whole card is one link, the zone chip sits above it and stays tappable. */}
                  <motion.article
                    id={product.id}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="relative flex h-full scroll-mt-24 flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                  >
                    <Link
                      href={href}
                      className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Get a quote — ${product.title}`}
                    />
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                      <product.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">{product.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{product.benefit}</p>
                    <dl className="mt-5 space-y-2 text-sm">
                      <div>
                        <dt className="font-semibold text-slate-800">Best for</dt>
                        <dd className="text-slate-600">{product.bestFor}</dd>
                      </div>
                      {product.note && (
                        <div>
                          <dt className="font-semibold text-slate-800">Worth knowing</dt>
                          <dd className="text-slate-600">{product.note}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900" data-product-price={product.id}>
                          {price !== null ? (
                            <>
                              from £{price}/m²
                              <span className="ml-1 font-normal text-slate-500">inc. VAT</span>
                            </>
                          ) : (
                            "Quoted per project"
                          )}
                        </span>
                        {price !== null && (
                          <span className="relative z-20 mt-2 inline-block">
                            <ZoneChip size="sm" />
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Get a quote <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </motion.article>
                </StaggerItem>
              )
            })}
          </Stagger>

          {/* Price guide */}
          <FadeIn delay={0.1}>
            <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Film price guide</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Guide prices per square metre, VAT inclusive, for {zone.label}. Minimum job charge £{MIN_JOB}. Use the
                    calculator for an exact figure with 10% off.
                  </p>
                </div>
                <ZoneChip />
              </div>
              <ul className="mt-5 divide-y divide-slate-100">
                {priceGuide.map((row) => (
                  <li key={row.name} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="text-slate-700">{row.name}</span>
                    <span className="shrink-0 font-semibold text-slate-900">£{zone.guide[row.rate]}/m²</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <GuaranteePanel />
        </div>
      </section>

      <FaqSection faqs={faqs} className="bg-slate-50" id="services-faq" />

      <CtaBand heading="Not sure which film? Send us a photo." text="Upload a couple of photos of the windows and tell us the problem. We'll recommend the film and price it — usually the same day." />
    </div>
  )
}
