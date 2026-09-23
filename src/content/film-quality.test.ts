import { describe, expect, it } from "vitest"
import { filmFailureClaim, site } from "../site.config"
import { COMPATIBILITY_CHECK_PARAGRAPH, DOUBLE_GLAZING_FAQ, buildComparisonRows } from "./film-quality"

describe("filmFailureClaim", () => {
  it("is absent with the shipped config", () => {
    expect(filmFailureClaim()).toBeNull()
    expect(filmFailureClaim(site.filmClaims)).toBeNull()
  })

  it("stays hidden when only one of figure / source is set", () => {
    expect(filmFailureClaim({ failureMultiplier: 3 })).toBeNull()
    expect(filmFailureClaim({ source: "Manufacturer bulletin 12" })).toBeNull()
    expect(filmFailureClaim({ failureMultiplier: 3, source: "   " })).toBeNull()
    expect(filmFailureClaim({ failureMultiplier: 0, source: "x" })).toBeNull()
  })

  it("renders the sentence only when both are set", () => {
    expect(filmFailureClaim({ failureMultiplier: 3, source: "Manufacturer bulletin 12" })).toBe(
      "Some films can cause units to fail up to 3x faster."
    )
    expect(filmFailureClaim({ failureMultiplier: 2.5, source: "x" })).toBe(
      "Some films can cause units to fail up to 2.5x faster."
    )
  })
})

describe("film-quality copy", () => {
  it("FAQ answer carries the compatibility-check paragraph", () => {
    expect(DOUBLE_GLAZING_FAQ.question).toBe("Will window film damage my double glazing?")
    expect(DOUBLE_GLAZING_FAQ.answer).toContain(COMPATIBILITY_CHECK_PARAGRAPH)
  })

  it("comparison guarantee row reads from config, not a hardcoded number", () => {
    const rows = buildComparisonRows({ workmanshipYears: 5, extendedYears: 10 })
    expect(rows.find((r) => r.label === "Guarantee")?.manx).toBe("5 years, 10 on Premium")
    expect(buildComparisonRows({ workmanshipYears: 7, extendedYears: 0 }).find((r) => r.label === "Guarantee")?.manx).toBe(
      "7 years, written"
    )
    expect(rows).toHaveLength(5)
  })
})
