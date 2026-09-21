import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"
import { ADMIN_COOKIE, adminToken, isValidAdminCookie } from "@/lib/adminAuth"
import {
  buildReport,
  parseTierFilter,
  parseZoneFilter,
  type Report,
  type TierFilter,
  type ZoneFilter,
} from "@/lib/analyticsReport"
import { clearAllEvents } from "@/lib/eventStore"
import { tierKeys, tiers, zoneKeys, zones } from "@/lib/pricing.zones"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin", robots: { index: false, follow: false } }

const RANGES = [7, 30, 90] as const
const CLEAR_CONFIRMATION = "DELETE"

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

async function login(formData: FormData) {
  "use server"
  const password = formData.get("password")?.toString() || ""
  const expected = process.env.ADMIN_PASSWORD
  if (expected && password === expected) {
    const store = await cookies()
    store.set(ADMIN_COOKIE, adminToken()!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })
    redirect("/admin")
  }
  redirect("/admin?error=1")
}

async function logout() {
  "use server"
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  redirect("/admin")
}

async function clearData(formData: FormData) {
  "use server"
  const store = await cookies()
  if (!isValidAdminCookie(store.get(ADMIN_COOKIE)?.value)) redirect("/admin")
  if (formData.get("confirm")?.toString().trim() !== CLEAR_CONFIRMATION) {
    redirect("/admin?cleared=0")
  }
  await clearAllEvents()
  redirect("/admin?cleared=1")
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function fmtPct(value: number | null, digits = 1): string {
  return value === null ? "—" : `${value.toFixed(digits)}%`
}

function fmtGBP(value: number | null, digits = 2): string {
  return value === null ? "—" : `£${value.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

function fmtInt(value: number): string {
  return value.toLocaleString("en-GB")
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${Number(d)}/${Number(m)}`
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Panel({
  title,
  aside,
  children,
  footnote,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
  footnote?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {aside}
      </header>
      <div className="px-6 py-5 space-y-5">{children}</div>
      {footnote && (
        <p className="border-t border-border/60 px-6 py-3 text-xs leading-relaxed text-muted-foreground">{footnote}</p>
      )}
    </section>
  )
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-background/70 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Pills<T extends string>({
  options,
  active,
  hrefFor,
  label,
}: {
  options: Array<{ value: T; label: string }>
  active: T
  hrefFor: (value: T) => string
  label: string
}) {
  return (
    <nav aria-label={label} className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
      {options.map((o) => (
        <Link
          key={o.value}
          href={hrefFor(o.value)}
          aria-current={o.value === active ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            o.value === active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  )
}

function Table({
  head,
  rows,
  empty,
}: {
  head: Array<{ label: string; align?: "left" | "right" }>
  rows: Array<{ key: string; cells: ReactNode[]; muted?: boolean }>
  empty: string
}) {
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            {head.map((h, i) => (
              <th
                key={h.label}
                className={`pb-2 font-medium ${h.align === "right" ? "text-right" : ""} ${i > 0 ? "pl-4" : ""}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={head.length} className="py-6 text-center text-sm text-muted-foreground">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className={row.muted ? "text-muted-foreground" : ""}>
                {row.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={`py-2.5 tabular-nums ${head[i]?.align === "right" ? "text-right" : ""} ${i > 0 ? "pl-4" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Sparkline({
  points,
  metric,
  color,
  label,
}: {
  points: Report["daily"]
  metric: "visitors" | "quotes" | "submits"
  color: string
  label: string
}) {
  const total = points.reduce((a, p) => a + p[metric], 0)
  const max = Math.max(1, ...points.map((p) => p[metric]))
  const first = points[0]?.date
  const last = points[points.length - 1]?.date
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{fmtInt(total)}</p>
      </div>
      <div className="flex h-14 items-end gap-px rounded-md bg-background/70 px-1 pt-1">
        {points.map((p) => (
          <div
            key={p.date}
            title={`${p.date}: ${p[metric]}`}
            className={`flex-1 min-w-[2px] rounded-t-sm ${color}`}
            style={{ height: `${p[metric] > 0 ? Math.max(8, (p[metric] / max) * 100) : 2}%` }}
          />
        ))}
      </div>
      {first && last && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/70">
          <span>{shortDate(first)}</span>
          <span>{shortDate(last)}</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; zone?: string; tier?: string; error?: string; cleared?: string }>
}) {
  const params = await searchParams
  const store = await cookies()
  const authed = isValidAdminCookie(store.get(ADMIN_COOKIE)?.value)

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to see site analytics.</p>
          </div>
          {!process.env.ADMIN_PASSWORD && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
              ADMIN_PASSWORD is not set — add it to the environment to enable login.
            </p>
          )}
          {params.error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">Wrong password, try again.</p>
          )}
          <form action={login} className="space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Password"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  const days = RANGES.includes(Number(params.days) as (typeof RANGES)[number]) ? Number(params.days) : 30
  const zoneFilter = parseZoneFilter(params.zone)
  const tierFilter = parseTierFilter(params.tier)
  const report = await buildReport(days, zoneFilter, tierFilter)

  const hrefFor = (d: number = days, z: ZoneFilter = zoneFilter, t: TierFilter = tierFilter) =>
    `/admin?days=${d}${z === "all" ? "" : `&zone=${z}`}${t === "all" ? "" : `&tier=${t}`}`

  const [visitors, quotePage, , priceShown, submitted] = report.funnel.map((s) => s.sessions)
  const shareOf = (n: number, of: number, what: string) =>
    of > 0 ? `${((n / of) * 100).toFixed(0)}% of ${what}` : undefined
  const isEmpty = report.totalEvents === 0
  const filterLabel = [
    zoneFilter !== "all" ? zones[zoneFilter].label : null,
    tierFilter !== "all" ? `${tiers[tierFilter].label} film` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last {days} days · {fmtInt(report.totalSessions)} sessions · {fmtInt(report.totalEvents)} events
            <span className="ml-2 inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
              {report.backend === "postgres" ? "Postgres" : "Local file"}
            </span>
          </p>
          {report.backend === "file" && (
            <p className="mt-1 text-xs text-amber-600">Local file storage — set DATABASE_URL for production.</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Pills
            label="Date range"
            active={String(days)}
            options={RANGES.map((d) => ({ value: String(d), label: `${d}d` }))}
            hrefFor={(v) => hrefFor(Number(v))}
          />
          <form action={logout}>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              Log out
            </button>
          </form>
        </div>
      </div>

      {params.cleared === "1" && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
          All analytics data has been cleared. New events will appear as visitors use the site.
        </p>
      )}
      {params.cleared === "0" && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          Nothing was deleted — type {CLEAR_CONFIRMATION} exactly to confirm.
        </p>
      )}

      {/* Headline numbers */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Visitors" value={fmtInt(visitors)} hint="sessions with a page view" />
        <Kpi label="Quote page" value={fmtInt(quotePage)} hint={shareOf(quotePage, visitors, "visitors")} />
        <Kpi label="Prices shown" value={fmtInt(priceShown)} hint={shareOf(priceShown, quotePage, "quote page")} />
        <Kpi label="Calculator leads" value={fmtInt(submitted)} hint={shareOf(submitted, priceShown, "prices shown")} />
        <Kpi label="Enquiry leads" value={fmtInt(report.enquiryFormSubmits)} hint="photo / message form" />
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold">No data yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The funnel, price drop-off and daily charts fill in automatically as visitors use the site. Check back
            once a few quotes have been shown.
          </p>
        </div>
      ) : (
        <>
          {/* Funnel */}
          <Panel
            title="Funnel"
            footnote="Each step shows sessions and the share of the previous step that reached it. The biggest drop is marked."
          >
            <div className="space-y-2.5">
              {report.funnel.map((step, i) => {
                const isBiggestDrop = i === report.biggestDropIndex
                const maxSessions = Math.max(1, report.funnel[0].sessions)
                return (
                  <div key={step.label} className="grid grid-cols-[7rem_1fr_3.5rem_7rem] items-center gap-3 text-sm">
                    <div className="truncate">{step.label}</div>
                    <div className="h-7 overflow-hidden rounded-md bg-background/70">
                      <div
                        className={`h-full rounded-md ${isBiggestDrop ? "bg-red-500/60" : "bg-primary/60"}`}
                        style={{ width: `${Math.max(1.5, (step.sessions / maxSessions) * 100)}%` }}
                      />
                    </div>
                    <div className="text-right font-semibold tabular-nums">{fmtInt(step.sessions)}</div>
                    <div className="flex items-center justify-end gap-2 text-right tabular-nums text-muted-foreground">
                      {step.pctOfPrevious !== null && fmtPct(step.pctOfPrevious)}
                      {isBiggestDrop && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                          drop
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          {/* Zones */}
          <Panel
            title="Conversion by pricing area"
            footnote="Always across every session so the two areas can be compared side by side, whatever the filters below."
          >
            <Table
              head={[
                { label: "Area" },
                { label: "From £/m² (Std / Prem)", align: "right" },
                { label: "Prices shown", align: "right" },
                { label: "Submitted", align: "right" },
                { label: "Submit rate", align: "right" },
                { label: "Avg price shown", align: "right" },
              ]}
              rows={report.zoneRows.map((row) => ({
                key: row.zone,
                muted: row.zone === "unknown",
                cells: [
                  row.label,
                  row.zone === "unknown"
                    ? "—"
                    : `£${zones[row.zone].pricePerM2.standard} / £${zones[row.zone].pricePerM2.premium}`,
                  fmtInt(row.shown),
                  fmtInt(row.submitted),
                  <span key="rate" className="font-semibold">{fmtPct(row.submitRate)}</span>,
                  fmtGBP(row.avgShown, 0),
                ],
              }))}
              empty="No prices shown in this period."
            />
          </Panel>

          {/* Price drop-off */}
          <Panel
            title={filterLabel ? `Price drop-off · ${filterLabel}` : "Price drop-off"}
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <Pills
                  label="Pricing area"
                  active={zoneFilter}
                  options={[{ value: "all" as ZoneFilter, label: "All areas" }, ...zoneKeys.map((z) => ({ value: z as ZoneFilter, label: zones[z].label }))]}
                  hrefFor={(z) => hrefFor(days, z)}
                />
                <Pills
                  label="Film tier"
                  active={tierFilter}
                  options={[{ value: "all" as TierFilter, label: "All films" }, ...tierKeys.map((t) => ({ value: t as TierFilter, label: tiers[t].label }))]}
                  hrefFor={(t) => hrefFor(days, zoneFilter, t)}
                />
              </div>
            }
            footnote="Uses the last price each session saw. Take rates respect the area filter only, so Premium share is measured against every film."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Premium take rate"
                value={fmtPct(report.takeRates.premiumTakeRate)}
                hint={`${fmtInt(report.takeRates.premiumShown)} of ${fmtInt(report.takeRates.tieredShown)} tiered quotes`}
              />
              <Stat
                label="10-year guarantee added"
                value={fmtPct(report.takeRates.guaranteeTakeRate)}
                hint={`${fmtInt(report.takeRates.guaranteeAdded)} of ${fmtInt(report.takeRates.guaranteeEligible)} eligible submits`}
              />
              <Stat label="Avg price · submitted" value={fmtGBP(report.avgShownSubmitters, 0)} />
              <Stat label="Avg price · abandoned" value={fmtGBP(report.avgShownAbandoners, 0)} />
            </div>
            <Table
              head={[
                { label: "Price shown" },
                { label: "Shown", align: "right" },
                { label: "Submitted", align: "right" },
                { label: "Submit rate", align: "right" },
                { label: "Avg £/m²", align: "right" },
              ]}
              rows={report.buckets
                .filter((b) => b.shown > 0)
                .map((b) => ({
                  key: b.label,
                  cells: [
                    b.label,
                    fmtInt(b.shown),
                    fmtInt(b.submitted),
                    <span key="rate" className="font-semibold">{fmtPct(b.submitRate)}</span>,
                    fmtGBP(b.avgPricePerSqM, 0),
                  ],
                }))}
              empty="No prices shown for this filter."
            />
            <p className="text-xs text-muted-foreground">
              Submitted calculator value in this view: <span className="font-semibold text-foreground">{fmtGBP(report.submittedValue, 0)}</span>
            </p>
          </Panel>

          {/* Daily volume + audience */}
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <Panel title="Daily volume">
              <div className="space-y-5">
                <Sparkline points={report.daily} metric="visitors" color="bg-primary/60" label="Visitors" />
                <Sparkline points={report.daily} metric="quotes" color="bg-amber-500/60" label="Prices shown" />
                <Sparkline points={report.daily} metric="submits" color="bg-green-500/60" label="Calculator leads" />
              </div>
            </Panel>

            <Panel title="Audience">
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Device split (sessions)</p>
                {(() => {
                  const { mobile, desktop } = report.deviceSplit
                  const total = Math.max(1, mobile + desktop)
                  return (
                    <div className="space-y-1.5">
                      <div className="flex h-2.5 overflow-hidden rounded-full bg-background/70">
                        <div className="bg-primary/70" style={{ width: `${(mobile / total) * 100}%` }} />
                        <div className="bg-muted-foreground/40" style={{ width: `${(desktop / total) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                        <span>Mobile {fmtInt(mobile)} · {((mobile / total) * 100).toFixed(0)}%</span>
                        <span>Desktop {fmtInt(desktop)} · {((desktop / total) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">What enquiries ask for</p>
                {report.enquiryNeeds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No enquiry submissions yet.</p>
                ) : (
                  <ul className="divide-y divide-border/60 text-sm">
                    {report.enquiryNeeds.map((row) => (
                      <li key={row.need} className="flex justify-between gap-4 py-1.5">
                        <span>{row.need}</span>
                        <span className="tabular-nums text-muted-foreground">{fmtInt(row.count)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Panel>
          </div>
        </>
      )}

      {/* Danger zone */}
      <details className="rounded-2xl border border-red-500/20 bg-card/50">
        <summary className="cursor-pointer select-none px-6 py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
          Clear all analytics data
        </summary>
        <form action={clearData} className="flex flex-wrap items-end gap-3 border-t border-red-500/20 px-6 py-5">
          <div className="flex-1 min-w-[16rem] space-y-1.5">
            <label htmlFor="confirm" className="block text-sm">
              Permanently deletes every stored event ({report.backend === "postgres" ? "Postgres" : "local file"}). Leads
              in StartMyPatch are not affected. Type <span className="font-mono font-semibold">{CLEAR_CONFIRMATION}</span>{" "}
              to confirm.
            </label>
            <input
              id="confirm"
              name="confirm"
              autoComplete="off"
              placeholder={CLEAR_CONFIRMATION}
              className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete everything
          </button>
        </form>
      </details>
    </div>
  )
}
