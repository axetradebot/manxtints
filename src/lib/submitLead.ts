// Lead submission with cutover fallback.
// Primary: StartMyPatch external-lead endpoint (JSON POST).
// Fallback: legacy Formspree endpoint (FormData POST) — used whenever the
// primary request fails (network error, non-200, or missing { ok: true }),
// so no lead is lost during the cutover.

export interface LeadFields {
  name: string
  phone: string
  email: string
  address: string
  service: string
  message: string
  /** Honeypot value — empty for real users */
  gotcha: string
}

const LEAD_ENDPOINT = (process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "").trim()
const LEAD_FALLBACK = (process.env.NEXT_PUBLIC_LEAD_FALLBACK || "").trim()

/**
 * Submits a lead. Returns true if either the primary endpoint accepted it
 * with { ok: true } or the Formspree fallback accepted it.
 */
export async function submitLead(
  fields: LeadFields,
  fallbackFormData: FormData
): Promise<boolean> {
  if (LEAD_ENDPOINT) {
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          address: fields.address,
          service: fields.service,
          message: fields.message,
          source_page: window.location.pathname,
          _gotcha: fields.gotcha,
        }),
      })

      if (response.ok) {
        const data = await response.json().catch(() => null)
        if (data && data.ok === true) {
          return true
        }
      }
    } catch {
      // Network failure — fall through to the Formspree fallback below.
    }
  }

  if (!LEAD_FALLBACK) return false

  try {
    const response = await fetch(LEAD_FALLBACK, {
      method: "POST",
      body: fallbackFormData,
      headers: { Accept: "application/json" },
    })
    return response.ok
  } catch {
    return false
  }
}
