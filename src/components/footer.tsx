"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Clock,
  ArrowUpRight
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  services: [
    { label: "Residential Tinting", href: "/services#residential" },
    { label: "Commercial Tinting", href: "/services#commercial" },
    { label: "Automotive Tinting", href: "/services#automotive" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Get a Quote", href: "/quote" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white mt-auto">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2.5 h-2.5 bg-white/90 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-white/90 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-white/90 rounded-sm"></div>
                  <div className="w-2.5 h-2.5 bg-white/90 rounded-sm"></div>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold">
                  MANX<span className="text-blue-400">TINTS</span>
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Shading Excellence, one window at a time. Professional window tinting 
              services across the Isle of Man. Satisfaction guaranteed.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="https://facebook.com/manxtints"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://instagram.com/manxtints"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group"
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
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group"
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
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:manxtints@gmail.com"
                  className="flex items-start gap-3 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Mail className="h-5 w-5 mt-0.5 text-blue-400" />
                  <span>manxtints@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="h-5 w-5 mt-0.5 text-blue-400" />
                <span>Isle of Man<br />Island-wide service</span>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <Clock className="h-5 w-5 mt-0.5 text-blue-400" />
                <span>Mon-Sat: By appointment<br />Quick response times</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-800" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} ManxTints. All rights reserved.</p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
