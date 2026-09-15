import type { Metadata } from "next"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: "Get an instant quote",
  description: `Price your window film in about a minute with 10% off, or send photos for a same-day quote. No visit needed. Fitted by vetted local ManxTints installers across the ${site.areasServed}.`,
}

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
