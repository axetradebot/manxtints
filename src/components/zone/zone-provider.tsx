"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { isZoneKey, zones, type Zone, type ZoneKey } from "@/lib/pricing.zones"
import {
  ZONE_PARAM,
  ZONE_SESSION_KEY,
  isExplicitSource,
  zoneCookieString,
  type ZoneSource,
} from "@/lib/zone"

export interface ZoneContextValue {
  zoneKey: ZoneKey
  zone: Zone
  source: ZoneSource
  /** True when the zone is only a guess (IP / default) and the chip must be shown. */
  isGuess: boolean
  /** Persist a new zone (cookie + session) and re-render every price on the page. */
  setZone: (zone: ZoneKey, source: Exclude<ZoneSource, "ip" | "default" | "stored">) => void
}

const ZoneContext = React.createContext<ZoneContextValue | null>(null)

function persist(zone: ZoneKey) {
  try {
    document.cookie = zoneCookieString(zone, window.location.protocol === "https:")
  } catch {
    /* cookies disabled — session mirror below still works for this tab */
  }
  try {
    sessionStorage.setItem(ZONE_SESSION_KEY, zone)
  } catch {
    /* storage unavailable — non-critical */
  }
}

/**
 * Applies ?zone= on client-side navigations (an ad link opened while already
 * on the site). Full-page loads are handled by proxy.ts before render.
 */
function ZoneParamSync({ onParam }: { onParam: (zone: ZoneKey) => void }) {
  const params = useSearchParams()
  const param = params.get(ZONE_PARAM)
  React.useEffect(() => {
    if (isZoneKey(param)) onParam(param)
  }, [param, onParam])
  return null
}

export function ZoneProvider({
  initialZone,
  initialSource,
  children,
}: {
  initialZone: ZoneKey
  initialSource: ZoneSource
  children: React.ReactNode
}) {
  const [state, setState] = React.useState<{ zoneKey: ZoneKey; source: ZoneSource }>({
    zoneKey: initialZone,
    source: initialSource,
  })

  const setZone = React.useCallback<ZoneContextValue["setZone"]>((zone, source) => {
    persist(zone)
    setState((prev) => (prev.zoneKey === zone && prev.source === source ? prev : { zoneKey: zone, source }))
  }, [])

  const onParam = React.useCallback(
    (zone: ZoneKey) => {
      setState((prev) => {
        if (prev.zoneKey === zone && prev.source === "param") return prev
        persist(zone)
        return { zoneKey: zone, source: "param" }
      })
    },
    []
  )

  const value = React.useMemo<ZoneContextValue>(
    () => ({
      zoneKey: state.zoneKey,
      zone: zones[state.zoneKey],
      source: state.source,
      isGuess: !isExplicitSource(state.source),
      setZone,
    }),
    [state, setZone]
  )

  return (
    <ZoneContext.Provider value={value}>
      <Suspense fallback={null}>
        <ZoneParamSync onParam={onParam} />
      </Suspense>
      {children}
    </ZoneContext.Provider>
  )
}

/**
 * The one place components read the pricing zone. Every £ figure on the site
 * comes from `useZone().zone` so switching areas re-renders them all at once.
 */
export function useZone(): ZoneContextValue {
  const ctx = React.useContext(ZoneContext)
  if (!ctx) {
    throw new Error("useZone must be used inside <ZoneProvider> (see app/layout.tsx)")
  }
  return ctx
}
