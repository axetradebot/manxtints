import { site } from "@/site.config"
import { iconForBadge } from "./trust-icons"
import { cn } from "@/lib/utils"

interface BadgeRowProps {
  className?: string
  /** "light" for white sections, "dark" for the footer. */
  tone?: "light" | "dark"
}

/** Renders `site.badges` as icon + text. Nothing renders if the list is empty. */
export function BadgeRow({ className, tone = "light" }: BadgeRowProps) {
  if (site.badges.length === 0) return null
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-3 text-sm",
        tone === "light" ? "text-slate-600" : "text-slate-300",
        className
      )}
    >
      {site.badges.map((badge) => {
        const Icon = iconForBadge(badge)
        return (
          <li key={badge} className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5 shrink-0", tone === "light" ? "text-trust" : "text-trust-soft")} />
            <span>{badge}</span>
          </li>
        )
      })}
    </ul>
  )
}
