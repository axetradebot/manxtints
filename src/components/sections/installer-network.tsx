"use client"

import { FadeIn } from "@/components/motion"
import { BadgeRow } from "@/components/trust/badge-row"
import { MapPinIcon, VettedIcon } from "@/components/trust/trust-icons"
import { hasStat, site } from "@/site.config"

export function InstallerNetwork() {
  const installers = site.stats.installersInNetwork
  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Our installer network</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
              Local hands. One standard.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Every ManxTints installer is vetted, insured and works to our written standard. Your booking,
              deposit and guarantee are always with ManxTints.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {hasStat(installers) && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
                  <VettedIcon className="h-4 w-4 text-trust" />
                  {installers} installers in the network
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200">
                <MapPinIcon className="h-4 w-4 text-primary" />
                Covering the {site.areasServed}
              </span>
            </div>
            <BadgeRow className="mt-8" />
          </FadeIn>

          <FadeIn delay={0.15} direction="left">
            <CoverageGraphic />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ---------- Map geometry ----------------------------------------------------
 * Simplified coastlines as [lon, lat] pairs, projected with a plain
 * equirectangular projection scaled for ~54°N so distances read true enough
 * for a 40-mile radius. The frame runs from the Channel to just above the
 * Forth; the Highlands are outside the coverage story so they're cropped.
 */
const LON_MIN = -6.6
const LAT_MIN = 49.7
const LAT_MAX = 56.6
const MAP_W = 300
const MAP_H = 400
const PX_PER_DEG = MAP_H / (LAT_MAX - LAT_MIN)
const LON_SCALE = Math.cos((54 * Math.PI) / 180)

type LonLat = readonly [number, number]

const project = ([lon, lat]: LonLat): [number, number] => [
  (lon - LON_MIN) * LON_SCALE * PX_PER_DEG,
  (LAT_MAX - lat) * PX_PER_DEG,
]

const toPath = (points: readonly LonLat[]) =>
  points.map((p, i) => `${i === 0 ? "M" : "L"}${project(p).map((n) => n.toFixed(1)).join(" ")}`).join(" ") + "Z"

const milesToPx = (miles: number) => ((miles * 1.609) / 111.2) * PX_PER_DEG

// Great Britain, anticlockwise from Land's End along the south coast.
const GREAT_BRITAIN: readonly LonLat[] = [
  [-5.7, 50.05], [-5.15, 49.97], [-4.75, 50.32], [-4.1, 50.33], [-3.6, 50.2], [-3.45, 50.6],
  [-2.95, 50.7], [-2.4, 50.6], [-1.95, 50.6], [-1.4, 50.78], [-0.75, 50.78], [0.25, 50.74],
  [0.85, 50.92], [1.4, 51.15], [1.42, 51.38], [0.75, 51.45], [0.5, 51.52], [0.95, 51.78],
  [1.3, 51.95], [1.63, 52.1], [1.75, 52.55], [1.5, 52.95], [0.7, 52.98], [0.35, 52.8],
  [0.15, 53.05], [0.35, 53.35], [0.1, 53.55], [-0.15, 54.1], [-0.55, 54.35], [-1.15, 54.65],
  [-1.4, 55.0], [-1.6, 55.55], [-2.0, 55.85], [-2.7, 56.05], [-3.3, 56.0], [-2.9, 56.2],
  [-2.7, 56.4], [-3.0, 56.7], [-5.3, 56.7], [-5.6, 56.3], [-5.5, 56.0], [-5.75, 55.35],
  [-5.45, 55.35], [-5.3, 55.9], [-5.05, 55.95], [-4.85, 55.7], [-4.65, 55.55], [-4.85, 55.3],
  [-5.05, 54.95], [-5.15, 54.75], [-4.95, 54.65], [-4.4, 54.7], [-3.9, 54.75], [-3.6, 54.9],
  [-3.05, 54.95], [-3.35, 54.85], [-3.5, 54.6], [-3.6, 54.45], [-3.4, 54.15], [-3.05, 54.2],
  [-2.95, 53.95], [-3.05, 53.75], [-2.95, 53.55], [-3.05, 53.42], [-3.15, 53.3], [-3.35, 53.35],
  [-3.85, 53.3], [-4.2, 53.3], [-4.6, 53.42], [-4.35, 53.15], [-4.7, 52.9], [-4.15, 52.85],
  [-4.1, 52.5], [-4.35, 52.2], [-4.7, 52.05], [-5.3, 51.9], [-5.1, 51.65], [-4.55, 51.75],
  [-4.2, 51.55], [-3.6, 51.45], [-3.15, 51.4], [-2.75, 51.6], [-3.0, 51.25], [-3.5, 51.2],
  [-4.2, 51.2], [-4.55, 51.0], [-4.5, 50.7], [-5.05, 50.4], [-5.6, 50.15],
]

const ISLE_OF_MAN: readonly LonLat[] = [
  [-4.8, 54.07], [-4.62, 54.06], [-4.45, 54.2], [-4.38, 54.32], [-4.37, 54.42], [-4.55, 54.4],
  [-4.72, 54.26],
]

// East coast of Ireland, running off the left edge for context.
const IRELAND_EDGE: readonly LonLat[] = [
  [-6.7, 52.0], [-6.35, 52.2], [-6.0, 52.6], [-6.05, 53.0], [-6.1, 53.45], [-6.2, 53.9],
  [-5.85, 54.05], [-5.55, 54.35], [-5.75, 54.65], [-5.6, 54.75], [-6.0, 55.15], [-6.7, 55.3],
]

interface CoverageArea {
  label: string
  sub?: string
  centre: LonLat
  /** Radius in miles; the Isle of Man ring simply encloses the island. */
  miles: number
  labelAt: "above" | "right" | "below"
}

const COVERAGE: CoverageArea[] = [
  { label: "Isle of Man", centre: [-4.58, 54.24], miles: 22, labelAt: "above" },
  { label: "North West", sub: "40 miles around Liverpool", centre: [-2.98, 53.41], miles: 40, labelAt: "right" },
  { label: "South East & London", sub: "40 miles around Slough", centre: [-0.6, 51.51], miles: 40, labelAt: "below" },
]

const GB_PATH = toPath(GREAT_BRITAIN)
const IOM_PATH = toPath(ISLE_OF_MAN)
const IRELAND_PATH = toPath(IRELAND_EDGE)

/** Britain with the three service areas ringed in the trust green. */
function CoverageGraphic() {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Coverage map: ${COVERAGE.map((c) => c.label).join(", ")}`}
      >
        <defs>
          <pattern id="in-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#e8edf3" strokeWidth="1" />
          </pattern>
          <linearGradient id="in-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#in-grid)" />

        <g strokeLinejoin="round">
          <path d={IRELAND_PATH} fill="#eef3f9" stroke="#d3dfee" strokeWidth="1.5" />
          <path d={GB_PATH} fill="#e3eefb" stroke="#bcd3f2" strokeWidth="1.5" />
          <path d={IOM_PATH} fill="#e3eefb" stroke="#bcd3f2" strokeWidth="1.5" />
        </g>

        {/* Coverage rings */}
        {COVERAGE.map((area) => {
          const [cx, cy] = project(area.centre)
          const r = milesToPx(area.miles)
          const labelPos =
            area.labelAt === "above"
              ? { x: cx, y: cy - r - 10, anchor: "middle" as const }
              : area.labelAt === "right"
                ? { x: cx + r + 8, y: cy + 4, anchor: "start" as const }
                : { x: cx, y: cy + r + 16, anchor: "middle" as const }
          return (
            <g key={area.label}>
              <circle cx={cx} cy={cy} r={r} fill="#1a9c5b" fillOpacity="0.14" stroke="#1a9c5b" strokeWidth="2" />
              <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#1a9c5b" strokeOpacity="0.25" strokeDasharray="3 4" />
              <circle cx={cx} cy={cy} r="4.5" fill="#1a9c5b" />
              <circle cx={cx} cy={cy} r="1.8" fill="#ffffff" />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={labelPos.anchor}
                fontFamily="ui-sans-serif, system-ui"
                fontSize="11"
                fontWeight="700"
                fill="#1e293b"
              >
                {area.label}
              </text>
              {area.sub && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 12}
                  textAnchor={labelPos.anchor}
                  fontFamily="ui-sans-serif, system-ui"
                  fontSize="8.5"
                  fontWeight="500"
                  fill="#64748b"
                >
                  {area.sub}
                </text>
              )}
            </g>
          )
        })}

        {/* Scotland continues beyond the frame */}
        <rect width={MAP_W} height="44" fill="url(#in-fade)" />
      </svg>
      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow ring-1 ring-slate-200 backdrop-blur">
        Installers across the {site.areasServed}
      </div>
    </div>
  )
}
