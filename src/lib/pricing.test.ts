import { describe, it, expect } from "vitest"
import {
  quoteProperty,
  quoteVehicle,
  guaranteeUpsellCost,
  formatGBP,
  MIN_JOB,
  MIN_WINDOW,
  GUARANTEE_PRICE,
  guaranteeUpsell,
} from "./pricing"
import { rateFor, zones } from "./pricing.zones"

const RESIDENTIAL_RATE = zones.standard.rates.house.standard // £99

describe("per-window £10 floor", () => {
  it("floors a tiny window to £10 before summing", () => {
    // 30cm x 30cm = 0.09m² @ £99 = £8.91 → floored to £10
    const q = quoteProperty([{ name: "W1", width: 30, height: 30 }], RESIDENTIAL_RATE, false)
    expect(q.lines[0].rawPrice).toBeCloseTo(8.91, 2)
    expect(q.lines[0].price).toBe(MIN_WINDOW)
    expect(q.lines[0].floorApplied).toBe(true)
  })

  it("leaves a normal window at area rate", () => {
    // 100cm x 60cm = 0.6m² @ £99 = £59.40
    const q = quoteProperty([{ name: "W1", width: 100, height: 60 }], RESIDENTIAL_RATE, false)
    expect(q.lines[0].price).toBeCloseTo(59.4, 2)
    expect(q.lines[0].floorApplied).toBe(false)
  })
})

describe("£100 job floor", () => {
  it("1 tiny window → £100 job floor", () => {
    // £10 window → 10% discount → £9 → job floor → £100
    const q = quoteProperty([{ name: "W1", width: 30, height: 30 }], RESIDENTIAL_RATE, false)
    expect(q.subtotal).toBe(10)
    expect(q.discountedTotal).toBeCloseTo(9, 2)
    expect(q.jobFloorApplied).toBe(true)
    expect(q.baseTotal).toBe(MIN_JOB)
    expect(q.finalTotal).toBe(MIN_JOB)
  })

  it("12 tiny windows → 12×£10 = £120 → discount → £108, above the job floor", () => {
    const windows = Array.from({ length: 12 }, (_, i) => ({
      name: `W${i + 1}`,
      width: 30,
      height: 30,
    }))
    const q = quoteProperty(windows, RESIDENTIAL_RATE, false)
    expect(q.subtotal).toBe(120)
    expect(q.discountAmount).toBeCloseTo(12, 2)
    expect(q.discountedTotal).toBeCloseTo(108, 2)
    expect(q.jobFloorApplied).toBe(false)
    expect(q.finalTotal).toBeCloseTo(108, 2)
  })

  it("total just under £100 post-discount gets floored", () => {
    // 1.0m² @ £99 = £99 → discount → £89.10 → floored to £100
    const q = quoteProperty([{ name: "W1", width: 100, height: 100 }], RESIDENTIAL_RATE, false)
    expect(q.discountedTotal).toBeCloseTo(89.1, 2)
    expect(q.jobFloorApplied).toBe(true)
    expect(q.finalTotal).toBe(MIN_JOB)
  })
})

describe("normal mixed job unchanged vs current maths", () => {
  it("matches subtotal × 0.9 when no floors apply", () => {
    // 100x60 (0.6m²) + 150x120 (1.8m²) = 2.4m² @ £99 = £237.60 → ×0.9 = £213.84
    const windows = [
      { name: "Lounge", width: 100, height: 60 },
      { name: "Patio", width: 150, height: 120 },
    ]
    const q = quoteProperty(windows, RESIDENTIAL_RATE, false)
    expect(q.subtotal).toBeCloseTo(237.6, 2)
    expect(q.lines.every((l) => !l.floorApplied)).toBe(true)
    expect(q.jobFloorApplied).toBe(false)
    expect(q.finalTotal).toBeCloseTo(237.6 * 0.9, 2)
  })
})

