"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Award, Users, Target, Heart, MapPin, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn, Stagger, StaggerItem, FloatingElement } from "@/components/motion"

const values = [
  {
    icon: Award,
    title: "Excellence",
    description: "We never compromise on quality. Every installation meets our exacting standards.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Your satisfaction is our priority. We listen, advise, and deliver beyond expectations.",
  },
  {
    icon: Target,
    title: "Precision",
    description: "Attention to detail in everything we do. Clean edges, perfect fits, flawless results.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We love what we do. That passion shows in every project we complete.",
  },
]

const milestones = [
  { year: "2022", event: "ManxTints founded in Douglas" },
  { year: "2023", event: "Expanded to residential and commercial tinting" },
  { year: "2024", event: "Became the IOM Government official contractor for all films" },
  { year: "2025", event: "2000+ properties and 100+ vehicles completed" },
]

const stats = [
  { value: "2000+", label: "Properties" },
  { value: "100+", label: "Vehicles Tinted" },
  { value: "100%", label: "Satisfaction" },
  { value: "IOM", label: "Gov Contractor" },
]

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1504222490345-c075b6008014?w=1920&q=80"
            alt="Workshop"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <Badge variant="electric" className="mb-6">About Us</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Isle of Man&apos;s
                <span className="text-gradient block">Trusted Experts</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                ManxTints is a family-run business with deep roots in the Isle of Man. 
                As the island&apos;s go-to destination for premium window tinting, we combine 
                expert craftsmanship with the finest films to deliver results that exceed expectations.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Proudly serving all of the Isle of Man</span>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl overflow-hidden aspect-square"
              >
                <Image
                  src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80"
                  alt="Professional tinting work"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <Badge className="bg-primary text-primary-foreground">
                    <Shield className="h-3 w-3 mr-1" />
                    Premium Quality
                  </Badge>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <motion.div
                    className="text-4xl md:text-5xl font-bold text-gradient mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-xl overflow-hidden aspect-[3/4]"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80"
                      alt="Tinted car"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-xl overflow-hidden aspect-[3/4] mt-8"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
                      alt="Tinted home"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>
                {/* Floating badge */}
                <FloatingElement>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass rounded-xl px-6 py-4 flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">5-Star Rated</span>
                  </div>
                </FloatingElement>
              </div>
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <Badge variant="electric" className="mb-4">Our Story</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Crafting Excellence
                <span className="text-gradient block">Family Values</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ManxTints was born from a simple passion: the art of perfect window tinting. 
                  As a proud Manx family business with deep roots in the Isle of Man, we bring 
                  local knowledge and genuine care to every project we undertake.
                </p>
                <p>
                  Our dedication to quality and precision has quickly earned us a reputation 
                  for excellence. Word has spread across the island, from Douglas to Peel, 
                  Ramsey to Castletown. Today, we&apos;re proud to be the official IOM Government 
                  contractor and the go-to choice for customers who demand the best.
                </p>
                <p>
                  We only use premium films from manufacturers we trust completely — films that 
                  come with great warranties and proven performance. Combined with 
                  our meticulous installation process, we guarantee results that look stunning 
                  and last for years.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="electric" className="mb-4">Our Values</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What Drives Us
              </h2>
              <p className="text-lg text-muted-foreground">
                Every decision we make is guided by our core values. They&apos;re not 
                just words on a wall — they&apos;re how we run our business every day.
              </p>
            </div>
          </FadeIn>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="glass rounded-2xl p-8 text-center h-full"
                >
                  <FloatingElement>
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                      <value.icon className="h-8 w-8 text-background" />
                    </div>
                  </FloatingElement>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="electric" className="mb-4">Our Journey</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Milestones
              </h2>
            </div>
          </FadeIn>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

              {milestones.map((milestone, index) => (
                <FadeIn
                  key={milestone.year}
                  delay={index * 0.1}
                  direction={index % 2 === 0 ? "right" : "left"}
                >
                  <div className={`relative flex items-center gap-8 mb-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} pl-20 md:pl-0`}>
                      <Card className="inline-block bg-card/50 border-border/50">
                        <CardContent className="p-6">
                          <Badge variant="electric" className="mb-2">{milestone.year}</Badge>
                          <p className="text-lg">{milestone.event}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary electric-glow" />
                    <div className="flex-1 hidden md:block" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the ManxTints difference. Get your free quote today and 
              discover why we&apos;re the island&apos;s most trusted tinting service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button variant="electric" size="xl" className="gap-2 group">
                  Get Your Free Quote
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="xl">
                  Contact Us
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
