// Lead submission with cutover fallback.
// Primary: StartMyPatch external-lead endpoint (JSON POST). The 8 string keys
// are the fixed contract; `job_details` is an optional 9th key carrying the
// structured job (see leadPayload.ts) for the installer brief.
// Fallback: legacy Formspree endpoint (FormData POST) — used whenever the
// primary request fails (network error, non-200, or missing { ok: true }),
// so no lead is lost during the cutover. It receives the same `message`
// (and job_details as JSON) so nothing is dropped on the fallback path.

import type { JobDetails } from "./leadPayload"

export interface LeadFields {
  name: string
  phone: string
  email: string
  address: string
  service: string
  message: string
  /** Honeypot value — empty for real users */
  gotcha: string
  /** Optional structured job data (installer brief). Omitted from the POST when absent. */
  jobDetails?: JobDetails
}

/**
 * What happened to a submission. Consumers must treat "a lead exists" as
 * `accepted && !honeypotTripped` — both endpoints deliberately answer OK to
 * honeypot submissions so bots see a success screen, but nothing was stored.
 */
export interface SubmitLeadResult {
  /** An endpoint confirmed it: primary `{ ok: true }` or Formspree `{ ok: true }`. */
  accepted: boolean
  via: "primary" | "fallback" | null
  /** The hidden `_gotcha` field had a value at submit time (bot). */
  honeypotTripped: boolean
}

const LEAD_ENDPOINT = (process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "").trim()
const LEAD_FALLBACK = (process.env.NEXT_PUBLIC_LEAD_FALLBACK || "").trim()

/** True when a submission should count as a real lead (for Meta, analytics, admin). */
export function isRealLead(result: SubmitLeadResult): boolean {
  return result.accepted && !result.honeypotTripped
}

async function readOkFlag(response: Response): Promise<boolean> {
  if (!response.ok) return false
  const data = (await response.json().catch(() => null)) as { ok?: unknown } | null
  return data?.ok === true
}

/**
 * Submits a lead. `accepted` is true only when an endpoint explicitly
 * confirmed the submission — never on a bare 2xx without `{ ok: true }`.
 */
export async function submitLead(
  fields: LeadFields,
  fallbackFormData: FormData
): Promise<SubmitLeadResult> {
  const honeypotTripped = fields.gotcha.trim().length > 0

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
          ...(fields.jobDetails ? { job_details: fields.jobDetails } : {}),
        }),
      })

      if (await readOkFlag(response)) {
        return { accepted: true, via: "primary", honeypotTripped }
      }
    } catch {
      // Network failure — fall through to the Formspree fallback below.
    }
  }

  if (!LEAD_FALLBACK) return { accepted: false, via: null, honeypotTripped }

  // Same message as the primary so the owner's email loses nothing; the
  // structured job is flattened to JSON since Formspree only takes strings.
  fallbackFormData.set("message", fields.message)
  if (fields.jobDetails) {
    fallbackFormData.set("job_details", JSON.stringify(fields.jobDetails, null, 2))
  }

  try {
    const response = await fetch(LEAD_FALLBACK, {
      method: "POST",
      body: fallbackFormData,
      headers: { Accept: "application/json" },
    })
    if (await readOkFlag(response)) {
      return { accepted: true, via: "fallback", honeypotTripped }
    }
    return { accepted: false, via: null, honeypotTripped }
  } catch {
    return { accepted: false, via: null, honeypotTripped }
  }
}
