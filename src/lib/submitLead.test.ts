import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const PRIMARY = "https://www.startmypatch.com/api/external-lead/test-token"
const FALLBACK = "https://formspree.io/f/test"

const fields = {
  name: "Jo Bloggs",
  phone: "07624 000000",
  email: "jo@example.com",
  address: "12, IM2 1BB",
  service: "DIY Calculator — Residential",
  message: "Quote: £267.50",
  gotcha: "",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

describe("submitLead", () => {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>()

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("NEXT_PUBLIC_LEAD_ENDPOINT", PRIMARY)
    vi.stubEnv("NEXT_PUBLIC_LEAD_FALLBACK", FALLBACK)
    vi.stubGlobal("window", { location: { pathname: "/quote" } })
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  async function load() {
    return (await import("./submitLead")).submitLead
  }

  it("is accepted via primary only on an explicit { ok: true }", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))
    const submitLead = await load()

    const result = await submitLead(fields, new FormData())

    expect(result).toEqual({ accepted: true, via: "primary", honeypotTripped: false })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(PRIMARY)
  })

  it("falls back to Formspree when the primary 200 lacks ok:true, and needs Formspree's ok:true", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "nope" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true, next: "/thanks" }))
    const submitLead = await load()

    const result = await submitLead(fields, new FormData())

    expect(result).toEqual({ accepted: true, via: "fallback", honeypotTripped: false })
    expect(fetchMock.mock.calls[1][0]).toBe(FALLBACK)
  })

  it("is not accepted when both endpoints fail", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(jsonResponse({ error: "x" }, 500))
    const submitLead = await load()

    const result = await submitLead(fields, new FormData())

    expect(result).toEqual({ accepted: false, via: null, honeypotTripped: false })
  })

  it("flags a filled honeypot even when the endpoint pretends success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }))
    const submitLead = await load()

    const result = await submitLead({ ...fields, gotcha: "http://spam.example" }, new FormData())

    expect(result).toEqual({ accepted: true, via: "primary", honeypotTripped: true })
  })
})
