import { describe, expect, it } from "vitest"
import {
  PANE_MAX_M2,
  PANE_MIN_M2,
  estimateRequestSchema,
  normalisePanes,
  panesFromClient,
  roundTotalM2,
  visionResultSchema,
} from "./photoQuote.schema"
import { photoQuoteRate, pricePhotoQuote } from "./photoQuote.pricing"
import { issueSessionToken, verifySessionToken } from "./photoQuote.token"
import { estimateCostGbp, imageSetHash, parseVisionOutput, photoIdFromUrl } from "./photoQuote.vision"
import { analyseGrey } from "./photoQuote.image"
import { buildPhotoQuoteLead } from "./leadPayload"
import { quoteProperty } from "./pricing"
import { zones } from "./pricing.zones"

const pane = (width_cm: number, height_cm: number, extra: Partial<Parameters<typeof normalisePanes>[0][number]> = {}) => ({
  photo: 0,
  label: "Window",
  type: "casement" as const,
  width_cm,
  height_cm,
  confidence: 0.7,
  ...extra,
})

describe("vision result validation", () => {
  it("accepts the documented shape and defaults the optional fields", () => {
    const parsed = visionResultSchema.parse({
      panes: [{ photo: 0, label: "Lounge", type: "casement", width_cm: 120, height_cm: 110, m2: 1.32, confidence: 0.8 }],
      total_m2: 1.3,
    })
    expect(parsed.panes).toHaveLength(1)
    expect(parsed.unusable_photos).toEqual([])
    expect(parsed.property_type).toBe("unknown")
    expect(parsed.notes).toBe("")
  })

  it("coerces an unknown pane type to other rather than failing", () => {
    const parsed = visionResultSchema.parse({
      panes: [{ photo: 0, label: "x", type: "porthole", width_cm: 50, height_cm: 50, confidence: 2 }],
    })
    expect(parsed.panes[0].type).toBe("other")
    expect(parsed.panes[0].confidence).toBe(0.5)
  })

  it("rejects non-positive dimensions", () => {
    expect(visionResultSchema.safeParse({ panes: [{ photo: 0, label: "x", type: "fixed", width_cm: 0, height_cm: 100, confidence: 0.5 }] }).success).toBe(false)
  })
})

describe("normalisePanes", () => {
  it("recomputes m² from the dimensions and ignores the model's figure", () => {
    const [p] = normalisePanes([pane(120, 110, { m2: 99 })], 1)
    expect(p.m2).toBe(1.32)
  })

  it("clamps tiny and huge panes", () => {
    const [tiny, huge] = normalisePanes([pane(10, 10), pane(600, 400)], 1)
    expect(tiny.m2).toBe(PANE_MIN_M2)
    expect(huge.m2).toBe(PANE_MAX_M2)
  })

  it("drops panes that point at a photo we did not send", () => {
    expect(normalisePanes([pane(100, 100, { photo: 3 })], 2)).toHaveLength(0)
  })

  it("rounds the total to 0.1 m²", () => {
    expect(roundTotalM2([{ m2: 1.32 }, { m2: 0.91 }])).toBe(2.2)
  })
})

describe("pricePhotoQuote", () => {
  it("uses the zone's Standard house rate with no DIY discount", () => {
    const panes = normalisePanes([pane(120, 110), pane(80, 210)], 1)
    const price = pricePhotoQuote(panes, "north")
    const calc = quoteProperty(
      panes.map((p) => ({ name: p.label, width: p.width_cm, height: p.height_cm })),
      photoQuoteRate("north"),
      false,
      { minJob: zones.north.minJob }
    )
    expect(price.rate).toBe(89)
    expect(price.point).toBeCloseTo(calc.subtotal, 2)
    expect(price.point).toBeGreaterThan(calc.finalTotal) // the calculator is 10% cheaper
  })

  it("applies the £10 per-pane floor and the zone job floor", () => {
    const price = pricePhotoQuote(normalisePanes([pane(10, 10)], 1), "se")
    expect(price.panes[0].floorApplied).toBe(true)
    expect(price.jobFloorApplied).toBe(true)
    expect(price.point).toBe(zones.se.minJob)
    expect(price.low).toBe(zones.se.minJob)
  })

  it("brackets the point estimate by ±15%", () => {
    const price = pricePhotoQuote(normalisePanes([pane(200, 200), pane(200, 200)], 1), "iom")
    expect(price.low).toBe(Math.round(price.point * 0.85))
    expect(price.high).toBe(Math.round(price.point * 1.15))
    expect(price.totalM2).toBe(8)
  })

  it("prices edited panes from the client the same way", () => {
    const edited = panesFromClient([{ id: "pane-1", label: "Lounge", type: "casement", width_cm: 150, height_cm: 100 }])
    expect(edited[0].id).toBe("pane-1")
    expect(pricePhotoQuote(edited, "iom").point).toBeCloseTo(1.5 * 89, 2)
  })
})

describe("estimate request", () => {
  it("requires a session and at least one photo URL", () => {
    expect(estimateRequestSchema.safeParse({ session: "x".repeat(20), photos: [] }).success).toBe(false)
    expect(estimateRequestSchema.safeParse({ session: "x".repeat(20), photos: ["https://example.com/a.jpg"], zone: "iom" }).success).toBe(true)
  })

  it("rejects an unknown zone and more than 8 photos", () => {
    expect(estimateRequestSchema.safeParse({ session: "x".repeat(20), photos: ["https://e.com/a"], zone: "mars" }).success).toBe(false)
    expect(estimateRequestSchema.safeParse({ session: "x".repeat(20), photos: Array(9).fill("https://e.com/a") }).success).toBe(false)
  })
})

