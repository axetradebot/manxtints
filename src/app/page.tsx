"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Sun, Eye, Zap, Award, Clock, Star, CheckCircle2, ThumbsUp, Users, Building2, Car, Home as HomeIcon, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn, Stagger, StaggerItem, FloatingElement, ScaleIn } from "@/components/motion"

const services = [
  {
    title: "Residential Tinting",
    description: "Elevate your home's comfort and style with our residential window tinting solutions. Enjoy natural light while maintaining privacy.",
    image: "/images/residential.jpg",
    href: "/services#residential",
    icon: HomeIcon,
    features: ["Natural Light", "Privacy", "Energy Savings"],
  },
  {
    title: "Commercial Tinting",
    description: "Create a professional and inviting atmosphere for your business with our commercial window tinting services. Enhance energy efficiency and reduce glare.",
    image: "/images/commercial.jpg",
    href: "/services#commercial",
    icon: Building2,
    features: ["Professional Look", "Energy Efficient", "Glare Reduction"],
  },
  {
    title: "Automotive Tinting",
    description: "Drive in style with our automotive window tinting. Experience superior UV protection, glare reduction, and a sleek look for your vehicle.",
    image: "/images/automotive.jpg",
    href: "/services#automotive",
    icon: Car,
    features: ["UV Protection", "Style Upgrade", "Sleek Look"],
  },
]

const whyChooseUs = [
  {
    icon: Users,
    title: "Professional and Friendly Staff",
    description: "Our expert team provides courteous service and exceptional results every time.",
  },
  {
    icon: Award,
    title: "Competitive Pricing",
    description: "Quality window tinting at fair, transparent prices with no hidden costs.",
  },
  {
    icon: Clock,
    title: "Hassle-free Booking Process",
    description: "Quick and easy booking. Get a quote and schedule your appointment effortlessly.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    description: "We stand behind our work with a satisfaction guarantee on every installation.",
  },
]

const testimonials = [
  {
    name: "Paul King",
    content: "A huge thank you to Manx Tints for the fantastic job on my living room windows. The service was top-notch from start to finish. Axel was very polite and professional throughout the process. If you are looking for high-quality window tinting, I highly recommend Axel at Manx Tints.",
    rating: 5,
    date: "January 2026",
  },
  {
    name: "Nina Marie Jensen",
    content: "We received a brilliant service from Axel from start to finish. Really pleased with our windows! Thanks very much!",
    rating: 5,
    date: "December 2025",
  },
  {
    name: "Tracey Brown",
    content: "Axel came today and fitted our two front windows with the tint, absolutely brilliant job, he is quick, efficient, neat and tidy and totally prepared. Really decent guy and I highly recommend him. Delighted with the job done.",
    rating: 5,
    date: "November 2025",
  },
  {
    name: "Ashlea Dentith",
    content: "Manx tints - what a lovely guy! Fantastic service, really pleased. Axel went above and beyond and fitted us in ASAP due to side effects from radiotherapy in my eye. I needed the brightness of the house reducing, it allowed me to be in my home after 9 days of being in a dark room. As well as some privacy on our large glass windows! Super clean and quick. Thanks Axel - always recommending you.",
    rating: 5,
    date: "July 2025",
  },
  {
    name: "Sue Perry",
    content: "My windows look fab! Privacy restored.. great customer service too. Would highly recommend.",
    rating: 5,
    date: "May 2025",
  },
  {
    name: "Kelly Dedman",
    content: "Windows look great! Excellent service, and the guys were quick, efficient and tidy. Highly recommend.",
    rating: 5,
    date: "March 2025",
  },
  {
    name: "Ara Hunter",
    content: "Axel from Manx Tints did a fantastic job at my home today. He was professional, quick, and precise with the window tinting. Very happy with the service!",
    rating: 5,
    date: "October 2024",
  },
  {
    name: "Moyra Kean",
    content: "A great job and the customer service is the best. I highly recommend them for all your window tints.",
    rating: 5,
    date: "March 2024",
  },
  {
    name: "Craig Walmsley",
    content: "Absolutely awesome job and so happy with what they have done to my windows. So professional, really nice people to speak to and rapid to getting a quote back and doing the job. I will be using them again to do my top windows in my house for sure.",
    rating: 5,
    date: "March 2024",
  },
  {
    name: "Becci Varey",
    content: "Got my car tinted by ManxTints and love the result. Highly recommend!!",
    rating: 5,
    date: "January 2024",
  },
  {
    name: "Brooke Cafearo",
    content: "I've had some privacy tint fitted on my lounge windows. I can see out but no one can see in! I'm SO impressed!!! Axe was efficient and professional! Would highly recommend!",
    rating: 5,
    date: "January 2024",
  },
]

