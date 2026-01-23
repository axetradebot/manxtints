"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, Shield, Sun, Eye, Thermometer, Car, Home, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"

const services = [
  {
    id: "automotive",
    icon: Car,
    title: "Automotive Tinting",
    tagline: "Style, Privacy & Protection",
    description: "Transform your vehicle with our premium automotive window tinting. We use only the finest films that provide exceptional UV protection, heat rejection, and that sleek, mysterious look that turns heads wherever you go.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    features: [
      "Up to 99% UV ray protection",
      "Reduces interior heat by up to 60%",
      "Enhanced privacy and security",
      "Reduces glare for safer driving",
      "Protects interior from fading",
      "Legal tint levels available",
    ],
    films: [
      { name: "Standard Dyed Film", price: "From £150", description: "Great value with excellent appearance" },
      { name: "Carbon Film", price: "From £250", description: "Superior heat rejection, no fading" },
      { name: "Ceramic Film", price: "From £350", description: "Premium performance, best clarity" },
    ],
  },
  {
    id: "residential",
    icon: Home,
    title: "Residential Tinting",
    tagline: "Comfort, Efficiency & Privacy",
    description: "Protect your home and family while reducing energy costs. Our residential window films provide excellent UV protection, reduce glare, enhance privacy, and help maintain comfortable temperatures year-round.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    features: [
      "Blocks up to 99% of UV rays",
      "Reduces energy costs significantly",
      "Eliminates hot spots and glare",
      "Daytime privacy without losing light",
      "Protects furniture from fading",
      "Various tint levels available",
    ],
    films: [
      { name: "Solar Control Film", price: "£60/m²", description: "Excellent heat rejection" },
      { name: "Privacy Film", price: "£60/m²", description: "One-way mirror effect" },
      { name: "Decorative Film", price: "£60/m²", description: "Frosted and patterned options" },
    ],
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial Tinting",
    tagline: "Professional, Efficient & Secure",
    description: "Create a more comfortable and productive work environment. Our commercial window tinting solutions help reduce energy costs, improve privacy for sensitive areas, and give your building a modern, professional appearance.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
    features: [
      "Significant energy cost reduction",
      "GDPR-compliant privacy solutions",
      "Reduces computer screen glare",
      "Enhanced security film options",
      "Professional storefront appearance",
      "Minimal disruption installation",
    ],
    films: [
      { name: "Privacy Film", price: "£55/m²", description: "One-way mirror effect for offices" },
      { name: "UV Blocking Film", price: "£50/m²", description: "Protect store products and stock from fading" },
      { name: "Security Film", price: "£60/m²", description: "Protect your property from break-ins" },
    ],
  },
  {
    id: "specialty",
    icon: Shield,
    title: "More Tint Options",
    tagline: "Specialty & High-Security Films",
    description: "We offer a range of specialty window films for unique requirements. From energy efficiency to high-security applications, these advanced films provide solutions for specific needs in residential, commercial, and industrial settings.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    features: [
      "Specialist security solutions",
      "Energy efficiency improvements",
      "Advanced data protection",
      "High-security applications",
      "Custom solutions available",
      "Professional consultation",
    ],
    films: [
      { name: "Security Film", price: "£60/m²", description: "Protect your home from break-ins" },
      { name: "Energy Saving Film", price: "£90/m²", description: "Winter heat loss reduction of 27%" },
      { name: "Anti Fog Film", price: "£200/m²", description: "Prevents condensation and fogging" },
      { name: "Data Jammer Film", price: "£900/m²", description: "Makes screens black from outside, protect sensitive data" },
      { name: "Bomb Blast Protection Film", price: "£100/m²", description: "High-security blast mitigation" },
    ],
  },
]

const benefits = [
  { icon: Shield, title: "UV Protection", description: "Block up to 99% of harmful UV rays" },
  { icon: Sun, title: "Heat Rejection", description: "Reduce interior heat by up to 60%" },
  { icon: Eye, title: "Privacy", description: "Enhanced privacy without losing light" },
  { icon: Thermometer, title: "Energy Savings", description: "Lower heating and cooling costs" },
]

