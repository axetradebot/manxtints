// Analytics event storage.
//
// Backend selection: if a Postgres connection string is configured
// (DATABASE_URL or POSTGRES_URL — e.g. the free Neon integration on Vercel),
// events go to a Postgres table. Otherwise they append to a local NDJSON file
// (.data/events.ndjson) — fine for local dev, but NOT durable on Vercel's
// serverless filesystem, so production needs the Postgres env var.

import { promises as fs } from "node:fs"
import path from "node:path"

export interface AnalyticsEvent {
  ts: number // epoch ms
  session: string
  event: string
  path: string | null
  referrer: string | null
  device: string | null
  payload: Record<string, unknown> | null
}

const RETENTION_MS = 365 * 24 * 60 * 60 * 1000 // prune events older than 12 months

const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""

// ---------------------------------------------------------------------------
// Postgres backend (Neon serverless driver)
// ---------------------------------------------------------------------------

let tableReady: Promise<void> | null = null

async function getSql() {
  const { neon } = await import("@neondatabase/serverless")
  return neon(PG_URL)
}

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      const sql = await getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id BIGSERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL,
          session TEXT NOT NULL,
          event TEXT NOT NULL,
          path TEXT,
          referrer TEXT,
          device TEXT,
          payload JSONB
        )`
      await sql`CREATE INDEX IF NOT EXISTS analytics_events_ts_idx ON analytics_events (ts)`
    })().catch((err) => {
      tableReady = null
      throw err
    })
  }
  return tableReady
}

async function pgInsert(e: AnalyticsEvent) {
  await ensureTable()
  const sql = await getSql()
  await sql`
    INSERT INTO analytics_events (ts, session, event, path, referrer, device, payload)
    VALUES (${new Date(e.ts).toISOString()}, ${e.session}, ${e.event}, ${e.path}, ${e.referrer}, ${e.device}, ${e.payload ? JSON.stringify(e.payload) : null})`
}

async function pgGetSince(sinceMs: number): Promise<AnalyticsEvent[]> {
  await ensureTable()
  const sql = await getSql()
  const rows = (await sql`
    SELECT ts, session, event, path, referrer, device, payload
    FROM analytics_events
    WHERE ts >= ${new Date(sinceMs).toISOString()}
    ORDER BY ts ASC`) as Array<{
    ts: string | Date
    session: string
    event: string
    path: string | null
    referrer: string | null
    device: string | null
    payload: Record<string, unknown> | null
  }>
  return rows.map((r) => ({
    ts: new Date(r.ts).getTime(),
    session: r.session,
    event: r.event,
    path: r.path,
    referrer: r.referrer,
    device: r.device,
    payload: r.payload,
  }))
}

async function pgPrune() {
  await ensureTable()
  const sql = await getSql()
  await sql`DELETE FROM analytics_events WHERE ts < ${new Date(Date.now() - RETENTION_MS).toISOString()}`
}

async function pgClear() {
  await ensureTable()
  const sql = await getSql()
  await sql`TRUNCATE TABLE analytics_events RESTART IDENTITY`
}

// ---------------------------------------------------------------------------
// File backend (local dev)
// ---------------------------------------------------------------------------

const FILE_PATH = path.join(process.cwd(), ".data", "events.ndjson")

async function fileInsert(e: AnalyticsEvent) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
  await fs.appendFile(FILE_PATH, JSON.stringify(e) + "\n", "utf8")
}

async function fileReadAll(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8")
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as AnalyticsEvent
        } catch {
          return null
        }
      })
      .filter((e): e is AnalyticsEvent => e !== null)
  } catch {
    return []
  }
}

async function fileGetSince(sinceMs: number): Promise<AnalyticsEvent[]> {
  return (await fileReadAll()).filter((e) => e.ts >= sinceMs)
}

async function filePrune() {
  const keep = (await fileReadAll()).filter((e) => e.ts >= Date.now() - RETENTION_MS)
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true })
  await fs.writeFile(FILE_PATH, keep.map((e) => JSON.stringify(e)).join("\n") + (keep.length ? "\n" : ""), "utf8")
}

async function fileClear() {
  await fs.rm(FILE_PATH, { force: true })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function storageBackend(): "postgres" | "file" {
  return PG_URL ? "postgres" : "file"
}

export async function insertEvent(e: AnalyticsEvent): Promise<void> {
  if (PG_URL) return pgInsert(e)
  return fileInsert(e)
}

export async function getEventsSince(sinceMs: number): Promise<AnalyticsEvent[]> {
  if (PG_URL) return pgGetSince(sinceMs)
  return fileGetSince(sinceMs)
}

export async function pruneOldEvents(): Promise<void> {
  if (PG_URL) return pgPrune()
  return filePrune()
}

/** Deletes every stored event. Used by the admin "clear all data" action. */
export async function clearAllEvents(): Promise<void> {
  if (PG_URL) return pgClear()
  return fileClear()
}
