// Photo quote persistence — server only.
//
// Backed by the same Postgres (Neon) connection as analytics when
// DATABASE_URL / POSTGRES_URL is set; otherwise a best-effort local fallback
// (NDJSON under .data/ plus in-memory maps) so the feature runs in dev.
//
// Tables (created on first use, like analytics_events):
//   ai_usage            — one row per model call attempt: tokens, cost, outcome.
//                         Also the source for per-IP rate limits and the
//                         daily spend cap, so those survive cold starts.
//   photo_quote_cache   — vision result keyed by the image-set hash, 24h TTL.
//   photo_quote_photos  — every uploaded photo, so the purge job can delete
//                         anything older than 30 days that was not booked.

import { promises as fs } from "node:fs"
import path from "node:path"
import { allowRequest } from "./rateLimit"
import type { VisionResult } from "./photoQuote.schema"

const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""
const DATA_DIR = path.join(process.cwd(), ".data")
const USAGE_FILE = path.join(DATA_DIR, "ai_usage.ndjson")
const PHOTOS_FILE = path.join(DATA_DIR, "photo_quote_photos.ndjson")

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000
export const PHOTO_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export type AiUsageOutcome =
  | "ok"
  | "cached"
  | "no_panes"
  | "invalid_output"
  | "model_error"
  | "rate_limited"
  | "cap_reached"
  | "turnstile_failed"

export interface AiUsageRow {
  ts: number
  feature: "photo_quote"
  model: string | null
  inputTokens: number
  outputTokens: number
  costGbp: number
  zone: string | null
  panes: number | null
  outcome: AiUsageOutcome
  ipHash: string
  session: string | null
  imageHash: string | null
  durationMs: number | null
}

export interface AiUsageSummary {
  /** Attempts that reached the model or the cache */
  calls: number
  cacheHits: number
  errors: number
  blocked: number
  totalCostGbp: number
  /** Mean cost of the calls that were actually billed */
  avgCostGbp: number | null
}

/** Outcomes that count towards a visitor's hourly / daily allowance. */
const COUNTED_OUTCOMES: AiUsageOutcome[] = ["ok", "cached", "no_panes", "invalid_output", "model_error"]

// ---------------------------------------------------------------------------
// Postgres backend
// ---------------------------------------------------------------------------

let tableReady: Promise<void> | null = null

async function getSql() {
  const { neon } = await import("@neondatabase/serverless")
  return neon(PG_URL)
}

