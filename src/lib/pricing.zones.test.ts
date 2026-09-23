import { describe, it, expect } from "vitest"
import {
  canonicalZone,
  defaultTier,
  defaultZone,
  filmPresentation,
  fromPrice,
  geoFromHeaders,
  guaranteeIncludedFor,
  hasTiers,
  includedGuaranteeYears,
  isTierKey,
  isZoneKey,
  postcodeAreaToZone,
  rateFor,
  tierAfterZoneChange,
  tierKeys,
  tiers,
  zoneFromGeo,
  zoneFromPostcode,
  zoneHasTierChoice,
  zoneKeys,
  zones,
} from "./pricing.zones"
import { quoteProperty } from "./pricing"
import { buildPropertyLead } from "./leadPayload"
import { resolveZone } from "./zone"

describe("zones config", () => {
  it("has the three published zones with the agreed headline rates", () => {
    expect(zoneKeys).toEqual(["iom", "north", "se"])
    expect(zones.iom.label).toBe("Isle of Man")
    expect(zones.iom.tiers).toEqual(["premium"])
    expect(zones.iom.pricePerM2).toEqual({ premium: 99 })
    expect(zones.iom.filmDisplayName).toBe("Dual-reflective privacy film")
    expect(zones.north.label).toBe("North West")
    expect(zones.north.pricePerM2).toEqual({ standard: 99, premium: 125 })
    expect(zones.se.label).toBe("South East & London")
    expect(zones.se.pricePerM2).toEqual({ standard: 135, premium: 165 })
    expect(defaultZone).toBe("north")
  })

  it("headline rates match the residential calculator rates in every zone", () => {
    for (const key of zoneKeys) {
      const zone = zones[key]
      expect(zone.rates.house).toEqual(zone.pricePerM2)
      expect(zone.guide.privacy).toBe(fromPrice(zone))
      if (zoneHasTierChoice(zone)) {
        expect(zone.pricePerM2.premium).toBeGreaterThan(zone.pricePerM2.standard ?? 0)
        expect(zone.rates.conservatory.premium).toBeGreaterThan(zone.rates.conservatory.standard ?? 0)
      }
    }
  })

  it("Isle of Man presents one film without the Premium label and keeps the 5-year upsell", () => {
    const film = filmPresentation(zones.iom, "premium")
    expect(film.label).toBeUndefined()
    expect(film.name).toBe("Dual-reflective privacy film")
    expect(film.name.toLowerCase()).not.toContain("premium")
    expect(includedGuaranteeYears(zones.iom, "premium")).toBe(5)
    expect(guaranteeIncludedFor(zones.iom, "premium")).toBe(false)
    expect(guaranteeIncludedFor(zones.north, "premium")).toBe(true)
    expect(rateFor(zones.iom, "house", "premium")).toBe(99)
    expect(rateFor(zones.iom, "house", "standard")).toBe(99)
  })

  it("tiers: Standard 5yr, Premium 10yr with the Most popular badge", () => {
    expect(tierKeys).toEqual(["standard", "premium"])
    expect(defaultTier).toBe("standard")
    expect(tiers.standard.guaranteeYears).toBe(5)
    expect(tiers.premium.guaranteeYears).toBe(10)
    expect(tiers.premium.badge).toBe("Most popular")
    expect(isTierKey("premium")).toBe(true)
    expect(isTierKey("__proto__")).toBe(false)
    expect(isTierKey("gold")).toBe(false)
  })

  it("rateFor reads the tier for house/conservatory and ignores it for commercial", () => {
    expect(rateFor(zones.north, "house", "standard")).toBe(99)
    expect(rateFor(zones.north, "house", "premium")).toBe(125)
    expect(rateFor(zones.se, "conservatory", "premium")).toBe(180)
    expect(rateFor(zones.se, "commercial", "premium")).toBe(zones.se.rates.commercial)
    expect(hasTiers("house")).toBe(true)
    expect(hasTiers("conservatory")).toBe(true)
    expect(hasTiers("commercial")).toBe(false)
    expect(hasTiers(null)).toBe(false)
  })

  it("isZoneKey rejects junk and the legacy alias", () => {
    expect(isZoneKey("se")).toBe(true)
    expect(isZoneKey("iom")).toBe(true)
    expect(isZoneKey("north")).toBe(true)
    expect(isZoneKey("standard")).toBe(false)
    expect(canonicalZone("standard")).toBe("north")
    expect(canonicalZone("SE")).toBeNull()
    expect(isZoneKey("london")).toBe(false)
    expect(isZoneKey(null)).toBe(false)
    expect(isZoneKey("__proto__")).toBe(false)
  })
})

