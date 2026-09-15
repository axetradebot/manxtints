import { NextRequest, NextResponse } from "next/server"
import { getEnquiryPhoto } from "@/lib/enquiryPhotoStore"
import { verifyPhotoSig } from "@/lib/photoSign"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const exp = request.nextUrl.searchParams.get("exp")
  const sig = request.nextUrl.searchParams.get("sig")
  if (!verifyPhotoSig(id, exp, sig)) {
    return new NextResponse("Gone", { status: 410 })
  }

  const photo = await getEnquiryPhoto(id)
  if (!photo) return new NextResponse("Not found", { status: 404 })

  return new NextResponse(new Uint8Array(photo.bytes), {
    status: 200,
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=86400",
    },
  })
}