const faqs = [
  // New FAQs from screenshots - added at top
  {
    question: "What is window tinting, and why should I consider it?",
    answer: "Window tinting involves applying a thin film to windows to enhance privacy, reduce glare, and block harmful UV rays. It adds a sleek aesthetic to your space and provides protection against sun damage.",
  },
  {
    question: "Does the privacy effect reverse at night?",
    answer: "No, unlike inferior window tint brands, our films use dual ceramic technology. They feature a reflective exterior layer for daytime privacy while maintaining a non-reflective interior layer, ensuring clear visibility from inside both day and night.",
  },
  {
    question: "How long does the window tinting process take?",
    answer: "The duration depends on the size and complexity of the project. Generally, for a standard installation, it can take a few hours. We'll provide you with a more accurate estimate during the consultation.",
  },
  {
    question: "How much does window tinting cost?",
    answer: "The pricing for our services is influenced by several factors, including the number of windows, accessibility, and the type of tint chosen. While the exact cost varies based on these considerations, a general estimate is around £60 per square meter.",
  },
  {
    question: "Can I choose the level of darkness for my window tint?",
    answer: "Absolutely! During the consultation, you can discuss your preferences, and we'll guide you through the available tinting options, including different levels of darkness and shades.",
  },
  {
    question: "Does window tinting provide UV protection?",
    answer: "Yes, our window tinting films are designed to block 99% of harmful UV rays, providing protection for your skin and preventing sun damage to your interiors.",
  },
  {
    question: "Will window tinting affect the visibility from inside or outside?",
    answer: "Our window tinting solutions are designed to maintain visibility from inside while enhancing privacy from the outside. We offer a range of tinting options to suit your preferences.",
  },
  {
    question: "Can I remove the window tint if needed?",
    answer: "Yes, our window tinting films can be safely removed free of charge. We use professional techniques to ensure a clean and residue-free removal process.",
  },
  {
    question: "What sets ManxTints apart from other window tinting services?",
    answer: "At ManxTints, we pride ourselves on delivering top-notch window tinting services with a focus on precision, customer satisfaction, and using high-quality materials. Our experienced team is dedicated to providing a seamless experience for our clients.",
  },
  {
    question: "How do I schedule a consultation for window tinting services?",
    answer: "It's easy! Simply contact us through our website, phone, or email to schedule a consultation. We'll discuss your needs, provide recommendations, and give you a detailed quote.",
  },
  {
    question: "How long will the window tint last, and is there a Guarantee?",
    answer: "Our high-quality window tinting films are durable and come with a 10 year guarantee. The lifespan may vary based on factors like sun exposure and maintenance, but you can expect long-lasting results.",
  },
  // Original FAQs
  {
    question: "What types of window tinting do you offer?",
    answer: "We offer three main types of window tinting services: Residential Tinting for homes (privacy, energy savings, UV protection), Commercial Tinting for businesses (professional appearance, energy efficiency, glare reduction), and Automotive Tinting for vehicles (UV protection, style, privacy). Each service uses premium films tailored to your specific needs.",
  },
  {
    question: "Is window tinting legal on the Isle of Man?",
    answer: "Yes, window tinting is legal on the Isle of Man. For vehicles, front side windows must allow at least 70% light transmission, while rear windows can have any tint level. We ensure all our automotive installations comply with local regulations.",
  },
  {
    question: "Can I wash my windows after tinting?",
    answer: "We recommend waiting 3-5 days after installation before cleaning your newly tinted windows. This allows the film to fully cure. After that, use a soft cloth and ammonia-free cleaning products. Avoid abrasive materials that could scratch the film.",
  },
  {
    question: "What areas do you cover?",
    answer: "We provide window tinting services across the entire Isle of Man. Whether you're in Douglas, Ramsey, Peel, Castletown, or anywhere else on the island, we can come to you for automotive tinting or arrange installation for your home or business.",
  },
]

