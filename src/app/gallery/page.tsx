"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const filteredImages = activeTab === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeTab)

  const openLightbox = (index: number) => setSelectedImage(index)
  const closeLightbox = () => setSelectedImage(null)
  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length)
    }
  }
  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length)
    }
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Gallery"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="electric" className="mb-6">Our Work</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Project
                <span className="text-gradient block">Gallery</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Browse our portfolio of completed projects. Every installation 
                showcases our commitment to quality and attention to detail.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filter Tabs */}
          <FadeIn>
            <Tabs defaultValue="all" className="mb-12" onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                >
                  All Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="automotive"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                >
                  Automotive
                </TabsTrigger>
                <TabsTrigger 
                  value="residential"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                >
                  Residential
                </TabsTrigger>
                <TabsTrigger 
                  value="commercial"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
                >
                  Commercial
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </FadeIn>

          {/* Masonry Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={`${image.src}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid"
                >
                  <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => openLightbox(index)}
                    className="relative group cursor-pointer rounded-xl overflow-hidden bg-card"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={image.src}
                        alt={image.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Badge variant="electric" className="mb-2 capitalize">
                        {image.category}
                      </Badge>
                      <h3 className="font-semibold text-lg">{image.title}</h3>
                      {image.description && (
                        <p className="text-sm text-muted-foreground">{image.description}</p>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-3 rounded-full glass hover:bg-primary/20 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 p-3 rounded-full glass hover:bg-primary/20 transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 p-3 rounded-full glass hover:bg-primary/20 transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={filteredImages[selectedImage].src}
                  alt={filteredImages[selectedImage].title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <Badge variant="electric" className="mb-2 capitalize">
                  {filteredImages[selectedImage].category}
                </Badge>
                <h3 className="text-2xl font-semibold">{filteredImages[selectedImage].title}</h3>
                {filteredImages[selectedImage].description && (
                  <p className="text-muted-foreground mt-2">{filteredImages[selectedImage].description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Want Results Like These?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your vehicle or property could be our next showcase project. 
              Get your free quote and let&apos;s create something amazing.
            </p>
            <Link href="/quote">
              <Button variant="electric" size="xl" className="gap-2 group">
                Get Your Free Quote
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