describe("zoneFromPostcode", () => {
  it("maps the seeded South East areas to se", () => {
    for (const [area, zone] of Object.entries(postcodeAreaToZone)) {
      if (zone !== "se") continue
      expect(zoneFromPostcode(`${area}1 1AA`)).toBe("se")
    }
  })

  it("maps Slough / London variants to se regardless of spacing and case", () => {
    expect(zoneFromPostcode("SL1 2AB")).toBe("se")
    expect(zoneFromPostcode("sl12ab")).toBe("se")
    expect(zoneFromPostcode(" SL1 ")).toBe("se")
    expect(zoneFromPostcode("EC1A 1BB")).toBe("se")
    expect(zoneFromPostcode("E1 6AN")).toBe("se")
    expect(zoneFromPostcode("W1A 0AX")).toBe("se")
    expect(zoneFromPostcode("N1")).toBe("se")
    expect(zoneFromPostcode("EN1 1AA")).toBe("se")
  })

  it("maps Isle of Man, the North West, and everywhere else", () => {
    expect(zoneFromPostcode("IM2 1BB")).toBe("iom")
    expect(zoneFromPostcode("im1 1aa")).toBe("iom")
    expect(zoneFromPostcode("M1 1AE")).toBe("north")
    expect(zoneFromPostcode("L1 8JQ")).toBe("north")
    expect(zoneFromPostcode("WA1 1AA")).toBe("north")
    expect(zoneFromPostcode("CA1 1AA")).toBe("north")
    expect(zoneFromPostcode("EH1 1YZ")).toBe("north")
    expect(zoneFromPostcode("SO14 7AA")).toBe("north")
    expect(zoneFromPostcode("NE1 4ST")).toBe("north")
  })

  it("returns null for unmapped / invalid input so the caller keeps the displayed zone", () => {
    expect(zoneFromPostcode("")).toBeNull()
    expect(zoneFromPostcode(null)).toBeNull()
    expect(zoneFromPostcode("hello")).toBeNull()
    expect(zoneFromPostcode("12345")).toBeNull()
    expect(zoneFromPostcode("SLOUGH")).toBeNull()
  })
})

describe("zoneFromGeo (Vercel headers)", () => {
  const headers = (h: Record<string, string>) => geoFromHeaders((name) => h[name.toLowerCase()] ?? null)

  it("no headers → north", () => {
    expect(zoneFromGeo(headers({}))).toBe("north")
  })

  it("country IM → iom, ahead of any UK city", () => {
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "IM" }))).toBe("iom")
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "IM", "x-vercel-ip-city": "London" }))).toBe("iom")
  })

  it("SE city → se", () => {
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-city": "Slough" }))).toBe("se")
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-city": "London" }))).toBe("se")
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-city": "St%20Albans" }))).toBe("se")
  })

  it("SE lat/lng inside the commuter-belt box → se", () => {
    expect(
      zoneFromGeo(
        headers({
          "x-vercel-ip-country": "GB",
          "x-vercel-ip-country-region": "ENG",
          "x-vercel-ip-latitude": "51.5072",
          "x-vercel-ip-longitude": "-0.1276",
        })
      )
    ).toBe("se")
  })

  it("North West and the Isle of Man resolve from city or coordinates", () => {
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-city": "Manchester" }))).toBe("north")
    expect(
      zoneFromGeo(
        headers({
          "x-vercel-ip-country": "GB",
          "x-vercel-ip-city": "Douglas",
          "x-vercel-ip-latitude": "54.15",
          "x-vercel-ip-longitude": "-4.48",
        })
      )
    ).toBe("iom")
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-country-region": "SCT", "x-vercel-ip-city": "London" }))).toBe(
      "north"
    )
  })

  it("outside GB → north even with SE-looking coordinates", () => {
    expect(
      zoneFromGeo(headers({ "x-vercel-ip-country": "FR", "x-vercel-ip-latitude": "51.5", "x-vercel-ip-longitude": "0" }))
    ).toBe("north")
  })
})

