// Shared zone-resolution plumbing used by proxy.ts (server) and the
// ZoneProvider (client). Pure helpers only — no React, no Next imports.

import { canonicalZone, defaultZone, isZoneKey, type ZoneKey } from "./pricing.zones"

/** Functional cookie holding the customer's pricing area. 30 days. */
export const ZONE_COOKIE = "mt_zone"
export const ZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
/** Mirror of the cookie for the current tab (survives a reload, not a new tab). */
export const ZONE_SESSION_KEY = "mt_zone"
/** URL parameter used by regional ad links, e.g. /quote?zone=se */
export const ZONE_PARAM = "zone"

/** Request headers proxy.ts forwards so the root layout can seed the client. */
export const ZONE_HEADER = "x-mt-zone"
export const ZONE_SOURCE_HEADER = "x-mt-zone-source"

/**
 * Where the current zone came from, in priority order.
 *  - param:    ?zone= on the URL (ad link)
 *  - user:     picked in the zone chip
 *  - postcode: reconfirmed from the postcode at the quote step
 *  - stored:   a previous param/user/postcode choice read back from the cookie
 *  - ip:       Vercel geolocation default — only a guess, chip always visible
 *  - default:  nothing known, North West
 */
export type ZoneSource = "param" | "user" | "postcode" | "stored" | "ip" | "default"

const SOURCES: ReadonlySet<string> = new Set<ZoneSource>(["param", "user", "postcode", "stored", "ip", "default"])

export function isZoneSource(value: unknown): value is ZoneSource {
  return typeof value === "string" && SOURCES.has(value)
}

/** True when the zone was chosen (or confirmed) rather than guessed. */
export function isExplicitSource(source: ZoneSource): boolean {
  return source === "param" || source === "user" || source === "postcode" || source === "stored"
}

export interface ResolvedZone {
  zone: ZoneKey
  source: ZoneSource
}

/**
 * Resolution order shared by server and client:
 *   URL param → stored choice → IP default → North West.
 * `?zone=standard` is the legacy alias for North West.
 */
export function resolveZone(input: {
  param?: string | null
  stored?: string | null
  ipZone?: ZoneKey | null
}): ResolvedZone {
  const param = canonicalZone(input.param)
  if (param) return { zone: param, source: "param" }
  const stored = canonicalZone(input.stored)
  if (stored) return { zone: stored, source: "stored" }
  if (input.ipZone && isZoneKey(input.ipZone)) return { zone: input.ipZone, source: "ip" }
  return { zone: defaultZone, source: "default" }
}

/** Serialises the functional zone cookie for document.cookie / Set-Cookie. */
export function zoneCookieString(zone: ZoneKey, secure: boolean): string {
  return [
    `${ZONE_COOKIE}=${zone}`,
    `Max-Age=${ZONE_COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}
