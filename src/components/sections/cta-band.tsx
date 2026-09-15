"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import { hasStat, site } from "@/site.config"

interface CtaBandProps {
  heading?: string
  text?: string
}

export function CtaBand({
  heading = "Ready for cooler, more private rooms?",
  text,
}: CtaBandProps) {
  const body =
    text ??
    `Get an instant price online, pick your date, and let your local ManxTints installer do the rest${
      hasStat(site.guarantee.workmanshipYears) ? ` — guaranteed for ${site.guarantee.workmanshipYears} years.` : "."
    }`
  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="container relative mx-auto px-4">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-5xl">{heading}</h2>
            <p className="mt-5 text-lg text-blue-100 md:text-xl">{body}</p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/quote">
                <Button size="xl" className="group gap-2 bg-white text-primary shadow-lg hover:bg-blue-50">
                  Get an instant quote
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/quote?tab=enquiry">
                <Button size="xl" className="gap-2 border-2 border-white bg-transparent text-white hover:bg-white/10">
                  Send photos for a quote
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-100/90">Free quotes online — no visit needed · {site.areasServed}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
