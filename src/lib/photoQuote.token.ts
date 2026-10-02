// Short-lived signed session token for the photo quote.
//
// Issued by POST /api/photo-quote/session when the sheet opens; required by
// the upload, estimate, price and booked routes. It is not an identity — it
// proves the caller went through the page flow and gives every call in one
// sitting a shared id for logging and the image-set cache. HMAC over
// `${id}.${exp}` with the same secret as the signed photo URLs.

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"

export const PHOTO_QUOTE_SESSION_TTL_MS = 30 * 60 * 1000

function secret(): string {
  return (
    process.env.PHOTO_SIGNING_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "manxtints-enquiry-photos-dev"
  )
}

function sign(id: string, exp: number): string {
  return createHmac("sha256", secret()).update(`pq.${id}.${exp}`).digest("hex")
}

export function issueSessionToken(now = Date.now()): { token: string; exp: number } {
  const id = randomUUID()
  const exp = now + PHOTO_QUOTE_SESSION_TTL_MS
  return { token: `${id}.${exp}.${sign(id, exp)}`, exp }
}

/** Returns the session id when the token is intact and unexpired, else null. */
export function verifySessionToken(token: string | undefined | null, now = Date.now()): string | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [id, expRaw, sig] = parts
  const exp = Number(expRaw)
  if (!/^[0-9a-f-]{36}$/i.test(id) || !Number.isFinite(exp) || exp < now) return null
  const expected = sign(id, exp)
  if (expected.length !== sig.length) return null
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig)) ? id : null
}
