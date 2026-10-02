import { NextRequest, NextResponse } from "next/server"
import { pricePhotoQuote } from "@/lib/photoQuote.pricing"
import { panesFromClient, priceRequestSchema, type PriceResponse } from "@/lib/photoQuote.schema"
import { verifySessionToken } from "@/lib/photoQuote.token"
import { zoneFromPostcode } from "@/lib/pricing.zones"
import { allowRequest } from "@/lib/rateLimit"
import { ipHashFor, sameOrigin } from "../_shared"

export const runtime = "nodejs"

/**
 * Server recompute before booking: the client may have edited pane sizes,
 * and the postcode may move the job to another area. No model call — this
 * is pure maths on the submitted panes, so it is cheap and only lightly
 * rate limited.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const { ipHash } = ipHashFor(request)
  if (!allowRequest(`pq-price:${ipHash}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const parsed = priceRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })
  const body = parsed.data

  if (!verifySessionToken(body.session)) return NextResponse.json({ error: "session" }, { status: 401 })

  const postcodeZone = body.postcode ? zoneFromPostcode(body.postcode) : null
  const zone = postcodeZone ?? body.zone
  const panes = panesFromClient(body.panes)
  if (panes.length === 0) return NextResponse.json({ error: "invalid" }, { status: 400 })

  const response: PriceResponse = {
    price: pricePhotoQuote(panes, zone),
    postcodeZone,
    zoneChanged: postcodeZone !== null && postcodeZone !== body.zone,
  }
  return NextResponse.json(response)
}
