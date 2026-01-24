"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="hidden md:flex bg-blue-600 text-white py-2"
      >
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a
              href="tel:+447624000000"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Us Today</span>
            </a>
            <a
              href="mailto:manxtints@gmail.com"
              className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>manxtints@gmail.com</span>
            </a>
          </div>
          <span className="text-blue-100">
            🇮🇲 Shading Excellence, One Window at a Time
          </span>
        </div>
      </motion.div>

      {/* Main nav */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white shadow-lg border-b border-slate-100"
            : "bg-white/90 backdrop-blur-md"
        )}
      >
        <nav className="container mx-auto px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  rotateY: 10,
                  rotateX: -5,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
                style={{ perspective: "1000px" }}
              >
                {/* 3D Shadow effect */}
                <div className="absolute inset-0 bg-blue-600/20 rounded-xl blur-lg transform translate-y-2 group-hover:translate-y-3 group-hover:blur-xl transition-all duration-300" />
                
                {/* Logo container with 3D effect */}
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 ring-1 ring-white/20">
                  {/* Gradient overlay for 3D depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 z-10 pointer-events-none" />
                  
                  <Image
                    src="/images/logo3.png"
                    alt="ManxTints Logo"
                    fill
                    className="object-contain p-0.5"
                    priority
                  />
                </div>
              </motion.div>
              
              <div className="flex flex-col">
                <motion.span 
                  className="text-xl md:text-2xl font-bold tracking-tight"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-sky-500">MANX</span><span className="text-[#1e3a5f]">TINTS</span>
                </motion.span>
                <span className="text-[9px] md:text-[10px] text-slate-500 tracking-wider uppercase">
                  Shading Excellence
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
                      pathname === link.href
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-md bg-blue-50 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link href="/quote">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">
                  Get Quote
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors text-slate-700"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-lg text-lg font-medium transition-all",
                        pathname === link.href
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                  className="pt-4"
                >
                  <Link href="/quote" className="block">
                    <Button size="xl" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Get Quote
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
