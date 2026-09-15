import type { Metadata } from "next"
import { site } from "@/site.config"

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to ManxTints about window film for your home or business across the ${site.areasServed}. Call, email or send a message — quotes are usually the same day.`,
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
