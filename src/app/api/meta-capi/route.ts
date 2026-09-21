import { createHash } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const GRAPH_API_VERSION = "v25.0"

/**
 * Server-side relay for the Meta Conversions API.
 *
 * Only `Lead` is accepted here: it is the one event the browser also sends
 * through the Pixel, and the shared `event_id` is what lets Meta deduplicate
 * the two copies. Upper-funnel events (ViewContent, CalculatorPriceShown,
 * EnquiryStarted) are browser-only and are rejected if posted here.
 *
 * Guards against phantom leads:
 *  - eventName must be "Lead", eventId must be present (8–64 chars);
 *  - the payload must carry an email or phone — every accepted enquiry has
 *    at least one, a blind POST to this route has neither;
 *  - when the browser sends an Origin header it must be this site;
 *  - GET/OPTIONS are not handled, so nothing fires on a preflight or a crawl.
 */

const ALLOWED_EVENTS = new Set(["Lead"])

interface UserDataInput {
  email?: string
  phone?: string
  firstName?: string
  zip?: string
}

interface CapiRequestBody {
  eventId?: unknown
  eventName?: unknown
  contentName?: unknown
  value?: unknown
  eventSourceUrl?: unknown
  userData?: UserDataInput
}

/** SHA-256 hash a normalized PII string. Returns undefined for empty input. */
function hash(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash("sha256").update(normalized).digest("hex")
}

/** Hash a phone number using digits only. Returns undefined when no digits. */
function hashPhone(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined
  const digits = value.replace(/\D/g, "")
  if (!digits) return undefined
  return createHash("sha256").update(digits).digest("hex")
}

/** Meta wants postcodes lowercase with no spaces (UK: "im21bb"). */
function hashZip(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined
  return hash(value.replace(/\s+/g, ""))
}

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  if (!host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function rejected(reason: string, status = 400) {
  return NextResponse.json({ ok: false, sent: false, reason }, { status })
}

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return rejected("origin", 403)

    const body = (await request.json().catch(() => null)) as CapiRequestBody | null
    if (!body || typeof body !== "object") return rejected("body")

    const { eventId, eventName, contentName, value, eventSourceUrl, userData = {} } = body

    if (typeof eventName !== "string" || !ALLOWED_EVENTS.has(eventName)) {
      return rejected("event_name")
    }
    if (typeof eventId !== "string" || eventId.length < 8 || eventId.length > 64) {
      return rejected("event_id")
    }

    // Build hashed user_data, omitting empty fields.
    const user_data: Record<string, string> = {}

    const em = hash(userData.email)
    if (em) user_data.em = em

    const ph = hashPhone(userData.phone)
    if (ph) user_data.ph = ph

    // A real enquiry always has a contact detail; a blind POST does not.
    if (!em && !ph) return rejected("contact")

    const fn = hash(userData.firstName)
    if (fn) user_data.fn = fn

    const zp = hashZip(userData.zip)
    if (zp) user_data.zp = zp

    // _fbp / _fbc cookies are sent un-hashed.
    const fbp = request.cookies.get("_fbp")?.value
    if (fbp) user_data.fbp = fbp

    const fbc = request.cookies.get("_fbc")?.value
    if (fbc) user_data.fbc = fbc

    // Client IP (first entry of x-forwarded-for) and user agent.
    const forwardedFor = request.headers.get("x-forwarded-for")
    const clientIp = forwardedFor?.split(",")[0]?.trim()
    if (clientIp) user_data.client_ip_address = clientIp

    const userAgent = request.headers.get("user-agent")
    if (userAgent) user_data.client_user_agent = userAgent

    const custom_data: Record<string, unknown> = { currency: "GBP" }
    if (typeof contentName === "string" && contentName) custom_data.content_name = contentName
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) custom_data.value = value

    const accessToken = process.env.META_CAPI_ACCESS_TOKEN
    const datasetId = process.env.META_DATASET_ID

    // Without server credentials there is nothing to send; the browser Pixel
    // copy still counts on its own.
    if (!accessToken || !datasetId) {
      return NextResponse.json({ ok: true, sent: false, reason: "unconfigured" })
    }

    const payload: { data: unknown[]; test_event_code?: string } = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: typeof eventSourceUrl === "string" ? eventSourceUrl : undefined,
          user_data,
          custom_data,
        },
      ],
    }

    // Optional: route events to Events Manager > Test events for verification.
    // Set META_TEST_EVENT_CODE in the environment; leave unset in production.
    const testEventCode = process.env.META_TEST_EVENT_CODE
    if (testEventCode) payload.test_event_code = testEventCode

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${datasetId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`

    const metaResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text().catch(() => "")
      console.error(`[meta-capi] Meta returned ${metaResponse.status}: ${errorText}`)
      // Don't surface tracking failures to the user.
      return NextResponse.json({ ok: true, sent: false, reason: "meta" })
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (error) {
    console.error("[meta-capi] Failed to forward event:", error)
    // Never break the client flow because of tracking.
    return NextResponse.json({ ok: true, sent: false, reason: "error" })
  }
}
