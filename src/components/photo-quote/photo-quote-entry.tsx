"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { motion, useReducedMotion } from "framer-motion"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

// The sheet (upload, estimate, booking) only loads once someone taps the
// button, so the /quote first paint stays light.
const PhotoQuoteSheet = dynamic(() => import("./photo-quote-sheet").then((m) => m.PhotoQuoteSheet), { ssr: false })

interface PhotoQuoteEntryProps {
  /** Switch to the calculator tab and prefill this many windows. */
  onUseCalculator: (paneCount: number) => void
  className?: string
}

/**
 * The big centred entry point on /quote: one primary button that opens the
 * photo-quote sheet, with the calculator offered underneath as the
 * "measure yourself and save 10%" alternative.
 */
export function PhotoQuoteEntry({ onUseCalculator, className }: PhotoQuoteEntryProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const reduceMotion = useReducedMotion() ?? false

  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-col items-center gap-3", className)}>
      <motion.button
        type="button"
        data-photo-quote-entry
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.3 }
            : { delay: 0.2, type: "spring", stiffness: 260, damping: 18, mass: 0.8 }
        }
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => {
          setMounted(true)
          setOpen(true)
        }}
        className={cn(
          "group relative isolate flex w-full items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 text-left text-white",
          "bg-[linear-gradient(160deg,#1673d9_0%,#0066cc_55%,#0a5bb8_100%)] shadow-[0_8px_24px_-8px_rgba(0,74,153,0.45)]",
          "ring-1 ring-inset ring-white/10 transition-[filter] hover:brightness-[1.06]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "animate-glow-pulse motion-reduce:animate-none"
        )}
      >
        {/* Sheen: a faint diagonal highlight that drifts across now and then. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)] animate-sheen motion-reduce:hidden"
        />
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-colors group-hover:bg-white/15">
          <Camera className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="relative min-w-0">
          <span className="block text-lg font-semibold leading-tight tracking-tight sm:text-xl">
            Snap your windows for an instant quote
          </span>
          <span className="mt-1 block text-sm text-white/75">Takes 30 seconds. No measuring.</span>
        </span>
      </motion.button>

      <button
        type="button"
        onClick={() => onUseCalculator(0)}
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Prefer to measure? <span className="font-medium text-trust">Use the calculator and save 10%.</span>
      </button>

      {mounted && <PhotoQuoteSheet open={open} onOpenChange={setOpen} onUseCalculator={onUseCalculator} />}
    </div>
  )
}
