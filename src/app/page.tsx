"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import { TrustBar } from "@/components/trust/trust-bar"
import { ClientLogos } from "@/components/trust/client-logos"
import { HeroProof } from "@/components/trust/hero-proof"
import { GuaranteePanel } from "@/components/trust/guarantee-panel"
import { WindowExplainer } from "@/components/explainer/window-explainer"
import { HowItWorks } from "@/components/sections/how-it-works"
import { WhyManxTints } from "@/components/sections/why-manxtints"
import { InstallerNetwork } from "@/components/sections/installer-network"
import { ReviewsSection } from "@/components/sections/reviews-section"
import { ProjectsGrid } from "@/components/sections/projects-grid"
import { FaqSection, type Faq } from "@/components/sections/faq-section"
import { CtaBand } from "@/components/sections/cta-band"
import { ZoneChip } from "@/components/zone/zone-chip"
import { useZone } from "@/components/zone/zone-provider"
import type { Zone } from "@/lib/pricing.zones"
import { fromPrice, zoneHasTierChoice } from "@/lib/pricing.zones"
import { hasStat, site } from "@/site.config"
import { DOUBLE_GLAZING_FAQ } from "@/content/film-quality"

const years = site.guarantee.workmanshipYears
const extended = site.guarantee.extendedYears

const buildFaqs = (zone: Zone): Faq[] => [
  {
    question: "Does one-way mirror film work at night?",
    answer:
      "Honestly: not in the same way. One-way mirror film reflects whichever side is brighter. By day that's outside, so passers-by see a mirror. At night with your lights on, the inside is brighter and the effect reverses — people can see in. If you need privacy around the clock, we'll recommend a frosted film or a combination instead.",
  },
  DOUBLE_GLAZING_FAQ,
  {
    question: "How long does window film last?",
    answer: `The premium films we fit typically last 15–25 years indoors with normal care${
      hasStat(years) ? `, and every installation comes with our ${years}-year written workmanship warranty` : ""
    }${hasStat(extended) ? ` (upgradeable to ${extended} years in the calculator)` : ""}.`,
  },
  {
    question: "What does the guarantee cover?",
    answer: `${site.guarantee.satisfactionPromise} ${
      hasStat(years)
        ? `Our ${years}-year guarantee covers peeling, bubbling, discolouration and delamination under normal use. `
        : ""
    }Premium film includes a ${extended}-year guarantee, and on Standard film you can extend to ${extended} years as an add-on in the calculator. It's issued and honoured by ManxTints, whichever installer fitted your film. Full terms are on the Terms & Conditions page.`,
  },
  {
    question: "What happens on install day?",
    answer:
      "Your local ManxTints installer arrives at the agreed time, re-measures every pane and confirms the film with you before starting. If anything differs from the quote, it's agreed with you first. Glass is cleaned, film is cut and fitted, edges are finished and the room is left as it was found — most homes take a few hours. Photos of the finished job are added to your booking.",
  },
  {
    question: "Who actually fits the film?",
    answer:
      "An insured installer from the ManxTints network, checked by us and working to our written installation standard. ManxTints handles your quote, booking, deposit, guarantee and customer care — so you always have one company to talk to.",
  },
  {
    question: "How do deposits and cancellations work?",
    answer: `${site.guarantee.depositLine} ${site.guarantee.cancellationLine} Full terms are on the Terms & Conditions page.`,
  },
  {
    question: "Which areas do you cover?",
    answer: `ManxTints installers cover the ${site.areasServed}. Enter your postcode on the quote page and we'll confirm availability and dates for your area.`,
  },
  {
    question: "How much does window film cost?",
    answer: zoneHasTierChoice(zone)
      ? `It depends on the film, the number of windows, their size and your area. As a guide, residential privacy film in the ${zone.label} area is from £${zone.pricePerM2.standard} per square metre including VAT (Standard film) or £${zone.pricePerM2.premium} per square metre for Premium, with a minimum job charge of £${zone.minJob}. Prices vary by area — you can change yours above. The calculator gives you an exact figure in about a minute, and 10% off automatically.`
      : `It depends on the number of windows and their size. On the ${zone.label} we fit one dual-reflective privacy film at £${fromPrice(zone)} per square metre including VAT, with a minimum job charge of £${zone.minJob}. The calculator gives you an exact figure in about a minute, and 10% off automatically.`,
  },
  {
    question: "Can I choose how dark the film is?",
    answer:
      "Yes. Tell us what you want to achieve on the quote page — or send photos — and we'll recommend the right shade and finish, from near-clear heat control to full frosted privacy.",
  },
  {
    question: "Can the film be removed later?",
    answer:
      "Yes. Professionally fitted film can be removed cleanly without damage to the glass. We use residue-free removal techniques if your needs change.",
  },
  {
    question: "Can I clean my windows after installation?",
    answer:
      "Wait 3–5 days for the film to fully cure, then clean as normal with a soft cloth and an ammonia-free cleaner. Avoid abrasive pads or blades.",
  },
]

