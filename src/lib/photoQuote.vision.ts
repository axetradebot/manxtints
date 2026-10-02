// Photo quote — the model call. Server only: this is the one module that
// touches ANTHROPIC_API_KEY, and it must never be imported from a client
// component (the API routes are its only consumers).
//
// Images are fetched server-side from our own storage (Vercel Blob, or the
// signed local route in dev) and sent as base64 in a single message, so the
// browser never talks to Anthropic and cannot substitute arbitrary URLs.

import { createHash } from "node:crypto"
import Anthropic from "@anthropic-ai/sdk"
import { getEnquiryPhoto } from "./enquiryPhotoStore"
import { verifyPhotoSig } from "./photoSign"
import { PANE_TYPES, visionResultSchema, type VisionResult } from "./photoQuote.schema"

export const DEFAULT_PHOTO_QUOTE_MODEL = "claude-haiku-4-5"

export function photoQuoteModel(): string {
  return (process.env.PHOTO_QUOTE_MODEL || DEFAULT_PHOTO_QUOTE_MODEL).trim()
}

/**
 * Dev-only canned answer so the sheet can be exercised end to end without an
 * API key or spend. Ignored on production deployments.
 */
export function photoQuoteMocked(): boolean {
  return process.env.PHOTO_QUOTE_MOCK === "1" && process.env.VERCEL_ENV !== "production"
}

export function photoQuoteConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY) || photoQuoteMocked()
}

// ---------------------------------------------------------------------------
// Cost
// ---------------------------------------------------------------------------

/** USD per million tokens, by model-id prefix. Override with env for new models. */
const USD_PER_MTOK: Array<{ prefix: string; input: number; output: number }> = [
  { prefix: "claude-haiku-4-5", input: 1, output: 5 },
  { prefix: "claude-sonnet-4-5", input: 3, output: 15 },
  { prefix: "claude-sonnet-4-6", input: 3, output: 15 },
  { prefix: "claude-sonnet-5", input: 2, output: 10 },
  { prefix: "claude-opus-4", input: 5, output: 25 },
  { prefix: "claude-opus-5", input: 5, output: 25 },
]

function envNumber(name: string): number | null {
  const n = Number(process.env[name])
  return Number.isFinite(n) && n > 0 ? n : null
}

/** £ cost of one call. GBP rate defaults to 0.78 USD→GBP; override with PHOTO_QUOTE_USD_TO_GBP. */
export function estimateCostGbp(model: string, inputTokens: number, outputTokens: number): number {
  const known = USD_PER_MTOK.find((m) => model.startsWith(m.prefix))
  const inputUsd = envNumber("PHOTO_QUOTE_INPUT_USD_PER_MTOK") ?? known?.input ?? 3
  const outputUsd = envNumber("PHOTO_QUOTE_OUTPUT_USD_PER_MTOK") ?? known?.output ?? 15
  const usdToGbp = envNumber("PHOTO_QUOTE_USD_TO_GBP") ?? 0.78
  const usd = (inputTokens / 1_000_000) * inputUsd + (outputTokens / 1_000_000) * outputUsd
  return Math.round(usd * usdToGbp * 100000) / 100000
}

// ---------------------------------------------------------------------------
// Image loading
// ---------------------------------------------------------------------------

export interface LoadedImage {
  url: string
  bytes: Buffer
  sha256: string
}

const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/i
const LOCAL_ROUTE = /^\/api\/enquiry-photos\/([0-9a-f-]{36})$/i

/**
 * Only our own storage is fetched. A Blob URL is unguessable and public; a
 * local dev URL must carry a valid signature. Anything else is rejected so
 * this route can't be used to make the server fetch arbitrary hosts.
 */
export async function loadOwnImage(rawUrl: string): Promise<LoadedImage | null> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  let bytes: Buffer | null = null
  const local = url.pathname.match(LOCAL_ROUTE)
  if (local) {
    const id = local[1]
    if (!verifyPhotoSig(id, url.searchParams.get("exp"), url.searchParams.get("sig"))) return null
    const stored = await getEnquiryPhoto(id)
    bytes = stored?.bytes ?? null
  } else if (url.protocol === "https:" && BLOB_HOST.test(url.hostname) && url.pathname.startsWith("/enquiry-photos/")) {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) return null
    bytes = Buffer.from(await response.arrayBuffer())
  } else {
    return null
  }

  if (!bytes || bytes.length === 0) return null
  return { url: rawUrl, bytes, sha256: createHash("sha256").update(bytes).digest("hex") }
}

/** Storage id for a URL we issued (Blob path or local route), or null. */
export function photoIdFromUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl)
    const local = url.pathname.match(LOCAL_ROUTE)
    if (local) return local[1]
    const blob = url.pathname.match(/^\/enquiry-photos\/([0-9a-f-]{36})\.jpg$/i)
    return blob ? blob[1] : null
  } catch {
    return null
  }
}

