import Image from "next/image"
import Link from "next/link"
import { lockupSubline, site } from "@/site.config"
import { cn } from "@/lib/utils"

interface WordmarkProps {
  tone?: "light" | "dark"
  size?: "sm" | "md"
  className?: string
  /** Header mark gets `priority` so it never delays LCP. */
  priority?: boolean
}

/** "ManxTints" wordmark + sub-line lockup used in the header and footer. */
export function Wordmark({ tone = "light", size = "md", className, priority = false }: WordmarkProps) {
  const mark = size === "md" ? "h-11 w-11 md:h-12 md:w-12" : "h-10 w-10"
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className={cn("relative shrink-0 overflow-hidden rounded-xl ring-1", mark, tone === "light" ? "ring-slate-200" : "ring-white/10")}>
        <Image src="/images/logo3.png" alt="" fill sizes="48px" className="object-contain p-0.5" priority={priority} />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-extrabold tracking-tight md:text-2xl", tone === "light" ? "text-slate-900" : "text-white")}>
          Manx<span className="text-primary">Tints</span>
        </span>
        <span className={cn("mt-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.14em] md:text-[11px]", tone === "light" ? "text-slate-500" : "text-slate-400")}>
          <span className="sm:hidden">{site.tagline}</span>
          <span className="hidden sm:inline">{lockupSubline}</span>
        </span>
      </span>
    </Link>
  )
}
