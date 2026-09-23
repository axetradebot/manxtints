import Image from "next/image"
import { FadeIn } from "@/components/motion"
import { cn } from "@/lib/utils"

interface ClientLogo {
  name: string
  src: string
  /** Intrinsic pixel size of the processed asset in /public/logos. */
  width: number
  height: number
  /** Solid-background artwork that reads as a tile rather than a cut-out mark. */
  tile?: boolean
  unoptimized?: boolean
}

/**
 * Commercial clients, ordered so the most recognisable names lead and the
 * bold "tile" artwork is spread out rather than clumped together.
 */
export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Isle of Man Steam Packet Company", src: "/logos/steam-packet.svg", width: 314, height: 318, unoptimized: true },
  { name: "KPMG", src: "/logos/kpmg.png", width: 358, height: 144 },
  { name: "Hartford Homes", src: "/logos/hartford-homes.png", width: 144, height: 144, tile: true },
  { name: "Appleby", src: "/logos/appleby.png", width: 480, height: 46 },
  { name: "Isle of Man Government", src: "/logos/isle-of-man-government.png", width: 138, height: 144 },
  { name: "Corlett Bolton & Co", src: "/logos/corlett-bolton.png", width: 144, height: 144, tile: true },
  { name: "Nedbank", src: "/logos/nedbank.png", width: 160, height: 144 },
  { name: "Boal & Co", src: "/logos/boal-and-co.png", width: 480, height: 98 },
  { name: "Garforth Gray", src: "/logos/garforth-gray.png", width: 144, height: 144, tile: true },
  { name: "Ellan Vannin Fuels", src: "/logos/ellan-vannin-fuels.png", width: 186, height: 74 },
  { name: "Motaworld", src: "/logos/motaworld.png", width: 480, height: 142, tile: true },
  { name: "Utopia Hair Salon", src: "/logos/utopia-hair.png", width: 144, height: 144, tile: true },
]

/** Display height of the logo row; widths follow each mark's own aspect ratio. */
const ROW_H = 56

function LogoTrack({ logos, hidden = false }: { logos: ClientLogo[]; hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className={cn(
        "flex shrink-0 items-center gap-x-7 pr-7 sm:gap-x-14 sm:pr-14",
        hidden && "motion-reduce:hidden",
        !hidden && "motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:pr-0"
      )}
    >
      {logos.map((logo) => (
        <li key={logo.name} className="flex h-11 shrink-0 items-center sm:h-14" title={logo.name}>
          <Image
            src={logo.src}
            alt={hidden ? "" : logo.name}
            width={Math.round((ROW_H * logo.width) / logo.height)}
            height={ROW_H}
            unoptimized={logo.unoptimized}
            loading="lazy"
            className={cn(
              "h-auto w-auto max-w-[7.5rem] object-contain sm:max-w-[11rem]",
              // Compact square tiles get the full row height so they don't read as smaller than wide wordmarks.
              logo.tile ? "max-h-11 sm:max-h-14" : "max-h-9 sm:max-h-12",
              // Desktop: muted until hovered so a dozen brand palettes don't fight the page.
              // Touch devices have no hover, so they keep full colour.
              "transition duration-300 [@media(hover:hover)]:grayscale [@media(hover:hover)]:opacity-70 [@media(hover:hover)]:hover:grayscale-0 [@media(hover:hover)]:hover:opacity-100",
              logo.tile && "rounded-lg shadow-sm ring-1 ring-slate-900/5"
            )}
          />
        </li>
      ))}
    </ul>
  )
}

interface MarqueeProps {
  logos: ClientLogo[]
  reverse?: boolean
  /** Loop time; shorter tracks need fewer seconds to keep the same scroll speed. */
  seconds?: number
  className?: string
}

function Marquee({ logos, reverse = false, seconds = 45, className }: MarqueeProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:px-4",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ animationDuration: `${seconds}s` }}
      >
        <LogoTrack logos={logos} />
        <LogoTrack logos={logos} hidden />
      </div>
    </div>
  )
}

// Phones only fit three logos per row, so they get two counter-scrolling rows instead.
const MOBILE_ROW_A = CLIENT_LOGOS.filter((_, i) => i % 2 === 0)
const MOBILE_ROW_B = CLIENT_LOGOS.filter((_, i) => i % 2 === 1)

/**
 * "Trusted by" logo bar. A CSS marquee (no JS, no layout work per frame) that
 * pauses on hover; users who prefer reduced motion get a static, wrapped grid.
 */
export function ClientLogos({ className }: { className?: string }) {
  return (
    <section aria-labelledby="client-logos-heading" className={cn("bg-white py-10 sm:py-12", className)}>
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Commercial clients</p>
            <h2 id="client-logos-heading" className="mt-2 font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Trusted by businesses you already know
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              From banks and law firms to homebuilders and the Isle of Man Government — the same film, the same
              installers, the same guarantee as your home.
            </p>
          </div>
        </FadeIn>
      </div>

      <div className="mt-7 space-y-5 sm:hidden">
        <Marquee logos={MOBILE_ROW_A} seconds={26} />
        <Marquee logos={MOBILE_ROW_B} seconds={30} reverse />
      </div>
      <Marquee logos={CLIENT_LOGOS} className="mt-10 hidden sm:block" />
    </section>
  )
}