export default function Home() {
  return (
    <div className="relative bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />
        
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-60" />

        {/* Hero content */}
        <div className="container mx-auto px-4 z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn delay={0.2}>
                <Badge className="mb-6 text-sm px-4 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  🇮🇲 Isle of Man&apos;s Trusted Window Tinting
                </Badge>
              </FadeIn>

              <FadeIn delay={0.3}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-slate-800">
                  Shading Excellence,
                  <span className="block text-gradient">One Window</span>
                  <span className="block">At a Time.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.4}>
                <p className="text-xl text-slate-600 mb-8 max-w-xl leading-relaxed">
                  Professional window tinting for homes, businesses, and vehicles across the Isle of Man. 
                  Quality films, expert installation, satisfaction guaranteed.
                </p>
              </FadeIn>

              <FadeIn delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/quote">
                    <Button size="xl" className="gap-2 group bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">
                      Get a Free Quote
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="outline" size="xl" className="gap-2 border-slate-300 hover:bg-slate-50">
                      View Our Services
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              {/* Trust badges */}
              <FadeIn delay={0.6}>
                <div className="flex flex-wrap gap-6 mt-12 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Free Quotes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Satisfaction Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <span>Island-Wide Service</span>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Hero Image */}
            <FadeIn direction="left" delay={0.4}>
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src="/images/hero.jpg"
                    alt="Professional window tinting"
                    width={600}
                    height={500}
                    className="object-cover w-full h-[500px]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
                </motion.div>
                
                {/* Floating review card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">5-Star Rated</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Trusted by customers across the Isle of Man</p>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Why Choose Us</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                Why Choose
                <span className="text-gradient block">ManxTints?</span>
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                We&apos;re committed to excellence in every installation, delivering quality results 
                that exceed expectations.
              </p>
            </div>
          </FadeIn>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <StaggerItem key={item.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg border border-slate-100 h-full card-hover"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Our Services</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                Professional Tinting
                <span className="text-gradient block">For Every Need</span>
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                From cosy homes to sleek vehicles, we deliver premium window tinting 
                solutions tailored to your needs.
              </p>
            </div>
          </FadeIn>

          <Stagger className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <StaggerItem key={service.title}>
                <Link href={service.href}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group overflow-hidden bg-white border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 h-full">
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center shadow">
                            <service.icon className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 flex-wrap">
                          {service.features.map((feature) => (
                            <Badge key={feature} className="bg-white/90 text-slate-700 backdrop-blur text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-semibold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">
                          {service.description}
                        </p>
                        <div className="flex items-center text-blue-600 font-medium">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">Testimonials</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                Here&apos;s What Our
                <span className="text-gradient block">Customers Say</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xl font-semibold text-slate-800">100% Recommend</span>
                <span className="text-slate-500">({testimonials.length} Reviews)</span>
              </div>
              <a 
                href="https://www.facebook.com/manxtints/reviews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                View all reviews on Facebook
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </FadeIn>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={testimonial.name}>
                <Card className="bg-white border-slate-200 shadow-lg h-full card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">{testimonial.date}</span>
                    </div>
                    <p className="text-slate-600 italic leading-relaxed mb-4 line-clamp-4">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">{testimonial.name}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn delay={0.4}>
            <div className="text-center mt-10">
              <a 
                href="https://www.facebook.com/manxtints/reviews" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Leave Us a Review on Facebook
                </Button>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMzBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTMwIDBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMzBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6TTYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAtMzBjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Windows?
              </h2>
              <p className="text-xl text-blue-100 mb-10">
                Get your free, no-obligation quote today. Experience the ManxTints difference — 
                professional service, quality results, satisfaction guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quote">
                  <Button size="xl" className="gap-2 group bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Get a Free Quote
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="xl" className="gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" id="faq">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                <HelpCircle className="h-3 w-3 mr-1" />
                FAQ
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
                Frequently Asked
                <span className="text-gradient block">Questions</span>
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Got questions? We&apos;ve got answers. Here are some of the most common 
                questions we receive about our window tinting services.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-slate-50 rounded-xl px-6 border border-slate-200 shadow-sm"
                  >
                    <AccordionTrigger className="text-left text-slate-800 hover:text-blue-600 font-medium py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">Still have questions?</p>
              <Link href="/contact">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
