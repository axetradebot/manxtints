"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion"
import { EyeOff, Moon, Shield, Sun, SunMedium, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"
import { hasStat, site } from "@/site.config"

type Benefit = "privacy" | "fading" | "safety" | "heat"
type Mode = "day" | "night"

const BENEFITS: { id: Benefit; label: string; icon: typeof EyeOff }[] = [
  { id: "privacy", label: "Private by day", icon: EyeOff },
  { id: "fading", label: "Stops fading", icon: SunMedium },
  { id: "safety", label: "Keeps glass together", icon: Shield },
  { id: "heat", label: "Cooler rooms", icon: Thermometer },
]

const uv = site.filmSpec.uvBlockPercent

const CAPTIONS: Record<Benefit, string> = {
  privacy: "From outside, it's a mirror. From inside, you see everything.",
  fading: hasStat(uv)
    ? `Blocks up to ${uv}% of UV — protects furniture, floors and fabrics.`
    : "Filters UV — protects furniture, floors and fabrics.",
  safety: "If the glass breaks, the film holds it in place.",
  heat: "Reflects heat and glare, so rooms stay cooler and screens stay visible.",
}

const NIGHT_CAPTION =
  "At night with lights on, the effect reverses — for all-hours privacy, choose frosted film."

const ease = [0.21, 0.47, 0.32, 0.98] as const

/* Pane geometry (viewBox 0 0 360 300) */
const PANE = { x: 68, y: 48, w: 224, h: 188, rx: 8 }

interface ExplainerProps {
  className?: string
  /** Section heading shown above the explainer. */
  heading?: string
  intro?: string
  id?: string
}

export function WindowExplainer({
  className,
  heading = "One film. Four quiet jobs.",
  intro = "Tap a benefit to see what the film does to the same window.",
  id = "explainer",
}: ExplainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px" })
  const reduced = useReducedMotion() ?? false

  const [active, setActive] = useState<Benefit>("privacy")
  const [mode, setMode] = useState<Mode>("day")
  const [playKey, setPlayKey] = useState(0)

  const playing = inView

  const select = (b: Benefit) => {
    setActive(b)
    if (b === "privacy") setMode("day")
    setPlayKey((k) => k + 1)
  }

  // Chip 1 (privacy, Day) is the default; its animation is gated on `playing`,
  // so it auto-plays the moment the section scrolls into view.
  const night = active === "privacy" && mode === "night"
  const caption = night ? NIGHT_CAPTION : CAPTIONS[active]

  const chip = (b: (typeof BENEFITS)[number]) => {
    const selected = active === b.id
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => select(b.id)}
        aria-pressed={selected}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          selected
            ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
            : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-blue-50/60"
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected ? "bg-white/15 text-white" : "bg-blue-50 text-primary"
          )}
        >
          <b.icon className="h-5 w-5" />
        </span>
        <span className="font-semibold leading-tight">{b.label}</span>
      </button>
    )
  }

  return (
    <section id={id} ref={ref} className={cn("relative", className)} aria-labelledby={`${id}-heading`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">How window film works</p>
          <h2 id={`${id}-heading`} className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{intro}</p>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,540px)_1fr] lg:gap-10">
          {/* Left chips (desktop) */}
          <div className="hidden flex-col gap-3 lg:flex">{BENEFITS.slice(0, 2).map(chip)}</div>

          {/* Window */}
          <div className="mx-auto w-full max-w-[540px]">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-xl shadow-slate-900/5">
              <WindowScene active={active} night={night} playing={playing} reduced={reduced} playKey={playKey} />

              {/* Day / Night toggle — the honest hook */}
              <AnimatePresence>
                {active === "privacy" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-1/2 top-3 -translate-x-1/2"
                  >
                    <div
                      role="group"
                      aria-label="Time of day"
                      className="flex rounded-full border border-white/60 bg-white/80 p-1 shadow-md backdrop-blur"
                    >
                      {(["day", "night"] as Mode[]).map((m) => {
                        const on = mode === m
                        return (
                          <button
                            key={m}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setMode(m)
                              setPlayKey((k) => k + 1)
                            }}
                            className={cn(
                              "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                              on ? "text-white" : "text-slate-600 hover:text-slate-900"
                            )}
                          >
                            {on && (
                              <motion.span
                                layoutId="explainer-mode-pill"
                                className={cn("absolute inset-0 rounded-full", m === "day" ? "bg-primary" : "bg-slate-800")}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                            )}
                            <span className="relative flex items-center gap-1.5">
                              {m === "day" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                              {m}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Caption */}
            <div className="mt-5 min-h-[4.5rem] text-center" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={caption}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className={cn("mx-auto max-w-md text-base font-medium leading-snug md:text-lg", night ? "text-slate-900" : "text-slate-800")}
                >
                  {caption}
                </motion.p>
              </AnimatePresence>
              {active === "privacy" && !night && (
                <p className="mt-2 text-sm text-slate-500">
                  Reverses at night with the lights on — tap <span className="font-medium text-slate-700">Night</span> to see.
                </p>
              )}
            </div>
          </div>

          {/* Right chips (desktop) */}
          <div className="hidden flex-col gap-3 lg:flex">{BENEFITS.slice(2).map(chip)}</div>

          {/* Chips (mobile / tablet) */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">{BENEFITS.map(chip)}</div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------------ */
/* Scene                                                                     */
/* ------------------------------------------------------------------------ */

interface SceneProps {
  active: Benefit
  night: boolean
  playing: boolean
  reduced: boolean
  /** Bumped on every chip tap so the overlay remounts and replays from the start. */
  playKey: number
}

function WindowScene({ active, night, playing, reduced, playKey }: SceneProps) {
  // Per-scene layer opacities. Everything is a crossfade (opacity) or transform.
  const reflection = night ? 0.08 : active === "privacy" ? 1 : active === "safety" ? 0.22 : 0.14
  const interior = night ? 1 : active === "privacy" ? 0.05 : 1
  const roomLight = night ? 1 : 0
  const t = reduced ? { duration: 0 } : { duration: 0.7, ease }

  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label="Stylised house window showing what window film does"
      className="block h-auto w-full max-h-[42vh] sm:max-h-none"
    >
      <defs>
        <clipPath id="wx-pane">
          <rect x={PANE.x} y={PANE.y} width={PANE.w} height={PANE.h} rx={PANE.rx} />
        </clipPath>
        <linearGradient id="wx-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb0e6" />
          <stop offset="0.65" stopColor="#cfe7f9" />
          <stop offset="1" stopColor="#eaf4fb" />
        </linearGradient>
        <linearGradient id="wx-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="wx-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wx-heat" cx="0.9" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fb923c" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wx-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f1ea" />
          <stop offset="1" stopColor="#e9e2d8" />
        </linearGradient>
      </defs>

      {/* House wall (day) */}
      <rect width="360" height="300" fill="url(#wx-wall)" />
      {/* Night falls on the wall */}
      <motion.rect width="360" height="300" fill="#141c2a" initial={false} animate={{ opacity: night ? 0.94 : 0 }} transition={t} />

      {/* Frame + sill */}
      <rect x="54" y="34" width="252" height="216" rx="16" fill="#ffffff" stroke="#d6dce6" strokeWidth="2" />
      <rect x="46" y="246" width="268" height="10" rx="3" fill="#e4e8ef" />

      {/* Interior scene */}
      <motion.g clipPath="url(#wx-pane)" initial={false} animate={{ opacity: interior }} transition={t}>
        <rect x={PANE.x} y={PANE.y} width={PANE.w} height={PANE.h} fill="#f8f1e6" />
        {/* floor */}
        <rect x={PANE.x} y="184" width={PANE.w} height="60" fill="#c99b6b" />
        <g stroke="#b3855a" strokeWidth="1">
          <line x1={PANE.x} y1="198" x2={PANE.x + PANE.w} y2="198" />
          <line x1={PANE.x} y1="212" x2={PANE.x + PANE.w} y2="212" />
          <line x1={PANE.x} y1="226" x2={PANE.x + PANE.w} y2="226" />
        </g>
        <rect x={PANE.x} y="181" width={PANE.w} height="4" fill="#ffffff" />
        {/* picture */}
        <rect x="98" y="78" width="42" height="32" rx="2" fill="#9db9d6" stroke="#ffffff" strokeWidth="3" />
        {/* lamp */}
        <motion.circle cx="112" cy="126" r="46" fill="url(#wx-lamp)" initial={false} animate={{ opacity: roomLight }} transition={t} />
        <line x1="112" y1="132" x2="112" y2="184" stroke="#6b6f7a" strokeWidth="3" />
        <path d="M96 132 L128 132 L122 112 L102 112 Z" fill={night ? "#ffe6a8" : "#e9e2d3"} stroke="#c8bfae" strokeWidth="1.5" />
        {/* sofa */}
        <rect x="150" y="120" width="112" height="28" rx="9" fill="#c94a30" />
        <rect x="150" y="142" width="112" height="44" rx="9" fill="#d9573c" />
        <rect x="158" y="134" width="46" height="18" rx="6" fill="#e56a4f" />
        <rect x="208" y="134" width="46" height="18" rx="6" fill="#e56a4f" />
        <rect x="158" y="186" width="6" height="6" fill="#7a5a44" />
        <rect x="248" y="186" width="6" height="6" fill="#7a5a44" />
        {/* warm room light when it is night */}
        <motion.rect
          x={PANE.x}
          y={PANE.y}
          width={PANE.w}
          height={PANE.h}
          fill="#ffe1a6"
          initial={false}
          animate={{ opacity: roomLight * 0.28 }}
          transition={t}
        />
      </motion.g>

      {/* Reflection of the outside (mirror) */}
      <motion.g clipPath="url(#wx-pane)" initial={false} animate={{ opacity: reflection }} transition={t}>
        <rect x={PANE.x} y={PANE.y} width={PANE.w} height={PANE.h} fill="url(#wx-sky)" />
        <circle cx="246" cy="86" r="15" fill="#fff6cf" />
        <ellipse cx="128" cy="92" rx="30" ry="11" fill="#ffffff" opacity="0.9" />
        <ellipse cx="146" cy="86" rx="22" ry="12" fill="#ffffff" opacity="0.9" />
        <ellipse cx="214" cy="126" rx="26" ry="9" fill="#ffffff" opacity="0.75" />
        {/* trees */}
        <g fill="#4f8a5f">
          <polygon points="76,236 96,166 116,236" />
          <polygon points="108,236 130,150 152,236" />
          <polygon points="150,236 168,178 186,236" />
          <polygon points="236,236 258,158 280,236" />
          <polygon points="270,236 290,180 310,236" />
        </g>
        <rect x={PANE.x} y="222" width={PANE.w} height="14" fill="#3f7350" />
        {/* mirror sheen sweep */}
        <motion.rect
          x="-140"
          y={PANE.y - 20}
          width="120"
          height={PANE.h + 40}
          fill="url(#wx-sheen)"
          initial={{ x: -140 }}
          animate={playing && !reduced && active === "privacy" && !night ? { x: [-140, 420] } : { x: -140 }}
          transition={
            playing && !reduced && active === "privacy" && !night
              ? { duration: 1.6, ease: "easeInOut", delay: 0.4, repeat: Infinity, repeatDelay: 2.6 }
              : { duration: 0 }
          }
          style={{ skewX: -12 }}
        />
      </motion.g>

      {/* Film layer, hugging the inside of the pane */}
      <motion.rect
        x={PANE.x + 2}
        y={PANE.y + 2}
        width={PANE.w - 4}
        height={PANE.h - 4}
        rx={PANE.rx - 1}
        fill="none"
        stroke="#4aa8ff"
        strokeWidth="3"
        initial={false}
        animate={{ opacity: active === "fading" || active === "safety" ? 0.9 : 0.35 }}
        transition={t}
      />

      {/* Mullion */}
      <rect x="177" y={PANE.y} width="6" height={PANE.h} fill="#ffffff" />

      {/* Glass edge highlight */}
      <rect x={PANE.x} y={PANE.y} width={PANE.w} height={PANE.h} rx={PANE.rx} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.5" />

      {/* Per-benefit overlays */}
      {active === "fading" && <FadingScene key={playKey} playing={playing} reduced={reduced} />}
      {active === "safety" && <SafetyScene key={playKey} playing={playing} reduced={reduced} />}
      {active === "heat" && <HeatScene key={playKey} playing={playing} reduced={reduced} />}
    </svg>
  )
}

/* ---------------------------- Stops fading ------------------------------ */

function FadingScene({ playing, reduced }: { playing: boolean; reduced: boolean }) {
  // Sun at top-left, rays travel toward the pane at ~52°.
  const angle = 52
  const goldTargets = { x: 150, y: 192 }
  const uvTargets = { x: 58, y: 74 }
  const run = playing && !reduced

  return (
    <g>
      {/* Sun */}
      <circle cx="26" cy="26" r="17" fill="#fde68a" />
      <circle cx="26" cy="26" r="11" fill="#fcd34d" />

      {/* Visible light: passes through */}
      {[0, 0.9, 1.8].map((delay, i) => (
        <motion.rect
          key={`gold-${i}`}
          x="30"
          y={30 + i * 6 - 6}
          width="24"
          height="3.5"
          rx="1.75"
          fill="#f6c453"
          style={{ rotate: angle, originX: 0, originY: 0.5 }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={
            run
              ? { x: [0, goldTargets.x], y: [0, goldTargets.y], opacity: [0, 1, 1, 0] }
              : { x: reduced ? goldTargets.x * 0.55 : 0, y: reduced ? goldTargets.y * 0.55 : 0, opacity: reduced ? 1 : 0 }
          }
          transition={run ? { duration: 2.2, ease: "linear", delay, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0 }}
        />
      ))}

      {/* UV: reaches the film and bounces back */}
      {[0.3, 1.2, 2.1].map((delay, i) => (
        <motion.rect
          key={`uv-${i}`}
          x="22"
          y={38 + i * 7}
          width="20"
          height="3.5"
          rx="1.75"
          fill="#8b5cf6"
          style={{ rotate: angle, originX: 0, originY: 0.5 }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={
            run
              ? { x: [0, uvTargets.x, 0], y: [0, uvTargets.y, 0], opacity: [0, 1, 0] }
              : { x: reduced ? uvTargets.x * 0.6 : 0, y: reduced ? uvTargets.y * 0.6 : 0, opacity: reduced ? 1 : 0 }
          }
          transition={
            run
              ? { duration: 1.9, ease: "easeInOut", delay, repeat: Infinity, repeatDelay: 0.6, times: [0, 0.5, 1] }
              : { duration: 0 }
          }
        />
      ))}

      {/* Static "bounce" arrow for reduced-motion readers */}
      {reduced && (
        <path d="M84 104 l-22 -8 m22 8 l-8 -20" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Legend */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="600">
        <rect x="6" y="58" width="12" height="3" rx="1.5" fill="#f6c453" />
        <text x="22" y="62" fill="#6b5a2a">Light passes</text>
        <rect x="6" y="72" width="12" height="3" rx="1.5" fill="#8b5cf6" />
        <text x="22" y="76" fill="#5b3fa6">UV blocked</text>
      </g>

      {/* Rug swatch: vivid with film vs faded without */}
      <g clipPath="url(#wx-pane)">
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: reduced ? 0 : 0.6 }}>
          <rect x="150" y="200" width="54" height="26" rx="4" fill="#d9573c" />
          <rect x="208" y="200" width="54" height="26" rx="4" fill="#efc9be" />
          <g fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" textAnchor="middle">
            <text x="177" y="196" fill="#7a3b2a">With film</text>
            <text x="235" y="196" fill="#9a7a70">Without</text>
          </g>
        </motion.g>
      </g>
    </g>
  )
}

/* ------------------------- Keeps glass together ------------------------- */

const CRACKS = [
  "M230 100 L204 74 L190 62 L184 50",
  "M230 100 L258 78 L276 72 L290 66",
  "M230 100 L244 130 L250 160 L246 192 L250 234",
  "M230 100 L212 128 L196 140 L182 148",
  "M230 100 L254 108 L278 114 L292 118",
  "M230 100 L228 72 L222 50",
  "M230 100 L216 116 L206 136 L204 160",
  "M210 84 Q230 78 252 86",
  "M206 112 Q232 124 258 112",
]

function SafetyScene({ playing, reduced }: { playing: boolean; reduced: boolean }) {
  const run = playing && !reduced
  return (
    <g clipPath="url(#wx-pane)">
      <motion.g
        initial={{ x: 0 }}
        animate={run ? { x: [0, -2.5, 2.5, -1.5, 1.5, 0] } : { x: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
      >
        {/* Impact ripple */}
        <motion.circle
          cx="230"
          cy="100"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          initial={{ r: 2, opacity: 0.9 }}
          animate={run ? { r: 36, opacity: 0 } : { r: 22, opacity: reduced ? 0.25 : 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        />

        {/* Cracks: dark underlay + light highlight so they read on any background */}
        {CRACKS.map((d, i) => (
          <g key={d}>
            <motion.path
              d={d}
              fill="none"
              stroke="#2b3647"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.55"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: run || reduced ? 1 : 0 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.3 + i * 0.07, ease: "easeOut" }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: run || reduced ? 1 : 0 }}
              transition={{ duration: 0.55, delay: reduced ? 0 : 0.3 + i * 0.07, ease: "easeOut" }}
            />
          </g>
        ))}
      </motion.g>

      {/* Film glow pulse — held together */}
      <motion.rect
        x={PANE.x + 2}
        y={PANE.y + 2}
        width={PANE.w - 4}
        height={PANE.h - 4}
        rx={PANE.rx - 1}
        fill="none"
        stroke="#4aa8ff"
        strokeWidth="5"
        initial={{ opacity: 0 }}
        animate={run ? { opacity: [0, 0.8, 0.35] } : { opacity: reduced ? 0.5 : 0 }}
        transition={{ duration: 1.2, delay: 0.9, ease: "easeOut" }}
      />

      {/* Label */}
      <motion.g
        initial={{ opacity: 0, y: 6 }}
        animate={run || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 1.1, ease }}
      >
        <rect x="96" y="204" width="98" height="22" rx="11" fill="#ffffff" stroke="#4aa8ff" strokeWidth="1.5" />
        <circle cx="110" cy="215" r="5" fill="#1a9c5b" />
        <path d="M107.5 215 l1.8 1.8 l3.4 -3.6" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="120" y="218.5" fontFamily="ui-sans-serif, system-ui" fontSize="9" fontWeight="700" fill="#1f2a3a">
          Held by film
        </text>
      </motion.g>
    </g>
  )
}

/* ------------------------------ Cooler rooms ---------------------------- */

const WAVE = "M0 0 q5 -6 10 0 t10 0 t10 0 t10 0 t10 0"

function HeatScene({ playing, reduced }: { playing: boolean; reduced: boolean }) {
  const run = playing && !reduced
  const rows = [78, 112, 146]
  return (
    <g>
      {/* Sun, right */}
      <circle cx="336" cy="52" r="19" fill="#fdba74" />
      <circle cx="336" cy="52" r="12" fill="#fb923c" />

      {/* Glare cone */}
      <motion.polygon
        points="336,52 292,60 292,180"
        fill="#fb923c"
        initial={{ opacity: 0 }}
        animate={run ? { opacity: [0, 0.28, 0.16] } : { opacity: reduced ? 0.2 : 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {/* Incoming heat waves */}
      {rows.map((y, i) => (
        <motion.path
          key={`in-${y}`}
          d={WAVE}
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ x: 356, y, opacity: 0 }}
          animate={run ? { x: [356, 300], y, opacity: [0, 1, 0.9, 0] } : { x: 312, y, opacity: reduced ? 1 : 0 }}
          transition={run ? { duration: 1.5, ease: "easeIn", delay: i * 0.35, repeat: Infinity, repeatDelay: 0.4 } : { duration: 0 }}
        />
      ))}

      {/* Reflected waves going back outside */}
      {rows.map((y, i) => (
        <motion.path
          key={`out-${y}`}
          d={WAVE}
          fill="none"
          stroke="#fb923c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 3"
          initial={{ x: 298, y: y + 10, opacity: 0 }}
          animate={run ? { x: [298, 350], y: [y + 10, y - 6], opacity: [0, 0.9, 0] } : { x: 318, y: y - 4, opacity: reduced ? 0.8 : 0 }}
          transition={run ? { duration: 1.3, ease: "easeOut", delay: 1.0 + i * 0.35, repeat: Infinity, repeatDelay: 0.6 } : { duration: 0 }}
        />
      ))}

      {/* Interior heat glow cooling down */}
      <g clipPath="url(#wx-pane)">
        <motion.rect
          x={PANE.x}
          y={PANE.y}
          width={PANE.w}
          height={PANE.h}
          fill="url(#wx-heat)"
          initial={{ opacity: reduced ? 0.1 : 0.7 }}
          animate={{ opacity: run ? [0.7, 0.7, 0.08] : 0.1 }}
          transition={{ duration: 2.6, times: [0, 0.3, 1], ease: "easeInOut" }}
        />

        {/* Thermometer */}
        <g>
          <rect x="266" y="88" width="12" height="86" rx="6" fill="#ffffff" stroke="#c7ced9" strokeWidth="1.5" />
          <circle cx="272" cy="176" r="9" fill="#ffffff" stroke="#c7ced9" strokeWidth="1.5" />
          <circle cx="272" cy="176" r="5.5" fill="#3b82f6" />
          <motion.rect
            x="269.5"
            y="96"
            width="5"
            height="76"
            rx="2.5"
            initial={{ scaleY: reduced ? 0.35 : 1, fill: reduced ? "#3b82f6" : "#ef4444" }}
            animate={run ? { scaleY: [1, 1, 0.35], fill: ["#ef4444", "#ef4444", "#3b82f6"] } : { scaleY: 0.35, fill: "#3b82f6" }}
            transition={{ duration: 2.6, times: [0, 0.3, 1], ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 1 }}
          />
          <g stroke="#94a3b8" strokeWidth="1">
            <line x1="280" y1="104" x2="285" y2="104" />
            <line x1="280" y1="126" x2="285" y2="126" />
            <line x1="280" y1="148" x2="285" y2="148" />
          </g>
        </g>
      </g>

      {/* Legend */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize="10" fontWeight="600">
        <path d="M6 62 q4 -5 8 0 t8 0" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <text x="28" y="65.5" fill="#7c3a12">Heat &amp; glare</text>
        <path d="M6 78 q4 -5 8 0 t8 0" fill="none" stroke="#fb923c" strokeWidth="2" strokeDasharray="3 2" strokeLinecap="round" />
        <text x="28" y="81.5" fill="#7c3a12">Reflected</text>
      </g>
    </g>
  )
}
