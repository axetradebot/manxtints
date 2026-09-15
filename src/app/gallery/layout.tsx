import type { Metadata } from "next"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: "Gallery",
  description: `Residential and commercial window film installations fitted by ManxTints installers across the ${site.areasServed}.`,
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
