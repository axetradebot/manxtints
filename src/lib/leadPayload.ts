// Builds what a lead says about the job: the human-readable `message` and the
// structured `job_details` that StartMyPatch turns into an installer brief.
//
// Contract with StartMyPatch (external-lead endpoint): the 8 string keys
// (name, phone, email, address, service, message, source_page, _gotcha) are
// unchanged. `job_details` is an OPTIONAL 9th key; a receiver that ignores it
// still gets the same information in `message`, and the "Quote: £…" line stays
// first so the pipeline value keeps parsing.

import { guaranteeUpsell, type Quote } from "./pricing"
import { tiers, type Tier, type Zone } from "./pricing.zones"

export interface JobWindow {
  /** "Window 1", or the name the customer typed */
  label: string
  width_cm: number
  height_cm: number
  /** Square metres, 2dp */
  m2: number
}

/**
 * Structured job data for the installer brief. Every field is optional;
 * senders include what they know. No prices — the brief is shared with
 * installers who must not see the customer's total.
 */
export interface JobDetails {
  /** customer = typed measurements in the calculator; photo_estimate = enquiry with photos */
  measured_by?: "customer" | "photo_estimate"
  /** "Residential" | "Conservatory" | "Commercial" | "Vehicle" | enquiry property type */
  property_type?: string
  /** Pricing area label, e.g. "Isle of Man & North" */
  zone?: string
  /** "Premium — Dual Reflective 20" (tier label + film name) */
  film_tier?: string
  /** Enquiry form only: "Standard" | "Premium" | "Advise me" */
  film_preference?: string
  /** 10 when the upsell was added or Premium was chosen, else the film's standard cover */
  guarantee_years?: number
  total_m2?: number
  window_count?: number
  windows?: JobWindow[]
  vehicle?: { type: string; package: string }
  /** The customer's free-text notes, verbatim */
  customer_notes?: string
}

/** Line added to the lead when the postcode could not be matched to a pricing area. */
export const UNMAPPED_POSTCODE_LINE = "We'll confirm your area's pricing with your quote."

const round2 = (n: number) => Math.round(n * 100) / 100
const gbp = (n: number) => `£${n.toFixed(2)}`

function withNotes(notes: string, summary: string): string {
  const trimmed = notes.trim()
  return trimmed ? `${trimmed}\n\n${summary}` : summary
}

export interface PropertyLeadInput {
  quote: Quote
  zone: Zone
  /** "Residential" | "Conservatory" | "Commercial" */
  projectTypeName: string
  /** The chosen film for a two-tier job; null for commercial and single-film zones */
  tier: Tier | null
  /** Customer-facing film name. Single-film zones pass this with `tier` null. */
  filmName?: string
  /** Years included before an upsell. Defaults from the tier (5 for Standard). */
  includedGuaranteeYears?: number
  guaranteeAdded: boolean
  guaranteeIncluded: boolean
  /** The typed postcode did not parse, so pricing is provisional */
  postcodeUnmapped: boolean
  customerNotes: string
}

export interface BuiltLead {
  service: string
  message: string
  jobDetails: JobDetails
}

/**
 * Calculator (property) submission. Message layout:
 *
 *   Quote: £412.00 incl. 10% DIY discount. 3 window(s), 4.20m² @ £99/m² (Isle of Man & North)
 *   Film: Premium — Dual Reflective 20 · 10yr guarantee
 *   Window 1: 120 x 100 cm = 1.20 m²
 *   Window 2: …
 */