function ensureTables(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      const sql = await getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS ai_usage (
          id BIGSERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL,
          feature TEXT NOT NULL,
          model TEXT,
          input_tokens INTEGER NOT NULL DEFAULT 0,
          output_tokens INTEGER NOT NULL DEFAULT 0,
          cost_gbp NUMERIC(10,5) NOT NULL DEFAULT 0,
          zone TEXT,
          panes INTEGER,
          outcome TEXT NOT NULL,
          ip_hash TEXT NOT NULL,
          session TEXT,
          image_hash TEXT,
          duration_ms INTEGER
        )`
      await sql`CREATE INDEX IF NOT EXISTS ai_usage_ts_idx ON ai_usage (ts)`
      await sql`CREATE INDEX IF NOT EXISTS ai_usage_ip_ts_idx ON ai_usage (ip_hash, ts)`
      await sql`
        CREATE TABLE IF NOT EXISTS photo_quote_cache (
          image_hash TEXT PRIMARY KEY,
          result JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        )`
      await sql`
        CREATE TABLE IF NOT EXISTS photo_quote_photos (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          booked BOOLEAN NOT NULL DEFAULT FALSE
        )`
      await sql`CREATE INDEX IF NOT EXISTS photo_quote_photos_created_idx ON photo_quote_photos (created_at)`
    })().catch((err) => {
      tableReady = null
      throw err
    })
  }
  return tableReady
}

// ---------------------------------------------------------------------------
// File / memory fallback (dev)
// ---------------------------------------------------------------------------

async function appendLine(file: string, row: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.appendFile(file, JSON.stringify(row) + "\n", "utf8")
}

async function readLines<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, "utf8")
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as T
        } catch {
          return null
        }
      })
      .filter((row): row is T => row !== null)
  } catch {
    return []
  }
}

async function writeLines(file: string, rows: unknown[]) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(file, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""), "utf8")
}

const memoryCache = new Map<string, { result: VisionResult; createdAt: number }>()

interface PhotoRecord {
  id: string
  url: string
  createdAt: number
  booked: boolean
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function photoQuoteBackend(): "postgres" | "file" {
  return PG_URL ? "postgres" : "file"
}

export async function logAiUsage(row: AiUsageRow): Promise<void> {
  if (!PG_URL) return appendLine(USAGE_FILE, row)
  await ensureTables()
  const sql = await getSql()
  await sql`
    INSERT INTO ai_usage (ts, feature, model, input_tokens, output_tokens, cost_gbp, zone, panes, outcome, ip_hash, session, image_hash, duration_ms)
    VALUES (${new Date(row.ts).toISOString()}, ${row.feature}, ${row.model}, ${row.inputTokens}, ${row.outputTokens},
            ${row.costGbp}, ${row.zone}, ${row.panes}, ${row.outcome}, ${row.ipHash}, ${row.session}, ${row.imageHash}, ${row.durationMs})`
}

/** £ spent on the feature since 00:00 UTC today. */
export async function dailySpendGbp(now = Date.now()): Promise<number> {
  const dayStart = new Date(now)
  dayStart.setUTCHours(0, 0, 0, 0)
  if (!PG_URL) {
    const rows = await readLines<AiUsageRow>(USAGE_FILE)
    return rows.filter((r) => r.ts >= dayStart.getTime()).reduce((sum, r) => sum + (Number(r.costGbp) || 0), 0)
  }
  await ensureTables()
  const sql = await getSql()
  const rows = (await sql`
    SELECT COALESCE(SUM(cost_gbp), 0) AS total FROM ai_usage
    WHERE feature = 'photo_quote' AND ts >= ${dayStart.toISOString()}`) as Array<{ total: string | number }>
  return Number(rows[0]?.total ?? 0)
}

/**
 * Number of estimate attempts from this visitor in the window. Falls back to
 * the in-memory limiter when there is no database (it then also records the
 * attempt, so call it once per request).
 */
export async function countRecentEstimates(ipHash: string, windowMs: number, limit: number, now = Date.now()): Promise<number> {
  if (!PG_URL) {
    // In-memory limiter records the hit; report "at limit" by returning limit.
    return allowRequest(`pq:${ipHash}:${windowMs}`, limit, windowMs) ? 0 : limit
  }
  await ensureTables()
  const sql = await getSql()
  const rows = (await sql`
    SELECT COUNT(*)::int AS n FROM ai_usage
    WHERE feature = 'photo_quote' AND ip_hash = ${ipHash}
      AND ts >= ${new Date(now - windowMs).toISOString()}
      AND outcome = ANY(${COUNTED_OUTCOMES})`) as Array<{ n: number }>
  return Number(rows[0]?.n ?? 0)
}

export async function getCachedEstimate(imageHash: string, now = Date.now()): Promise<VisionResult | null> {
  if (!PG_URL) {
    const hit = memoryCache.get(imageHash)
    if (!hit) return null
    if (now - hit.createdAt > CACHE_TTL_MS) {
      memoryCache.delete(imageHash)
      return null
    }
    return hit.result
  }
  await ensureTables()
  const sql = await getSql()
  const rows = (await sql`
    SELECT result FROM photo_quote_cache
    WHERE image_hash = ${imageHash} AND created_at >= ${new Date(now - CACHE_TTL_MS).toISOString()}`) as Array<{
    result: VisionResult
  }>
  return rows[0]?.result ?? null
}

export async function putCachedEstimate(imageHash: string, result: VisionResult, now = Date.now()): Promise<void> {
  if (!PG_URL) {
    memoryCache.set(imageHash, { result, createdAt: now })
    return
  }
  await ensureTables()
  const sql = await getSql()
  await sql`
    INSERT INTO photo_quote_cache (image_hash, result, created_at)
    VALUES (${imageHash}, ${JSON.stringify(result)}, ${new Date(now).toISOString()})
    ON CONFLICT (image_hash) DO UPDATE SET result = EXCLUDED.result, created_at = EXCLUDED.created_at`
  // Opportunistic cleanup so the table never grows past a day of traffic.
  await sql`DELETE FROM photo_quote_cache WHERE created_at < ${new Date(now - CACHE_TTL_MS).toISOString()}`
}

export async function registerPhotos(items: Array<{ id: string; url: string }>, now = Date.now()): Promise<void> {
  if (items.length === 0) return
  if (!PG_URL) {
    for (const item of items) {
      await appendLine(PHOTOS_FILE, { id: item.id, url: item.url, createdAt: now, booked: false } satisfies PhotoRecord)
    }
    return
  }
  await ensureTables()
  const sql = await getSql()
  for (const item of items) {
    await sql`
      INSERT INTO photo_quote_photos (id, url, created_at)
      VALUES (${item.id}, ${item.url}, ${new Date(now).toISOString()})
      ON CONFLICT (id) DO NOTHING`
  }
}

/** Photos attached to an accepted lead are kept for the installer. */
export async function markPhotosBooked(urls: string[]): Promise<void> {
  if (urls.length === 0) return
  if (!PG_URL) {
    const rows = await readLines<PhotoRecord>(PHOTOS_FILE)
    const set = new Set(urls)
    await writeLines(
      PHOTOS_FILE,
      rows.map((r) => (set.has(r.url) ? { ...r, booked: true } : r))
    )
    return
  }
  await ensureTables()
  const sql = await getSql()
  await sql`UPDATE photo_quote_photos SET booked = TRUE WHERE url = ANY(${urls})`
}

/** Unbooked photos past the retention window, oldest first. */
export async function listExpiredPhotos(limit = 200, now = Date.now()): Promise<Array<{ id: string; url: string }>> {
  const cutoff = now - PHOTO_RETENTION_MS
  if (!PG_URL) {
    const rows = await readLines<PhotoRecord>(PHOTOS_FILE)
    return rows
      .filter((r) => !r.booked && r.createdAt < cutoff)
      .slice(0, limit)
      .map((r) => ({ id: r.id, url: r.url }))
  }
  await ensureTables()
  const sql = await getSql()
  return (await sql`
    SELECT id, url FROM photo_quote_photos
    WHERE booked = FALSE AND created_at < ${new Date(cutoff).toISOString()}
    ORDER BY created_at ASC LIMIT ${limit}`) as Array<{ id: string; url: string }>
}

export async function forgetPhotos(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  if (!PG_URL) {
    const rows = await readLines<PhotoRecord>(PHOTOS_FILE)
    const set = new Set(ids)
    await writeLines(PHOTOS_FILE, rows.filter((r) => !set.has(r.id)))
    return
  }
  await ensureTables()
  const sql = await getSql()
  await sql`DELETE FROM photo_quote_photos WHERE id = ANY(${ids})`
}

/** Admin dashboard: cost and outcome summary since `sinceMs`. */
export async function aiUsageSummary(sinceMs: number): Promise<AiUsageSummary> {
  let rows: Array<{ outcome: AiUsageOutcome; costGbp: number }>
  if (!PG_URL) {
    rows = (await readLines<AiUsageRow>(USAGE_FILE))
      .filter((r) => r.ts >= sinceMs)
      .map((r) => ({ outcome: r.outcome, costGbp: Number(r.costGbp) || 0 }))
  } else {
    await ensureTables()
    const sql = await getSql()
    rows = (
      (await sql`
        SELECT outcome, cost_gbp FROM ai_usage
        WHERE feature = 'photo_quote' AND ts >= ${new Date(sinceMs).toISOString()}`) as Array<{
        outcome: AiUsageOutcome
        cost_gbp: string | number
      }>
    ).map((r) => ({ outcome: r.outcome, costGbp: Number(r.cost_gbp) || 0 }))
  }

  const billed = rows.filter((r) => r.outcome === "ok" || r.outcome === "no_panes" || r.outcome === "invalid_output")
  const totalCostGbp = rows.reduce((sum, r) => sum + r.costGbp, 0)
  return {
    calls: rows.filter((r) => COUNTED_OUTCOMES.includes(r.outcome)).length,
    cacheHits: rows.filter((r) => r.outcome === "cached").length,
    errors: rows.filter((r) => r.outcome === "model_error" || r.outcome === "invalid_output").length,
    blocked: rows.filter((r) => r.outcome === "rate_limited" || r.outcome === "cap_reached" || r.outcome === "turnstile_failed").length,
    totalCostGbp,
    avgCostGbp: billed.length > 0 ? totalCostGbp / billed.length : null,
  }
}
