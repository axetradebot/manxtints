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

export type ZoneKey = "iom" | "north" | "se"

/**
 * Old ad links and cookies used `standard` for the combined Isle of Man & North
 * zone. It now means North West. This is the only place that string is accepted.
 */
export const ZONE_ALIASES: Record<string, ZoneKey> = { standard: "north" }

/** A real zone key, or the `standard` → `north` alias. Junk returns null. */
export function canonicalZone(value: unknown): ZoneKey | null {
  if (isZoneKey(value)) return value
  if (typeof value === "string" && Object.prototype.hasOwnProperty.call(ZONE_ALIASES, value)) {
    return ZONE_ALIASES[value]
  }
  return null
}

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
  /** £ minimum job charge in this zone, applied after the DIY discount and voucher. */
  minJob: number
  /**
   * Films offered here. One entry means no tier step: the film is shown under
   * `filmDisplayName` (or the tier's own name) with no Standard/Premium comparison.
   */
  tiers: readonly TierKey[]
  /** Plain name for a single-film zone. Hides the tier label. */
  filmDisplayName?: string
  /** Bullets for a single-film zone. Two-tier zones use `tiers[key].bullets`. */
  filmBullets?: readonly string[]
  /** Residential £/m² per film offered, VAT inclusive. */
  pricePerM2: Partial<Record<TierKey, number>>
  /** Calculator rates per project type, VAT inclusive. Tiered types are per offered tier. */
  rates: {
    house: Partial<Record<TierKey, number>>
    conservatory: Partial<Record<TierKey, number>>
    commercial: number
  }
  /** Services page price guide, VAT inclusive. */
  guide: Record<GuideRateKey, number>
  /** Vehicle packages (service currently paused, kept in step for re-enable). */
  vehicle: Record<"car" | "suv", Record<"2" | "4", number>>
}

const IOM_FILM_BULLETS = [
  "One-way privacy by day",
  "Clear view from inside",
  "Heat and glare reduction",
  "5-year guarantee",
] as const

