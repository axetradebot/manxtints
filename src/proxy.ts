import { NextResponse, type NextRequest } from "next/server"
import { geoFromHeaders, zoneFromGeo } from "@/lib/pricing.zones"
import {
  ZONE_COOKIE,
  ZONE_COOKIE_MAX_AGE,
  ZONE_HEADER,
  ZONE_PARAM,
  ZONE_SOURCE_HEADER,
  resolveZone,
} from "@/lib/zone"

/**
 * Resolves the pricing zone for every page request and forwards it to the
 * root layout as request headers, so the first server render already shows
 * the right area's prices (no client-side flash from one price to another).
 *
 *   ?zone=iom|north|se (or the legacy alias standard → north)
 *                      → wins, and is persisted to the 30-day mt_zone cookie
 *   mt_zone cookie     → a choice the visitor (or an ad link) made earlier
 *   Vercel geo headers → only a DEFAULT; the chip stays visible for it
 *   otherwise          → north
 */
export function proxy(request: NextRequest) {
  const param = request.nextUrl.searchParams.get(ZONE_PARAM)
  const stored = request.cookies.get(ZONE_COOKIE)?.value
  const ipZone = zoneFromGeo(geoFromHeaders((name) => request.headers.get(name)))

  const resolved = resolveZone({ param, stored, ipZone })

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(ZONE_HEADER, resolved.zone)
  requestHeaders.set(ZONE_SOURCE_HEADER, resolved.source)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (resolved.source === "param" && stored !== resolved.zone) {
    response.cookies.set(ZONE_COOKIE, resolved.zone, {
      maxAge: ZONE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    })
  }

  return response
}

export const config = {
  // Pages only — skip static assets, images and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images|gallery|projects|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)"],
}
