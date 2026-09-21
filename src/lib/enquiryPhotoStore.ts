// Enquiry photo storage.
//
// Production: Vercel Blob when BLOB_READ_WRITE_TOKEN is set — returns a
// public unguessable URL. Dev fallback: files under .data/enquiry-photos/
// served through the signed /api/enquiry-photos/:id route (30-day expiry).

import { promises as fs } from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"

const LOCAL_DIR = path.join(process.cwd(), ".data", "enquiry-photos")

export async function putEnquiryPhoto(
  bytes: Buffer,
  contentType: string
): Promise<{ id: string; publicUrl: string | null }> {
  const id = randomUUID()
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (token) {
    const { put } = await import("@vercel/blob")
    const blob = await put(`enquiry-photos/${id}.jpg`, bytes, {
      access: "public",
      contentType,
      token,
      addRandomSuffix: false,
    })
    return { id, publicUrl: blob.url }
  }

  // Vercel's filesystem is read-only and per-invocation, so the local
  // fallback can never work there — say so instead of failing on mkdir.
  if (process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set — link a Vercel Blob store to this project")
  }

  await fs.mkdir(LOCAL_DIR, { recursive: true })
  await fs.writeFile(path.join(LOCAL_DIR, `${id}.jpg`), bytes)
  return { id, publicUrl: null }
}

export async function getEnquiryPhoto(
  id: string
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  try {
    const bytes = await fs.readFile(path.join(LOCAL_DIR, `${id}.jpg`))
    return { bytes, contentType: "image/jpeg" }
  } catch {
    return null
  }
}
