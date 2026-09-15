import type { Metadata } from "next"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: "Services — window film, explained simply",
  description: `One-way mirror privacy, solar and heat control, frosted, safety and conservatory roof film for homes and businesses across the ${site.areasServed}. VAT-inclusive guide prices and instant online quotes.`,
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children
}
