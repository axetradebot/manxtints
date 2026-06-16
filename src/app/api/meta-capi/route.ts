import { createHash } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const GRAPH_API_VERSION = "v25.0"

interface UserDataInput {
  email?: string
  phone?: string
  firstName?: string
  zip?: string
}

interface CapiRequestBody {
  eventId?: string
  eventName?: string
  contentName?: string
  value?: number
  eventSourceUrl?: string
  userData?: UserDataInput
}

/** SHA-256 hash a normalized PII string. Returns undefined for empty input. */
function hash(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash("sha256").update(normalized).digest("hex")
}

/** Hash a phone number using digits only. Returns undefined when no digits. */
function hashPhone(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const digits = value.replace(/\D/g, "")
  if (!digits) return undefined
  return createHash("sha256").update(digits).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN
    const datasetId = process.env.META_DATASET_ID

    // Without server credentials there is nothing to send; succeed silently.
    if (!accessToken || !datasetId) {
      return NextResponse.json({ ok: true })
    }

    const body = (await request.json()) as CapiRequestBody
    const {
      eventId,
      eventName = "Lead",
      contentName,
      value,
      eventSourceUrl,
      userData = {},
    } = body

    // Build hashed user_data, omitting empty fields.
    const user_data: Record<string, string | string[]> = {}

    const em = hash(userData.email)
    if (em) user_data.em = em

    const ph = hashPhone(userData.phone)
    if (ph) user_data.ph = ph

    const fn = hash(userData.firstName)
    if (fn) user_data.fn = fn

    const zp = hash(userData.zip)
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

    const custom_data: Record<string, unknown> = {
      currency: "GBP",
    }
    if (contentName) custom_data.content_name = contentName
    if (typeof value === "number") custom_data.value = value

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: eventSourceUrl,
          user_data,
          custom_data,
        },
      ],
    }

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
      console.error(
        `[meta-capi] Meta returned ${metaResponse.status}: ${errorText}`
      )
      // Don't surface tracking failures to the user.
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[meta-capi] Failed to forward event:", error)
    // Never break the client flow because of tracking.
    return NextResponse.json({ ok: true })
  }
}
