// In-memory sliding-window limiter. Fine for a single Vercel instance;
// bursts across instances are still capped by the 6-file request limit.

const windows = new Map<string, number[]>()

export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (windows.get(key) || []).filter((ts) => now - ts < windowMs)
  if (recent.length >= limit) {
    windows.set(key, recent)
    return false
  }
  recent.push(now)
  windows.set(key, recent)
  return true
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return headers.get("x-real-ip") || "unknown"
}
