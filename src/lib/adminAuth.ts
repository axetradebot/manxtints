import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_COOKIE = "mt_admin"

// Stateless session token: HMAC of a fixed label keyed by the admin password.
// Changing ADMIN_PASSWORD invalidates all existing sessions.
export function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return createHmac("sha256", password).update("manxtints-admin-session").digest("hex")
}

export function isValidAdminCookie(value: string | undefined): boolean {
  const token = adminToken()
  if (!token || !value) return false
  const a = Buffer.from(value)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}
