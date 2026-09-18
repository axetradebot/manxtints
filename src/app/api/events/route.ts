import { NextRequest, NextResponse } from "next/server"
import { insertEvent } from "@/lib/eventStore"

const ALLOWED_EVENTS = new Set([
  "page_view",
  "quote_page_view",
  "calc_started",
  "calc_windows_added",
  "calc_price_shown",
  "tier_selected",
  "calc_submitted",
  "visit_form_submitted",
  "enquiry_submitted",
])

// Fire-and-forget collector: always answers 204 so a storage hiccup can
// never surface as an error on the marketing site.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = typeof body.event === "string" ? body.event : ""
    const session = typeof body.session === "string" ? body.session.slice(0, 64) : ""
    if (!ALLOWED_EVENTS.has(event) || !session) {
      return new NextResponse(null, { status: 204 })
    }

    await insertEvent({
      ts: Date.now(),
      session,
      event,
      path: typeof body.path === "string" ? body.path.slice(0, 200) : null,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null,
      device: body.device === "mobile" ? "mobile" : "desktop",
      payload:
        body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
          ? (body.payload as Record<string, unknown>)
          : null,
    })
  } catch {
    // swallow — analytics is best-effort
  }
  return new NextResponse(null, { status: 204 })
}
