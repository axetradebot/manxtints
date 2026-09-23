import { headers } from "next/headers"
import { defaultZone, isZoneKey, type ZoneKey } from "./pricing.zones"
import { ZONE_HEADER, ZONE_SOURCE_HEADER, isZoneSource, type ZoneSource } from "./zone"

/**
 * Reads the zone proxy.ts resolved for this request. Falls back to
 * North West / `default` when proxy did not run (e.g. `next start` without the
 * matcher hitting, or a unit render).
 */
export async function getRequestZone(): Promise<{ zone: ZoneKey; source: ZoneSource }> {
  const h = await headers()
  const zone = h.get(ZONE_HEADER)
  const source = h.get(ZONE_SOURCE_HEADER)
  return {
    zone: isZoneKey(zone) ? zone : defaultZone,
    source: isZoneSource(source) ? source : "default",
  }
}