describe("resolveZone priority", () => {
  it("URL param beats everything, and standard is the north alias", () => {
    expect(resolveZone({ param: "se", stored: "north", ipZone: "iom" })).toEqual({ zone: "se", source: "param" })
    expect(resolveZone({ param: "standard", stored: "iom", ipZone: "se" })).toEqual({ zone: "north", source: "param" })
    expect(resolveZone({ param: "iom" })).toEqual({ zone: "iom", source: "param" })
  })
  it("stored beats IP, including a legacy standard cookie", () => {
    expect(resolveZone({ param: null, stored: "standard", ipZone: "se" })).toEqual({ zone: "north", source: "stored" })
  })
  it("IP is a flagged default", () => {
    expect(resolveZone({ param: "bogus", stored: "nope", ipZone: "se" })).toEqual({ zone: "se", source: "ip" })
  })
  it("falls back to north", () => {
    expect(resolveZone({})).toEqual({ zone: "north", source: "default" })
  })
})

describe("zone rates flow through the calculator unchanged", () => {
  it("same windows, higher rate in SE — floors/discount reapplied identically", () => {
    const windows = [
      { name: "Lounge", width: 100, height: 60 },
      { name: "Patio", width: 150, height: 120 },
    ]
    const std = quoteProperty(windows, zones.north.rates.house.standard!, false)
    const se = quoteProperty(windows, zones.se.rates.house.standard!, false)
    expect(std.finalTotal).toBeCloseTo(2.4 * 99 * 0.9, 2)
    expect(se.finalTotal).toBeCloseTo(2.4 * 135 * 0.9, 2)
    expect(se.jobFloorApplied).toBe(false)
    expect(se.discountAmount / se.subtotal).toBeCloseTo(0.1, 6)
  })
})

describe("zone minimum job charge", () => {
  const windows = [
    { name: "Lounge", width: 100, height: 60 },
    { name: "Patio", width: 150, height: 120 },
  ]

  it("SE floors to £350, north and the Isle of Man stay at £100", () => {
    expect(zones.se.minJob).toBe(350)
    expect(zones.north.minJob).toBe(100)
    expect(zones.iom.minJob).toBe(100)
  })

  it("a £291.60 SE job is floored to £350; the same job in the North is not", () => {
    // 2.4m² @ £135 = £324 → ×0.9 = £291.60 → below the £350 SE floor
    const se = quoteProperty(windows, zones.se.rates.house.standard!, false, { minJob: zones.se.minJob })
    expect(se.discountedTotal).toBeCloseTo(291.6, 2)
    expect(se.jobFloorApplied).toBe(true)
    expect(se.minJob).toBe(350)
    expect(se.baseTotal).toBe(350)
    expect(se.finalTotal).toBe(350)

    const std = quoteProperty(windows, zones.north.rates.house.standard!, false, { minJob: zones.north.minJob })
    expect(std.jobFloorApplied).toBe(false)
    expect(std.minJob).toBe(100)
  })

  it("SE job above £350 is not floored and the guarantee upsell follows the real total", () => {
    // 4.2m² @ £135 = £567 → ×0.9 = £510.30 → 10% upsell = £51.03
    const q = quoteProperty([{ name: "Bay", width: 300, height: 140 }], zones.se.rates.house.standard!, true, {
      minJob: zones.se.minJob,
    })
    expect(q.jobFloorApplied).toBe(false)
    expect(q.baseTotal).toBeCloseTo(510.3, 2)
    expect(q.guaranteeCost).toBeCloseTo(51.03, 2)
  })

  it("guarantee upsell sits on top of the £350 floor at 10% of the floored total", () => {
    const q = quoteProperty(windows, zones.se.rates.house.standard!, true, { minJob: zones.se.minJob })
    expect(q.baseTotal).toBe(350)
    expect(q.guaranteeCost).toBe(35)
    expect(q.finalTotal).toBe(385)
  })
})

