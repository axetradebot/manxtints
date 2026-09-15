// Aggregates raw analytics events into the /admin dashboard report.

import {
  type AnalyticsEvent,
  getEventsSince,
  pruneOldEvents,
  storageBackend,
} from "./eventStore"

export interface FunnelStep {
  label: string
  sessions: number
  /** % of the previous step that made it here (null for the first step) */
  pctOfPrevious: number | null
}

export interface PriceBucket {
  label: string
  shown: number
  submitted: number
  submitRate: number | null
  avgPricePerSqM: number | null
}

export interface DailyPoint {
  date: string // YYYY-MM-DD
  visitors: number
  quotes: number
  submits: number
}

export interface Report {
  days: number
  backend: "postgres" | "file"
  totalEvents: number
  funnel: FunnelStep[]
  /** Index into funnel of the step with the biggest % drop from its predecessor */
  biggestDropIndex: number | null
  buckets: PriceBucket[]
  avgShownSubmitters: number | null
  avgShownAbandoners: number | null
  daily: DailyPoint[]
  deviceSplit: { mobile: number; desktop: number }
  visitFormSubmits: number
  enquiryFormSubmits: number
  enquiryNeeds: Array<{ need: string; count: number }>
}

const BUCKET_EDGES: Array<{ label: string; min: number; max: number | null }> = [
  { label: "£0–100", min: 0, max: 100 },
  { label: "£100–200", min: 100, max: 200 },
  { label: "£200–300", min: 200, max: 300 },
  { label: "£300–500", min: 300, max: 500 },
  { label: "£500–800", min: 500, max: 800 },
  { label: "£800+", min: 800, max: null },
]

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export async function buildReport(days: number): Promise<Report> {
  // Opportunistic retention pruning — keeps the store under 12 months of data.
  await pruneOldEvents().catch(() => {})

  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const events = await getEventsSince(since)

  const sessions = new Map<string, AnalyticsEvent[]>()
  for (const e of events) {
    const list = sessions.get(e.session)
    if (list) list.push(e)
    else sessions.set(e.session, [e])
  }

  const has = (list: AnalyticsEvent[], name: string) => list.some((e) => e.event === name)
  const all = [...sessions.values()]

  const visitors = all.filter((l) => has(l, "page_view")).length
  const quotePage = all.filter(
    (l) => has(l, "quote_page_view") || l.some((e) => e.event === "page_view" && e.path === "/quote")
  ).length
  const started = all.filter((l) => has(l, "calc_started")).length
  const priceShown = all.filter((l) => has(l, "calc_price_shown")).length
  const submitted = all.filter((l) => has(l, "calc_submitted")).length

  const counts = [visitors, quotePage, started, priceShown, submitted]
  const labels = ["Site visitors", "Quote page", "Calc started", "Price shown", "Submitted"]
  const funnel: FunnelStep[] = counts.map((n, i) => ({
    label: labels[i],
    sessions: n,
    pctOfPrevious: i === 0 ? null : counts[i - 1] > 0 ? (n / counts[i - 1]) * 100 : null,
  }))

  let biggestDropIndex: number | null = null
  let biggestDrop = -1
  funnel.forEach((step, i) => {
    if (step.pctOfPrevious !== null) {
      const drop = 100 - step.pctOfPrevious
      if (drop > biggestDrop) {
        biggestDrop = drop
        biggestDropIndex = i
      }
    }
  })

  // Price drop-off: last price_shown per session, paired with whether it submitted.
  interface Shown {
    total: number
    areaSqM: number
    submitted: boolean
  }
  const shownSessions: Shown[] = []
  for (const list of all) {
    const shows = list.filter((e) => e.event === "calc_price_shown")
    if (shows.length === 0) continue
    const last = shows[shows.length - 1]
    const total = Number((last.payload as { total?: unknown } | null)?.total)
    if (!Number.isFinite(total)) continue
    const areaSqM = Number((last.payload as { areaSqM?: unknown } | null)?.areaSqM)
    shownSessions.push({
      total,
      areaSqM: Number.isFinite(areaSqM) ? areaSqM : 0,
      submitted: has(list, "calc_submitted"),
    })
  }

  const buckets: PriceBucket[] = BUCKET_EDGES.map(({ label, min, max }) => {
    const inBucket = shownSessions.filter((s) => s.total >= min && (max === null || s.total < max))
    const submittedCount = inBucket.filter((s) => s.submitted).length
    return {
      label,
      shown: inBucket.length,
      submitted: submittedCount,
      submitRate: inBucket.length > 0 ? (submittedCount / inBucket.length) * 100 : null,
      avgPricePerSqM: mean(
        inBucket.filter((s) => s.areaSqM > 0).map((s) => s.total / s.areaSqM)
      ),
    }
  })

  const avgShownSubmitters = mean(shownSessions.filter((s) => s.submitted).map((s) => s.total))
  const avgShownAbandoners = mean(shownSessions.filter((s) => !s.submitted).map((s) => s.total))

  // Daily volume
  const dayKey = (ts: number) => new Date(ts).toISOString().slice(0, 10)
  const dailyMap = new Map<string, { visitors: Set<string>; quotes: Set<string>; submits: Set<string> }>()
  for (let i = days - 1; i >= 0; i--) {
    dailyMap.set(dayKey(Date.now() - i * 24 * 60 * 60 * 1000), {
      visitors: new Set(),
      quotes: new Set(),
      submits: new Set(),
    })
  }
  for (const e of events) {
    const bucket = dailyMap.get(dayKey(e.ts))
    if (!bucket) continue
    if (e.event === "page_view") bucket.visitors.add(e.session)
    if (e.event === "calc_price_shown") bucket.quotes.add(e.session)
    if (e.event === "calc_submitted") bucket.submits.add(e.session)
  }
  const daily: DailyPoint[] = [...dailyMap.entries()].map(([date, v]) => ({
    date,
    visitors: v.visitors.size,
    quotes: v.quotes.size,
    submits: v.submits.size,
  }))

  // Device split (by session's first recorded device)
  let mobile = 0
  let desktop = 0
  for (const list of all) {
    if (list[0]?.device === "mobile") mobile++
    else desktop++
  }

  const visitFormSubmits = events.filter((e) => e.event === "visit_form_submitted").length
  const enquiryEvents = events.filter((e) => e.event === "enquiry_submitted")
  const enquiryFormSubmits = enquiryEvents.length
  const needCounts = new Map<string, number>()
  for (const e of enquiryEvents) {
    const needs = (e.payload as { needs?: unknown } | null)?.needs
    if (!Array.isArray(needs)) continue
    for (const need of needs) {
      if (typeof need !== "string" || !need) continue
      needCounts.set(need, (needCounts.get(need) || 0) + 1)
    }
  }
  const enquiryNeeds = [...needCounts.entries()]
    .map(([need, count]) => ({ need, count }))
    .sort((a, b) => b.count - a.count)

  return {
    days,
    backend: storageBackend(),
    totalEvents: events.length,
    funnel,
    biggestDropIndex,
    buckets,
    avgShownSubmitters,
    avgShownAbandoners,
    daily,
    deviceSplit: { mobile, desktop },
    visitFormSubmits,
    enquiryFormSubmits,
    enquiryNeeds,
  }
}