describe("guarantee upsell = max(£29, 10% of post-floor total)", () => {
  it("is 10% of the total when that beats the £29 floor", () => {
    // 4.2m² @ £99 = £415.80 → ×0.9 = £374.22 → 10% = £37.42
    const q = quoteProperty([{ name: "Bay", width: 300, height: 140 }], RESIDENTIAL_RATE, true)
    expect(q.baseTotal).toBeCloseTo(374.22, 2)
    expect(q.guaranteeCost).toBeCloseTo(37.42, 2)
    expect(q.finalTotal).toBeCloseTo(374.22 + 37.42, 2)
  })

  it("adds the guarantee AFTER discount and job floor (not discounted)", () => {
    // 2.4m² @ £99 = £237.60 → ×0.9 = £213.84 → 10% = £21.38 → floor £29
    const windows = [
      { name: "Lounge", width: 100, height: 60 },
      { name: "Patio", width: 150, height: 120 },
    ]
    const q = quoteProperty(windows, RESIDENTIAL_RATE, true)
    expect(q.guaranteeCost).toBe(guaranteeUpsell.minPounds)
    expect(q.finalTotal).toBeCloseTo(237.6 * 0.9 + 29, 2)
  })

  it("guarantee sits on top of the £100 floor at the £29 minimum", () => {
    const q = quoteProperty([{ name: "W1", width: 30, height: 30 }], RESIDENTIAL_RATE, true)
    expect(q.baseTotal).toBe(MIN_JOB)
    expect(q.guaranteeCost).toBe(29)
    expect(q.finalTotal).toBe(MIN_JOB + 29)
  })

  it("rounds to the penny and formats as a pound figure", () => {
    expect(guaranteeUpsellCost(486)).toBe(48.6)
    expect(formatGBP(48.6)).toBe("£48.60")
    expect(formatGBP(412)).toBe("£412")
    expect(guaranteeUpsellCost(0)).toBe(0)
  })

  it("Premium rate with the guarantee off (included) adds nothing", () => {
    const rate = rateFor(zones.standard, "house", "premium")
    const q = quoteProperty([{ name: "Bay", width: 300, height: 140 }], rate, false)
    expect(q.pricePerSqM).toBe(125)
    expect(q.guaranteeCost).toBe(0)
  })
})

describe("voucher ordering", () => {
  it("applies after the DIY discount and before the job floor, and the upsell follows the floored total", () => {
    // 2.4m² @ £99 = £237.60 → ×0.9 = £213.84 → −£150 voucher = £63.84 → floor £100 → +£29
    const windows = [
      { name: "Lounge", width: 100, height: 60 },
      { name: "Patio", width: 150, height: 120 },
    ]
    const q = quoteProperty(windows, RESIDENTIAL_RATE, true, { voucher: 150 })
    expect(q.voucherAmount).toBe(150)
    expect(q.jobFloorApplied).toBe(true)
    expect(q.baseTotal).toBe(MIN_JOB)
    expect(q.finalTotal).toBe(MIN_JOB + 29)
  })

  it("never takes off more than the discounted total", () => {
    const q = quoteProperty([{ name: "W1", width: 100, height: 60 }], RESIDENTIAL_RATE, false, { voucher: 999 })
    expect(q.voucherAmount).toBeCloseTo(q.discountedTotal, 2)
    expect(q.baseTotal).toBe(MIN_JOB)
  })
})

describe("vehicle quotes", () => {
  it("applies discount then guarantee, no floors relevant at vehicle prices", () => {
    const q = quoteVehicle(250, true)
    expect(q.discountedTotal).toBeCloseTo(225, 2)
    expect(q.jobFloorApplied).toBe(false)
    expect(q.finalTotal).toBeCloseTo(225 + GUARANTEE_PRICE, 2)
  })
})

describe("empty state", () => {
  it("no windows → zero totals, no floors", () => {
    const q = quoteProperty([], RESIDENTIAL_RATE, false)
    expect(q.subtotal).toBe(0)
    expect(q.jobFloorApplied).toBe(false)
    expect(q.finalTotal).toBe(0)
  })
})
