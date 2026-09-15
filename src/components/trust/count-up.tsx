"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"

interface CountUpProps {
  value: number
  /** Decimal places to show (e.g. 1 for a 4.9 rating). */
  decimals?: number
  prefix?: string
  suffix?: string
  durationMs?: number
  className?: string
}

/**
 * Counts from 0 to `value` once the element scrolls into view.
 * Renders the final value immediately for reduced-motion users.
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1200,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setProgress(1 - Math.pow(1 - t, 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, durationMs, reduceMotion])

  const shown = reduceMotion ? value : value * progress
  const label = `${prefix}${value.toFixed(decimals)}${suffix}`

  return (
    <span ref={ref} className={className} aria-label={label}>
      {prefix}
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  )
}