describe("session token", () => {
  it("round-trips and expires", () => {
    const { token } = issueSessionToken(1_000_000)
    expect(verifySessionToken(token, 1_000_001)).toMatch(/^[0-9a-f-]{36}$/)
    expect(verifySessionToken(token, 1_000_000 + 31 * 60 * 1000)).toBeNull()
  })

  it("rejects tampering", () => {
    const { token } = issueSessionToken()
    const [id, exp, sig] = token.split(".")
    expect(verifySessionToken(`${id}.${Number(exp) + 1}.${sig}`)).toBeNull()
    expect(verifySessionToken(`${id}.${exp}.${"0".repeat(sig.length)}`)).toBeNull()
    expect(verifySessionToken("garbage")).toBeNull()
  })
})

describe("vision helpers", () => {
  it("parses JSON with or without fences and rejects junk", () => {
    const body = '{"panes":[{"photo":0,"label":"a","type":"fixed","width_cm":100,"height_cm":100,"confidence":0.6}]}'
    expect(parseVisionOutput(body)?.panes).toHaveLength(1)
    expect(parseVisionOutput("```json\n" + body + "\n```")?.panes).toHaveLength(1)
    expect(parseVisionOutput("Sorry, I cannot see any windows.")).toBeNull()
  })

  it("hashes the image set independent of order", () => {
    const a = { url: "a", bytes: Buffer.from("a"), sha256: "aaa" }
    const b = { url: "b", bytes: Buffer.from("b"), sha256: "bbb" }
    expect(imageSetHash([a, b], undefined, "m")).toBe(imageSetHash([b, a], undefined, "m"))
    expect(imageSetHash([a, b], 120, "m")).not.toBe(imageSetHash([a, b], undefined, "m"))
  })

  it("prices tokens for the default model", () => {
    // 10k in + 500 out on Haiku 4.5 = $0.0125 → ~£0.00975
    expect(estimateCostGbp("claude-haiku-4-5", 10_000, 500)).toBeCloseTo(0.00975, 4)
  })

  it("extracts storage ids from both URL shapes", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000"
    expect(photoIdFromUrl(`http://localhost:3000/api/enquiry-photos/${id}?exp=1&sig=2`)).toBe(id)
    expect(photoIdFromUrl(`https://abc.public.blob.vercel-storage.com/enquiry-photos/${id}.jpg`)).toBe(id)
    expect(photoIdFromUrl("https://evil.example/whatever")).toBeNull()
  })
})

describe("photo quality hints", () => {
  const size = 32
  it("flags a flat grey frame as blurry and a black frame as dark", () => {
    expect(analyseGrey(new Float32Array(size * size).fill(128), size, size)).toEqual(["blurry"])
    expect(analyseGrey(new Float32Array(size * size).fill(5), size, size)).toEqual(["dark"])
  })

  it("passes a high-contrast checkerboard", () => {
    const grey = new Float32Array(size * size)
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) grey[y * size + x] = (x + y) % 2 ? 230 : 30
    expect(analyseGrey(grey, size, size)).toEqual([])
  })
})

describe("buildPhotoQuoteLead", () => {
  it("writes the estimate line first and keeps prices out of job_details", () => {
    const price = pricePhotoQuote(normalisePanes([pane(120, 110), pane(80, 210, { label: "Patio", type: "patio_door" })], 1), "north")
    const lead = buildPhotoQuoteLead({
      price,
      propertyTypeName: "Residential",
      photoUrls: ["https://x/1.jpg"],
      estimateNotes: "Frame cut off on photo 1.",
      postcodeUnmapped: false,
      customerNotes: "",
    })
    expect(lead.service).toBe("Photo Quote — Residential")
    expect(lead.message.split("\n")[0]).toMatch(/^ESTIMATE \(photo\): £\d+\.\d\d \(range £\d+–£\d+\), 2 pane\(s\), 3\.0 m² @ Standard North West$/)
    expect(lead.message).toContain("Photos: https://x/1.jpg")
    expect(lead.jobDetails.measured_by).toBe("photo_estimate")
    expect(lead.jobDetails.photo_urls).toEqual(["https://x/1.jpg"])
    expect(lead.jobDetails.windows).toHaveLength(2)
    expect(JSON.stringify(lead.jobDetails)).not.toMatch(/£|point|low|high/)
  })

  it("spells out the window total and the zone minimum when the job floor applies", () => {
    const price = pricePhotoQuote(normalisePanes([pane(60, 80)], 1), "iom")
    expect(price.jobFloorApplied).toBe(true)
    expect(price.point).toBe(zones.iom.minJob)
    expect(price.subtotal).toBeLessThan(price.point)
    const lead = buildPhotoQuoteLead({
      price,
      propertyTypeName: "Residential",
      photoUrls: [],
      estimateNotes: "",
      postcodeUnmapped: false,
      customerNotes: "",
    })
    expect(lead.message.split("\n")[0]).toContain(`(windows £${price.subtotal.toFixed(2)}, minimum job charge £${zones.iom.minJob})`)
  })
})
