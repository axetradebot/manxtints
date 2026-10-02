"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { Turnstile as CfTurnstile, type TurnstileInstance } from "@marsidev/react-turnstile"

export const TURNSTILE_SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "").trim()

export interface TurnstileHandle {
  /** Fresh token for the next request (tokens are single-use). */
  reset: () => void
}

interface TurnstileProps {
  onToken: (token: string | null) => void
}

/**
 * Invisible-by-default Turnstile widget. Renders nothing when no site key is
 * configured (dev) — the server skips verification in that case too.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile({ onToken }, ref) {
  const widget = useRef<TurnstileInstance | null>(null)
  useImperativeHandle(ref, () => ({ reset: () => widget.current?.reset() }), [])

  if (!TURNSTILE_SITE_KEY) return null

  return (
    <CfTurnstile
      ref={widget}
      siteKey={TURNSTILE_SITE_KEY}
      options={{ appearance: "interaction-only", size: "flexible", theme: "light" }}
      onSuccess={(token) => onToken(token)}
      onExpire={() => {
        onToken(null)
        widget.current?.reset()
      }}
      onError={() => onToken(null)}
      className="empty:hidden"
    />
  )
})
