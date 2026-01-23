"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    value: "+44 7624 331401",
    href: "tel:+447624331401",
    description: "9am-5pm, 7 days a week",
  },
  {
    icon: Mail,
    title: "Email",
    value: "manxtints@gmail.com",
    href: "mailto:manxtints@gmail.com",
    description: "We reply within 24 hours",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Douglas, Isle of Man",
    href: "https://maps.google.com",
    description: "IM2 1BB",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "9am - 5pm",
    href: null,
    description: "7 Days a Week",
  },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Contact us"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="electric" className="mb-6">Get In Touch</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Contact
                <span className="text-gradient block">ManxTints</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Have a question or ready to get started? We&apos;d love to hear from you. 
                Reach out using any of the methods below.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <StaggerItem key={info.title}>
                <motion.div whileHover={{ y: -5 }}>
                  <Card className="glass border-border/50 h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                        <info.icon className="h-7 w-7 text-background" />
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                      {info.href ? (
                        <a 
                          href={info.href}
                          className="text-primary hover:underline block mb-1"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-primary mb-1">{info.value}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeIn>
              <div className="glass rounded-2xl p-8 md:p-10">
                <h2 className="text-3xl font-bold mb-2">Send Us a Message</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-background" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for contacting us. We&apos;ll be in touch soon.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="John Smith"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="+44 7624 000 000"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us about your project or ask us a question..."
                        rows={5}
                        className="bg-background/50 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="electric"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </FadeIn>

            {/* Map & Info */}
            <FadeIn direction="left" delay={0.2}>
              <div className="space-y-8">
                {/* Map placeholder */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-card">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37614.83395888!2d-4.5!3d54.15!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486391ec69d1b1bf%3A0x4dda12d4e81bdec4!2sDouglas%2C%20Isle%20of%20Man!5e0!3m2!1sen!2suk!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>

                {/* Social links */}
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                    <p className="text-muted-foreground mb-4">
                      Stay updated with our latest projects and offers on social media.
                    </p>
                    <div className="flex gap-4">
                      <motion.a
                        href="https://facebook.com/manxtints"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                        <span>Facebook</span>
                      </motion.a>
                      <motion.a
                        href="https://instagram.com/manxtints"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        <span>Instagram</span>
                      </motion.a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for Your Free Quote?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Skip the contact form and get straight to your personalized quote.
              It&apos;s fast, easy, and completely free.
            </p>
            <Link href="/quote">
              <Button variant="electric" size="xl" className="gap-2">
                Get Your Free Quote
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
