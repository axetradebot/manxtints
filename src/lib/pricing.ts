// Single source of truth for DIY calculator pricing rules.
//
// Order of operations (do not reorder):
//   per-window price → £10 per-window floor → sum → 10% DIY discount →
//   £100 job floor → 10-year guarantee added on the post-discount, post-floor total.

export const MIN_JOB = 100 // £ minimum job size, applied after the DIY discount
export const MIN_WINDOW = 10 // £ minimum contribution per window, applied before summing
export const DIY_DISCOUNT = 0.1 // 10% off for using the calculator
export const GUARANTEE_PRICE = 19 // 10-year guarantee upsell

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
  jobFloorApplied: boolean
  /** max(discountedTotal, MIN_JOB) — before guarantee */
  baseTotal: number
  guaranteeCost: number
  /** baseTotal + guaranteeCost — what the customer pays */
  finalTotal: number
}

export function quoteProperty(
  windows: WindowMeasurement[],
  pricePerSqM: number,
  extendedGuarantee: boolean
): Quote {
  const lines: WindowLine[] = windows.map((w) => {
    const areaSqM = (w.width * w.height) / 10000
    const rawPrice = areaSqM * pricePerSqM
    const price = Math.max(rawPrice, MIN_WINDOW)
    return { ...w, areaSqM, rawPrice, price, floorApplied: price > rawPrice }
  })

  const totalAreaSqM = lines.reduce((sum, l) => sum + l.areaSqM, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price, 0)
  const discountAmount = subtotal * DIY_DISCOUNT
  const discountedTotal = subtotal - discountAmount
  const jobFloorApplied = lines.length > 0 && discountedTotal < MIN_JOB
  const baseTotal = jobFloorApplied ? MIN_JOB : discountedTotal
  const guaranteeCost = extendedGuarantee ? GUARANTEE_PRICE : 0

  return {
    lines,
    totalAreaSqM,
    pricePerSqM,
    subtotal,
    discountAmount,
    discountedTotal,
    jobFloorApplied,
    baseTotal,
    guaranteeCost,
    finalTotal: baseTotal + guaranteeCost,
  }
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
    jobFloorApplied,
    baseTotal,
    guaranteeCost,
    finalTotal: baseTotal + guaranteeCost,
  }
}
