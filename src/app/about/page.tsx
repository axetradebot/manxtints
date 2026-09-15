"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Camera, FileCheck2, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { BadgeRow } from "@/components/trust/badge-row"
import { CountUp } from "@/components/trust/count-up"
import { hasStat, site } from "@/site.config"
import { fiveStarShare, platformRatings } from "@/content/reviews"

const standards = [
  {
    icon: Camera,
    title: "Photos on every job",
    text: "Before and after photos are taken on every installation and attached to your booking, so quality is seen — not assumed.",
  },
  {
    icon: FileCheck2,
    title: "The agreed film, every time",
    text: "Installers fit exactly the film named on your quote. Any change is agreed with you in writing before work starts.",
  },
  {
    icon: ScrollText,
    title: "A written guarantee from ManxTints",
    text: hasStat(site.guarantee.workmanshipYears)
      ? `Your ${site.guarantee.workmanshipYears}-year workmanship warranty is issued by ManxTints and honoured by ManxTints, whichever installer fitted your film.`
      : "Your guarantee is issued by ManxTints and honoured by ManxTints, whichever installer fitted your film.",
  },
]

export default function AboutPage() {
  const { stats, founder } = site
  const share = fiveStarShare()
  const platforms = platformRatings()
  const platformNames = platforms.map((p) => p.label).join(" and ")
  const figures = [
    hasStat(stats.yearsTrading) && { label: "years trading", value: stats.yearsTrading, suffix: "" },
    hasStat(stats.projectsCompleted) && { label: "projects completed", value: stats.projectsCompleted, suffix: "+" },
    hasStat(stats.installersInNetwork) && { label: "vetted installers", value: stats.installersInNetwork, suffix: "" },
    ...platformRatings().map((p) => ({ label: `${p.label} rating · ${p.count} reviews`, value: p.rating, suffix: "", decimals: 1 })),
  ].filter(Boolean) as { label: string; value: number; suffix: string; decimals?: number }[]

  return (
    <div className="relative bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/70 to-white pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container mx-auto px-4">
          <FadeIn immediate>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">About ManxTints</p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
                A window film company, built around the customer.
              </h1>
              <p className="mt-6 text-lg text-slate-600 md:text-xl">
                ManxTints quotes, books, guarantees and looks after every job. Vetted local installers fit the film.
                You deal with one company, across the {site.areasServed}.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Story */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* In view on load at 390px, so it must paint server-side for LCP. */}
            <FadeIn immediate delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-slate-700">
                <p>
                  Every job starts with the film. We fit premium window films that last, reject heat and keep a
                  clean, even finish. Corners sit tight, edges sit flush, and the glass is cleaned before and after.
                  Attention to detail is the whole job, not a finishing touch.
                </p>
                <p>
                  The same standard applies to how we treat you. Quotes come back the same day and someone answers
                  when you call. If anything isn&apos;t right, we put it right, with no runaround. You deal with
                  ManxTints from the first message to the last check-in, across the {site.areasServed}.
                </p>
                {share > 0 && (
                  <p>
                    Quality film, careful fitting and service that goes further than the install is why customers
                    leave{" "}
                    <Link
                      href="/#reviews"
                      className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
                    >
                      {share}% 5-star reviews
                    </Link>
                    {platformNames ? ` on ${platformNames}` : ""}.
                  </p>
                )}
              </div>

              {/* The founder appears here, once, as the founder. */}
              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                  {founder.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{founder.name}</p>
                  <p className="text-sm text-slate-600">{founder.line}</p>
                </div>
              </div>

              {site.credentials.length > 0 && (
                <ul className="mt-6 space-y-2 text-sm text-slate-700">
                  {site.credentials.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-trust" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </FadeIn>

            <FadeIn direction="left" delay={0.15}>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                <Image
                  src="/gallery/residential/manxtints-installer-window.jpg"
                  alt="A ManxTints installer applying window film to a residential patio door"
                  width={900}
                  height={1100}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="aspect-[4/5] h-auto w-full object-cover object-[18%_46%]"
                />
              </div>
              {figures.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  {figures.map((f) => (
                    <div key={f.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <dt className="font-display text-3xl font-bold text-slate-900">
                        <CountUp value={f.value} suffix={f.suffix} decimals={f.decimals ?? 0} />
                      </dt>
                      <dd className="text-sm text-slate-600">{f.label}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Installer standards</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
                What every ManxTints installer signs up to
              </h2>
            </div>
          </FadeIn>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {standards.map((s) => (
              <StaggerItem key={s.title}>
                <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-trust-soft text-trust">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <FadeIn delay={0.1}>
            <BadgeRow className="mt-10 justify-center" />
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center">
              <Link href="/quote">
                <Button size="xl" className="group gap-2">
                  Get an instant quote
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
