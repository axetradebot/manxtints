/**
 * Latest posts from the ManxTints Instagram account. Server-side only: it reads
 * the access token from the environment, so import it from server components.
 *
 * Instagram does not allow scraping the public profile page (it is login-walled
 * and against their terms), so this uses the official Instagram API with
 * Instagram Login. It needs a long-lived access token for the business /
 * creator account in `INSTAGRAM_ACCESS_TOKEN`. Without a token the gallery
 * page still renders a "follow us" card — it just has no live thumbnails.
 *
 * Getting a token (one-off, ~10 minutes):
 *   1. developers.facebook.com → Create app → "Other" → Business →
 *      add the "Instagram" product → "API setup with Instagram login".
 *   2. Add @manxtintsltd as an Instagram tester and accept the invite from
 *      Instagram → Settings → Apps and websites → Tester invites.
 *   3. "Generate token" for the account, then exchange it for a long-lived
 *      token (60 days) — the dashboard does this for you.
 *   4. Put it in `.env.local` / Vercel as INSTAGRAM_ACCESS_TOKEN.
 *
 * Long-lived tokens expire after 60 days unless refreshed. Refreshing needs
 * the token to be at least 24h old and is a single GET; see `refreshUrl`.
 */

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"

export interface InstagramPost {
  id: string
  permalink: string
  /** Always an image URL: the post image, or the poster frame for videos. */
  imageUrl: string
  mediaType: InstagramMediaType
  caption: string
  timestamp: string
}

interface ApiMedia {
  id: string
  permalink?: string
  media_type?: InstagramMediaType
  media_url?: string
  thumbnail_url?: string
  caption?: string
  timestamp?: string
}

export const INSTAGRAM_HANDLE = "manxtintsltd"
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`

/** How long a rendered page may keep showing the same set of posts. */
export const INSTAGRAM_REVALIDATE_SECONDS = 60 * 60

const FIELDS = "id,permalink,media_type,media_url,thumbnail_url,caption,timestamp"

export function refreshUrl(token: string): string {
  return `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
}

/** Pure mapper, exported for tests. Drops anything without a usable image. */
export function normaliseInstagramMedia(items: ApiMedia[], limit: number): InstagramPost[] {
  const posts: InstagramPost[] = []
  for (const m of items) {
    const imageUrl = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url
    if (!m.id || !m.permalink || !imageUrl || !m.media_type) continue
    posts.push({
      id: m.id,
      permalink: m.permalink,
      imageUrl,
      mediaType: m.media_type,
      caption: (m.caption ?? "").trim(),
      timestamp: m.timestamp ?? "",
    })
    if (posts.length >= limit) break
  }
  return posts
}

export async function fetchInstagramPosts(limit = 8): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return []

  // Ask for a few more than we need so filtered-out items don't leave gaps.
  const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=${Math.min(limit + 4, 50)}&access_token=${encodeURIComponent(token)}`

  try {
    const res = await fetch(url, { next: { revalidate: INSTAGRAM_REVALIDATE_SECONDS } })
    if (!res.ok) {
      console.warn(`[instagram] ${res.status} ${res.statusText}`)
      return []
    }
    const body = (await res.json()) as { data?: ApiMedia[] }
    return normaliseInstagramMedia(body.data ?? [], limit)
  } catch (err) {
    console.warn("[instagram] fetch failed", err)
    return []
  }
}
