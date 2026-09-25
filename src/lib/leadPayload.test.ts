import { describe, expect, it } from "vitest"

import { buildEnquiryJobDetails, buildPropertyLead, buildVehicleLead, UNMAPPED_POSTCODE_LINE } from "./leadPayload"
import { quoteProperty, quoteVehicle } from "./pricing"
import { rateFor, tiers, zones } from "./pricing.zones"

const north = zones.north

const threeWindows = [
  { name: "Window 1", width: 120, height: 100 },
  { name: "Window 2", width: 200, height: 100 },
  { name: "Window 3", width: 100, height: 100 },
]

describe("buildPropertyLead — 3-window Premium job", () => {
  const rate = rateFor(north, "house", "premium") // £125/m² on IoM
  const quote = quoteProperty(threeWindows, rate, false)
  const lead = buildPropertyLead({
    quote,
    zone: north,
    projectTypeName: "Residential",
    tier: tiers.premium,
    guaranteeAdded: false,
    guaranteeIncluded: true,
    postcodeUnmapped: false,
    customerNotes: "Side gate is unlocked, dog is friendly.",
  })

  it("produces job_details with all three windows and 2dp m²", () => {
    expect(lead.jobDetails).toEqual({
      measured_by: "customer",
      property_type: "Residential",
      zone: "North West",
      film_tier: "Premium — Dual Reflective 20",
      guarantee_years: 10,
      total_m2: 4.2,
      window_count: 3,
      windows: [
        { label: "Window 1", width_cm: 120, height_cm: 100, m2: 1.2 },
        { label: "Window 2", width_cm: 200, height_cm: 100, m2: 2 },
        { label: "Window 3", width_cm: 100, height_cm: 100, m2: 1 },
      ],
      customer_notes: "Side gate is unlocked, dog is friendly.",
    })
  })

  it("carries no prices in job_details", () => {
    expect(JSON.stringify(lead.jobDetails)).not.toMatch(/£|price|total_gbp|value/i)
  })

  it("keeps the Quote line first (after notes) and re-adds the per-window lines", () => {
    const [notes, blank, quoteLine, filmLine, w1, w2, w3] = lead.message.split("\n")
    expect(notes).toBe("Side gate is unlocked, dog is friendly.")
    expect(blank).toBe("")
    expect(quoteLine).toBe(
      `Quote: £${quote.finalTotal.toFixed(2)} incl. 10% DIY discount (10-year guarantee included). 3 window(s), 4.20m² @ £125/m² (North West)`
    )
    expect(filmLine).toBe("Film: Premium — Dual Reflective 20 · 10yr guarantee")
    expect(w1).toBe("Window 1: 120 x 100 cm = 1.20 m²")
    expect(w2).toBe("Window 2: 200 x 100 cm = 2.00 m²")
    expect(w3).toBe("Window 3: 100 x 100 cm = 1.00 m²")
  })

  it("still satisfies StartMyPatch's Quote-line parser (regex from lib/external-lead.ts)", () => {
    const match = lead.message.match(/^\s*quote:\s*£\s*([\d,]+(?:\.\d{1,2})?)/im)
    expect(match).not.toBeNull()
    expect(parseFloat(match![1])).toBe(quote.finalTotal)
  })

  it("labels the service with the tier", () => {
    expect(lead.service).toBe("DIY Calculator — Residential (Premium)")
  })
})

describe("buildPropertyLead — Standard + upsell, unmapped postcode, no notes", () => {
  const quote = quoteProperty(threeWindows, rateFor(north, "house", "standard"), true)
  const lead = buildPropertyLead({
    quote,
    zone: north,
    projectTypeName: "Residential",
    tier: tiers.standard,
    guaranteeAdded: true,
    guaranteeIncluded: false,
    postcodeUnmapped: true,
    customerNotes: "   ",
  })

  it("reports 10yr when the upsell was taken and 5yr otherwise", () => {
    expect(lead.jobDetails.guarantee_years).toBe(10)
    const noUpsell = buildPropertyLead({
      quote: quoteProperty(threeWindows, rateFor(north, "house", "standard"), false),
      zone: north,
      projectTypeName: "Residential",
      tier: tiers.standard,
      guaranteeAdded: false,
      guaranteeIncluded: false,
      postcodeUnmapped: false,
      customerNotes: "",
    })
    expect(noUpsell.jobDetails.guarantee_years).toBe(5)
    expect(noUpsell.message.split("\n")[1]).toBe("Film: Standard — Silver 20 · 5yr guarantee")
  })

  it("starts with the Quote line when there are no notes, and appends the unmapped-postcode line", () => {
    expect(lead.message.startsWith("Quote: £")).toBe(true)
    expect(lead.message.endsWith(UNMAPPED_POSTCODE_LINE)).toBe(true)
    expect(lead.jobDetails.customer_notes).toBeUndefined()
  })
})

describe("buildPropertyLead — commercial (single film)", () => {
  const quote = quoteProperty(threeWindows, rateFor(north, "commercial", "standard"), false)
  const lead = buildPropertyLead({
    quote,
    zone: north,
    projectTypeName: "Commercial",
    tier: null,
    guaranteeAdded: false,
    guaranteeIncluded: false,
    postcodeUnmapped: false,
    customerNotes: "",
  })

  it("omits film_tier and states the guarantee instead", () => {
    expect(lead.jobDetails.film_tier).toBeUndefined()
    expect(lead.message.split("\n")[1]).toBe("Guarantee: 5yr")
    expect(lead.service).toBe("DIY Calculator — Commercial")
  })
})

describe("buildVehicleLead", () => {
  it("sends the vehicle block instead of windows", () => {
    const lead = buildVehicleLead({
      quote: quoteVehicle(250, true),
      zone: north,
      vehicleLabel: "4 Door SUV",
      vehicleDescription: "All passenger windows + boot window",
      extendedGuarantee: true,
      guaranteePrice: 19,
      customerNotes: "",
    })
    expect(lead.jobDetails).toEqual({
      measured_by: "customer",
      property_type: "Vehicle",
      zone: "North West",
      guarantee_years: 10,
      vehicle: { type: "4 Door SUV", package: "All passenger windows + boot window" },
    })
    expect(lead.message.split("\n")[0]).toMatch(/^Quote: £\d+\.\d{2} incl\. 10% DIY discount, 10yr guarantee \(\+£19\)\. Package: /)
    expect(lead.message.split("\n")[1]).toBe("Vehicle: 4 Door SUV · 10yr guarantee")
  })
})

describe("buildEnquiryJobDetails", () => {
  it("marks photo enquiries as photo_estimate and never includes windows", () => {
    const details = buildEnquiryJobDetails({
      propertyType: "Conservatory",
      filmPreference: "Advise me",
      description: "Six panes, south facing.",
      hasPhotos: true,
    })
    expect(details).toEqual({
      measured_by: "photo_estimate",
      property_type: "Conservatory",
      film_preference: "Advise me",
      customer_notes: "Six panes, south facing.",
    })
    expect(details?.windows).toBeUndefined()
  })

  it("omits measured_by without photos, and the whole key when nothing was chosen", () => {
    expect(buildEnquiryJobDetails({ propertyType: "Home", filmPreference: null, description: "", hasPhotos: false })).toEqual({
      property_type: "Home",
    })
    expect(buildEnquiryJobDetails({ propertyType: null, filmPreference: null, description: "  ", hasPhotos: false })).toBeUndefined()
  })
})
