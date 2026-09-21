import { NextRequest, NextResponse } from "next/server"
import { putEnquiryPhoto } from "@/lib/enquiryPhotoStore"
import { signedPhotoUrl } from "@/lib/photoSign"
import { allowRequest, clientIp } from "@/lib/rateLimit"

const MAX_FILES = 6
const MAX_BYTES = 2_000_000
const SUBMIT_LIMIT = 10
const HOUR_MS = 60 * 60 * 1000

function requestOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") || "https"
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "www.manxtints.com"
  if (host.startsWith("http")) return host.replace(/\/$/, "")
  return `${proto}://${host}`
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)
  if (!allowRequest(`enquiry:${ip}`, SUBMIT_LIMIT, HOUR_MS)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_FILES)

  if (files.length === 0) {
    return NextResponse.json({ urls: [] })
  }

  const origin = requestOrigin(request)
  const urls: string[] = []

  for (const file of files) {
    if (file.size > MAX_BYTES) continue
    const type = file.type || "image/jpeg"
    if (!type.startsWith("image/")) continue
    try {
      const bytes = Buffer.from(await file.arrayBuffer())
      const stored = await putEnquiryPhoto(bytes, "image/jpeg")
      urls.push(stored.publicUrl || signedPhotoUrl(origin, stored.id))
    } catch (error) {
      // Skip a single failed file; caller treats an empty list as upload failure.
      console.error("enquiry photo upload failed:", error instanceof Error ? error.message : error)
    }
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 })
  }

  return NextResponse.json({ urls })
}
