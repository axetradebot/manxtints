import { NextRequest, NextResponse } from "next/server"
import { putEnquiryPhoto } from "@/lib/enquiryPhotoStore"
import { signedPhotoUrl } from "@/lib/photoSign"
import { PHOTO_QUOTE_MAX_PHOTO_BYTES, PHOTO_QUOTE_MAX_PHOTOS } from "@/lib/photoQuote.schema"
import { registerPhotos } from "@/lib/photoQuote.store"
import { verifySessionToken } from "@/lib/photoQuote.token"
import { allowRequest } from "@/lib/rateLimit"
import { ipHashFor, requestOrigin, sameOrigin } from "../_shared"

export const runtime = "nodejs"

/**
 * Stores one photo-quote image (multipart field `file`) and returns its URL.
 * Uploads happen one at a time in the background while the customer is still
 * adding photos, so each call is a single file. Needs a session token.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const { ipHash } = ipHashFor(request)
  // Generous: 8 photos × a few retries per estimate, 10 estimates a day.
  if (!allowRequest(`pq-upload:${ipHash}`, PHOTO_QUOTE_MAX_PHOTOS * 12, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const session = verifySessionToken(form.get("session")?.toString())
  if (!session) return NextResponse.json({ error: "session" }, { status: 401 })

  const file = form.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "no_file" }, { status: 400 })
  }
  if (file.size > PHOTO_QUOTE_MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 })
  }
  if (!(file.type || "image/jpeg").startsWith("image/")) {
    return NextResponse.json({ error: "not_image" }, { status: 415 })
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    // JPEG magic bytes — the client re-encodes everything as JPEG.
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) {
      return NextResponse.json({ error: "not_image" }, { status: 415 })
    }
    const stored = await putEnquiryPhoto(bytes, "image/jpeg")
    const url = stored.publicUrl || signedPhotoUrl(requestOrigin(request), stored.id)
    await registerPhotos([{ id: stored.id, url }]).catch((error) => {
      console.error("photo-quote: could not register photo:", error instanceof Error ? error.message : error)
    })
    return NextResponse.json({ url })
  } catch (error) {
    console.error("photo-quote upload failed:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "upload_failed" }, { status: 500 })
  }
}
