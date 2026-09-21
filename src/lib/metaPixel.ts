/**
 * Meta Pixel + Conversions API (CAPI).
 *
 * This is the only module that calls `fbq` or `/api/meta-capi`. Every event
 * the site sends, in funnel order:
 *
 *  Event                 Kind      Fired from                          Trigger                                       Parameters
 *  --------------------  --------  ----------------------------------  --------------------------------------------  ------------------------------------------------
 *  PageView              standard  app/layout.tsx (base snippet)       every page load                               —
 *  ViewContent           standard  app/quote/page.tsx                  /quote mounted                                content_name "quote_page", content_category "quote"
 *  CalculatorPriceShown  custom    app/quote/page.tsx                  calculator summary step renders a total       value, currency "GBP", content_name (project
 *                                                                      (again if area/film changes the price)        type), tier, zone
 *  EnquiryStarted        custom    quote/page.tsx, quote-enquiry-form  first focus on any field of the form, once    content_name "diy_calculator" | "quote_enquiry"
 *  Lead                  standard  quote/page.tsx, quote-enquiry-form  ONLY after submitLead() resolved with         value (quote total when known), currency "GBP",
 *                                                                      accepted=true AND honeypot empty              content_name, eventID (shared with CAPI)
 *
 * Lead is the only event that also goes to the Conversions API. The browser
 * and server copies share `event_id`, so Meta deduplicates them to one. The
 * server relay adds event_source_url, client IP/UA, _fbp/_fbc and hashed
 * email/phone/first name/postcode.
 *
 * Lead must never fire on a button click, when a price is shown, on a failed
 * submission, or on a honeypot drop. trackLead() enforces this from the
 * SubmitLeadResult rather than trusting the call site.
 *
 * Upper-funnel events are browser-only. In Events Manager they must stay as
 * separate events (or custom conversions) — never mapped to Lead.
 *
 * Meta's automatic configuration is disabled in app/layout.tsx
 * (`fbq('set', 'autoConfig', false, PIXEL_ID)`). Without that, Event Setup
 * Tool rules saved in Events Manager are injected by fbevents.js and fire
 * events this code never asked for — a "button click → Lead" rule on the
 * calculator's step-1 Continue button was counting every click as a Lead.
 * Do not re-enable it, and do not create codeless events for this pixel.
 */

import { isRealLead, type SubmitLeadResult } from "./submitLead"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export type LeadContentName = "diy_calculator" | "quote_enquiry"

export interface TrackLeadParams {
  contentName: LeadContentName
  /** Quote total in pounds. Omit when the enquiry has no price yet. */
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
 * Wait for the Pixel (window.fbq) to be available. The base snippet loads
 * lazily after window.onload, so events fired during hydration may need to
 * wait a moment. Capped so it never blocks anything for long.
 */
async function waitForFbq(timeoutMs: number): Promise<Fbq | undefined> {
  const start = Date.now()
  let fbq = resolveFbq()
  while (!fbq && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 75))
    fbq = resolveFbq()
  }
  return fbq
}

/** Run a Pixel call once fbq exists. Never throws. */
async function withFbq(timeoutMs: number, call: (fbq: Fbq) => void): Promise<void> {
  if (typeof window === "undefined") return
  try {
    const fbq = await waitForFbq(timeoutMs)
    if (fbq) call(fbq)
  } catch {
    // Tracking must never break the UI.
  }
}

/** Standard ViewContent — the quote page being opened. Browser only. */
export function trackViewContent(params: { contentName: string; contentCategory?: string }): void {
  void withFbq(10_000, (fbq) => {
    fbq("track", "ViewContent", {
      content_name: params.contentName,
      content_category: params.contentCategory,
    })
  })
}

/** Custom event: the calculator rendered a total. Browser only; not a Lead. */
export function trackCalculatorPriceShown(params: {
  value: number
  contentName: string
  tier?: string | null
  zone: string
}): void {
  void withFbq(10_000, (fbq) => {
    fbq("trackCustom", "CalculatorPriceShown", {
      value: params.value,
      currency: "GBP",
      content_name: params.contentName,
      tier: params.tier ?? undefined,
      zone: params.zone,
    })
  })
}

/** Custom event: a visitor focused the first field of a form. Browser only; not a Lead. */
export function trackEnquiryStarted(contentName: LeadContentName): void {
  void withFbq(10_000, (fbq) => {
    fbq("trackCustom", "EnquiryStarted", { content_name: contentName })
  })
}

function newEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Fire Meta "Lead" via the browser Pixel and the Conversions API, deduplicated
 * by a shared event id — but ONLY for a real, accepted enquiry.
 *
 * Callers pass the SubmitLeadResult from submitLead(). If the submission was
 * not accepted, or the honeypot was filled (bot), nothing is sent and the
 * function resolves false. Never throws.
 */
export async function trackLead(result: SubmitLeadResult, params: TrackLeadParams): Promise<boolean> {
  if (typeof window === "undefined") return false
  if (!isRealLead(result)) return false

  const eventId = newEventId()
  const { contentName, value, email, phone, firstName, zip } = params
  const roundedValue = typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : undefined

  // 1) Browser Pixel.
  await withFbq(1500, (fbq) => {
    fbq(
      "track",
      "Lead",
      {
        content_name: contentName,
        value: roundedValue,
        currency: "GBP",
      },
      { eventID: eventId }
    )
  })

  // 2) Conversions API — fire-and-forget with keepalive so the request
  //    survives the thank-you re-render or a tab close.
  try {
    void fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventId,
        eventName: "Lead",
        contentName,
        value: roundedValue,
        eventSourceUrl: window.location.href,
        userData: { email, phone, firstName, zip },
      }),
    })
  } catch {
    // Swallow network errors — never surface tracking failures.
  }

  return true
}
