"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { track } from "@/lib/analytics"

// Fires a page_view on every client-side navigation (and initial load).
// The quote page additionally gets its own funnel event.
export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return
    track("page_view")
    if (pathname === "/quote") track("quote_page_view")
  }, [pathname])

  return null
}