const faqs = [
  {
    question: "Is window tinting legal on the Isle of Man?",
    answer: "Yes, window tinting is legal on the Isle of Man. For vehicles, there are regulations regarding how dark the tint can be on front side windows (must allow 70% light transmission) and windscreen (top strip only). Rear windows can be any tint level. We always ensure our installations comply with Isle of Man road regulations.",
  },
  {
    question: "How long does tinting take?",
    answer: "For a standard car, the process typically takes 2-4 hours depending on the number of windows and complexity. Residential and commercial projects vary based on the number and size of windows. We'll give you an accurate time estimate when providing your quote.",
  },
  {
    question: "How long does window tint last?",
    answer: "Quality window tint, like the films we use, can last 15-25 years with proper care. We provide a 5 year guarantee on our premium ceramic films. Cheaper films may fade or bubble within a few years, which is why we only use trusted, premium brands.",
  },
  {
    question: "Can I wash my windows after tinting?",
    answer: "We recommend waiting 3-5 days before cleaning newly tinted windows to allow the film to fully cure. After that, use a soft cloth and ammonia-free cleaner. Avoid abrasive materials that could scratch the film.",
  },
  {
    question: "Will tinting affect my visibility at night?",
    answer: "When professionally installed with appropriate tint levels, window film should not significantly impact night visibility. We help you choose the right tint level for your needs, balancing style and privacy with safety and visibility.",
  },
  {
    question: "Do you offer mobile services?",
    answer: "Yes! We offer mobile tinting services across the Isle of Man. For automotive tinting, we can come to your home or workplace. Contact us to arrange a convenient location.",
  },
]

export default function ServicesPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920&q=80"
            alt="Window tinting"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="electric" className="mb-6">Our Services</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Professional Tinting
                <span className="text-gradient block">Solutions</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                From sleek automotive tints to energy-efficient building films, 
                we deliver premium quality and stunning results for every project.
              </p>
            </div>
          </FadeIn>

          {/* Quick benefits */}
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <div className="glass rounded-xl p-6 text-center">
                  <benefit.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Services Detail Sections */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-24 ${index % 2 === 0 ? "bg-card/30" : ""}`}
        >
          <div className="container mx-auto px-4">
            <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
              {/* Image */}
              <FadeIn direction={index % 2 === 0 ? "right" : "left"}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative rounded-2xl overflow-hidden aspect-[4/3]"
                >
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <Badge variant="electric" className="mb-2">
                      <service.icon className="h-3 w-3 mr-1" />
                      {service.tagline}
                    </Badge>
                  </div>
                </motion.div>
              </FadeIn>

              {/* Content */}
              <FadeIn direction={index % 2 === 0 ? "left" : "right"}>
                <div className={index % 2 === 1 ? "lg:order-first" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                      <service.icon className="h-7 w-7 text-background" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold">{service.title}</h2>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-8">
                    {service.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Film options */}
                  <div className="space-y-3 mb-8">
                    <h3 className="text-lg font-semibold mb-4">Available Films</h3>
                    {service.films.map((film) => (
                      <Card key={film.name} className="bg-card/50 border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{film.name}</p>
                            <p className="text-sm text-muted-foreground">{film.description}</p>
                          </div>
                          <Badge variant="secondary">{film.price}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Link href="/quote">
                    <Button variant="electric" size="lg" className="gap-2 group">
                      Get a Quote
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      ))}

      {/* PPF Section */}
      <section id="ppf" className="py-24 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="electric" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Paint Protection Film
              </h2>
              <p className="text-lg text-muted-foreground">
                We&apos;re expanding our services to include premium paint protection film (PPF) 
                installation. Protect your vehicle&apos;s paintwork from stone chips, scratches, 
                and environmental damage. Contact us to be notified when this service launches.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="electric" className="mb-4">FAQ</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked
                <span className="text-gradient block">Questions</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="glass rounded-xl px-6"
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get your free, no-obligation quote today. We&apos;ll help you choose 
              the perfect tinting solution for your needs.
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
