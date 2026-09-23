"use client"

/**
 * Bespoke icons for the "Why ManxTints" cards, drawn in the same 24-grid,
 * 1.75 stroke style as trust-icons. Each one plays a single short animation
 * when `active` flips to true (once, on view). Under `reduced` the same end
 * state is reached with a zero-length transition.
 *
 * `initial` is always the hidden state so the server HTML and the client's
 * first render agree; a client-only `initial={false}` would leave the
 * server's stroke-dasharray / opacity attributes un-patched after hydration.
 * Animations are opacity / pathLength only.
 */

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedIconProps {
  /** Start the one-shot animation. */
  active: boolean
  /** prefers-reduced-motion: snap to the end state instead of animating. */
  reduced: boolean
  className?: string
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

const ease = [0.21, 0.47, 0.32, 0.98] as const

/** A pane of glass with a crack that draws on from the top. */
export function CrackedPaneIcon({ active, reduced, className }: AnimatedIconProps) {
  const show = active || reduced
  const draw = (delay: number, duration: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: show ? { pathLength: 1, opacity: 1 } : undefined,
    transition: reduced ? { duration: 0 } : { duration, delay, ease },
  })

  return (
    <svg {...base} className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M4 12h16" opacity="0.35" />
      <motion.path d="M12.5 3.2 11 7.8l2.6 2.9-2.1 4.4 1.4 5.7" {...draw(0.3, 0.8)} />
      <motion.path d="m13.6 10.7 2.9-1.6" {...draw(0.85, 0.3)} />
      <motion.path d="m11.5 15.1-2.6 1.1" {...draw(1.0, 0.3)} />
    </svg>
  )
}

/** A window with a shield in front; a soft trust-green glow fades in and settles. */
export function ShieldGlassIcon({ active, reduced, className }: AnimatedIconProps) {
  const show = active || reduced

  return (
    <span className={cn("relative inline-flex", className)}>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-trust/40 blur-md"
        initial={{ opacity: 0 }}
        animate={show ? { opacity: reduced ? 0.25 : [0, 0.9, 0.25] } : undefined}
        transition={reduced ? { duration: 0 } : { duration: 1.4, times: [0, 0.45, 1], ease: "easeInOut", delay: 0.2 }}
      />
      <svg {...base} className="relative h-full w-full">
        <rect x="3" y="4" width="18" height="14" rx="1.5" opacity="0.55" />
        <path d="M12 4v14M3 11h18" opacity="0.35" />
        <path
          d="M15.5 9.5 11 11.2v2.9c0 2.8 1.9 5.1 4.5 6.4 2.6-1.3 4.5-3.6 4.5-6.4v-2.9L15.5 9.5Z"
          fill="#fff"
        />
        <motion.path
          d="m13.8 14.4 1.3 1.3 2.4-2.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={show ? { pathLength: 1, opacity: 1 } : undefined}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.7, ease }}
        />
      </svg>
    </span>
  )
}

/** A house whose window turns from daylight to a warm lit window as the sun gives way to the moon. */
export function HouseDuskIcon({ active, reduced, className }: AnimatedIconProps) {
  const show = active || reduced
  const fade = (to: number, delay: number) => ({
    initial: { opacity: 1 - to },
    animate: show ? { opacity: to } : undefined,
    transition: reduced ? { duration: 0 } : { duration: 0.9, delay, ease: "easeInOut" as const },
  })

  return (
    <svg {...base} className={className}>
      {/* Sun sets; moon appears */}
      <motion.circle cx="19" cy="5.5" r="1.8" {...fade(0, 0.3)} />
      <motion.path d="M19.6 3.6a2.4 2.4 0 1 0 1.8 3.9 3 3 0 0 1-1.8-3.9Z" {...fade(1, 0.7)} />

      {/* House */}
      <path d="m4 12 8-6.5L20 12" />
      <path d="M6 10.4V20h12v-9.6" />
      <path d="M13.5 20v-4.6h-3V20" />

      {/* Window: daylight pane fades out, warm lit pane fades in */}
      <rect x="7.6" y="12.4" width="3.2" height="3.2" rx="0.5" />
      <motion.rect x="8.1" y="12.9" width="2.2" height="2.2" rx="0.3" fill="#bfdbfe" stroke="none" {...fade(0, 0.5)} />
      <motion.rect x="8.1" y="12.9" width="2.2" height="2.2" rx="0.3" fill="#fbbf24" stroke="none" {...fade(1, 0.5)} />
    </svg>
  )
}
