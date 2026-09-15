"use client"

import { motion } from "framer-motion"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { CalendarTickIcon, InstallerIcon, RulerIcon } from "@/components/trust/trust-icons"
import { hasStat, site } from "@/site.config"

const steps = [
  {
    icon: RulerIcon,
    title: "Measure & quote online in 60 seconds",
    text: "Pop your window sizes into the calculator for an instant price, or send us a couple of photos and we'll quote the same day. No visit needed.",
  },
  {
    icon: CalendarTickIcon,
    title: "Deposit secures your date",
    text: `Pick a slot that suits you and it's yours. ${site.guarantee.depositLine}`,
  },
  {
    icon: InstallerIcon,
    title: "Your local ManxTints installer fits it, guaranteed",
    text: hasStat(site.guarantee.workmanshipYears)
      ? `A vetted, insured installer re-measures on the day, fits the agreed film and leaves it spotless — backed by our ${site.guarantee.workmanshipYears}-year workmanship warranty.`
      : "A vetted, insured installer re-measures on the day, fits the agreed film and leaves it spotless — backed by our workmanship guarantee.",
  },
]

export function HowItWorks({ id = "how-it-works" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
              Quoted online. Fitted locally. Guaranteed by us.
            </h2>
          </div>
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-sm font-bold text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold leading-snug text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{step.text}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
