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
  // Automotive - Using placeholder images for now
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
    category: "automotive",
    title: "Porsche 911 Ceramic Tint",
    description: "Full ceramic tint package",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    category: "automotive",
    title: "BMW M4 Competition",
    description: "Privacy tint all round",
  },
  {
    src: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80",
    category: "automotive",
    title: "Audi RS6 Avant",
    description: "Carbon ceramic film",
  },
  {
    src: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80",
    category: "automotive",
    title: "Mercedes AMG GT",
    description: "Premium ceramic package",
  },
  {
    src: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=80",
    category: "automotive",
    title: "Range Rover Sport",
    description: "Limo black rear windows",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    category: "automotive",
    title: "Volkswagen Golf R",
    description: "Sports package tint",
  },
  // Residential
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    category: "residential",
    title: "Modern Home - Douglas",
    description: "Solar control film throughout",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    category: "residential",
    title: "Conservatory - Onchan",
    description: "Heat rejection film",
  },
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    category: "residential",
    title: "Beachfront Property",
    description: "UV protection film",
  },
  {
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    category: "residential",
    title: "Contemporary Villa",
    description: "Privacy and solar control",
  },
  // Commercial
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    category: "commercial",
    title: "Office Tower - Douglas",
    description: "Commercial solar film",
  },
  {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    category: "commercial",
    title: "Retail Storefront",
    description: "Security and branding film",
  },
  {
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
    category: "commercial",
    title: "Corporate Office",
    description: "Privacy partition film",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
    category: "commercial",
    title: "Meeting Rooms",
    description: "Frosted privacy film",
  },
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
            src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1920&q=80"
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
