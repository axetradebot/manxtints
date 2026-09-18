"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { zoneKeys, zones, type ZoneKey } from "@/lib/pricing.zones"
import { useZone } from "./zone-provider"

interface ZoneChipProps {
  className?: string
  /** Use on dark backgrounds. */
  tone?: "light" | "dark"
  /** Compact variant for tight spots (services cards). */
  size?: "sm" | "md"
  /** Called after the visitor picks an area. */
  onChange?: (zone: ZoneKey) => void
}

/**
 * "Prices for {area} · Change" — shown wherever a price appears so the
 * customer always knows which area's rates they are looking at and can switch
 * with one tap. Choosing persists (cookie + session) and every price on the
 * page re-renders immediately through useZone().
 */
export function ZoneChip({ className, tone = "light", size = "md", onChange }: ZoneChipProps) {
  const { zoneKey, zone, isGuess, setZone } = useZone()
  const [open, setOpen] = React.useState(false)

  const choose = (key: ZoneKey) => {
    setZone(key, "user")
    onChange?.(key)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-zone-chip
          data-zone={zoneKey}
          data-zone-guess={isGuess ? "true" : undefined}
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium leading-none transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
            size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
            tone === "dark"
              ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
              : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700",
            className
          )}
          aria-label={`Prices shown for ${zone.label}. Change area`}
        >
          <MapPin className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", tone === "dark" ? "text-blue-200" : "text-blue-600")} />
          <span className="truncate">
            Prices for <span className="font-semibold">{zone.label}</span>
          </span>
          <span aria-hidden className={cn("shrink-0", tone === "dark" ? "text-white/60" : "text-slate-400")}>
            ·
          </span>
          <span className={cn("shrink-0 font-semibold underline-offset-2", tone === "dark" ? "text-blue-100" : "text-blue-600")}>
            Change
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed z-[70] w-full bg-white text-slate-900 shadow-2xl focus:outline-none",
            "bottom-0 left-0 right-0 rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
            "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-7"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">Which area is the job in?</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600">
                Pick the area where the job is. Installer rates differ by region, so the price you see is the price for
                that address.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="-mr-2 -mt-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <ul className="mt-5 space-y-2" role="list">
            {zoneKeys.map((key) => {
              const z = zones[key]
              const selected = key === zoneKey
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => choose(key)}
                    data-zone-option={key}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors",
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                          selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-transparent"
                        )}
                        aria-hidden
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{z.label}</span>
                        <span className="block text-xs text-slate-500">Standard / Premium film, VAT inclusive</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-base font-bold">£{z.pricePerM2.standard}/m²</span>
                      <span className="block text-[11px] text-slate-500">Premium £{z.pricePerM2.premium}/m²</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-4 text-xs text-slate-500">
            We&apos;ll reconfirm the area from your postcode before you submit, and any change is shown to you first
            — the total you see is the total you pay.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Muted one-liner for the top of the calculator: "Prices vary by area. Showing X." */
export function ZoneNotice({ className }: { className?: string }) {
  const { zone } = useZone()
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Prices vary by area. Showing <span className="font-medium text-foreground">{zone.label}</span>.
    </p>
  )
}
