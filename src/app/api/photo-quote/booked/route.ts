import { NextRequest, NextResponse } from "next/server"
import { bookedRequestSchema } from "@/lib/photoQuote.schema"
import { markPhotosBooked } from "@/lib/photoQuote.store"
import { verifySessionToken } from "@/lib/photoQuote.token"
import { allowRequest } from "@/lib/rateLimit"
import { ipHashFor, sameOrigin } from "../_shared"

export const runtime = "nodejs"

/**
 * Called after submitLead() was accepted: flags the photos as attached to a
 * booked lead so the 30-day purge keeps them for the installer.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const { ipHash } = ipHashFor(request)
  if (!allowRequest(`pq-booked:${ipHash}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const parsed = bookedRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 })
  if (!verifySessionToken(parsed.data.session)) return NextResponse.json({ error: "session" }, { status: 401 })

  try {
    await markPhotosBooked(parsed.data.photos)
  } catch (error) {
    console.error("photo-quote: could not mark photos booked:", error instanceof Error ? error.message : error)
  }
  return NextResponse.json({ ok: true })
}
