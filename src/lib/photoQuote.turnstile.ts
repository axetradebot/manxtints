// Cloudflare Turnstile verification — server only.
//
// Enforced whenever TURNSTILE_SECRET_KEY is set. Without it (local dev, or
// before the keys are added in Vercel) the check is skipped and a warning is
// logged once, so the feature still runs; the daily spend cap and per-IP
// limits remain in force regardless.

let warned = false

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (!warned) {
      warned = true
      console.warn("photo-quote: TURNSTILE_SECRET_KEY is not set — bot check skipped")
    }
    return true
  }
  if (!token) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip && ip !== "unknown") body.set("remoteip", ip)
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(6000),
    })
    const data = (await response.json().catch(() => null)) as { success?: boolean } | null
    return data?.success === true
  } catch {
    return false
  }
}
