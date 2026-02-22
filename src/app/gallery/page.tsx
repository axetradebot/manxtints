"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { ArrowRight, X, ChevronLeft, ChevronRight, Camera, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"

/*
 * =====================================================
 * GALLERY IMAGE MANAGEMENT
 * =====================================================
 * 
 * To add new photos to the gallery:
 * 
 * 1. Create the following folder structure in /public:
 *    - /public/gallery/automotive/
 *    - /public/gallery/residential/
 *    - /public/gallery/commercial/
 * 
 * 2. Drop your images into the appropriate folder
 * 
 * 3. Add the image info to the galleryImages array below:
 *    {
 *      src: "/gallery/automotive/your-image.jpg",
 *      category: "automotive",
 *      title: "Brief title",
 *      description: "Optional description",
 *    }
 * 
 * Supported formats: JPG, PNG, WebP
 * Recommended size: 1200x800 or similar aspect ratio
 * =====================================================
 */

const galleryImages = [
  // =====================================================
  // AUTOMOTIVE PROJECTS (6 photos)
  // =====================================================
  { src: "/gallery/automotive/1000006918_1705874620.jpg", category: "automotive", title: "Vehicle Tinting", description: "Professional automotive tint" },
  { src: "/gallery/automotive/FB_IMG_1769248545189.jpg", category: "automotive", title: "Car Tint", description: "Premium ceramic film" },
  { src: "/gallery/automotive/FB_IMG_1769248558394.jpg", category: "automotive", title: "Automotive Project", description: "UV protection & style" },
  { src: "/gallery/automotive/FB_IMG_1769248565209.jpg", category: "automotive", title: "Vehicle Window Film", description: "Heat rejection" },
  { src: "/gallery/automotive/FB_IMG_1769248570779.jpg", category: "automotive", title: "Car Tinting", description: "Privacy & protection" },
  { src: "/gallery/automotive/FB_IMG_1769248575415.jpg", category: "automotive", title: "Auto Tint", description: "Sleek finish" },
  // =====================================================
  // RESIDENTIAL PROJECTS (19 photos)
  // =====================================================
  { src: "/gallery/residential/1000008571_1714036458.jpg", category: "residential", title: "Residential Tinting", description: "Home window film" },
  { src: "/gallery/residential/1000017928_1714540796.jpg", category: "residential", title: "Home Project", description: "Privacy & solar control" },
  { src: "/gallery/residential/1000034868_1730806667.jpg", category: "residential", title: "Residential Installation", description: "Heat rejection film" },
  { src: "/gallery/residential/1000043385_1742199442.jpg", category: "residential", title: "Home Tinting", description: "Professional finish" },
  { src: "/gallery/residential/1000043386_1742199441.jpg", category: "residential", title: "Residential Work", description: "Expert installation" },
  { src: "/gallery/residential/1000043387_1742199441.jpg", category: "residential", title: "Home Project", description: "Privacy film" },
  { src: "/gallery/residential/1000043388_1742199441.jpg", category: "residential", title: "Residential Tint", description: "Solar control" },
  { src: "/gallery/residential/1000046789_1745171775.jpg", category: "residential", title: "Home Installation", description: "Heat rejection" },
  { src: "/gallery/residential/1000046793_1745171773.jpg", category: "residential", title: "Residential Project", description: "UV blocking" },
  { src: "/gallery/residential/1000046794_1745171774.jpg", category: "residential", title: "Home Tinting", description: "Energy savings" },
  { src: "/gallery/residential/1000046795_1745171777.jpg", category: "residential", title: "Residential Work", description: "Professional service" },
  { src: "/gallery/residential/1000046796_1745171777.jpg", category: "residential", title: "Home Project", description: "Quality film" },
  { src: "/gallery/residential/1000046797_1745171776.jpg", category: "residential", title: "Residential Tint", description: "Expert finish" },
  { src: "/gallery/residential/1000046798_1745171775.jpg", category: "residential", title: "Home Installation", description: "Privacy solution" },
  { src: "/gallery/residential/1000046799_1745171774.jpg", category: "residential", title: "Residential Project", description: "Solar protection" },
  { src: "/gallery/residential/1000046800_1745171775.jpg", category: "residential", title: "Home Tinting", description: "Heat control" },
  { src: "/gallery/residential/1000046801_1745171775.jpg", category: "residential", title: "Residential Work", description: "UV protection" },
  { src: "/gallery/residential/1000046802_1745171775.jpg", category: "residential", title: "Home Project", description: "Energy efficient" },
  { src: "/gallery/residential/1000046803_1745171776.jpg", category: "residential", title: "Residential Tint", description: "Professional install" },
  // =====================================================
  // COMMERCIAL PROJECTS (15 photos)
  // =====================================================
  { src: "/gallery/commercial/1000016570_1714541017.jpg", category: "commercial", title: "Commercial Tinting", description: "Business window film" },
  { src: "/gallery/commercial/1000034869_1730806668.jpg", category: "commercial", title: "Office Project", description: "Professional installation" },
  { src: "/gallery/commercial/1000034871_1730806666.jpg", category: "commercial", title: "Commercial Work", description: "Heat rejection" },
  { src: "/gallery/commercial/1000034874_1730806667.jpg", category: "commercial", title: "Business Tinting", description: "Solar control" },
  { src: "/gallery/commercial/1000034875_1730806669.jpg", category: "commercial", title: "Commercial Project", description: "UV protection" },
  { src: "/gallery/commercial/1000034876_1730806669.jpg", category: "commercial", title: "Office Installation", description: "Privacy film" },
  { src: "/gallery/commercial/1000034877_1730806669.jpg", category: "commercial", title: "Commercial Tint", description: "Energy savings" },
  { src: "/gallery/commercial/1000034878_1730806666.jpg", category: "commercial", title: "Business Project", description: "Professional finish" },
  { src: "/gallery/commercial/1000043384_1742199441.jpg", category: "commercial", title: "Commercial Work", description: "Quality installation" },
  { src: "/gallery/commercial/1000046789_1745171775.jpg", category: "commercial", title: "Office Tinting", description: "Heat control" },
  { src: "/gallery/commercial/1000046790_1745171776.jpg", category: "commercial", title: "Commercial Project", description: "Solar protection" },
  { src: "/gallery/commercial/1000046791_1745171776.jpg", category: "commercial", title: "Business Installation", description: "UV blocking" },
  { src: "/gallery/commercial/1000046792_1745171775.jpg", category: "commercial", title: "Commercial Tint", description: "Privacy solution" },
  { src: "/gallery/commercial/2025-04-20_19-04-28_1745172285.jpg", category: "commercial", title: "Office Project", description: "Expert installation" },
  { src: "/gallery/commercial/PHOTO-2025-08-21-12-29-02.jpg", category: "commercial", title: "Commercial Work", description: "Professional tinting" },
]

