"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Facebook, Instagram, Clock, ArrowUpRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Wordmark } from "@/components/brand/wordmark"
import { BadgeRow } from "@/components/trust/badge-row"
import { hasStat, site } from "@/site.config"

const footerLinks = {
  services: [
    { label: "One-way mirror & privacy film", href: "/services#privacy" },
    { label: "Solar & heat control", href: "/services#solar" },
    { label: "Frosted privacy", href: "/services#frosted" },
    { label: "Safety & security film", href: "/services#safety" },
    { label: "Conservatory roof film", href: "/services#conservatory" },
    { label: "Commercial", href: "/services#commercial" },
  ],
  company: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "About ManxTints", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Get an instant quote", href: "/quote" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
}

export function Footer() {
  const { guarantee } = site
  return (
    <footer className="relative bg-slate-900 text-white mt-auto">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Wordmark tone="dark" size="sm" />
            <p className="text-slate-400 text-sm leading-relaxed">
              Window film for homes and businesses across the {site.areasServed}. Quoted online, booked
              with a protected deposit and fitted by vetted local ManxTints installers
              {hasStat(guarantee.workmanshipYears) ? ` — with a ${guarantee.workmanshipYears}-year workmanship warranty.` : "."}
            </p>
            <div className="flex gap-3">
              <motion.a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ManxTints on Facebook"
                whileHover={{ y: -2 }}
                className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ManxTints on Instagram"
                whileHover={{ y: -2 }}
                className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">What we fit</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group text-sm"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group text-sm"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact us</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s+/g, "")}`}
                  className="flex items-start gap-3 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Phone className="h-5 w-5 mt-0.5 text-blue-400" />
                  <span>{site.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-start gap-3 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Mail className="h-5 w-5 mt-0.5 text-blue-400" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="h-5 w-5 mt-0.5 text-blue-400" />
                <span>
                  {site.registeredLocation}
                  <br />
                  Installers across the {site.areasServed}
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <Clock className="h-5 w-5 mt-0.5 text-blue-400" />
                <span>
                  Mon–Sat: installs by appointment
                  <br />
                  Quotes usually the same day
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-800" />

        <BadgeRow tone="dark" className="justify-center md:justify-start" />

        <Separator className="my-8 bg-slate-800" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-blue-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
