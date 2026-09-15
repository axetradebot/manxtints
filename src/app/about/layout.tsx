import type { Metadata } from "next"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: "About",
  description: `ManxTints is a window film company serving the ${site.areasServed}: online quotes, protected booking and a written guarantee, with installation by vetted local installers working to one standard.`,
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
