import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ADMIN_COOKIE, adminToken, isValidAdminCookie } from "@/lib/adminAuth"
import { buildReport, type Report } from "@/lib/analyticsReport"

export const dynamic = "force-dynamic"

export const metadata = { title: "Admin", robots: { index: false, follow: false } }

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

function fmtPct(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`
}

function fmtGBP(value: number | null): string {
  return value === null ? "—" : `£${value.toFixed(2)}`
}

function Sparkline({
  points,
  metric,
  color,
}: {
  points: Report["daily"]
  metric: "visitors" | "quotes" | "submits"
  color: string
}) {
  const max = Math.max(1, ...points.map((p) => p[metric]))
  return (
    <div className="flex items-end gap-px h-12">
      {points.map((p) => (
        <div
          key={p.date}
          title={`${p.date}: ${p[metric]}`}
          className={`flex-1 min-w-[2px] rounded-t-sm ${color}`}
          style={{ height: `${Math.max(p[metric] > 0 ? 8 : 2, (p[metric] / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; error?: string }>
}) {
  const params = await searchParams
  const store = await cookies()
  const authed = isValidAdminCookie(store.get(ADMIN_COOKIE)?.value)

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 space-y-4">
          <h1 className="text-xl font-bold">Admin login</h1>
          {!process.env.ADMIN_PASSWORD && (
            <p className="text-sm text-red-500">
              ADMIN_PASSWORD is not set — add it to the environment to enable login.
            </p>
          )}
          {params.error && <p className="text-sm text-red-500">Wrong password, try again.</p>}
          <form action={login} className="space-y-4">
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
              className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30
  const report = await buildReport(days)

  return (
    <div className="container mx-auto px-4 py-24 space-y-10 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {report.totalEvents} events in the last {days} days · storage: {report.backend}
            {report.backend === "file" && " (local file — set DATABASE_URL for production)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              className={`rounded-md px-3 py-1.5 text-sm border ${
                d === days
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}d
            </Link>
          ))}
          <form action={logout}>
            <button className="rounded-md px-3 py-1.5 text-sm border border-border text-muted-foreground hover:text-foreground">
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Funnel */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Funnel</h2>
        <div className="space-y-2">
          {report.funnel.map((step, i) => {
            const isBiggestDrop = i === report.biggestDropIndex
            const maxSessions = Math.max(1, report.funnel[0].sessions)
            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-28 text-sm shrink-0">{step.label}</div>
                <div className="flex-1 h-7 rounded bg-background overflow-hidden">
                  <div
                    className={`h-full rounded ${isBiggestDrop ? "bg-red-500/70" : "bg-primary/70"}`}
                    style={{ width: `${Math.max(2, (step.sessions / maxSessions) * 100)}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-medium">{step.sessions}</div>
                <div
                  className={`w-24 text-right text-sm ${
                    isBiggestDrop ? "text-red-500 font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {step.pctOfPrevious === null ? "" : `${fmtPct(step.pctOfPrevious)}${isBiggestDrop ? " ⬅ drop" : ""}`}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Percentages show conversion from the previous step. The biggest drop is highlighted in red.
          Home-visit form submissions (outside this funnel): {report.visitFormSubmits}
        </p>
      </section>

      {/* Price drop-off */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Price drop-off</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Shown price</th>
                <th className="py-2 pr-4 font-medium text-right">Quotes shown</th>
                <th className="py-2 pr-4 font-medium text-right">Submitted</th>
                <th className="py-2 pr-4 font-medium text-right">Submit rate</th>
                <th className="py-2 font-medium text-right">Avg £/m²</th>
              </tr>
            </thead>
            <tbody>
              {report.buckets.map((b) => (
                <tr key={b.label} className="border-b border-border/50">
                  <td className="py-2 pr-4">{b.label}</td>
                  <td className="py-2 pr-4 text-right">{b.shown}</td>
                  <td className="py-2 pr-4 text-right">{b.submitted}</td>
                  <td className="py-2 pr-4 text-right font-medium">{fmtPct(b.submitRate)}</td>
                  <td className="py-2 text-right">{fmtGBP(b.avgPricePerSqM)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-lg bg-background p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg shown price — submitters</p>
            <p className="text-2xl font-bold">{fmtGBP(report.avgShownSubmitters)}</p>
          </div>
          <div className="rounded-lg bg-background p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg shown price — abandoners</p>
            <p className="text-2xl font-bold">{fmtGBP(report.avgShownAbandoners)}</p>
          </div>
        </div>
      </section>

      {/* Volume */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-6">
        <h2 className="text-lg font-semibold">Daily volume</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Visitors ({report.daily.reduce((a, p) => a + p.visitors, 0)} total)
            </p>
            <Sparkline points={report.daily} metric="visitors" color="bg-primary/70" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Quotes shown ({report.daily.reduce((a, p) => a + p.quotes, 0)} total)
            </p>
            <Sparkline points={report.daily} metric="quotes" color="bg-amber-500/70" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Submitted ({report.daily.reduce((a, p) => a + p.submits, 0)} total)
            </p>
            <Sparkline points={report.daily} metric="submits" color="bg-green-500/70" />
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Device split (sessions)</p>
          {(() => {
            const { mobile, desktop } = report.deviceSplit
            const total = Math.max(1, mobile + desktop)
            return (
              <div className="space-y-1">
                <div className="flex h-6 rounded overflow-hidden">
                  <div className="bg-primary/70" style={{ width: `${(mobile / total) * 100}%` }} />
                  <div className="bg-muted-foreground/40" style={{ width: `${(desktop / total) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Mobile {mobile} ({((mobile / total) * 100).toFixed(0)}%) · Desktop {desktop} (
                  {((desktop / total) * 100).toFixed(0)}%)
                </p>
              </div>
            )
          })()}
        </div>
      </section>
    </div>
  )
}
