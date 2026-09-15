/**
 * Bespoke, consistent-stroke trust icons. Deliberately simple so they read as
 * plain statements rather than accreditation logos.
 */
import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

/** Google "G" mark, for review-platform attribution only. */
export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3a7.2 7.2 0 0 1-10.7-3.77H1.37v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.37 14.32A7.2 7.2 0 0 1 5 12c0-.8.14-1.58.37-2.32V6.58H1.37A12 12 0 0 0 0 12c0 1.94.46 3.77 1.37 5.42l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A12 12 0 0 0 1.37 6.58l4 3.1A7.18 7.18 0 0 1 12 4.77Z"
      />
    </svg>
  )
}

/** Facebook "f" mark, for review-platform attribution only. */
export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M16.6 15.5l.5-3.5h-3.4V9.8c0-1 .5-1.9 2-1.9h1.5V4.9s-1.4-.2-2.7-.2c-2.8 0-4.6 1.7-4.6 4.7V12H6.8v3.5h3.1V24a12.2 12.2 0 0 0 3.8 0v-8.5h2.9Z"
      />
    </svg>
  )
}

export function ShieldTickIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function GuaranteeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="10" r="6" />
      <path d="m9.5 10 1.7 1.7L14.5 8.5" />
      <path d="M9 15.5 8 21l4-2 4 2-1-5.5" />
    </svg>
  )
}

export function DepositIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 11h18" />
      <path d="M7 15h3" />
      <path d="M16 3v4M13 5h6" />
    </svg>
  )
}

export function VettedIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="m15 9 2 2 4-4" />
    </svg>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 2.7 5.6 6.1.8-4.4 4.3 1.1 6.1L12 17l-5.5 2.8 1.1-6.1L3.2 9.4l6.1-.8L12 3Z" />
    </svg>
  )
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </svg>
  )
}

export function CalendarTickIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="m9.5 15 1.8 1.8 3.5-3.6" />
    </svg>
  )
}

export function InstallerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16" />
      <path d="m14.5 6.5 3 3" />
    </svg>
  )
}

/** Layered film sheet with a peel — "premium films". */
export function FilmIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="14" height="18" rx="1.5" />
      <path d="M18 8h2v13H8" />
      <path d="M8 8h6M8 12h6M8 16h3" />
    </svg>
  )
}

/** Lightning bolt — "instant". */
export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H13l1-8.5Z" />
    </svg>
  )
}

/** Simple smile — "friendly". */
export function SmileIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" />
      <path d="M9 9.5h.01M15 9.5h.01" strokeWidth="2.25" />
    </svg>
  )
}

/** Picks an icon for a badge string by keyword; falls back to the shield. */
export function iconForBadge(label: string) {
  const l = label.toLowerCase()
  if (l.includes("guarantee") || l.includes("warranty")) return GuaranteeIcon
  if (l.includes("deposit")) return DepositIcon
  if (l.includes("vetted") || l.includes("local")) return VettedIcon
  if (l.includes("rating") || l.includes("review")) return StarIcon
  return ShieldTickIcon
}
