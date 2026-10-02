import { NextRequest, NextResponse } from "next/server"
import { issueSessionToken } from "@/lib/photoQuote.token"
import { photoQuoteConfigured } from "@/lib/photoQuote.vision"
import { allowRequest } from "@/lib/rateLimit"
import { ipHashFor, sameOrigin } from "../_shared"

export const runtime = "nodejs"

/**
 * Issues the short-lived session token the sheet needs before it can upload
 * or ask for an estimate. Cheap, but still limited so it can't be farmed.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const { ipHash } = ipHashFor(request)
  if (!allowRequest(`pq-session:${ipHash}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }
  const { token, exp } = issueSessionToken()
  return NextResponse.json({ token, exp, enabled: photoQuoteConfigured() })
}
