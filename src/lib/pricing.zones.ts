// Single source of truth for REGIONAL pricing.
//
// Installer rates differ by area, so every £/m² the site shows or calculates
// is read from `zones[zone]`. The calculator maths (floors, DIY discount,
// guarantee) lives in ./pricing.ts and is zone-independent.
//
// Legal keystone: the customer must always be able to see which zone's prices
// they are looking at, change it, and never have a total change silently.
// The zone is resolved early (URL → stored choice → IP default → standard) and
// reconfirmed from the postcode before submission — see ./zone.ts.

export type ZoneKey = "standard" | "se"

export type PropertyRateKey = "house" | "conservatory" | "commercial"

// ---------------------------------------------------------------------------
// Film tiers (residential + conservatory). Commercial has a single film.
// ---------------------------------------------------------------------------

export type TierKey = "standard" | "premium"

export interface Tier {
  label: string
  film: string
  tagline: string
  bullets: readonly string[]
  guaranteeYears: number
  badge?: string
}

export const tiers: Record<TierKey, Tier> = {
  standard: {
    label: "Standard",
    film: "Silver 20",
    tagline: "Mirror privacy by day. Great value.",
    bullets: ["One-way mirror effect in daylight", "Reflects heat & glare", "5-year guarantee included"],
    guaranteeYears: 5,
  },
  premium: {
    label: "Premium",
    film: "Reflective Privacy 20",
    tagline: "Privacy without the mirror look inside.",
    bullets: [
      "Same one-way privacy by day",
      "Clear, non-reflective view from inside",
      "Higher heat rejection",
      "10-year guarantee included",
    ],
    guaranteeYears: 10,
    badge: "Most popular",
  },
}

export const tierKeys = Object.keys(tiers) as TierKey[]
export const defaultTier: TierKey = "standard"

export function isTierKey(value: unknown): value is TierKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(tiers, value)
}

/** Both films are honest about night-time — shown on every tier card. */
export const NIGHT_TIME_NOTE = "Daytime privacy — reverses at night with the lights on."

/** Project types that offer a choice of film tier. */
export const TIERED_TYPES: readonly PropertyRateKey[] = ["house", "conservatory"]

export function hasTiers(type: string | null | undefined): type is "house" | "conservatory" {
  return type === "house" || type === "conservatory"
}

export type GuideRateKey =
  | "privacy"
  | "frosted"
  | "solar"
  | "conservatory"
  | "commercialPrivacy"
  | "uvBlocking"
  | "securityCommercial"
  | "securityResidential"
  | "energySaving"
  | "antiFog"
  | "dataJammer"
  | "blast"

export interface Zone {
  /** Customer-facing area name, shown in the zone chip and on every price. */
  label: string
  /** Residential £/m² per film tier, VAT inclusive. `standard` is the "from" price. */
  pricePerM2: Record<TierKey, number>
  /** Calculator rates per project type, VAT inclusive. Tiered types are per tier. */
  rates: {
    house: Record<TierKey, number>
    conservatory: Record<TierKey, number>
    commercial: number
  }
  /** Services page price guide, VAT inclusive. */
  guide: Record<GuideRateKey, number>
  /** Vehicle packages (service currently paused, kept in step for re-enable). */
  vehicle: Record<"car" | "suv", Record<"2" | "4", number>>
}

export const zones: Record<ZoneKey, Zone> = {
  standard: {
    label: "Isle of Man & North",
    pricePerM2: { standard: 99, premium: 125 },
    rates: {
      house: { standard: 99, premium: 125 },
      conservatory: { standard: 120, premium: 146 },
      commercial: 98,
    },
    guide: {
      privacy: 99,
      frosted: 99,
      solar: 99,
      conservatory: 120,
      commercialPrivacy: 98,
      uvBlocking: 119,
      securityCommercial: 119,
      securityResidential: 99,
      energySaving: 90,
      antiFog: 200,
      dataJammer: 900,
      blast: 100,
    },
    vehicle: { car: { "2": 200, "4": 250 }, suv: { "2": 250, "4": 300 } },
  },
  se: {
    label: "South East & London",
    pricePerM2: { standard: 135, premium: 165 },
    rates: {
      house: { standard: 135, premium: 165 },
      conservatory: { standard: 150, premium: 180 },
      commercial: 124,
    },
    guide: {
      privacy: 135,
      frosted: 135,
      solar: 135,
      conservatory: 150,
      commercialPrivacy: 124,
      uvBlocking: 150,
      securityCommercial: 150,
      securityResidential: 135,
      energySaving: 115,
      antiFog: 250,
      dataJammer: 1100,
      blast: 125,
    },
    vehicle: { car: { "2": 250, "4": 310 }, suv: { "2": 310, "4": 375 } },
  },
}

export const defaultZone: ZoneKey = "standard"

export const zoneKeys = Object.keys(zones) as ZoneKey[]

export function isZoneKey(value: unknown): value is ZoneKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(zones, value)
}

/**
 * The calculator £/m² for a project type in a zone. Tiered types read the
 * chosen tier; commercial has one film so the tier is ignored.
 */
