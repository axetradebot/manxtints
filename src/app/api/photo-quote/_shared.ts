// Helpers shared by the photo-quote route handlers.

import { createHash } from "node:crypto"
import type { NextRequest } from "next/server"
import { canonicalZone, defaultZone, type ZoneKey } from "@/lib/pricing.zones"
import { ZONE_COOKIE } from "@/lib/zone"
import { clientIp } from "@/lib/rateLimit"

/** Visitor key for limits and logs — never the raw address. */
export function ipHashFor(request: NextRequest): { ip: string; ipHash: string } {
  const ip = clientIp(request.headers)
  const salt = process.env.PHOTO_SIGNING_SECRET || process.env.ADMIN_PASSWORD || "manxtints"
  return { ip, ipHash: createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32) }
}

/**
 * Pricing area for this request. The body's zone wins (it is what the sheet
 * showed the customer); proxy.ts does not run for API routes so the cookie
 * is read here directly as the fallback.
 */
export function resolveZoneFor(request: NextRequest, bodyZone: unknown): ZoneKey {
  return canonicalZone(bodyZone) ?? canonicalZone(request.cookies.get(ZONE_COOKIE)?.value) ?? defaultZone
}

export function requestOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") || "https"
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "www.manxtints.com"
  if (host.startsWith("http")) return host.replace(/\/$/, "")
  return `${proto}://${host}`
}

/** Blocks cross-site POSTs when the browser sends an Origin header. */
export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || ""
    return new URL(origin).host === host
  } catch {
    return false
  }
}