export const zones: Record<ZoneKey, Zone> = {
  iom: {
    label: "Isle of Man",
    minJob: 100,
    // The film itself is the dual-reflective one, but it is not sold as "Premium"
    // and the 10-year guarantee is an upsell, not included.
    tiers: ["premium"],
    filmDisplayName: "Dual-reflective privacy film",
    filmBullets: IOM_FILM_BULLETS,
    pricePerM2: { premium: 99 },
    rates: {
      house: { premium: 99 },
      conservatory: { premium: 120 },
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
  north: {
    label: "North West",
    minJob: 100,
    tiers: ["standard", "premium"],
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
    minJob: 350,
    tiers: ["standard", "premium"],
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

export const defaultZone: ZoneKey = "north"

export const zoneKeys = Object.keys(zones) as ZoneKey[]

export function isZoneKey(value: unknown): value is ZoneKey {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(zones, value)
}

/** True when the visitor picks between Standard and Premium. */
export function zoneHasTierChoice(zone: Zone): boolean {
  return zone.tiers.length > 1
}

/** Standard where both films are offered; the only film in a single-film zone. */
export function defaultTierFor(zone: Zone): TierKey {
  if (zone.tiers.length === 1) return zone.tiers[0]
  return zone.tiers.includes(defaultTier) ? defaultTier : zone.tiers[0]
}

export function tierAvailable(zone: Zone, tier: TierKey): boolean {
  return zone.tiers.includes(tier)
}

/**
 * Years included before any upsell. A single-film zone keeps the pre-tier
 * 5-year cover even when the film itself is the dual-reflective one.
 * Premium in a two-tier zone includes 10.
 */
export function includedGuaranteeYears(zone: Zone, tier: TierKey): number {
  if (!zoneHasTierChoice(zone)) return tiers.standard.guaranteeYears
  return tiers[tier].guaranteeYears
}

/** True only when the chosen Premium film in a two-tier zone already includes 10 years. */
export function guaranteeIncludedFor(zone: Zone, tier: TierKey): boolean {
  return zoneHasTierChoice(zone) && tier === "premium"
}

export interface FilmPresentation {
  /** "Dual-reflective privacy film", or "Premium — Reflective Privacy 20". */
  name: string
  bullets: readonly string[]
  /** Set for a two-tier choice. Omitted so a single film is not called Premium. */
  label?: string
}

export function filmPresentation(zone: Zone, tier: TierKey): FilmPresentation {
  if (!zoneHasTierChoice(zone) && zone.filmDisplayName) {
    return { name: zone.filmDisplayName, bullets: zone.filmBullets ?? tiers[tier].bullets }
  }
  const film = tiers[tier]
  return { name: `${film.label} — ${film.film}`, label: film.label, bullets: film.bullets }
}

/** Lowest residential headline rate in the zone (the "from" price). */
export function fromPrice(zone: Zone): number {
  const key = zone.tiers.includes("standard") ? "standard" : zone.tiers[0]
  const price = zone.pricePerM2[key]
  if (price === undefined) throw new Error(`No headline rate for ${zone.label}`)
  return price
}

/**
 * The calculator £/m² for a project type in a zone. Tiered types read the
 * chosen tier when the zone offers it, otherwise the zone's only film.
 * Commercial has one film so the tier is ignored.
 */
export function rateFor(zone: Zone, type: PropertyRateKey, tier: TierKey): number {
  if (type === "commercial") return zone.rates.commercial
  const offered = tierAvailable(zone, tier) ? tier : defaultTierFor(zone)
  const price = zone.rates[type][offered]
  if (price === undefined) throw new Error(`No ${type} rate for ${offered} in ${zone.label}`)
  return price
}

export interface TierStepTransition {
  tier: TierKey
  step: number
}

/**
 * Re-derives the film and calculator step when the zone changes.
 * Entering a two-tier zone from a single-film zone inserts the tier step
 * (Standard selected). Leaving one removes it. The quote is then just
 * (windows, zone, this tier).
 */
export function tierAfterZoneChange(input: {
  from: Zone
  to: Zone
  tier: TierKey
  /** House and conservatory choose a film; commercial does not. */
  propertyHasTiers: boolean
  step: number
}): TierStepTransition {
  const fromChoice = input.propertyHasTiers && zoneHasTierChoice(input.from)
  const toChoice = input.propertyHasTiers && zoneHasTierChoice(input.to)
  let tier = input.tier
  if (!fromChoice && toChoice) tier = defaultTierFor(input.to)
  else if (!tierAvailable(input.to, tier)) tier = defaultTierFor(input.to)

  let step = input.step
  if (!fromChoice && toChoice && input.step === 4) step = 3
  if (fromChoice && !toChoice && input.step === 3) step = 4
  return { tier, step }
}

// ---------------------------------------------------------------------------
// Postcode area → zone
// ---------------------------------------------------------------------------

/**
 * Outward-code letter prefixes. First match wins, so two-letter areas (IM, WA)
 * are listed alongside one-letter ones and the regex captures the longer area.
 * Anything that parses but is not listed is the default zone (North West).
 */
const SE_POSTCODE_AREAS = [
  "SL", "RG", "GU", "KT", "SM", "TW", "HA", "UB", "WD", "AL", "HP", "OX", "RH",
  "CR", "BR", "DA", "EN", "IG", "RM", "SW", "W", "NW", "N", "E", "EC", "WC", "SE",
] as const

const IOM_POSTCODE_AREAS = ["IM"] as const

/** Greater Manchester, Cheshire, Merseyside, Lancashire, Cumbria, plus Stoke. */
const NORTH_POSTCODE_AREAS = [
  "M", "SK", "WA", "WN", "BL", "OL", "L", "CH", "CW", "PR", "BB", "FY", "LA", "ST", "CA",
] as const

export const postcodeAreaToZone: Record<string, ZoneKey> = {
  ...Object.fromEntries(SE_POSTCODE_AREAS.map((area) => [area, "se" as ZoneKey])),
  ...Object.fromEntries(IOM_POSTCODE_AREAS.map((area) => [area, "iom" as ZoneKey])),
  ...Object.fromEntries(NORTH_POSTCODE_AREAS.map((area) => [area, "north" as ZoneKey])),
}

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

/** Towns Vercel reports on the Isle of Man. Country code IM is the primary signal. */
const IOM_CITIES = new Set(
  ["douglas", "ramsey", "peel", "castletown", "port erin", "port st mary", "onchan", "laxey"].map((c) => c.toLowerCase())
)

/** Isle of Man island box, checked before the North West box. */
const IOM_BOUNDS = { minLat: 54.05, maxLat: 54.42, minLng: -4.85, maxLng: -4.3 }

const NW_CITIES = new Set(
  [
    "manchester", "salford", "stockport", "bolton", "wigan", "oldham", "rochdale", "bury",
    "altrincham", "sale", "cheadle", "stretford", "leigh", "chester", "warrington", "macclesfield",
    "crewe", "northwich", "runcorn", "widnes", "ellesmere port", "liverpool", "birkenhead",
    "bootle", "southport", "st helens", "wallasey", "preston", "blackpool", "blackburn",
    "burnley", "lancaster", "morecambe", "fleetwood", "chorley", "leyland", "carlisle",
    "kendal", "barrow-in-furness", "barrow in furness", "whitehaven", "workington", "penrith",
    "stoke-on-trent", "stoke on trent",
  ].map((c) => c.toLowerCase())
)

/**
 * Greater Manchester, Cheshire, Merseyside, Lancashire and Cumbria.
 * West of the Pennines and north of the SE commuter belt.
 */
const NW_BOUNDS = { minLat: 53.15, maxLat: 55.25, minLng: -3.7, maxLng: -2.0 }

function inBox(
  lat: number | null,
  lng: number | null,
  box: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
  return (
    lat !== null &&
    lng !== null &&
    lat >= box.minLat &&
    lat <= box.maxLat &&
    lng >= box.minLng &&
    lng <= box.maxLng
  )
}

/**
 * Maps Vercel geo data to a zone. Country `IM` is the Isle of Man. Anything
 * outside the UK, or with no usable data, falls back to North West — a safe
 * default the customer can change with one tap.
 */
export function zoneFromGeo(geo: GeoHint): ZoneKey {
  const country = geo.country?.toUpperCase()
  if (country === "IM") return "iom"
  if (country !== "GB") return defaultZone

  const region = geo.region?.toUpperCase()
  if (region && region !== "ENG") return defaultZone

  const city = geo.city ? safeDecode(geo.city).toLowerCase() : ""
  if (city && IOM_CITIES.has(city)) return "iom"
  if (city && SE_CITIES.has(city)) return "se"
  if (city && NW_CITIES.has(city)) return "north"

  const lat = toNumber(geo.latitude)
  const lng = toNumber(geo.longitude)
  if (inBox(lat, lng, IOM_BOUNDS)) return "iom"
  if (inBox(lat, lng, SE_BOUNDS)) return "se"
  if (inBox(lat, lng, NW_BOUNDS)) return "north"

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
