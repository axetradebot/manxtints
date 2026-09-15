"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import { TrustBar } from "@/components/trust/trust-bar"
import { HeroProof } from "@/components/trust/hero-proof"
import { GuaranteePanel } from "@/components/trust/guarantee-panel"
import { WindowExplainer } from "@/components/explainer/window-explainer"
import { HowItWorks } from "@/components/sections/how-it-works"
import { InstallerNetwork } from "@/components/sections/installer-network"
import { ReviewsSection } from "@/components/sections/reviews-section"
import { ProjectsGrid } from "@/components/sections/projects-grid"
import { FaqSection, type Faq } from "@/components/sections/faq-section"
import { CtaBand } from "@/components/sections/cta-band"
import { hasStat, site } from "@/site.config"

const years = site.guarantee.workmanshipYears
const extended = site.guarantee.extendedYears

const faqs: Faq[] = [
  {
    question: "Does one-way mirror film work at night?",
    answer:
      "Honestly: not in the same way. One-way mirror film reflects whichever side is brighter. By day that's outside, so passers-by see a mirror. At night with your lights on, the inside is brighter and the effect reverses — people can see in. If you need privacy around the clock, we'll recommend a frosted film or a combination instead.",
  },
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
        ? `Our ${years}-year workmanship warranty covers peeling, bubbling, discolouration and delamination under normal use. `
        : ""
    }It's issued and honoured by ManxTints, whichever installer fitted your film. Full terms are on the Terms & Conditions page.`,
  },
  {
    question: "What happens on install day?",
    answer:
      "Your local ManxTints installer arrives at the agreed time, re-measures every pane and confirms the film with you before starting. If anything differs from the quote, it's agreed with you first. Glass is cleaned, film is cut and fitted, edges are finished and the room is left as it was found — most homes take a few hours. Photos of the finished job are added to your booking.",
  },
  {
    question: "Who actually fits the film?",
    answer:
      "A vetted, insured installer from the ManxTints network who works to our written installation standard. ManxTints handles your quote, booking, deposit, guarantee and customer care — so you always have one company to talk to.",
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
    answer:
      "It depends on the film, the number of windows and their size. As a guide, residential privacy film is around £99 per square metre including VAT, with a minimum job charge of £100. The calculator gives you an exact figure in about a minute — and 10% off automatically.",
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
  return (
    <div className="relative bg-white">
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-start overflow-hidden sm:min-h-[88vh] sm:justify-end md:min-h-[92vh]">
        <Image
          src={site.hero.image}
          alt={site.hero.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={60}
          className="object-cover object-[center_40%]"
        />
        {/* Legibility scrims: darker at the bottom and left where the copy sits */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/20 to-transparent" />

        <div className="container relative z-10 mx-auto w-full px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-20 sm:pb-16 sm:pt-32 md:pb-24 md:pt-40">
          <div className="max-w-3xl">
            <FadeIn immediate delay={0.1}>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur sm:mb-4">
                Free quotes online — no visit needed
              </p>
            </FadeIn>
            <FadeIn immediate delay={0.2}>
              <h1 className="font-display text-[2rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {site.hero.headline}
              </h1>
            </FadeIn>
            <FadeIn immediate delay={0.3}>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-100 [@media(max-width:639px)_and_(max-height:700px)]:hidden sm:mt-6 sm:text-lg md:text-xl">
                ManxTints quotes, books and guarantees your window film. Vetted local installers fit it — across
                the {site.areasServed}.
              </p>
            </FadeIn>
            <FadeIn immediate delay={0.4}>
              <div className="mt-4 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
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
              <HeroProof className="mt-4 sm:mt-9" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust bar — hidden entirely until config has real figures */}
      <TrustBar />

      {/* The centrepiece */}
      <div className="bg-gradient-to-b from-white via-blue-50/40 to-white py-20 md:py-28">
        <WindowExplainer />
      </div>

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

      <FaqSection faqs={faqs} className="bg-slate-50" intro="Straight answers on privacy, guarantees and what happens on the day." />

      <CtaBand />
    </div>
  )
}
