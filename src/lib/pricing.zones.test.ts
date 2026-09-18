import { describe, it, expect } from "vitest"
import {
  defaultTier,
  defaultZone,
  geoFromHeaders,
  hasTiers,
  isTierKey,
  isZoneKey,
  postcodeAreaToZone,
  rateFor,
  tierKeys,
  tiers,
  zoneFromGeo,
  zoneFromPostcode,
  zoneKeys,
  zones,
} from "./pricing.zones"
import { quoteProperty } from "./pricing"
import { resolveZone } from "./zone"

describe("zones config", () => {
  it("has the two published zones with the agreed headline rates", () => {
    expect(zoneKeys).toEqual(["standard", "se"])
    expect(zones.standard.label).toBe("Isle of Man & North")
    expect(zones.standard.pricePerM2).toEqual({ standard: 99, premium: 125 })
    expect(zones.se.label).toBe("South East & London")
    expect(zones.se.pricePerM2).toEqual({ standard: 135, premium: 165 })
    expect(defaultZone).toBe("standard")
  })

  it("headline rates match the residential calculator rates in every zone", () => {
    for (const key of zoneKeys) {
      expect(zones[key].rates.house).toEqual(zones[key].pricePerM2)
      expect(zones[key].guide.privacy).toBe(zones[key].pricePerM2.standard)
      expect(zones[key].pricePerM2.premium).toBeGreaterThan(zones[key].pricePerM2.standard)
      expect(zones[key].rates.conservatory.premium).toBeGreaterThan(zones[key].rates.conservatory.standard)
    }
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
    expect(rateFor(zones.standard, "house", "standard")).toBe(99)
    expect(rateFor(zones.standard, "house", "premium")).toBe(125)
    expect(rateFor(zones.se, "conservatory", "premium")).toBe(180)
    expect(rateFor(zones.se, "commercial", "premium")).toBe(zones.se.rates.commercial)
    expect(hasTiers("house")).toBe(true)
    expect(hasTiers("conservatory")).toBe(true)
    expect(hasTiers("commercial")).toBe(false)
    expect(hasTiers(null)).toBe(false)
  })

  it("isZoneKey rejects junk", () => {
    expect(isZoneKey("se")).toBe(true)
    expect(isZoneKey("standard")).toBe(true)
    expect(isZoneKey("SE")).toBe(false)
    expect(isZoneKey("london")).toBe(false)
    expect(isZoneKey(null)).toBe(false)
    expect(isZoneKey("__proto__")).toBe(false)
  })
})

describe("zoneFromPostcode", () => {
  it("maps the seeded South East areas to se", () => {
    for (const area of Object.keys(postcodeAreaToZone)) {
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

  it("maps Isle of Man and the rest of the UK to standard", () => {
    expect(zoneFromPostcode("IM2 1BB")).toBe("standard")
    expect(zoneFromPostcode("M1 1AE")).toBe("standard")
    expect(zoneFromPostcode("L1 8JQ")).toBe("standard")
    expect(zoneFromPostcode("EH1 1YZ")).toBe("standard")
    expect(zoneFromPostcode("SO14 7AA")).toBe("standard") // Southampton is not in the SE list
    expect(zoneFromPostcode("NE1 4ST")).toBe("standard") // NE ≠ N / E
    expect(zoneFromPostcode("WA1 1AA")).toBe("standard") // WA ≠ W
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

  it("no headers → standard", () => {
    expect(zoneFromGeo(headers({}))).toBe("standard")
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

  it("non-SE GB locations → standard", () => {
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-city": "Manchester" }))).toBe("standard")
    expect(
      zoneFromGeo(
        headers({
          "x-vercel-ip-country": "GB",
          "x-vercel-ip-city": "Douglas",
          "x-vercel-ip-latitude": "54.15",
          "x-vercel-ip-longitude": "-4.48",
        })
      )
    ).toBe("standard")
    expect(zoneFromGeo(headers({ "x-vercel-ip-country": "GB", "x-vercel-ip-country-region": "SCT", "x-vercel-ip-city": "London" }))).toBe(
      "standard"
    )
  })

  it("outside GB → standard even with SE-looking coordinates", () => {
    expect(
      zoneFromGeo(headers({ "x-vercel-ip-country": "FR", "x-vercel-ip-latitude": "51.5", "x-vercel-ip-longitude": "0" }))
    ).toBe("standard")
  })
})

describe("resolveZone priority", () => {
  it("URL param beats everything", () => {
    expect(resolveZone({ param: "se", stored: "standard", ipZone: "standard" })).toEqual({ zone: "se", source: "param" })
  })
  it("stored beats IP", () => {
    expect(resolveZone({ param: null, stored: "standard", ipZone: "se" })).toEqual({ zone: "standard", source: "stored" })
  })
  it("IP is a flagged default", () => {
    expect(resolveZone({ param: "bogus", stored: "nope", ipZone: "se" })).toEqual({ zone: "se", source: "ip" })
  })
  it("falls back to standard", () => {
    expect(resolveZone({})).toEqual({ zone: "standard", source: "default" })
  })
})

describe("zone rates flow through the calculator unchanged", () => {
  it("same windows, higher rate in SE — floors/discount reapplied identically", () => {
    const windows = [
      { name: "Lounge", width: 100, height: 60 },
      { name: "Patio", width: 150, height: 120 },
    ]
    const std = quoteProperty(windows, zones.standard.rates.house.standard, false)
    const se = quoteProperty(windows, zones.se.rates.house.standard, false)
    expect(std.finalTotal).toBeCloseTo(2.4 * 99 * 0.9, 2)
    expect(se.finalTotal).toBeCloseTo(2.4 * 135 * 0.9, 2)
    expect(se.jobFloorApplied).toBe(false)
    expect(se.discountAmount / se.subtotal).toBeCloseTo(0.1, 6)
  })
})