/** Same photos + same anchor + same model → same answer for 24h. */
export function imageSetHash(images: LoadedImage[], anchorWidthCm: number | undefined, model: string): string {
  const parts = [...images.map((i) => i.sha256)].sort()
  parts.push(anchorWidthCm ? `anchor:${Math.round(anchorWidthCm)}` : "anchor:none", `model:${model}`, "v1")
  return createHash("sha256").update(parts.join("|")).digest("hex")
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a window-film surveyor estimating glass area from customer photos of UK homes and small commercial premises.

For each photo, identify every separate pane of glass that would be tinted (each opening light, fixed light or door panel counts as its own pane). Estimate the width and height of the GLASS ONLY in centimetres — exclude frames, sills and walls.

Use these UK standard sizes as priors when nothing in the photo gives scale:
- patio / sliding door panel: about 80 x 210 cm
- bifold door panel: about 90 x 210 cm
- casement window light: about 60-120 wide x 100-120 high
- sash window (per sash): about 90 x 75
- skylight / roof light: about 78 x 118
- front door glazing panel: about 30 x 100
If the customer supplied the width of one window, use it to calibrate scale across all photos. Door handles (about 100 cm from the floor), light switches (about 120 cm), radiators (about 60 cm high) and standard bricks (21.5 cm long) are useful scale references.

Rules:
- Never invent panes you cannot see. If a frame is cut off, estimate the visible pane and lower its confidence.
- confidence is 0 to 1: 0.8+ when the whole frame and a scale reference are visible, 0.5 when guessing from priors, below 0.4 when the photo is poor.
- If a photo shows no glass, is too dark or blurred to measure, list its index in unusable_photos and return no panes for it.
- Photos are indexed from 0 in the order given.
- property_type is your best guess at the setting: house, flat, conservatory, commercial or unknown.
- label each pane briefly by room or position if obvious ("Lounge left light", "Patio door panel 1"); otherwise use the pane type.

Respond with ONLY a JSON object, no prose, no code fences:
{"panes":[{"photo":0,"label":"string","type":"${PANE_TYPES.join("|")}","width_cm":120,"height_cm":110,"m2":1.32,"confidence":0.7}],"total_m2":1.3,"notes":"short caveats for the installer, max 2 sentences","unusable_photos":[],"property_type":"house"}`

function userPrompt(photoCount: number, anchorWidthCm: number | undefined): string {
  const anchor = anchorWidthCm
    ? ` The customer says one of these windows is ${Math.round(anchorWidthCm)} cm wide (glass width) — use it to calibrate scale.`
    : ""
  return `Here are ${photoCount} photo${photoCount === 1 ? "" : "s"} of windows the customer wants tinted, taken from inside.${anchor} Identify every pane and estimate its glass size. Return the JSON object only.`
}

// ---------------------------------------------------------------------------
// Call
// ---------------------------------------------------------------------------

export interface VisionCallResult {
  result: VisionResult | null
  raw: string
  inputTokens: number
  outputTokens: number
  model: string
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) throw new Error("no JSON object in response")
  return JSON.parse(trimmed.slice(start, end + 1))
}

/** Parses model text into a validated VisionResult, or null when it does not conform. */
export function parseVisionOutput(text: string): VisionResult | null {
  try {
    const parsed = visionResultSchema.safeParse(extractJson(text))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function mockVision(images: LoadedImage[]): VisionCallResult {
  const types = ["casement", "patio_door", "sash", "fixed"] as const
  const result: VisionResult = {
    panes: images.map((_, i) => ({
      photo: i,
      label: `Window ${i + 1}`,
      type: types[i % types.length],
      width_cm: [120, 80, 90, 150][i % 4],
      height_cm: [110, 210, 150, 100][i % 4],
      confidence: 0.7,
    })),
    notes: "Mock estimate — PHOTO_QUOTE_MOCK is set.",
    unusable_photos: [],
    property_type: "house",
  }
  return { result, raw: JSON.stringify(result), inputTokens: 0, outputTokens: 0, model: "mock" }
}

export async function callVision(images: LoadedImage[], anchorWidthCm: number | undefined): Promise<VisionCallResult> {
  if (photoQuoteMocked()) return mockVision(images)
  const model = photoQuoteModel()
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 25_000, maxRetries: 1 })

  const content: Anthropic.Messages.ContentBlockParam[] = [
    ...images.map<Anthropic.Messages.ImageBlockParam>((img) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: img.bytes.toString("base64") },
    })),
    { type: "text", text: userPrompt(images.length, anchorWidthCm) },
  ]

  const response = await client.messages.create({
    model,
    max_tokens: 1500,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content },
      // Prefilling the brace pins the reply to bare JSON.
      { role: "assistant", content: "{" },
    ],
  })

  const text = "{" + response.content.map((block) => (block.type === "text" ? block.text : "")).join("")
  return {
    result: parseVisionOutput(text),
    raw: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model: response.model || model,
  }
}
