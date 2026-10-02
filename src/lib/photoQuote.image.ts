// Client-side photo prep for the photo quote.
//
// Re-encodes through a canvas (which drops EXIF, including GPS) at 1280px
// on the long edge, JPEG ~0.8, and runs two cheap quality checks on a small
// greyscale copy: variance of the Laplacian for blur, mean luminance for
// darkness. Both are hints only — the customer can always keep the photo.

const MAX_EDGE = 1280
const JPEG_QUALITY = 0.8
/** Analysis thumbnail — big enough to see edges, small enough to be instant. */
const ANALYSIS_EDGE = 160
/** Variance of the Laplacian below this reads as soft/blurred at 160px. */
const BLUR_THRESHOLD = 35
/** Mean luminance (0–255) below this reads as too dark to measure from. */
const DARK_THRESHOLD = 45

export type PhotoWarning = "blurry" | "dark"

export interface PreparedPhoto {
  blob: Blob
  width: number
  height: number
  warnings: PhotoWarning[]
}

function drawScaled(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Blur + darkness check on a small greyscale copy. Exported for tests. */
export function analyseGrey(grey: Float32Array, width: number, height: number): PhotoWarning[] {
  const warnings: PhotoWarning[] = []
  let sum = 0
  for (let i = 0; i < grey.length; i++) sum += grey[i]
  const mean = sum / grey.length
  if (mean < DARK_THRESHOLD) warnings.push("dark")

  // Laplacian (4-neighbour) variance over the interior.
  let lapSum = 0
  let lapSq = 0
  let n = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const lap = grey[i - 1] + grey[i + 1] + grey[i - width] + grey[i + width] - 4 * grey[i]
      lapSum += lap
      lapSq += lap * lap
      n++
    }
  }
  if (n > 0) {
    const lapMean = lapSum / n
    const variance = lapSq / n - lapMean * lapMean
    // A near-black frame is "blurry" by this measure too; report dark only.
    if (variance < BLUR_THRESHOLD && !warnings.includes("dark")) warnings.push("blurry")
  }
  return warnings
}

function greyscaleOf(canvas: HTMLCanvasElement): { grey: Float32Array; width: number; height: number } {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available")
  const { width, height } = canvas
  const { data } = ctx.getImageData(0, 0, width, height)
  const grey = new Float32Array(width * height)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    grey[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return { grey, width, height }
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file)
  try {
    const full = drawScaled(bitmap, MAX_EDGE)
    const small = drawScaled(bitmap, ANALYSIS_EDGE)

    let warnings: PhotoWarning[] = []
    try {
      const { grey, width, height } = greyscaleOf(small)
      warnings = analyseGrey(grey, width, height)
    } catch {
      // Quality hints are optional; a tainted canvas or odd browser just skips them.
    }

    const blob = await new Promise<Blob | null>((resolve) => full.toBlob(resolve, "image/jpeg", JPEG_QUALITY))
    if (!blob) throw new Error("Could not encode image")
    return { blob, width: full.width, height: full.height, warnings }
  } finally {
    bitmap.close()
  }
}