const categories = [
  { value: "all", label: "All", count: galleryImages.length },
  { value: "automotive", label: "Automotive", count: galleryImages.filter(i => i.category === "automotive").length },
  { value: "residential", label: "Residential", count: galleryImages.filter(i => i.category === "residential").length },
  { value: "commercial", label: "Commercial", count: galleryImages.filter(i => i.category === "commercial").length },
]

const SWIPE_THRESHOLD = 50

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const filterScrollRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)

  const filteredImages = activeTab === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeTab)

  const openLightbox = (index: number) => setSelectedImage(index)
  const closeLightbox = () => setSelectedImage(null)

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length)
    }
  }, [selectedImage, filteredImages.length])

  const prevImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length)
    }
  }, [selectedImage, filteredImages.length])

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      prevImage()
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      nextImage()
    }
  }, [nextImage, prevImage])

  useEffect(() => {
    if (selectedImage === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage()
      else if (e.key === "ArrowLeft") prevImage()
      else if (e.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, nextImage, prevImage])

  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [selectedImage])

  return (
    <div className="relative bg-white">
      {/* Hero Section - compact and punchy on mobile */}
      <section className="relative pt-16 pb-8 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
        <div className="absolute top-10 right-0 w-48 h-48 md:w-72 md:h-72 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-sky-100 rounded-full blur-3xl opacity-50" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 md:mb-6 text-xs md:text-sm px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                <Camera className="h-3 w-3 mr-1.5" />
                Our Work
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6 text-slate-800 leading-tight">
                Project
                <span className="text-gradient block">Gallery</span>
              </h1>
              <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
                Every installation showcases our commitment to quality and attention to detail.
              </p>

              {/* Stats row - visible proof */}
              <div className="flex items-center justify-center gap-4 sm:gap-8 mt-6 md:mt-8">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{galleryImages.length}+</p>
                  <p className="text-xs sm:text-sm text-slate-500">Projects</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">100%</p>
                  <p className="text-xs sm:text-sm text-slate-500">Satisfaction</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">5.0</p>
                  <p className="text-xs sm:text-sm text-slate-500">Rating</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="pb-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Filter Pills - horizontal scroll on mobile */}
          <FadeIn>
            <div className="mb-6 md:mb-10">
              <div 
                ref={filterScrollRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center -mx-4 px-4 md:mx-0 md:px-0"
              >
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveTab(cat.value)}
                    className={`
                      flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium
                      transition-all duration-300 ease-out
                      ${activeTab === cat.value
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
                      }
                    `}
                  >
                    {cat.label}
                    <span className={`ml-1.5 text-xs ${activeTab === cat.value ? "text-blue-200" : "text-slate-400"}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Image Grid - mobile-first design */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => {
                const isFeature = index % 7 === 0
                return (
                  <motion.div
                    key={`${image.src}-${activeTab}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
                    className={`${isFeature ? "col-span-2 row-span-2" : ""}`}
                  >
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openLightbox(index)}
                      className="relative group cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 h-full"
                    >
                      <div className={`relative ${isFeature ? "aspect-square" : "aspect-[4/5]"}`}>
                        <Image
                          src={image.src}
                          alt={image.title}
                          fill
                          sizes={isFeature ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          loading={index < 8 ? "eager" : "lazy"}
                        />
                        {/* Always-visible gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                        {/* Category pill - always visible on mobile */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/90 backdrop-blur-sm text-slate-700 capitalize shadow-sm">
                            {image.category}
                          </span>
                        </div>

                        {/* Title - always visible at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4">
                          <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base leading-tight drop-shadow-lg">
                            {image.title}
                          </h3>
                          <p className="text-white/70 text-[10px] sm:text-xs mt-0.5 drop-shadow hidden sm:block">
                            {image.description}
                          </p>
                        </div>

                        {/* Hover enhance - desktop only */}
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg">
                            <Sparkles className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Results count */}
          <div className="text-center mt-6 md:mt-8">
            <p className="text-sm text-slate-400">
              Showing {filteredImages.length} {filteredImages.length === 1 ? "project" : "projects"}
              {activeTab !== "all" && ` in ${activeTab}`}
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox - mobile-optimized with swipe */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between p-3 sm:p-4 relative z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-white/90 border-white/20 text-xs">
                  {selectedImage + 1} / {filteredImages.length}
                </Badge>
                <span className="text-white/60 text-xs capitalize hidden sm:inline">
                  {filteredImages[selectedImage].category}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Main image area with swipe */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
              {/* Desktop navigation arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-4 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors z-10 hidden md:flex"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-4 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors z-10 hidden md:flex"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>

              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  style={{ x: dragX }}
                  className="w-full h-full flex items-center justify-center px-3 sm:px-8 md:px-16 cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative w-full max-w-4xl aspect-[3/4] sm:aspect-video rounded-lg sm:rounded-xl overflow-hidden">
                    <Image
                      src={filteredImages[selectedImage].src}
                      alt={filteredImages[selectedImage].title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom info bar */}
            <div 
              className="p-3 sm:p-4 md:p-6 text-center relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                {filteredImages[selectedImage].title}
              </h3>
              {filteredImages[selectedImage].description && (
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  {filteredImages[selectedImage].description}
                </p>
              )}
              {/* Mobile swipe hint */}
              <p className="text-white/30 text-[10px] mt-2 md:hidden">
                Swipe to navigate
              </p>
              {/* Mobile nav dots */}
              <div className="flex items-center justify-center gap-3 mt-3 md:hidden">
                <button
                  onClick={prevImage}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <span className="text-white/60 text-xs tabular-nums min-w-[3rem] text-center">
                  {selectedImage + 1} / {filteredImages.length}
                </span>
                <button
                  onClick={nextImage}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
                Want Results Like These?
              </h2>
              <p className="text-sm sm:text-base md:text-xl text-blue-100 mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed">
                Your vehicle or property could be our next showcase project. 
                Get your free quote and let&apos;s create something amazing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/quote">
                  <Button size="xl" className="gap-2 group w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Get Your Free Quote
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="xl" className="gap-2 w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
