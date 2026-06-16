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

/**
 * Fire a Meta "Lead" event via the browser Pixel and the server-side
 * Conversions API, deduplicated by a shared eventId.
 *
 * Fire-and-forget: never throws, never blocks the UI.
 */
export async function trackLead(params: TrackLeadParams): Promise<void> {
  if (typeof window === "undefined") return

  const eventId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const { contentName, value, email, phone, firstName, zip } = params

  try {
    if (typeof window.fbq === "function") {
      window.fbq(
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

  try {
    await fetch("/api/meta-capi", {
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
