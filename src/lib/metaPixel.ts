declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export type LeadContentName = "diy_calculator" | "home_visit"

export interface TrackLeadParams {
  contentName: LeadContentName
  value?: number
  email?: string
  phone?: string
  firstName?: string
  zip?: string
}

type Fbq = (...args: unknown[]) => void

/** Return window.fbq only if it's currently a callable function. */
function resolveFbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined
  return typeof window.fbq === "function" ? window.fbq : undefined
}

/**
 * Wait briefly for the Pixel (window.fbq) to be available. The base code
 * defines fbq as a queueing stub almost immediately, but this guards against
 * a submit that happens before the script has run. Capped so it never blocks
 * the UI for long.
 */
async function waitForFbq(timeoutMs = 1500): Promise<Fbq | undefined> {
  const start = Date.now()
  let fbq = resolveFbq()
  while (!fbq && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 75))
    fbq = resolveFbq()
  }
  return fbq
}

/**
 * Fire a Meta "Lead" event via the browser Pixel and the server-side
 * Conversions API, deduplicated by a shared eventId.
 *
 * The browser Pixel is fired FIRST (awaiting fbq readiness) so the beacon is
 * sent before any navigation/unload. The CAPI POST is fire-and-forget with
 * keepalive so it completes even if the page unloads. Never throws.
 */
export async function trackLead(params: TrackLeadParams): Promise<void> {
  if (typeof window === "undefined") return

  const eventId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const { contentName, value, email, phone, firstName, zip } = params

  // 1) Browser Pixel — ensure fbq exists, then fire before returning so the
  //    beacon isn't cancelled by a subsequent navigation/page unload.
  try {
    const fbq = await waitForFbq()
    if (fbq) {
      fbq(
        "track",
        "Lead",
        {
          content_name: contentName,
          value,
          currency: "GBP",
        },
        { eventID: eventId }
      )
    }
  } catch {
    // Ignore Pixel errors — tracking must never break the UI.
  }

  // 2) Conversions API — fire-and-forget with keepalive so the request
  //    survives page unload. We intentionally do not await it.
  try {
    void fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventId,
        eventName: "Lead",
        contentName,
        value,
        eventSourceUrl: window.location.href,
        userData: { email, phone, firstName, zip },
      }),
    })
  } catch {
    // Swallow network errors — never surface tracking failures.
  }
}
