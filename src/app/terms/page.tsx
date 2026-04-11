import Link from "next/link"
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import {
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Banknote,
  CalendarX,
  Wrench,
  Scale,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and Conditions for ManxTints LTD window tinting services across the Isle of Man.",
}

export default function TermsPage() {
  return (
    <div className="relative bg-white">
      {/* Hero */}
      <section className="relative pt-16 pb-10 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        <div className="absolute top-10 right-0 w-48 h-48 md:w-72 md:h-72 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-sky-100 rounded-full blur-3xl opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 md:mb-6 text-xs md:text-sm px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                <Scale className="h-3 w-3 mr-1.5" />
                Legal
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6 text-slate-800 leading-tight">
                Terms &amp;
                <span className="text-gradient block">Conditions</span>
              </h1>
              <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                Please read the following terms carefully before proceeding with
                any ManxTints LTD service. By engaging our services you agree to
                be bound by these conditions.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            {/* ------------------------------------------------------------------ */}
            {/* 1. Cancellation Policy */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-violet-100 items-center justify-center">
                    <CalendarX className="h-6 w-6 text-violet-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    1. Cancellation Policy
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    We understand that circumstances can change, and ManxTints
                    LTD aims to accommodate our customers wherever reasonably
                    possible. Should you need to cancel or reschedule a booked
                    appointment, we kindly ask that you provide us with{" "}
                    <strong className="text-slate-800">
                      at least 24 hours&apos; notice
                    </strong>{" "}
                    prior to the scheduled date and time of the installation.
                  </p>
                  <p>
                    Provided that adequate notice is given in accordance with the
                    above,{" "}
                    <strong className="text-slate-800">
                      there is no cancellation fee.
                    </strong>{" "}
                    We will work with you to identify a mutually convenient
                    alternative date at no additional cost. Repeated
                    cancellations or failure to provide the requisite notice may,
                    at our discretion, require a deposit for future bookings.
                  </p>
                  <div className="rounded-xl bg-violet-50 border border-violet-200 p-4 sm:p-5 flex items-start gap-3">
                    <CalendarX className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
                    <p className="text-violet-800 text-sm font-medium">
                      24 hours&apos; notice &mdash; no cancellation fee. We
                      value your time and flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 2. Deposits & Payment */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center">
                    <Banknote className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    2. Deposits &amp; Payment
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    ManxTints LTD endeavours to keep our booking process as
                    straightforward and accessible as possible. To that end,{" "}
                    <strong className="text-slate-800">
                      no deposit is required for any job valued at or below
                      &pound;5,000.
                    </strong>{" "}
                    We believe this demonstrates the confidence we place in the
                    quality of our service and the trust we extend to our valued
                    customers.
                  </p>
                  <p>
                    For projects exceeding &pound;5,000 in total value, a
                    deposit may be requested at the time of booking in order to
                    secure the appointment and cover material procurement costs.
                    The specific deposit amount will be communicated clearly at
                    the quotation stage. Full payment for all services is due
                    upon satisfactory completion of the installation unless
                    alternative arrangements have been agreed in writing.
                  </p>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-emerald-800 text-sm font-medium">
                      Jobs under &pound;5,000 &mdash; no deposit necessary. Book
                      with confidence, pay on completion.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 3. Glass Breakage Disclaimer */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="relative rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="absolute -top-4 left-6 sm:left-8">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md shadow-amber-500/30">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Important Notice
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-6 mt-2">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-amber-100 items-center justify-center">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                      3. Glass Breakage Disclaimer
                    </h2>
                    <p className="text-amber-700 text-sm font-medium mt-1">
                      Tinting is performed entirely at your own risk
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    ManxTints LTD takes every reasonable and practicable measure
                    to ensure that the window films we apply are safe and
                    compatible with your glazing. All films held in our inventory
                    and recommended for installation carry a solar absorption
                    rate well below the 50&nbsp;% threshold&nbsp;&mdash; our
                    standard residential and commercial tinting films operate at
                    approximately 37&nbsp;% solar absorption. These products are
                    sourced from reputable, industry-leading manufacturers and
                    have been rigorously tested for quality and reliability.
                  </p>
                  <div className="rounded-xl bg-amber-100/60 border border-amber-200 p-4 sm:p-5">
                    <p className="font-semibold text-amber-900">
                      ManxTints LTD does not cover the cost of replacing any
                      blown, shattered, or cracked glass.
                    </p>
                  </div>
                  <p>
                    Where glazing is already damaged, structurally compromised,
                    chipped, scratched, or exhibits any form of pre-existing
                    weakness&nbsp;&mdash; including, without limitation, stress
                    fractures, manufacturing defects, or deterioration arising
                    from age&nbsp;&mdash; the additional thermal absorption or
                    slight mechanical tension introduced by the application of
                    window film may, in rare circumstances, cause the glass to
                    fail. Whilst such occurrences are uncommon, they represent an
                    inherent risk associated with the tinting process that cannot
                    be entirely eliminated.
                  </p>
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 sm:p-5">
                    <p className="font-semibold text-red-800">
                      Tinting is performed entirely at your own risk. By
                      proceeding with the installation you expressly acknowledge
                      and accept this risk and agree that ManxTints LTD, its
                      directors, employees, and subcontractors shall not be held
                      liable for any glass replacement, consequential damage, or
                      associated costs arising from the application of window
                      film.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 4. Site Preparation */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-sky-100 items-center justify-center">
                    <Wrench className="h-6 w-6 text-sky-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                      4. Site Preparation
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    To ensure the highest quality installation and to protect
                    your belongings, we respectfully request that customers
                    prepare the work area in advance of our scheduled arrival.
                    This includes, but is not limited to, moving furniture,
                    plants, ornaments, electronic equipment, blinds, curtains,
                    and any other objects situated in close proximity to the
                    windows being treated.
                  </p>
                  <p>
                    A clear workspace of at least one metre around each window is
                    ideal. This allows our technicians to work efficiently and
                    reduces the risk of accidental damage to personal property.
                    Where obstacles cannot reasonably be moved, please inform us
                    in advance so that we can plan accordingly and allocate
                    additional time if necessary.
                  </p>
                  <p>
                    ManxTints LTD shall not be held liable for any damage to
                    items left in the immediate vicinity of the work area during
                    the installation process.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 4. Customer Responsibilities */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <ClipboardCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    5. Customer Responsibilities
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    In order to facilitate a professional and efficient
                    installation, we kindly request that all customers attend to
                    the following responsibilities prior to our arrival.
                    Fulfilment of these obligations helps us deliver the highest
                    standard of workmanship and ensures your complete
                    satisfaction with the finished result.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                        Glass Condition Confirmation
                      </h3>
                      <p className="text-sm text-slate-500">
                        You confirm that, to the best of your knowledge, all
                        glass surfaces presented for tinting are in good
                        structural condition and are suitable for the application
                        of window film. Any known defects, chips, cracks, or
                        stress marks must be disclosed to ManxTints LTD prior to
                        commencement of work.
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                        Clear Access &amp; Obstructions
                      </h3>
                      <p className="text-sm text-slate-500">
                        You must provide clear, unobstructed access to all
                        windows scheduled for tinting. Please move any
                        furniture, ornaments, blinds, curtains, or other items
                        from the interior of the window area to ensure a
                        seamless and uninterrupted installation process.
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 sm:col-span-2">
                      <h3 className="font-semibold text-slate-800 mb-2 text-sm">
                        Regulatory Compliance
                      </h3>
                      <p className="text-sm text-slate-500">
                        You are responsible for ensuring that the tint level and
                        type of film selected complies with all relevant Isle of
                        Man, United Kingdom, or other applicable regulations and
                        legislation. Whilst ManxTints LTD is pleased to offer
                        guidance and recommendations, the final responsibility
                        for regulatory compliance rests solely with the
                        customer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 5. Warranty & Aftercare */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    6. Warranty &amp; Aftercare
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    ManxTints LTD stands behind every installation with a
                    comprehensive warranty covering both materials and
                    workmanship. Our standard and premium films are backed by a
                    five-year guarantee against peeling, bubbling, discolouration,
                    and delamination under normal usage conditions.
                  </p>
                  <p>
                    This warranty does not extend to damage resulting from
                    misuse, accidental impact, improper cleaning methods, the
                    application of adhesive materials to tinted surfaces, or any
                    modification carried out by a third party after the original
                    installation.
                  </p>
                  <h3 className="font-semibold text-slate-800 pt-2">
                    Aftercare Guidelines
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>
                        Allow 3&ndash;5 days for the film to cure before
                        cleaning newly tinted windows.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>
                        Use only ammonia-free, non-abrasive cleaning products on
                        tinted surfaces.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>
                        Avoid placing adhesive stickers, suction cups, or
                        abrasive materials directly onto the film.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>
                        Report any concerns promptly so that we may assess and
                        address them under warranty.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 6. Limitation of Liability */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-slate-100 items-center justify-center">
                    <Scale className="h-6 w-6 text-slate-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    7. Limitation of Liability
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    To the fullest extent permitted by applicable law, the total
                    aggregate liability of ManxTints LTD in connection with any
                    claim arising out of or related to the services provided
                    shall not exceed the total amount paid by the customer for
                    the specific service giving rise to the claim.
                  </p>
                  <p>
                    ManxTints LTD shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages
                    howsoever arising, including but not limited to loss of
                    profit, loss of use, or damage to property beyond the glass
                    surface directly treated. Nothing in these terms shall
                    exclude or limit liability that cannot lawfully be excluded
                    or limited.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* ------------------------------------------------------------------ */}
            {/* 7. Contact & Queries */}
            {/* ------------------------------------------------------------------ */}
            <FadeIn>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                    8. Contact &amp; Queries
                  </h2>
                </div>
                <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                  <p>
                    Should you have any questions, concerns, or require
                    clarification regarding these Terms &amp; Conditions, please
                    do not hesitate to contact us. Our team is happy to assist
                    and will respond at the earliest opportunity.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="mailto:manxtints@gmail.com"
                      className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-5 py-3 text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">
                        manxtints@gmail.com
                      </span>
                    </a>
                    <a
                      href="tel:+447624331401"
                      className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-5 py-3 text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">
                        +44 7624 331401
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Last updated */}
            <FadeIn>
              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-400">
                  Last updated: February 2026 &mdash; ManxTints LTD, Isle of Man
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
                Ready to Get Started?
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-blue-100 mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed">
                Get your free, no-obligation quote today. No deposit needed for
                jobs under &pound;5,000.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/quote">
                  <Button
                    size="xl"
                    className="gap-2 group w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                  >
                    Get Your Free Quote
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="xl"
                    className="gap-2 w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
