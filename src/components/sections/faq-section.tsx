"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn } from "@/components/motion"

export interface Faq {
  question: string
  answer: string
}

interface FaqSectionProps {
  faqs: Faq[]
  id?: string
  heading?: string
  intro?: string
  className?: string
  /** Emit FAQPage JSON-LD for this list. */
  schema?: boolean
}

export function FaqSection({
  faqs,
  id = "faq",
  heading = "Questions, answered",
  intro,
  className = "bg-white",
  schema = true,
}: FaqSectionProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <section className={`py-20 md:py-28 ${className}`} id={id}>
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">{heading}</h2>
            {intro && <p className="mt-4 text-lg text-slate-600">{intro}</p>}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm"
                >
                  <AccordionTrigger className="py-5 text-left font-medium text-slate-900 hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 leading-relaxed text-slate-600">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-12 text-center">
            <p className="mb-4 text-slate-600">Still have a question?</p>
            <Link href="/contact">
              <Button variant="outline" className="gap-2">
                Contact us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
