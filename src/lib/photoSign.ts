import { createHmac, timingSafeEqual } from "node:crypto"

const PHOTO_TTL_MS = 30 * 24 * 60 * 60 * 1000

function secret(): string {
  return (
    process.env.PHOTO_SIGNING_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "manxtints-enquiry-photos-dev"
  )
}

export function signPhotoId(id: string, exp = Date.now() + PHOTO_TTL_MS): { exp: number; sig: string } {
  const sig = createHmac("sha256", secret()).update(`${id}.${exp}`).digest("hex")
  return { exp, sig }
}

export function verifyPhotoSig(id: string, exp: string | null, sig: string | null): boolean {
  const expMs = Number(exp)
  if (!sig || !Number.isFinite(expMs) || expMs < Date.now()) return false
  const expected = signPhotoId(id, expMs).sig
  if (expected.length !== sig.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}

export function signedPhotoUrl(origin: string, id: string): string {
  const { exp, sig } = signPhotoId(id)
  return `${origin}/api/enquiry-photos/${id}?exp=${exp}&sig=${sig}`
}
