import { NextRequest, NextResponse } from "next/server"
import { pricePhotoQuote } from "@/lib/photoQuote.pricing"
import { estimateRequestSchema, normalisePanes, type EstimateResponse } from "@/lib/photoQuote.schema"
import {
  countRecentEstimates,
  dailySpendGbp,
  getCachedEstimate,
  logAiUsage,
  putCachedEstimate,
  type AiUsageOutcome,
} from "@/lib/photoQuote.store"
import { verifySessionToken } from "@/lib/photoQuote.token"
import { verifyTurnstile } from "@/lib/photoQuote.turnstile"
import {
  callVision,
  estimateCostGbp,
  imageSetHash,
  loadOwnImage,
  photoQuoteConfigured,
  photoQuoteModel,
  type LoadedImage,
} from "@/lib/photoQuote.vision"
import { ipHashFor, resolveZoneFor, sameOrigin } from "./_shared"

export const runtime = "nodejs"
export const maxDuration = 30

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const HOURLY_LIMIT = 3
const DAILY_LIMIT = 10
const DEFAULT_DAILY_CAP_GBP = 10

function dailyCapGbp(): number {
  const n = Number(process.env.PHOTO_QUOTE_DAILY_CAP_GBP)
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DAILY_CAP_GBP
}

/**
 * POST /api/photo-quote — estimate glass area from uploaded photos and price
 * it for the visitor's zone. Order of checks is deliberate: everything cheap
 * and abuse-related runs before a single byte is fetched or billed.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const parsed = estimateRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })
  const body = parsed.data

  const session = verifySessionToken(body.session)
  if (!session) return NextResponse.json({ error: "session" }, { status: 401 })

  if (!photoQuoteConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 })
  }

  const { ip, ipHash } = ipHashFor(request)
  const zone = resolveZoneFor(request, body.zone)
  const startedAt = Date.now()
  const model = photoQuoteModel()

  const log = (outcome: AiUsageOutcome, extra: Partial<Parameters<typeof logAiUsage>[0]> = {}) =>
    logAiUsage({
      ts: Date.now(),
      feature: "photo_quote",
      model: null,
      inputTokens: 0,
      outputTokens: 0,
      costGbp: 0,
      zone,
      panes: null,
      outcome,
      ipHash,
      session,
      imageHash: null,
      durationMs: Date.now() - startedAt,
      ...extra,
    }).catch((error) => console.error("photo-quote: usage log failed:", error instanceof Error ? error.message : error))

  if (!(await verifyTurnstile(body.turnstile, ip))) {
    await log("turnstile_failed")
    return NextResponse.json({ error: "turnstile" }, { status: 403 })
  }

  // Per-visitor allowance, counted from the usage log so it survives restarts.
  if ((await countRecentEstimates(ipHash, HOUR_MS, HOURLY_LIMIT)) >= HOURLY_LIMIT) {
    await log("rate_limited")
    return NextResponse.json({ error: "rate_limited", retryAfter: "hour" }, { status: 429 })
  }
  if ((await countRecentEstimates(ipHash, DAY_MS, DAILY_LIMIT)) >= DAILY_LIMIT) {
    await log("rate_limited")
    return NextResponse.json({ error: "rate_limited", retryAfter: "day" }, { status: 429 })
  }

  // Global spend cap: degrade to the calculator rather than keep paying.
  const cap = dailyCapGbp()
  if (cap > 0 && (await dailySpendGbp().catch(() => 0)) >= cap) {
    await log("cap_reached")
    return NextResponse.json({ error: "high_demand" }, { status: 503 })
  }

  // Images come only from our own storage.
  const images: LoadedImage[] = []
  for (const url of body.photos) {
    const img = await loadOwnImage(url).catch(() => null)
    if (!img) return NextResponse.json({ error: "bad_photo", url }, { status: 400 })
    images.push(img)
  }

  const imageHash = imageSetHash(images, body.anchorWidthCm, model)
  let vision = await getCachedEstimate(imageHash).catch(() => null)
  let cached = Boolean(vision)

  if (!vision) {
    cached = false
    let call: Awaited<ReturnType<typeof callVision>>
    try {
      call = await callVision(images, body.anchorWidthCm)
    } catch (error) {
      console.error("photo-quote: model call failed:", error instanceof Error ? error.message : error)
      await log("model_error", { model, imageHash })
      return NextResponse.json({ error: "model_error" }, { status: 502 })
    }
    const costGbp = estimateCostGbp(call.model, call.inputTokens, call.outputTokens)
    const usage = { model: call.model, inputTokens: call.inputTokens, outputTokens: call.outputTokens, costGbp, imageHash }

    if (!call.result) {
      console.error("photo-quote: unparseable model output:", call.raw.slice(0, 400))
      await log("invalid_output", usage)
      return NextResponse.json({ error: "model_error" }, { status: 502 })
    }
    vision = call.result
    const panes = normalisePanes(vision.panes, images.length)
    if (panes.length === 0) {
      await log("no_panes", usage)
      return NextResponse.json(
        { error: "no_panes", unusablePhotos: vision.unusable_photos, notes: vision.notes },
        { status: 422 }
      )
    }
    await log("ok", { ...usage, panes: panes.length })
    await putCachedEstimate(imageHash, vision).catch(() => {})
  } else {
    await log("cached", { model, imageHash, panes: vision.panes.length })
  }

  const panes = normalisePanes(vision.panes, images.length)
  if (panes.length === 0) {
    return NextResponse.json(
      { error: "no_panes", unusablePhotos: vision.unusable_photos, notes: vision.notes },
      { status: 422 }
    )
  }

  const price = pricePhotoQuote(panes, zone)
  const response: EstimateResponse = {
    estimateId: session,
    price,
    notes: vision.notes,
    unusablePhotos: vision.unusable_photos.filter((i) => i < images.length),
    propertyType: vision.property_type,
    cached,
  }
  return NextResponse.json(response)
}
