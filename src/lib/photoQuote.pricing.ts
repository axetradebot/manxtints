// Photo quote pricing. Same engine as the calculator (src/lib/pricing.ts):
//   Standard rate × pane m² → £10 per-pane floor → sum → zone job floor.
// Deliberately NO 10% DIY discount — that is the reward for measuring up.
// The point estimate is wrapped in a ±15% range because the areas came from
// photos, not a tape measure.

import { quoteProperty, roundPence } from "./pricing"
import { rateFor, zones, type ZoneKey } from "./pricing.zones"
import {
  PHOTO_QUOTE_RANGE_HIGH,
  PHOTO_QUOTE_RANGE_LOW,
  roundTotalM2,
  type EstimatePane,
  type PhotoQuotePriceDTO,
} from "./photoQuote.schema"

export type PhotoQuotePrice = PhotoQuotePriceDTO

/** Standard-film house rate: the photo quote always prices on this. */
export function photoQuoteRate(zone: ZoneKey): number {
  return rateFor(zones[zone], "house", "standard")
}

export function pricePhotoQuote(panes: EstimatePane[], zoneKey: ZoneKey): PhotoQuotePrice {
  const zone = zones[zoneKey]
  const rate = photoQuoteRate(zoneKey)
  const quote = quoteProperty(
    panes.map((p) => ({ name: p.label, width: p.width_cm, height: p.height_cm })),
    rate,
    false,
    { minJob: zone.minJob, diyDiscount: false }
  )

  const point = roundPence(quote.finalTotal)
  // The floor is a real minimum, so the low end never dips under it.
  const low = Math.max(quote.minJob, Math.round(point * PHOTO_QUOTE_RANGE_LOW))
  const high = Math.max(low, Math.round(point * PHOTO_QUOTE_RANGE_HIGH))

  return {
    zone: zoneKey,
    zoneLabel: zone.label,
    rate,
    panes: panes.map((p, i) => ({
      ...p,
      price: roundPence(quote.lines[i].price),
      floorApplied: quote.lines[i].floorApplied,
    })),
    totalM2: roundTotalM2(panes),
    subtotal: roundPence(quote.subtotal),
    minJob: quote.minJob,
    jobFloorApplied: quote.jobFloorApplied,
    point,
    low,
    high,
  }
}
