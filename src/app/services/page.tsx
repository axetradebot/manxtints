"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Building2, Eye, EyeOff, Shield, Sun, Thermometer, Wind } from "lucide-react"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { WindowExplainer } from "@/components/explainer/window-explainer"
import { GuaranteePanel } from "@/components/trust/guarantee-panel"
import { FaqSection, type Faq } from "@/components/sections/faq-section"
import { CtaBand } from "@/components/sections/cta-band"
import { hasStat, site } from "@/site.config"

/**
 * One calm card per product actually offered. Automotive is currently paused
 * and deliberately not listed. Prices are the existing published guide prices
 * (VAT inclusive) and should be kept in step with the calculator.
 */
const products = [
  {
    id: "privacy",
    icon: EyeOff,
    title: "One-way mirror & privacy film",
    benefit: "Daytime privacy without curtains — a mirror from outside, a clear view from inside.",
    bestFor: "Street-facing lounges, bedrooms, bathrooms and ground-floor offices.",
    price: "From £99/m²",
    note: "Reverses at night with lights on — ask about frosted film for all-hours privacy.",
  },
  {
    id: "solar",
    icon: Thermometer,
    title: "Solar & heat control film",
    benefit: `Rejects heat and glare${hasStat(site.filmSpec.heatRejectionPercent) ? ` — up to ${site.filmSpec.heatRejectionPercent}% of solar heat` : ""} — so rooms stay usable in summer.`,
    bestFor: "South- and west-facing rooms, home offices, big glazed extensions.",
    price: "From £150/m² (ceramic)",
  },
  {
    id: "frosted",
    icon: Eye,
    title: "Frosted privacy film",
    benefit: "Soft, even light with full privacy — day and night, lights on or off.",
    bestFor: "Bathrooms, front doors, meeting rooms, glass partitions.",
    price: "From £99/m²",
  },
  {
    id: "safety",
    icon: Shield,
    title: "Safety & security film",
    benefit: "Holds broken glass together so it stays in the frame instead of falling in.",
    bestFor: "Doors, low-level glazing, shopfronts and anywhere children play.",
    price: "From £89/m²",
  },
  {
    id: "conservatory",
    icon: Sun,
    title: "Conservatory roof film",
    benefit: "Turns a greenhouse back into a room by reflecting heat and glare from the roof.",
    bestFor: "Glass and polycarbonate conservatory roofs, roof lanterns, skylights.",
    price: "From £100/m²",
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial",
    benefit: "Cooler, glare-free workspaces and discreet privacy for offices and shopfronts.",
    bestFor: "Offices, retail, clinics, schools and public buildings.",
    price: "From £98/m²",
    note: "Installed around your opening hours with minimal disruption.",
  },
  {
    id: "specialty",
    icon: Wind,
    title: "Specialist films",
    benefit: "Energy-saving, anti-fog, data-jammer and blast-mitigation films for specific problems.",
    bestFor: "Listed buildings, server rooms, government and high-security sites.",
    price: "Quoted per project",
  },
]

/** Existing published price guide, kept so no pricing information is lost. */
const priceGuide = [
  { name: "Privacy film (one-way mirror)", price: "£99/m²" },
  { name: "Decorative / frosted film", price: "£99/m²" },
  { name: "Ceramic heat-control film", price: "£150–£200/m²" },
  { name: "Conservatory roof film", price: "£100/m²" },
  { name: "Commercial privacy film", price: "£98/m²" },
  { name: "UV blocking film (retail stock protection)", price: "£119/m²" },
  { name: "Security film (commercial)", price: "£119/m²" },
  { name: "Security film (residential)", price: "£89/m²" },
  { name: "Energy saving film", price: "£90/m²" },
  { name: "Anti-fog film", price: "£200/m²" },
  { name: "Data jammer film", price: "£900/m²" },
  { name: "Bomb blast protection film", price: "£100/m²" },
]

const faqs: Faq[] = [
  {
    question: "Which film do I need?",
    answer:
      "Tell us the problem — privacy, heat, glare, fading or safety — on the quote page and we'll recommend the film. Most homes choose one-way mirror film for privacy, ceramic film where heat is the issue, and frosted film for bathrooms and doors.",
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
    answer: `Quality film lasts 15–25 years indoors with normal care${
      hasStat(site.guarantee.workmanshipYears) ? `, and every installation carries our ${site.guarantee.workmanshipYears}-year workmanship warranty` : ""
    }${hasStat(site.guarantee.extendedYears) ? ` (upgradeable to ${site.guarantee.extendedYears} years in the calculator)` : ""}.`,
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

      {/* Product cards */}
      <section id="residential" className="scroll-mt-24 bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">What we fit</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">Pick the job. We&apos;ll pick the film.</h2>
              <p className="mt-4 text-lg text-slate-600">All prices include VAT. Every job is guaranteed by ManxTints.</p>
            </div>
          </FadeIn>

          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.07}>
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <motion.article
                  id={product.id}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="flex h-full scroll-mt-24 flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
                >
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
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="text-sm font-semibold text-slate-900">
                      {product.price}
                      {product.price.includes("£") && <span className="ml-1 font-normal text-slate-500">inc. VAT</span>}
                    </span>
                    <Link
                      href="/quote"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      Get a quote <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Price guide */}
          <FadeIn delay={0.1}>
            <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900">Film price guide</h3>
              <p className="mt-1 text-sm text-slate-500">
                Guide prices per square metre, VAT inclusive. Minimum job charge £100. Use the calculator for an exact
                figure with 10% off.
              </p>
              <ul className="mt-5 divide-y divide-slate-100">
                {priceGuide.map((row) => (
                  <li key={row.name} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="text-slate-700">{row.name}</span>
                    <span className="shrink-0 font-semibold text-slate-900">{row.price}</span>
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
