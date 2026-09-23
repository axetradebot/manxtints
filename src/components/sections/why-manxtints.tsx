"use client"

import { useRef, type ComponentType } from "react"
import Link from "next/link"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"
import { filmFailureClaim, site } from "@/site.config"
import {
  CHEAP_FILM_PARAGRAPH,
  COMPATIBILITY_CHECK_PARAGRAPH,
  FILM_QUALITY_COPY,
  REAL_HOMES_PARAGRAPH,
  buildComparisonRows,
} from "@/content/film-quality"
import { CrackedPaneIcon, HouseDuskIcon, ShieldGlassIcon } from "./film-quality-icons"

type IconComponent = ComponentType<{ active: boolean; reduced: boolean; className?: string }>

interface Card {
  icon: IconComponent
  /** Icon tile colours: the problem card is neutral, the fix carries the trust green. */
  tone: string
  title: string
  text: string
}

/** Runs the icon's one-shot animation the first time the card scrolls into view. */
function IconTile({ icon: Icon, tone, reduced }: { icon: IconComponent; tone: string; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <div ref={ref} className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", tone)}>
      <Icon active={inView} reduced={reduced} className="h-7 w-7" />
    </div>
  )
}

/** Tick that draws on as its row reveals (inherits the row's variants). */
function TickMark({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-trust">
      <motion.path
        d="m4.5 10.5 3.5 3.5 7.5-8"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: reduced ? { duration: 0 } : { duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] },
          },
        }}
      />
    </svg>
  )
}

function CrossMark() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400">
      <path d="m6 6 8 8M14 6l-8 8" />
    </svg>
  )
}

export function WhyManxTints({ id = "why-manxtints" }: { id?: string }) {
  const reduced = useReducedMotion() ?? false
  const claim = filmFailureClaim()
  const rows = buildComparisonRows(site.guarantee)

  // Same `hidden` start on server and client (see film-quality-icons.tsx);
  // reduced motion just makes the reveal instantaneous.
  const rowVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: reduced ? { duration: 0 } : { duration: 0.4 } },
  }

  const cards: Card[] = [
    {
      icon: CrackedPaneIcon,
      tone: "bg-slate-100 text-slate-700",
      title: "The problem with cheap film",
      text: claim ? `${CHEAP_FILM_PARAGRAPH} ${claim}` : CHEAP_FILM_PARAGRAPH,
    },
    {
      icon: ShieldGlassIcon,
      tone: "bg-trust-soft text-trust",
      title: "What we fit instead",
      text: COMPATIBILITY_CHECK_PARAGRAPH,
    },
    {
      icon: HouseDuskIcon,
      tone: "bg-blue-50 text-primary",
      title: "Made for real homes",
      text: REAL_HOMES_PARAGRAPH,
    },
  ]

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-y border-slate-200/70 bg-slate-50 py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{FILM_QUALITY_COPY.eyebrow}</p>
            <h2 id={`${id}-heading`} className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
              {FILM_QUALITY_COPY.headline}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{FILM_QUALITY_COPY.subline}</p>
          </div>
        </FadeIn>

        <Stagger className="grid gap-5 md:grid-cols-3 md:gap-6">
          {cards.map((card) => (
            <StaggerItem key={card.title} className="h-full">
              <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <IconTile icon={card.icon} tone={card.tone} reduced={reduced} />
                <h3 className="mt-6 text-xl font-semibold leading-snug text-slate-900">{card.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{card.text}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        {claim && site.filmClaims.source && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-slate-500">Source: {site.filmClaims.source}</p>
        )}

        {/* Comparison strip: three fixed columns so it never scrolls sideways at 390px */}
        <FadeIn delay={0.05}>
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:mt-14">
            <table className="w-full table-fixed border-collapse text-left text-[13px] leading-snug sm:text-sm">
              <caption className="sr-only">How ManxTints compares with a typical installer</caption>
              <colgroup>
                <col className="w-[30%] sm:w-[34%]" />
                <col className="w-[35%] sm:w-[33%]" />
                <col className="w-[35%] sm:w-[33%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="px-2.5 py-3 sm:px-4">
                    <span className="sr-only">Feature</span>
                  </th>
                  <th scope="col" className="px-2.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4 sm:text-xs">
                    Typical installer
                  </th>
                  <th scope="col" className="bg-trust-soft/70 px-2.5 py-3 text-[11px] font-semibold uppercase tracking-wider text-trust sm:px-4 sm:text-xs">
                    ManxTints
                  </th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={{ visible: { transition: { staggerChildren: reduced ? 0 : 0.06 } } }}
              >
                {rows.map((row) => (
                  <motion.tr key={row.label} variants={rowVariants} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="px-2.5 py-3.5 align-top font-medium text-slate-800 [overflow-wrap:anywhere] sm:px-4">
                      {row.label}
                    </th>
                    <td className="px-2.5 py-3.5 align-top text-slate-500 sm:px-4">
                      <span className="flex items-start gap-1.5 [overflow-wrap:anywhere]">
                        <CrossMark />
                        <span>{row.typical}</span>
                      </span>
                    </td>
                    <td className="bg-trust-soft/40 px-2.5 py-3.5 align-top font-medium text-slate-900 sm:px-4">
                      <span className="flex items-start gap-1.5 [overflow-wrap:anywhere]">
                        <TickMark reduced={reduced} />
                        <span>{row.manx}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mx-auto mt-12 max-w-2xl text-center md:mt-16">
            <p className="font-display text-xl font-semibold text-slate-900 md:text-2xl">{FILM_QUALITY_COPY.closer}</p>
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Button asChild size="xl" className="group w-full gap-2 bg-primary text-white hover:bg-blue-700 sm:w-auto">
                <Link href={FILM_QUALITY_COPY.primaryCta.href}>
                  {FILM_QUALITY_COPY.primaryCta.label}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Link
                href={FILM_QUALITY_COPY.secondaryCta.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {FILM_QUALITY_COPY.secondaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
