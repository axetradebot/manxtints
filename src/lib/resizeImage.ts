// Client-side image prep for enquiry uploads.
// Draws onto a canvas so EXIF (including GPS) is stripped, then encodes
// as JPEG at ~80% with a 1600px long-edge cap so phone photos stay under 1MB.

const MAX_EDGE = 1600
const JPEG_QUALITY = 0.8

export async function resizeImageForUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    throw new Error("Canvas is not available")
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  })
  if (!blob) throw new Error("Could not encode image")
  return blob
}
