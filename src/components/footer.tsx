"use client"

import Link from "next/link"
import Image from "next/image"
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
              <motion.div 
                whileHover={{ scale: 1.05, rotateY: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 ring-1 ring-white/10"
              >
                {/* Gradient overlay for 3D depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 z-10 pointer-events-none" />
                <Image
                  src="/images/logo3.png"
                  alt="ManxTints Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </motion.div>
              <div>
                <span className="text-xl font-bold">
                  <span className="text-sky-400">MANX</span><span className="text-slate-200">TINTS</span>
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
