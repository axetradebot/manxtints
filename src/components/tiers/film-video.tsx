"use client"

import * as React from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FilmVideoProps {
  src: string
  poster: string
  alt: string
  /** Shown as a chip in the corner, e.g. the film name. */
  label?: string
  /** `sizes` for the poster image; defaults to the tier-card side column. */
  sizes?: string
  className?: string
}

/**
 * Silent, looping clip that only runs while on screen. The poster is painted
 * immediately and the video fades over it once the first frames are decoded,
 * so there is never a black box or a jump on load. With reduced motion the
 * clip waits for a tap instead of autoplaying.
 */
export function FilmVideo({
  src,
  poster,
  alt,
  label,
  sizes = "(min-width: 640px) 224px, 100vw",
  className,
}: FilmVideoProps) {
  const reduceMotion = useReducedMotion()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [inView, setInView] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [userStarted, setUserStarted] = React.useState(false)

  const shouldPlay = inView && (!reduceMotion || userStarted)

  React.useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "120px 0px",
      threshold: 0.25,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (shouldPlay) {
      // play() can reject if the browser blocks it; the poster simply stays up.
      el.play().catch(() => {})
    } else {
      el.pause()
    }
  }, [shouldPlay])

  const start = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUserStarted(true)
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-900", className)}>
      <Image
        src={poster}
        alt={alt}
        fill
        sizes={sizes}
        quality={80}
        className={cn("object-cover transition-opacity duration-500", ready && shouldPlay ? "opacity-0" : "opacity-100")}
      />
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload={reduceMotion ? "none" : "metadata"}
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setReady(true)}
        onWaiting={() => setReady(false)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
          ready && shouldPlay ? "opacity-100" : "opacity-0"
        )}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
      {label && (
        <span className="pointer-events-none absolute bottom-2.5 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-400 motion-safe:animate-pulse" />
          {label}
        </span>
      )}
      {reduceMotion && !userStarted && (
        <button
          type="button"
          onClick={start}
          aria-label="Play clip"
          // z-20 keeps it above a parent card's stretched link (z-10).
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 text-white transition-colors hover:bg-black/30"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  )
}