export function buildPropertyLead(input: PropertyLeadInput): BuiltLead {
  const { quote, zone, projectTypeName, tier, guaranteeAdded, guaranteeIncluded, postcodeUnmapped } = input

  const finalPrice = gbp(quote.finalTotal)
  const baseYears = input.includedGuaranteeYears ?? (tier ?? tiers.standard).guaranteeYears
  const guaranteeYears = guaranteeAdded || guaranteeIncluded ? guaranteeUpsell.years : baseYears
  const filmTitle = input.filmName ?? (tier ? `${tier.label} — ${tier.film}` : null)

  const guaranteeSuffix = guaranteeAdded
    ? ` + ${guaranteeUpsell.years}-year guarantee ${gbp(quote.guaranteeCost)}`
    : guaranteeIncluded
      ? ` (${guaranteeYears}-year guarantee included)`
      : ""
  const quoteLine = quote.jobFloorApplied
    ? `${gbp(quote.baseTotal)} (minimum job charge)${guaranteeSuffix}${guaranteeAdded ? ` = ${finalPrice}` : ""}`
    : `${finalPrice} incl. 10% DIY discount${guaranteeSuffix}`

  const windows: JobWindow[] = quote.lines.map((line, i) => ({
    label: line.name?.trim() || `Window ${i + 1}`,
    width_cm: line.width,
    height_cm: line.height,
    m2: round2(line.areaSqM),
  }))

  const lines = [
    `Quote: ${quoteLine}. ${windows.length} window(s), ${quote.totalAreaSqM.toFixed(2)}m² @ £${quote.pricePerSqM}/m² (${zone.label})`,
    filmTitle ? `Film: ${filmTitle} · ${guaranteeYears}yr guarantee` : `Guarantee: ${guaranteeYears}yr`,
    ...windows.map((w) => `${w.label}: ${w.width_cm} x ${w.height_cm} cm = ${w.m2.toFixed(2)} m²`),
  ]
  if (postcodeUnmapped) lines.push(UNMAPPED_POSTCODE_LINE)

  const jobDetails: JobDetails = {
    measured_by: "customer",
    property_type: projectTypeName,
    zone: zone.label,
    guarantee_years: guaranteeYears,
    total_m2: round2(quote.totalAreaSqM),
    window_count: windows.length,
    windows,
  }
  if (filmTitle) jobDetails.film_tier = filmTitle
  const notes = input.customerNotes.trim()
  if (notes) jobDetails.customer_notes = notes

  return {
    service: `DIY Calculator — ${projectTypeName}${tier ? ` (${tier.label})` : ""}`,
    message: withNotes(input.customerNotes, lines.join("\n")),
    jobDetails,
  }
}

export interface VehicleLeadInput {
  quote: Quote
  zone: Zone
  /** e.g. "4 Door SUV" */
  vehicleLabel: string
  /** e.g. "All passenger windows + boot window" */
  vehicleDescription: string
  extendedGuarantee: boolean
  /** Flat price of the vehicle guarantee upsell, for the message */
  guaranteePrice: number
  customerNotes: string
}

export function buildVehicleLead(input: VehicleLeadInput): BuiltLead {
  const { quote, zone, vehicleLabel, vehicleDescription, extendedGuarantee } = input
  const guaranteeYears = extendedGuarantee ? guaranteeUpsell.years : tiers.standard.guaranteeYears

  const summary = [
    `Quote: ${gbp(quote.finalTotal)} incl. 10% DIY discount${extendedGuarantee ? `, ${guaranteeYears}yr guarantee (+£${input.guaranteePrice})` : ""}. Package: ${vehicleDescription} (${zone.label})`,
    `Vehicle: ${vehicleLabel} · ${guaranteeYears}yr guarantee`,
  ].join("\n")

  const jobDetails: JobDetails = {
    measured_by: "customer",
    property_type: "Vehicle",
    zone: zone.label,
    guarantee_years: guaranteeYears,
    vehicle: { type: vehicleLabel, package: vehicleDescription },
  }
  const notes = input.customerNotes.trim()
  if (notes) jobDetails.customer_notes = notes

  return {
    service: `DIY Calculator — Vehicle (${vehicleLabel})`,
    message: withNotes(input.customerNotes, summary),
    jobDetails,
  }
}

/**
 * Quote Enquiry form: no measurements, so no windows. `measured_by` is set
 * (photo_estimate) only when the customer actually attached photos.
 */
export function buildEnquiryJobDetails(input: {
  propertyType: string | null
  filmPreference: string | null
  description: string
  hasPhotos: boolean
}): JobDetails | undefined {
  const details: JobDetails = {}
  if (input.hasPhotos) details.measured_by = "photo_estimate"
  if (input.propertyType) details.property_type = input.propertyType
  if (input.filmPreference) details.film_preference = input.filmPreference
  const notes = input.description.trim()
  if (notes) details.customer_notes = notes
  // Nothing beyond what the message already says — leave the key out entirely.
  return Object.keys(details).length > 0 ? details : undefined
}
