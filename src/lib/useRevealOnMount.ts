"use client"

import { useEffect, useRef } from "react"

/**
 * Scrolls the referenced element into view when `active` flips to true.
 *
 * Used for the "sent!" cards: the long form they replace collapses to a short
 * card, so the page shrinks and the browser clamps the old scroll position to
 * the new bottom — the customer sees the footer, not the confirmation. Waits a
 * frame so the card has mounted (and FadeIn has begun) before scrolling.
 */
export function useRevealOnMount<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return
    const frame = requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
    return () => cancelAnimationFrame(frame)
  }, [active])

  return ref
}
