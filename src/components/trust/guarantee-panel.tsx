"use client"

import { hasStat, site } from "@/site.config"
import { FadeIn } from "@/components/motion"
import { DepositIcon, GuaranteeIcon, ShieldTickIcon } from "./trust-icons"

/**
 * The satisfaction promise verbatim from config, the workmanship guarantee and
 * deposit-protected booking. One calm line each.
 */
export function GuaranteePanel({ compact = false }: { compact?: boolean }) {
  const { guarantee } = site
  const lines = [
    {
      icon: ShieldTickIcon,
      title: "Guaranteed satisfaction",
      text: guarantee.satisfactionPromise,
    },
    hasStat(guarantee.workmanshipYears) && {
      icon: GuaranteeIcon,
      title: `${guarantee.workmanshipYears}-year workmanship warranty`,
      text: "Written, in your name, and honoured by ManxTints — whichever installer fitted your film.",
    },
    {
      icon: DepositIcon,
      title: "Deposit-protected booking",
      text: guarantee.depositLine,
    },
  ].filter(Boolean) as { icon: typeof ShieldTickIcon; title: string; text: string }[]

  return (
    <FadeIn>
      <div className="rounded-3xl border border-trust/20 bg-trust-soft/60 p-6 md:p-10">
        {!compact && (
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-trust">Our promise</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">
              Booked with ManxTints. Guaranteed by ManxTints.
            </h2>
          </div>
        )}
        <ul className="grid gap-6 md:grid-cols-3">
          {lines.map((line) => (
            <li key={line.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-trust shadow-sm ring-1 ring-trust/15">
                <line.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{line.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{line.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  )
}