export default function Home() {
  const { zone } = useZone()
  const faqs = buildFaqs(zone)

  return (
    <div className="relative bg-white">
      {/* Hero — mobile treatment is locked; lg+ is the original full-bleed overlay. */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={site.hero.image}
            alt={site.hero.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 1px, 100vw"
            quality={60}
            className="object-cover object-[center_32%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-900/20" />
        </div>

        {/* lg+: the photo is portrait (9:16), so covering a landscape viewport would crop it to a
            third of its height. A blurred copy fills the frame; the sharp photo is right-anchored
            and sized from the hero height so the whole house stays in view. */}
        <div className="absolute inset-0 hidden lg:block">
          <Image
            src={site.hero.image}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            quality={40}
            className="scale-110 object-cover object-[center_40%] blur-2xl saturate-[.85]"
          />
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-y-0 right-0 w-[min(62vw,calc(92vh*0.92))] [mask-image:linear-gradient(to_right,transparent,black_30%)]">
            <Image
              src={site.hero.image}
              alt={site.hero.alt}
              fill
              priority
              sizes="62vw"
              quality={80}
              className="object-cover object-[center_42%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-slate-900/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/25 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full flex-col justify-end px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-6 sm:pb-16 md:min-h-[calc(100svh-7.25rem)] md:justify-center md:py-16 lg:min-h-[92vh] lg:justify-end lg:pb-24 lg:pt-40">
          <div className="max-w-xl lg:max-w-3xl">
            <FadeIn immediate delay={0.1}>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur sm:mb-5">
                Free quotes online — no visit needed
              </p>
            </FadeIn>
            <FadeIn immediate delay={0.2}>
              <h1 className="font-display text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.05] xl:text-7xl">
                {site.hero.headline}
              </h1>
            </FadeIn>
            <FadeIn immediate delay={0.3}>
              <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-slate-200 [@media(max-width:639px)_and_(max-height:700px)]:hidden sm:mt-5 sm:text-lg lg:mt-6 lg:max-w-2xl lg:text-xl">
                One company quotes, books and guarantees your window film. An experienced installer near you
                fits it — across the {site.areasServed}.
              </p>
            </FadeIn>
            <FadeIn immediate delay={0.4}>
              <div className="mt-5 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                <Link href="/quote">
                  <Button size="xl" className="group w-full gap-2 bg-primary text-white shadow-xl shadow-blue-900/30 hover:bg-blue-700 sm:w-auto">
                    Get an instant quote
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="xl" variant="outline" className="w-full border-white/40 bg-white/10 text-white backdrop-blur hover:border-white hover:bg-white/20 hover:text-white sm:w-auto">
                    How it works
                  </Button>
                </Link>
              </div>
            </FadeIn>
            <FadeIn immediate delay={0.5}>
              <HeroProof className="mt-5 sm:mt-8 lg:mt-9" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social proof first: the businesses we've fitted for, straight under the hero CTA */}
      <ClientLogos />

      {/* Trust bar — hidden entirely until config has real figures */}
      <TrustBar />

      {/* The centrepiece */}
      <div className="bg-gradient-to-b from-white via-blue-50/40 to-white py-20 md:py-28">
        <WindowExplainer />
      </div>

      {/* Why our film, not the cheapest quote */}
      <WhyManxTints />

      <HowItWorks />

      {/* Guarantee */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <GuaranteePanel />
        </div>
      </section>

      <InstallerNetwork />

      <ReviewsSection />

      <ProjectsGrid />

      <FaqSection
        faqs={faqs}
        className="bg-slate-50"
        intro="Straight answers on privacy, guarantees and what happens on the day."
        aside={<ZoneChip />}
      />

      <CtaBand />
    </div>
  )
}
