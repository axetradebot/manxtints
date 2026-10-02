// Photo quote — shared types and validation.
//
// Everything the client and the /api/photo-quote routes agree on lives here:
// the shape the vision model must return, the clamps the server applies to
// it, and the request bodies. No pricing, no I/O — see photoQuote.pricing.ts
// (maths) and photoQuote.store.ts / photoQuote.vision.ts (server only).

import { z } from "zod"
import { isZoneKey, type ZoneKey } from "./pricing.zones"

/** Hard limits, mirrored in the UI copy. */
export const PHOTO_QUOTE_MAX_PHOTOS = 8
/** Per photo, after the client has resized it to 1280px and re-encoded as JPEG. */
export const PHOTO_QUOTE_MAX_PHOTO_BYTES = 4_000_000
export const PANE_MIN_M2 = 0.1
export const PANE_MAX_M2 = 8
/** Range shown around the point estimate. */
export const PHOTO_QUOTE_RANGE_LOW = 0.85
export const PHOTO_QUOTE_RANGE_HIGH = 1.15

export const PANE_TYPES = ["patio_door", "casement", "sash", "bifold", "fixed", "skylight", "other"] as const
export type PaneType = (typeof PANE_TYPES)[number]

export const PANE_TYPE_LABELS: Record<PaneType, string> = {
  patio_door: "Patio door",
  casement: "Casement window",
  sash: "Sash window",
  bifold: "Bifold door",
  fixed: "Fixed pane",
  skylight: "Skylight",
  other: "Window",
}

/**
 * One pane as the model reports it. `photo` is the 0-based index into the
 * images we sent. Dimensions are the glass only, in centimetres.
 */
export const visionPaneSchema = z.object({
  photo: z.number().int().min(0),
  label: z.string().trim().min(1).max(60),
  type: z.enum(PANE_TYPES).catch("other"),
  width_cm: z.number().finite().positive(),
  height_cm: z.number().finite().positive(),
  m2: z.number().finite().nonnegative().optional(),
  confidence: z.number().min(0).max(1).catch(0.5),
})

export const visionResultSchema = z.object({
  panes: z.array(visionPaneSchema).max(PHOTO_QUOTE_MAX_PHOTOS * 6),
  total_m2: z.number().finite().nonnegative().optional(),
  notes: z.string().max(600).optional().default(""),
  unusable_photos: z.array(z.number().int().min(0)).default([]),
  /** The model's best guess at the setting; only used for the lead's label. */
  property_type: z.enum(["house", "flat", "conservatory", "commercial", "unknown"]).catch("unknown"),
})

export type VisionPane = z.infer<typeof visionPaneSchema>
export type VisionResult = z.infer<typeof visionResultSchema>

