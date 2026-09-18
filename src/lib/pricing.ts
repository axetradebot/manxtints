// Single source of truth for DIY calculator pricing rules.
//
// Order of operations (do not reorder):
//   per-window price at the tier's zone rate → £10 per-window floor → sum →
//   10% DIY discount → voucher (if any) → £100 job floor →
//   10-year guarantee upsell = max(£29, 10% of that post-floor total) → final.

export const MIN_JOB = 100 // £ minimum job size, applied after the DIY discount
export const MIN_WINDOW = 10 // £ minimum contribution per window, applied before summing
export const DIY_DISCOUNT = 0.1 // 10% off for using the calculator

/**
 * Extended (10-year) guarantee upsell. Applies to the Standard film only —
 * Premium includes 10 years. Always quoted as a pound figure.
 */
export const guaranteeUpsell = {
  years: 10,
  pctOfTotal: 0.1,
  minPounds: 29,
} as const

/** Vehicle packages keep their historic flat upsell (vehicle calculator is unaffected by tiers). */
export const GUARANTEE_PRICE = 19

/** max(£29, 10% of the post-floor total), rounded to the penny. */
export function guaranteeUpsellCost(baseTotal: number): number {
  if (baseTotal <= 0) return 0
  return roundPence(Math.max(guaranteeUpsell.minPounds, baseTotal * guaranteeUpsell.pctOfTotal))
}

export function roundPence(value: number): number {
  return Math.round(value * 100) / 100
}

/** "£48.60" / "£412" — pence only when they're non-zero. */
export function formatGBP(value: number): string {
  const rounded = roundPence(value)
  return Number.isInteger(rounded) ? `£${rounded}` : `£${rounded.toFixed(2)}`
}

export interface WindowMeasurement {
  name: string
  width: number // cm
  height: number // cm
}

export interface WindowLine extends WindowMeasurement {
  areaSqM: number
  rawPrice: number // area × rate, before the per-window floor
  price: number // after the £10 per-window floor
  floorApplied: boolean
}

export interface Quote {
  lines: WindowLine[]
  totalAreaSqM: number
  pricePerSqM: number
  /** Sum of per-window prices (post window-floor), before discount */
  subtotal: number
  discountAmount: number
  /** subtotal − discountAmount */
  discountedTotal: number
  /** Voucher pounds actually taken off (capped at the discounted total) */
  voucherAmount: number
  jobFloorApplied: boolean
  /** max(discountedTotal − voucher, MIN_JOB) — before guarantee */
  baseTotal: number
  guaranteeCost: number
  /** baseTotal + guaranteeCost — what the customer pays */
  finalTotal: number
}

export interface QuoteOptions {
  /** Pounds off, applied after the DIY discount and before the job floor. */
  voucher?: number
}

export function quoteProperty(
  windows: WindowMeasurement[],
  pricePerSqM: number,
  extendedGuarantee: boolean,
  options: QuoteOptions = {}
): Quote {
  const lines: WindowLine[] = windows.map((w) => {
    const areaSqM = (w.width * w.height) / 10000
    const rawPrice = areaSqM * pricePerSqM
    const price = Math.max(rawPrice, MIN_WINDOW)
    return { ...w, areaSqM, rawPrice, price, floorApplied: price > rawPrice }
  })

  const totalAreaSqM = lines.reduce((sum, l) => sum + l.areaSqM, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price, 0)
  return finishQuote(lines, totalAreaSqM, pricePerSqM, subtotal, extendedGuarantee, options, lines.length > 0)
}

export function quoteVehicle(vehiclePrice: number, extendedGuarantee: boolean): Quote {
  const subtotal = vehiclePrice
  const discountAmount = subtotal * DIY_DISCOUNT
  const discountedTotal = subtotal - discountAmount
  const jobFloorApplied = vehiclePrice > 0 && discountedTotal < MIN_JOB
  const baseTotal = jobFloorApplied ? MIN_JOB : discountedTotal
  const guaranteeCost = extendedGuarantee ? GUARANTEE_PRICE : 0

  return {
    lines: [],
    totalAreaSqM: 0,
    pricePerSqM: 0,
    subtotal,
    discountAmount,
    discountedTotal,
    voucherAmount: 0,
    jobFloorApplied,
    baseTotal,
    guaranteeCost,
    finalTotal: baseTotal + guaranteeCost,
  }
}

function finishQuote(
  lines: WindowLine[],
  totalAreaSqM: number,
  pricePerSqM: number,
  subtotal: number,
  extendedGuarantee: boolean,
  options: QuoteOptions,
  hasJob: boolean
): Quote {
  const discountAmount = subtotal * DIY_DISCOUNT
  const discountedTotal = subtotal - discountAmount
  const voucherAmount = Math.min(Math.max(options.voucher ?? 0, 0), discountedTotal)
  const afterVoucher = discountedTotal - voucherAmount
  const jobFloorApplied = hasJob && afterVoucher < MIN_JOB
  const baseTotal = jobFloorApplied ? MIN_JOB : afterVoucher
  const guaranteeCost = extendedGuarantee && hasJob ? guaranteeUpsellCost(baseTotal) : 0

  return {
    lines,
    totalAreaSqM,
    pricePerSqM,
    subtotal,
    discountAmount,
    discountedTotal,
    voucherAmount,
    jobFloorApplied,
    baseTotal,
    guaranteeCost,
    finalTotal: baseTotal + guaranteeCost,
  }
}
