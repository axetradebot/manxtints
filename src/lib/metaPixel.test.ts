import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { trackLead } from "./metaPixel"
import { isRealLead, type SubmitLeadResult } from "./submitLead"

const accepted: SubmitLeadResult = { accepted: true, via: "primary", honeypotTripped: false }
const acceptedViaFallback: SubmitLeadResult = { accepted: true, via: "fallback", honeypotTripped: false }
const failed: SubmitLeadResult = { accepted: false, via: null, honeypotTripped: false }
const bot: SubmitLeadResult = { accepted: true, via: "primary", honeypotTripped: true }

describe("isRealLead", () => {
  it("counts only accepted, non-honeypot submissions", () => {
    expect(isRealLead(accepted)).toBe(true)
    expect(isRealLead(acceptedViaFallback)).toBe(true)
    expect(isRealLead(failed)).toBe(false)
    expect(isRealLead(bot)).toBe(false)
  })
})

describe("trackLead", () => {
  const fbq = vi.fn()
  const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")))

  beforeEach(() => {
    vi.stubGlobal("window", { fbq, location: { href: "https://www.manxtints.com/quote" } })
    vi.stubGlobal("fetch", fetchMock)
    fbq.mockClear()
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fires the Pixel and CAPI with one shared event id after an accepted submission", async () => {
    const sent = await trackLead(accepted, {
      contentName: "diy_calculator",
      value: 267.5,
      email: "jo@example.com",
    })

    expect(sent).toBe(true)
    expect(fbq).toHaveBeenCalledTimes(1)
    const [method, name, params, options] = fbq.mock.calls[0] as [string, string, Record<string, unknown>, { eventID: string }]
    expect(method).toBe("track")
    expect(name).toBe("Lead")
    expect(params).toMatchObject({ content_name: "diy_calculator", value: 267.5, currency: "GBP" })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("/api/meta-capi")
    const body = JSON.parse(String(init.body)) as Record<string, unknown>
    expect(body.eventName).toBe("Lead")
    expect(body.eventId).toBe(options.eventID)
    expect(body.value).toBe(267.5)
    expect(body.eventSourceUrl).toBe("https://www.manxtints.com/quote")
  })

  it("sends nothing when the submission was not accepted", async () => {
    expect(await trackLead(failed, { contentName: "quote_enquiry" })).toBe(false)
    expect(fbq).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sends nothing when the honeypot was filled, even though the endpoint said ok", async () => {
    expect(await trackLead(bot, { contentName: "diy_calculator", value: 120 })).toBe(false)
    expect(fbq).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