/** A pane after server-side clamping — what the price is computed from. */
export interface EstimatePane {
  id: string
  photo: number
  label: string
  type: PaneType
  width_cm: number
  height_cm: number
  /** width × height, clamped to [PANE_MIN_M2, PANE_MAX_M2], 2dp */
  m2: number
  confidence: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Normalises what the model returned into priced panes: dimensions become
 * whole centimetres, area is recomputed from them (never trusted from the
 * model) and clamped so one bad reading can't produce a £0 or £5,000 pane.
 */
export function normalisePanes(panes: VisionPane[], photoCount: number): EstimatePane[] {
  const out: EstimatePane[] = []
  panes.forEach((p, i) => {
    if (p.photo >= photoCount) return
    const width_cm = Math.round(Math.min(Math.max(p.width_cm, 10), 600))
    const height_cm = Math.round(Math.min(Math.max(p.height_cm, 10), 400))
    const raw = (width_cm * height_cm) / 10000
    const m2 = round2(Math.min(Math.max(raw, PANE_MIN_M2), PANE_MAX_M2))
    out.push({
      id: `pane-${i + 1}`,
      photo: p.photo,
      label: p.label || `${PANE_TYPE_LABELS[p.type]} ${i + 1}`,
      type: p.type,
      width_cm,
      height_cm,
      m2,
      confidence: Math.round(p.confidence * 100) / 100,
    })
  })
  return out
}

/** Total glass area the way the customer sees it: rounded to 0.1 m². */
export function roundTotalM2(panes: Array<{ m2: number }>): number {
  const total = panes.reduce((sum, p) => sum + p.m2, 0)
  return Math.round(total * 10) / 10
}

// ---------------------------------------------------------------------------
// Request bodies
// ---------------------------------------------------------------------------

const zoneKeySchema = z.custom<ZoneKey>((v) => isZoneKey(v), "Unknown pricing area")

const photoUrlSchema = z.string().url().max(600)

/** POST /api/photo-quote — estimate from uploaded photos. */
export const estimateRequestSchema = z.object({
  session: z.string().min(16).max(400),
  turnstile: z.string().max(4000).optional(),
  photos: z.array(photoUrlSchema).min(1).max(PHOTO_QUOTE_MAX_PHOTOS),
  /** Width in cm of one window the customer knows, to scale the others. */
  anchorWidthCm: z.number().finite().min(20).max(600).optional(),
  zone: zoneKeySchema.optional(),
})
export type EstimateRequest = z.infer<typeof estimateRequestSchema>

/** A pane as the client sends it back after edits (dimensions only). */
export const clientPaneSchema = z.object({
  id: z.string().max(40),
  label: z.string().trim().max(60),
  type: z.enum(PANE_TYPES).catch("other"),
  width_cm: z.number().finite().min(10).max(600),
  height_cm: z.number().finite().min(10).max(400),
  /** Carried from the estimate; a pane the customer re-typed is 1. */
  confidence: z.number().min(0).max(1).optional(),
})
export type ClientPane = z.infer<typeof clientPaneSchema>

/** POST /api/photo-quote/price — server recompute before booking. */
export const priceRequestSchema = z.object({
  session: z.string().min(16).max(400),
  panes: z.array(clientPaneSchema).min(1).max(PHOTO_QUOTE_MAX_PHOTOS * 6),
  zone: zoneKeySchema,
  postcode: z.string().trim().max(12).optional(),
})
export type PriceRequest = z.infer<typeof priceRequestSchema>

/** POST /api/photo-quote/booked — lead accepted, keep the photos. */
export const bookedRequestSchema = z.object({
  session: z.string().min(16).max(400),
  photos: z.array(photoUrlSchema).max(PHOTO_QUOTE_MAX_PHOTOS),
})

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export type PropertyTypeGuess = VisionResult["property_type"]

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeGuess, string> = {
  house: "Residential",
  flat: "Residential (flat)",
  conservatory: "Conservatory",
  commercial: "Commercial",
  unknown: "Residential",
}

/** Shape of a priced estimate (see photoQuote.pricing.ts for the maths). */
export interface PricedPaneDTO extends EstimatePane {
  price: number
  floorApplied: boolean
}

export interface PhotoQuotePriceDTO {
  zone: ZoneKey
  zoneLabel: string
  rate: number
  panes: PricedPaneDTO[]
  totalM2: number
  subtotal: number
  minJob: number
  jobFloorApplied: boolean
  point: number
  low: number
  high: number
}

/** 200 body from POST /api/photo-quote. */
export interface EstimateResponse {
  estimateId: string
  price: PhotoQuotePriceDTO
  notes: string
  unusablePhotos: number[]
  propertyType: PropertyTypeGuess
  cached: boolean
}

/** 200 body from POST /api/photo-quote/price. */
export interface PriceResponse {
  price: PhotoQuotePriceDTO
  /** Zone derived from the postcode, when it parsed */
  postcodeZone: ZoneKey | null
  /** True when the postcode moved the job to a different area than requested */
  zoneChanged: boolean
}

/** Clamp edited panes from the client the same way as the model's output. */
export function panesFromClient(panes: ClientPane[]): EstimatePane[] {
  return normalisePanes(
    panes.map((p, i) => ({
      photo: 0,
      label: p.label || `Window ${i + 1}`,
      type: p.type,
      width_cm: p.width_cm,
      height_cm: p.height_cm,
      confidence: p.confidence ?? 1,
    })),
    1
  ).map((p, i) => ({ ...p, id: panes[i].id || p.id }))
}