describe("tier step across zone changes", () => {
  const windows = [{ name: "Bay", width: 200, height: 100 }]

  it("north premium → iom collapses to the single film at £99 and leaves the tier step", () => {
    const before = quoteProperty(windows, rateFor(zones.north, "house", "premium"), false)
    expect(before.pricePerSqM).toBe(125)
    const next = tierAfterZoneChange({
      from: zones.north,
      to: zones.iom,
      tier: "premium",
      propertyHasTiers: true,
      step: 4,
    })
    expect(next.tier).toBe("premium")
    expect(next.step).toBe(4)
    const after = quoteProperty(windows, rateFor(zones.iom, "house", next.tier), false, { minJob: zones.iom.minJob })
    expect(after.pricePerSqM).toBe(99)
    expect(after.finalTotal).toBeCloseTo(2 * 99 * 0.9, 2)
    const lead = buildPropertyLead({
      quote: after,
      zone: zones.iom,
      projectTypeName: "Residential",
      tier: null,
      filmName: filmPresentation(zones.iom, next.tier).name,
      includedGuaranteeYears: includedGuaranteeYears(zones.iom, next.tier),
      guaranteeAdded: false,
      guaranteeIncluded: false,
      postcodeUnmapped: false,
      customerNotes: "",
    })
    expect(lead.service).toBe("DIY Calculator — Residential")
    expect(lead.jobDetails.film_tier).toBe("Dual-reflective privacy film")
    expect(lead.message).toContain("Film: Dual-reflective privacy film · 5yr guarantee")
    expect(lead.message).not.toContain("Premium")
  })

  it("north standard → iom uses the single film, and the 10-year upsell is still on offer", () => {
    const next = tierAfterZoneChange({
      from: zones.north,
      to: zones.iom,
      tier: "standard",
      propertyHasTiers: true,
      step: 3,
    })
    expect(next).toEqual({ tier: "premium", step: 4 })
    const q = quoteProperty(windows, rateFor(zones.iom, "house", next.tier), true, { minJob: zones.iom.minJob })
    expect(q.pricePerSqM).toBe(99)
    expect(q.guaranteeCost).toBeGreaterThan(0)
    expect(guaranteeIncludedFor(zones.iom, next.tier)).toBe(false)
  })

  it("iom → north inserts the tier step with Standard selected", () => {
    const next = tierAfterZoneChange({
      from: zones.iom,
      to: zones.north,
      tier: "premium",
      propertyHasTiers: true,
      step: 4,
    })
    expect(next).toEqual({ tier: "standard", step: 3 })
    expect(rateFor(zones.north, "house", next.tier)).toBe(99)
  })

  it("se → iom collapses the tier the same way", () => {
    const next = tierAfterZoneChange({
      from: zones.se,
      to: zones.iom,
      tier: "premium",
      propertyHasTiers: true,
      step: 4,
    })
    expect(next.tier).toBe("premium")
    expect(rateFor(zones.iom, "house", next.tier)).toBe(99)
    expect(filmPresentation(zones.iom, next.tier).name).not.toContain("Premium")
  })

  it("commercial jobs do not gain a tier step", () => {
    expect(
      tierAfterZoneChange({
        from: zones.iom,
        to: zones.north,
        tier: "premium",
        propertyHasTiers: false,
        step: 4,
      })
    ).toEqual({ tier: "premium", step: 4 })
  })
})
