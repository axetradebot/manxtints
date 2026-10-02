import { NextRequest, NextResponse } from "next/server"
import { deleteEnquiryPhoto } from "@/lib/enquiryPhotoStore"
import { forgetPhotos, listExpiredPhotos } from "@/lib/photoQuote.store"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Daily cron (see vercel.json): deletes photo-quote images older than 30
 * days that were never attached to a booked lead. Vercel calls it with
 * `Authorization: Bearer ${CRON_SECRET}`; the same header works for a manual run.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 })
  }

  const expired = await listExpiredPhotos()
  const deleted: string[] = []
  for (const photo of expired) {
    try {
      await deleteEnquiryPhoto(photo.id, photo.url)
      deleted.push(photo.id)
    } catch (error) {
      console.error("photo-quote purge: could not delete", photo.id, error instanceof Error ? error.message : error)
    }
  }
  await forgetPhotos(deleted)
  return NextResponse.json({ checked: expired.length, deleted: deleted.length })
}
