// Assembles the Quote Enquiry lead message. Empty sections are omitted
// so the pipeline note stays short and photo URLs stay clickable.

export function assembleEnquiryMessage(opts: {
  needs: string[]
  propertyType: string | null
  /** "Standard" | "Premium" | "Advise me" — omitted when not chosen. */
  filmPreference?: string | null
  description: string
  photoUrls: string[]
  photoUploadFailed: boolean
}): string {
  const parts: string[] = []

  if (opts.needs.length > 0) {
    parts.push(`Looking for: ${opts.needs.join(", ")}`)
  }
  if (opts.propertyType) {
    parts.push(`Property: ${opts.propertyType}`)
  }
  if (opts.filmPreference) {
    parts.push(`Film preference: ${opts.filmPreference}`)
  }
  if (opts.description.trim()) {
    parts.push(`Description: ${opts.description.trim()}`)
  }
  if (opts.photoUploadFailed) {
    parts.push("Photos: photo upload failed")
  } else if (opts.photoUrls.length > 0) {
    parts.push(`Photos:\n${opts.photoUrls.join("\n")}`)
  }

  return parts.join("\n")
}

export function enquiryServiceLabel(propertyType: string | null): string {
  return `Quote Enquiry — ${propertyType || "Property"}`
}