export function rateFor(zone: Zone, type: PropertyRateKey, tier: TierKey): number {
  if (type === "commercial") return zone.rates.commercial
  return zone.rates[type][tier]
}

// ---------------------------------------------------------------------------
// Postcode area → zone
// ---------------------------------------------------------------------------

/**
 * Outward-code letter prefixes (postcode areas) priced at South East rates.
 * Everything else that parses as a UK/IoM postcode is `standard`.
 * Editable: add or remove areas here and nothing else needs to change.
 */
const SE_POSTCODE_AREAS = [
  "SL", "RG", "GU", "KT", "SM", "TW", "HA", "UB", "WD", "AL", "HP", "OX", "RH",
  "CR", "BR", "DA", "EN", "IG", "RM", "SW", "W", "NW", "N", "E", "EC", "WC", "SE",
] as const

export const postcodeAreaToZone: Record<string, ZoneKey> = Object.fromEntries(
  SE_POSTCODE_AREAS.map((area) => [area, "se" as ZoneKey])
)

/** Loose UK/IoM postcode shape: outward code, optional inward code. */
const POSTCODE_RE = /^([A-Z]{1,2})\d[A-Z\d]?\s*(\d[A-Z]{2})?$/

/**
 * Returns the zone for a postcode, or `null` when the input does not parse as
 * a postcode at all (unmapped). Callers keep the displayed zone in that case
 * and tell the customer pricing will be confirmed with their quote.
 */
export function zoneFromPostcode(input: string | null | undefined): ZoneKey | null {
  if (!input) return null
  const normalised = input.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const match = normalised.match(POSTCODE_RE)
  if (!match) return null
  const area = match[1]
  return Object.prototype.hasOwnProperty.call(postcodeAreaToZone, area) ? postcodeAreaToZone[area] : defaultZone
}

// ---------------------------------------------------------------------------
// IP geolocation → zone (Vercel geo headers)
// ---------------------------------------------------------------------------

export interface GeoHint {
  country?: string | null
  region?: string | null
  city?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
}

/** Cities Vercel commonly reports for the SE commuter belt and Greater London. */
const SE_CITIES = new Set(
  [
    "london", "slough", "reading", "guildford", "woking", "croydon", "sutton", "kingston upon thames",
    "twickenham", "richmond", "harrow", "uxbridge", "watford", "st albans", "hemel hempstead",
    "high wycombe", "oxford", "maidenhead", "windsor", "bracknell", "wokingham", "redhill", "reigate",
    "crawley", "horsham", "bromley", "dartford", "enfield", "ilford", "romford", "barnet", "ealing",
    "hounslow", "hillingdon", "brent", "camden", "islington", "hackney", "westminster", "lambeth",
    "southwark", "lewisham", "greenwich", "bexley", "havering", "newham", "wandsworth", "merton",
    "epsom", "leatherhead", "esher", "weybridge", "staines", "egham", "amersham", "chesham",
    "aylesbury", "hatfield", "welwyn garden city", "stevenage", "hertford", "cheshunt", "waltham cross",
    "sevenoaks", "tonbridge", "gravesend", "orpington", "banbury", "bicester", "abingdon", "didcot",
    "newbury", "basingstoke", "farnborough", "aldershot", "camberley", "fleet",
  ].map((c) => c.toLowerCase())
)

/**
 * Bounding box for the SE commuter belt (Greater London, Berkshire, Surrey,
 * Bucks, Herts, Oxon, Kent/Sussex commuter towns). Deliberately generous:
 * this only sets a DEFAULT and the zone chip is always shown for IP defaults.
 */
const SE_BOUNDS = { minLat: 50.75, maxLat: 52.05, minLng: -1.45, maxLng: 1.45 }

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Maps Vercel geo data to a zone. Anything outside Great Britain, or with no
 * usable data, falls back to `standard` — a safe default that the customer
 * can change with one tap.
 */
export function zoneFromGeo(geo: GeoHint): ZoneKey {
  const country = geo.country?.toUpperCase()
  if (country !== "GB") return defaultZone

  const region = geo.region?.toUpperCase()
  if (region && region !== "ENG") return defaultZone

  const city = geo.city ? safeDecode(geo.city).toLowerCase() : ""
  if (city && SE_CITIES.has(city)) return "se"

  const lat = toNumber(geo.latitude)
  const lng = toNumber(geo.longitude)
  if (
    lat !== null &&
    lng !== null &&
    lat >= SE_BOUNDS.minLat &&
    lat <= SE_BOUNDS.maxLat &&
    lng >= SE_BOUNDS.minLng &&
    lng <= SE_BOUNDS.maxLng
  ) {
    return "se"
  }

  return defaultZone
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Reads the Vercel geo headers off any Headers-like object. */
export function geoFromHeaders(get: (name: string) => string | null | undefined): GeoHint {
  return {
    country: get("x-vercel-ip-country"),
    region: get("x-vercel-ip-country-region"),
    city: get("x-vercel-ip-city"),
    latitude: get("x-vercel-ip-latitude"),
    longitude: get("x-vercel-ip-longitude"),
  }
}
