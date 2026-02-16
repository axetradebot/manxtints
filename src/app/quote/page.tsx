"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, 
  ArrowLeft,
  Calendar, 
  Calculator, 
  Car, 
  Truck, 
  Home, 
  Building2, 
  Sun,
  CheckCircle2,
  Plus,
  Minus,
  X,
  Info,
  Shield,
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn, Stagger, StaggerItem } from "@/components/motion"

// Vehicle pricing configuration
const vehiclePricing = {
  car: {
    "2": { price: 200, windows: "Rear 3 windows + boot", description: "Back 3 windows including boot window" },
    "4": { price: 250, windows: "Rear 5 windows + boot", description: "All passenger windows + boot window" }
  },
  suv: {
    "2": { price: 250, windows: "Rear windows + boot", description: "All rear windows including boot" },
    "4": { price: 300, windows: "Rear 4 windows + boot", description: "All passenger windows + boot window" }
  }
} as const

const propertyTypes = [
  { id: "house", label: "Residential", icon: Home },
  { id: "conservatory", label: "Conservatory", icon: Sun },
  { id: "commercial", label: "Commercial", icon: Building2 },
]

// Film types with pricing per m² - SAVED FOR FUTURE USE
// Uncomment when different film types are in stock
/*
const filmTypes = [
  { 
    id: "basic", 
    name: "Standard Dyed Film", 
    pricePerSqM: 15, 
    description: "Great value, good appearance" 
  },
  { 
    id: "privacy", 
    name: "Privacy / Carbon Film", 
    pricePerSqM: 20, 
    description: "Enhanced privacy, superior heat rejection" 
  },
  { 
    id: "ceramic", 
    name: "Premium Ceramic Film", 
    pricePerSqM: 25, 
    description: "Best performance, crystal clarity" 
  },
]
*/

// Labour costs
const labourCosts = {
  car: { min: 80, max: 120 },
  van: { min: 100, max: 150 },
  suv: { min: 100, max: 140 },
  house: { min: 80, max: 120 },
  conservatory: { min: 120, max: 180 },
  commercial: { min: 150, max: 250 },
}

interface Window {
  id: string
  name: string
  width: number
  height: number
}

const faqs = [
  {
    question: "How accurate is the DIY calculator?",
    answer: "The calculator provides a rough estimate based on typical measurements and pricing. Actual costs may vary based on window complexity, film type availability, and installation requirements. We'll confirm the exact price during our free consultation.",
  },
  {
    question: "Is the home visit really free?",
    answer: "Absolutely! We offer free, no-obligation consultations across the Isle of Man. We'll assess your needs, take precise measurements, and provide an accurate quote — all at no cost to you.",
  },
  {
    question: "How long until I receive my quote?",
    answer: "For home visit requests, we typically schedule within 2-3 days and provide your quote immediately after the visit. For DIY calculator submissions, we'll review your measurements and send a detailed quote within 24 hours.",
  },
  {
    question: "Can I change my mind after getting a quote?",
    answer: "Of course! Our quotes are completely obligation-free. Take your time to decide — there's no pressure and no expiry on quotes.",
  },
]

export default function QuotePage() {
  const [activeTab, setActiveTab] = useState("visit")
  
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1920&q=80"
            alt="Get a quote"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="electric" className="mb-6">Free Quote</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Get Your
                <span className="text-gradient block">Free Quote</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Two ways to get your personalized quote: request a free home visit 
                or use our instant DIY calculator for a rough estimate.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quote Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="visit" className="space-y-12" onValueChange={setActiveTab}>
            <FadeIn>
              <TabsList className="grid grid-cols-2 max-w-2xl mx-auto h-auto p-2 bg-card/50">
                <TabsTrigger 
                  value="visit" 
                  className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="hidden sm:inline">Request Free Visit</span>
                  <span className="sm:hidden">Free Visit</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calculator" 
                  className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="hidden sm:inline">DIY Calculator</span>
                  <span className="sm:hidden">Calculator</span>
                </TabsTrigger>
              </TabsList>
            </FadeIn>

            <TabsContent value="visit">
              <VisitRequestForm />
            </TabsContent>

            <TabsContent value="calculator">
              <DIYCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <Badge variant="electric" className="mb-4">FAQ</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Quote Questions
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
    </div>
  )
}

// Visit Request Form Component
function VisitRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [projectType, setProjectType] = useState<"vehicle" | "property">("property")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    // Add project type to form data
    formData.append('_subject', `New Visit Request - ${projectType === 'property' ? 'Property' : 'Vehicle'}`)
    formData.append('Project Type', projectType === 'property' ? 'Property' : 'Vehicle')
    
    try {
      const response = await fetch('https://formspree.io/f/mpqpzwve', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert('There was an error submitting the form. Please try again.')
      }
    } catch (error) {
      alert('There was an error submitting the form. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <FadeIn>
        <Card className="max-w-2xl mx-auto glass">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-background" />
            </motion.div>
            <h3 className="text-3xl font-bold mb-4">Request Sent!</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your request. We&apos;ll be in touch within 24 hours 
              to confirm your appointment.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" size="lg">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <Card className="max-w-2xl mx-auto glass">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Request a Free Home/Vehicle Visit</CardTitle>
          <CardDescription>
            We&apos;ll come to you, assess your needs, and provide an accurate quote on the spot.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Type Toggle */}
            <div className="space-y-2">
              <Label>What would you like tinted?</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={projectType === "property" ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setProjectType("property")}
                >
                  <Home className="h-6 w-6" />
                  <span>Property</span>
                </Button>
                <Button
                  type="button"
                  variant={projectType === "vehicle" ? "default" : "outline"}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setProjectType("vehicle")}
                >
                  <Car className="h-6 w-6" />
                  <span>Vehicle</span>
                </Button>
              </div>
            </div>

            {/* Contact Details */}
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

            {/* Conditional Fields */}
            <AnimatePresence mode="wait">
              {projectType === "vehicle" ? (
                <motion.div
                  key="vehicle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="vehicleReg">Vehicle Registration *</Label>
                    <Input
                      id="vehicleReg"
                      name="vehicleReg"
                      required
                      placeholder="MAN 123"
                      className="bg-background/50 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select name="vehicleType">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV / 4x4</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="property"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      placeholder="123 Main Street"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      required
                      placeholder="IM1 1AA"
                      className="bg-background/50 uppercase"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Information</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us more about your requirements..."
                rows={4}
                className="bg-background/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="electric"
              size="xl"
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
                  Submitting...
                </>
              ) : (
                <>
                  Request Free Visit
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </FadeIn>
  )
}

// DIY Calculator Component
function DIYCalculator() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<"vehicle" | "property" | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  // Vehicle-specific state
  const [vehicleType, setVehicleType] = useState<"car" | "suv" | null>(null)
  const [doorCount, setDoorCount] = useState<"2" | "4" | null>(null)
  // const [selectedFilm, setSelectedFilm] = useState(filmTypes[1]) // SAVED FOR FUTURE USE
  const [windows, setWindows] = useState<Window[]>([])
  const [extendedGuarantee, setExtendedGuarantee] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const addWindow = () => {
    setWindows([
      ...windows,
      { id: crypto.randomUUID(), name: `Window ${windows.length + 1}`, width: 0, height: 0 }
    ])
  }

  const updateWindow = (id: string, field: keyof Window, value: string | number) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ))
  }

  const removeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id))
  }

  // Price per square meter for property types
  const propertyPrices: Record<string, number> = {
    house: 89,        // Residential: £89 per m²
    conservatory: 130, // Conservatory: £130 per m²
    commercial: 98,   // Commercial: £98 per m²
  }

  // Get vehicle price from selected options
  const getVehiclePrice = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return 0
    return vehiclePricing[vehicleType][doorCount].price
  }

  // Get vehicle description from selected options
  const getVehicleDescription = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return ""
    return vehiclePricing[vehicleType][doorCount].description
  }

  // Get vehicle windows info from selected options
  const getVehicleWindows = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return ""
    return vehiclePricing[vehicleType][doorCount].windows
  }

  // Get vehicle label from selected options
  const getVehicleLabel = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return ""
    return `${doorCount} Door ${vehicleType.toUpperCase()}`
  }

  // Check if vehicle selection is complete
  const isVehicleComplete = () => {
    return category === "vehicle" && vehicleType !== null && doorCount !== null
  }

  // Guarantee pricing
  const guaranteePrice = 17

  // Calculate totals
  const calculateTotals = () => {
    // For vehicles, use fixed pricing
    if (category === "vehicle") {
      const vehiclePrice = getVehiclePrice()
      const guaranteeCost = extendedGuarantee ? guaranteePrice : 0
      const baseQuote = vehiclePrice
      const totalWithGuarantee = baseQuote + guaranteeCost
      return {
        totalAreaSqM: "N/A",
        pricePerSqM: 0,
        baseQuote: baseQuote.toFixed(2),
        totalQuote: totalWithGuarantee.toFixed(2),
        guaranteeCost: guaranteeCost,
        isVehicle: true,
        vehicleLabel: getVehicleLabel(),
        vehicleDescription: getVehicleDescription(),
      }
    }

    // For properties, calculate based on area
    const totalAreaCm = windows.reduce((sum, w) => sum + (w.width * w.height), 0)
    const totalAreaSqM = totalAreaCm / 10000 // Convert cm² to m²
    
    const pricePerSqM = selectedType && category === "property" 
      ? propertyPrices[selectedType] || 60 
      : 0
    const baseQuote = totalAreaSqM * pricePerSqM
    const guaranteeCost = extendedGuarantee ? guaranteePrice : 0
    const totalWithGuarantee = baseQuote + guaranteeCost

    return {
      totalAreaSqM: totalAreaSqM.toFixed(2),
      pricePerSqM,
      baseQuote: baseQuote.toFixed(2),
      totalQuote: totalWithGuarantee.toFixed(2),
      guaranteeCost: guaranteeCost,
      isVehicle: false,
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    const currentTotals = calculateTotals()
    
    if (category === "vehicle") {
      // Vehicle submission
      const vehicleLabel = getVehicleLabel()
      const vehicleDescription = getVehicleDescription()
      
      formData.append('_subject', `New Vehicle Quote Request - ${vehicleLabel} - £${currentTotals.totalQuote}${extendedGuarantee ? ' (15yr Guarantee)' : ''}`)
      formData.append('Category', 'Vehicle')
      formData.append('Vehicle Type', vehicleLabel)
      formData.append('Package', vehicleDescription)
      formData.append('Guarantee', extendedGuarantee ? '15 Year Guarantee (+£17)' : 'Standard 5 Year Guarantee')
      formData.append('Quote', `£${currentTotals.totalQuote}`)
    } else {
      // Property submission
      const projectTypeName = selectedType === 'house' ? 'Residential' : 
                             selectedType === 'conservatory' ? 'Conservatory' : 
                             selectedType === 'commercial' ? 'Commercial' : selectedType
      
      formData.append('_subject', `New Property Quote Request - ${projectTypeName} - £${currentTotals.totalQuote}${extendedGuarantee ? ' (15yr Guarantee)' : ''}`)
      formData.append('Category', 'Property')
      formData.append('Project Type', projectTypeName || 'Not specified')
      formData.append('Total Area (m²)', currentTotals.totalAreaSqM)
      formData.append('Price per m²', `£${currentTotals.pricePerSqM}`)
      formData.append('Guarantee', extendedGuarantee ? '15 Year Guarantee (+£17)' : 'Standard 5 Year Guarantee')
      formData.append('Estimated Quote', `£${currentTotals.totalQuote}`)
      formData.append('Number of Windows', windows.length.toString())
      
      // Add individual window measurements
      windows.forEach((window, index) => {
        const areaCm = window.width * window.height
        const areaSqM = (areaCm / 10000).toFixed(2)
        formData.append(`Window ${index + 1}`, `${window.name}: ${window.width}cm x ${window.height}cm = ${areaSqM}m²`)
      })
      
      // Add property address details
      const houseName = formData.get('houseName')
      const postcode = formData.get('postcode')
      if (houseName) formData.append('House Name/Number', houseName.toString())
      if (postcode) formData.append('Postcode', postcode.toString())
    }
    
    try {
      const response = await fetch('https://formspree.io/f/mpqpzwve', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert('There was an error submitting the form. Please try again.')
      }
    } catch (error) {
      alert('There was an error submitting the form. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const totals = calculateTotals()

  if (isSubmitted) {
    return (
      <FadeIn>
        <Card className="max-w-2xl mx-auto glass">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-background" />
            </motion.div>
            <h3 className="text-3xl font-bold mb-4">Quote Request Sent!</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you! We&apos;ll review your measurements and send you an 
              accurate quote within 24 hours.
            </p>
            <Button onClick={() => {
              setIsSubmitted(false)
              setStep(1)
              setCategory(null)
              setSelectedType(null)
              setVehicleType(null)
              setDoorCount(null)
              setWindows([])
              setExtendedGuarantee(false)
            }} variant="outline" size="lg">
              Start New Quote
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Show 2 steps for vehicles, 4 steps for properties */}
            {(category === "vehicle" ? [1, 2] : [1, 2, 3, 4]).map((s, index, arr) => {
              // For vehicles: step 1 = select, step 4 = review (displayed as step 2)
              const displayStep = category === "vehicle" && s === 2 ? 2 : s
              const isActive = category === "vehicle" 
                ? (s === 1 ? step >= 1 : step >= 4)
                : step >= s
              const lineActive = category === "vehicle"
                ? (s === 1 ? step >= 4 : false)
                : step > s
              
              return (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {displayStep}
                  </div>
                  {index < arr.length - 1 && (
                    <div className={`w-12 h-1 mx-1 rounded transition-all ${
                      lineActive ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-center text-muted-foreground">
            {step === 1 && "Select what you want tinted"}
            {step === 2 && category === "property" && "Enter window measurements"}
            {step === 3 && "Upgrade your guarantee"}
            {step === 4 && "Review & submit"}
          </p>
        </div>

        <Card className="glass">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Category */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">What would you like to tint?</h3>
                    <p className="text-muted-foreground">Select your project type to get started</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Vehicle */}
                    <motion.div whileHover={{ scale: category === "vehicle" ? 1 : 1.02 }}>
                      <Card 
                        className={`cursor-pointer transition-all h-full ${
                          category === "vehicle" 
                            ? "border-primary bg-primary/5" 
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setCategory("vehicle")
                          // Reset vehicle selection when clicking the card
                          if (category !== "vehicle") {
                            setVehicleType(null)
                            setDoorCount(null)
                          }
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                            <Car className="h-8 w-8 text-background" />
                          </div>
                          <h4 className="text-xl font-semibold text-center mb-2">Vehicle</h4>
                          <p className="text-sm text-muted-foreground text-center">
                            Car or SUV window tinting
                          </p>
                          
                          {/* Vehicle Selection Flow */}
                          {category === "vehicle" && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-6 space-y-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Step 1: Vehicle Type */}
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-center flex items-center justify-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                                  Choose your vehicle type
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  {/* Car Option */}
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setVehicleType("car")
                                      setDoorCount(null)
                                    }}
                                    className={`relative p-4 rounded-xl border-2 transition-all ${
                                      vehicleType === "car"
                                        ? "border-primary bg-primary/10 shadow-lg"
                                        : "border-border hover:border-primary/50 bg-background"
                                    }`}
                                  >
                                    {vehicleType === "car" && (
                                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      </div>
                                    )}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Car className="h-6 w-6 text-white" />
                                      </div>
                                      <span className="font-semibold text-sm">Car</span>
                                      <span className="text-xs text-muted-foreground">Sedan, Hatchback, Coupe</span>
                                    </div>
                                  </motion.button>

                                  {/* SUV Option */}
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                      setVehicleType("suv")
                                      setDoorCount(null)
                                    }}
                                    className={`relative p-4 rounded-xl border-2 transition-all ${
                                      vehicleType === "suv"
                                        ? "border-primary bg-primary/10 shadow-lg"
                                        : "border-border hover:border-primary/50 bg-background"
                                    }`}
                                  >
                                    {vehicleType === "suv" && (
                                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="h-3 w-3 text-primary-foreground" />
                                      </div>
                                    )}
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <Truck className="h-6 w-6 text-white" />
                                      </div>
                                      <span className="font-semibold text-sm">SUV</span>
                                      <span className="text-xs text-muted-foreground">4x4, Crossover, Jeep</span>
                                    </div>
                                  </motion.button>
                                </div>
                              </div>

                              {/* Step 2: Door Count - Only show if vehicle type selected */}
                              <AnimatePresence>
                                {vehicleType && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3"
                                  >
                                    <p className="text-sm font-medium text-center flex items-center justify-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
                                      How many doors?
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                      {/* 2 Door Option */}
                                      <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDoorCount("2")}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${
                                          doorCount === "2"
                                            ? "border-primary bg-primary/10 shadow-lg"
                                            : "border-border hover:border-primary/50 bg-background"
                                        }`}
                                      >
                                        {doorCount === "2" && (
                                          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                          </div>
                                        )}
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-2xl font-bold text-primary">2</span>
                                          <span className="font-semibold text-sm">Door</span>
                                          <span className="text-xs text-muted-foreground">
                                            {vehicleType === "car" ? "Coupe style" : "3-door SUV"}
                                          </span>
                                        </div>
                                      </motion.button>

                                      {/* 4 Door Option */}
                                      <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDoorCount("4")}
                                        className={`relative p-4 rounded-xl border-2 transition-all ${
                                          doorCount === "4"
                                            ? "border-primary bg-primary/10 shadow-lg"
                                            : "border-border hover:border-primary/50 bg-background"
                                        }`}
                                      >
                                        {doorCount === "4" && (
                                          <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="h-3 w-3 text-primary-foreground" />
                                          </div>
                                        )}
                                        <div className="flex flex-col items-center gap-1">
                                          <span className="text-2xl font-bold text-primary">4</span>
                                          <span className="font-semibold text-sm">Door</span>
                                          <span className="text-xs text-muted-foreground">
                                            {vehicleType === "car" ? "Sedan, Hatchback" : "5-door SUV"}
                                          </span>
                                        </div>
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Price Display - Only show when both selected */}
                              <AnimatePresence>
                                {vehicleType && doorCount && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-gradient-to-r from-primary/20 to-cyan-400/20 rounded-xl p-4 text-center"
                                  >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <Sparkles className="h-5 w-5 text-primary" />
                                      <span className="text-sm font-medium">Your Package</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gradient mb-1">
                                      £{getVehiclePrice()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {getVehicleWindows()}
                                    </p>
                                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                                      <Shield className="h-4 w-4" />
                                      <span>Premium film with 5 year guarantee</span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* IOM Regulations Notice */}
                              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                                <div className="flex gap-3">
                                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                  <div className="text-xs space-y-1">
                                    <p className="font-semibold text-amber-800 dark:text-amber-200">Isle of Man Regulations</p>
                                    <p className="text-amber-700 dark:text-amber-300">
                                      Front side windows cannot be tinted darker than factory glass. 
                                      Our packages cover rear and back windows only, fully compliant with IOM law.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Van Notice */}
                              <p className="text-xs text-muted-foreground text-center italic">
                                <Info className="h-3 w-3 inline mr-1" />
                                Unfortunately, we currently can&apos;t tint vans due to height restrictions at our premises. 
                                We&apos;re working hard to make this possible soon!
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Property */}
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card 
                        className={`cursor-pointer transition-all h-full ${
                          category === "property" 
                            ? "border-primary bg-primary/10" 
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setCategory("property")}
                      >
                        <CardContent className="p-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                            <Home className="h-8 w-8 text-background" />
                          </div>
                          <h4 className="text-xl font-semibold text-center mb-2">Property</h4>
                          <p className="text-sm text-muted-foreground text-center">
                            House, Conservatory, or Commercial
                          </p>
                          {category === "property" && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {propertyTypes.map((type) => (
                                <Button
                                  key={type.id}
                                  variant={selectedType === type.id ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs px-2 truncate"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedType(type.id)
                                  }}
                                >
                                  {type.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* IOM Tint Regulations Note for Vehicles */}
                  {category === "vehicle" && selectedType && (
                    <div className="glass rounded-xl p-4 flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Please note:</strong> Due to Isle of Man tint regulations, we cannot tint 
                        the front windows any darker than factory tint.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      variant="electric"
                      size="lg"
                      onClick={() => {
                        // Vehicles skip to step 3 (guarantee), properties go to step 2 (measurements)
                        if (category === "vehicle") {
                          setStep(3)
                        } else {
                          if (windows.length === 0) addWindow()
                          setStep(2)
                        }
                      }}
                      disabled={category === "vehicle" ? !isVehicleComplete() : !selectedType}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 (Film Type Selection) - SAVED FOR FUTURE USE
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Choose Your Film Type</h3>
                    <p className="text-muted-foreground">Different films offer different benefits and price points</p>
                  </div>

                  <div className="space-y-4">
                    {filmTypes.map((film) => (
                      <motion.div key={film.id} whileHover={{ scale: 1.01 }}>
                        <Card 
                          className={`cursor-pointer transition-all ${
                            selectedFilm.id === film.id 
                              ? "border-primary bg-primary/10" 
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedFilm(film)}
                        >
                          <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 ${
                                selectedFilm.id === film.id 
                                  ? "border-primary bg-primary" 
                                  : "border-muted-foreground"
                              }`}>
                                {selectedFilm.id === film.id && (
                                  <CheckCircle2 className="h-4 w-4 text-background" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">{film.name}</h4>
                                <p className="text-sm text-muted-foreground">{film.description}</p>
                              </div>
                            </div>
                            <Badge variant="electric">£{film.pricePerSqM}/m²</Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      variant="electric"
                      size="lg"
                      onClick={() => {
                        if (windows.length === 0) addWindow()
                        setStep(3)
                      }}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
              */}

              {/* Step 2: Enter Measurements */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Enter Window Measurements</h3>
                    <p className="text-muted-foreground">
                      Measure each window in centimeters (width × height)
                    </p>
                  </div>

                  <div className="glass rounded-xl p-4 flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> For houses, measure just the visible glass of each window, 
                      not the frame. Don&apos;t worry about being exact — we&apos;ll confirm measurements 
                      during our visit.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {windows.map((window, index) => (
                      <motion.div
                        key={window.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-12 gap-4 items-end"
                      >
                        <div className="col-span-12 sm:col-span-4">
                          <Label>Window Name</Label>
                          <Input
                            value={window.name}
                            onChange={(e) => updateWindow(window.id, 'name', e.target.value)}
                            placeholder={`Window ${index + 1}`}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-3">
                          <Label>Width (cm)</Label>
                          <Input
                            type="number"
                            value={window.width || ''}
                            onChange={(e) => updateWindow(window.id, 'width', parseInt(e.target.value) || 0)}
                            placeholder="100"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="col-span-5 sm:col-span-3">
                          <Label>Height (cm)</Label>
                          <Input
                            type="number"
                            value={window.height || ''}
                            onChange={(e) => updateWindow(window.id, 'height', parseInt(e.target.value) || 0)}
                            placeholder="60"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWindow(window.id)}
                            disabled={windows.length === 1}
                            className="hover:bg-destructive/20 hover:text-destructive"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addWindow}
                    className="w-full gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Another Window
                  </Button>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      variant="electric"
                      size="lg"
                      onClick={() => setStep(3)}
                      disabled={windows.some(w => w.width === 0 || w.height === 0)}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 15 Year Guarantee Upsell */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                    >
                      <Shield className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Upgrade to 15 Year Guarantee</h3>
                    <p className="text-muted-foreground">
                      Ultimate peace of mind for just a little extra
                    </p>
                  </div>

                  {/* Upsell Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <Card 
                      className={`cursor-pointer transition-all overflow-hidden ${
                        extendedGuarantee 
                          ? "border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 shadow-xl shadow-amber-500/20" 
                          : "border-2 border-dashed border-border hover:border-amber-500/50"
                      }`}
                      onClick={() => setExtendedGuarantee(!extendedGuarantee)}
                    >
                      {extendedGuarantee && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <motion.div 
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              extendedGuarantee 
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500" 
                                : "border-muted-foreground/50"
                            }`}
                            whileTap={{ scale: 0.9 }}
                          >
                            {extendedGuarantee && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                              >
                                <Check className="h-5 w-5 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                              <h4 className="text-xl font-bold">15 Year Guarantee</h4>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-lg px-3 py-1">
                                  Just +£17
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-muted-foreground mb-4">
                              Get <span className="font-semibold text-foreground">triple the coverage</span> of our standard 5-year guarantee. 
                              Any problems at all? We&apos;ve got you covered.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm">Peeling? <span className="font-medium">Replaced free</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm">Bubbles? <span className="font-medium">Replaced free</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm">Discoloration? <span className="font-medium">Replaced free</span></span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="text-sm">Any issues? <span className="font-medium">No questions asked</span></span>
                              </div>
                            </div>

                            {extendedGuarantee && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t border-amber-500/30"
                              >
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                  <Sparkles className="h-5 w-5" />
                                  <span className="font-semibold">You&apos;re covered for 15 years!</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Value proposition */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      That&apos;s just <span className="font-semibold text-foreground">£1.13 per year</span> for complete peace of mind
                    </p>
                  </motion.div>

                  {/* Skip option */}
                  {!extendedGuarantee && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Not interested? No problem — you&apos;re still covered by our standard 5-year guarantee
                    </motion.p>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(category === "vehicle" ? 1 : 2)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Back
                    </Button>
                    <Button
                      variant="electric"
                      size="lg"
                      onClick={() => setStep(4)}
                      className="gap-2"
                    >
                      {extendedGuarantee ? "Continue with 15 Year Guarantee" : "Continue with Standard Guarantee"}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Your Quote Summary</h3>
                    <p className="text-muted-foreground">
                      Review your details and submit for an accurate quote
                    </p>
                  </div>

                  {/* Summary for Properties */}
                  {category === "property" && (
                    <div className="glass rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Project Type</span>
                        <span className="font-medium capitalize">{selectedType === "house" ? "Residential" : selectedType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Windows</span>
                        <span className="font-medium">{windows.length} window{windows.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Area</span>
                        <span className="font-medium">{totals.totalAreaSqM} m²</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price per m²</span>
                        <span className="font-medium">£{totals.pricePerSqM}</span>
                      </div>
                    </div>
                  )}

                  {/* Summary for Vehicles */}
                  {category === "vehicle" && (
                    <div className="glass rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Vehicle Type</span>
                        <span className="font-medium">{getVehicleLabel()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Package</span>
                        <span className="font-medium">{getVehicleDescription()}</span>
                      </div>
                    </div>
                  )}

                  {/* Guarantee Selection */}
                  {extendedGuarantee && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative overflow-hidden rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-red-500/10 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">15 Year Guarantee</p>
                            <p className="text-sm text-muted-foreground">Complete peace of mind</p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          +£17
                        </Badge>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Options */}
                  <div className="space-y-4">
                    {/* Main Option: 4 Weekly Payments */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-cyan-400/10"
                    >
                      {/* Recommended badge */}
                      <div className="absolute top-0 right-0">
                        <div className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          RECOMMENDED
                        </div>
                      </div>
                      
                      <div className="p-6 pt-8 text-center">
                        <p className="text-sm font-medium text-primary mb-3">Pay in 4 Easy Weekly Instalments</p>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-5xl font-bold text-gradient">
                            £{(parseFloat(totals.totalQuote) / 4).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground font-medium">/week</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total: £{totals.totalQuote} over 4 weeks
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            No interest
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            No credit check
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            Flexible
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Alternative: Lump Sum with Discount */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-xl border border-border/50 bg-card/50 p-5"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-sm font-medium mb-1">Or pay in full & save 10%</p>
                          <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <span className="text-2xl font-bold text-gradient">
                              £{(parseFloat(totals.totalQuote) * 0.9).toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              £{totals.totalQuote}
                            </span>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                              SAVE £{(parseFloat(totals.totalQuote) * 0.1).toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Custom Payment Message */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative rounded-xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Need smaller weekly payments?</p>
                          <p className="text-sm text-muted-foreground">
                            Just message the ManxTints team and we&apos;ll find a payment plan that suits you! 
                            We&apos;re flexible and here to help. 💬
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <p className="text-xs text-center text-muted-foreground">
                      {category === "vehicle" 
                        ? "*Price includes rear windows as specified"
                        : "*Final price confirmed after professional assessment"
                      }
                    </p>
                  </div>

                  {/* IOM Regulation Note for Vehicles */}
                  {category === "vehicle" && (
                    <div className="glass rounded-xl p-4 flex items-start gap-3">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <strong>Please note:</strong> Due to Isle of Man tint regulations, we cannot tint 
                        the front windows any darker than factory tint.
                      </p>
                    </div>
                  )}

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-center text-muted-foreground">
                      Happy with the quote? Let&apos;s get you booked in!
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="calcName">Full Name *</Label>
                        <Input
                          id="calcName"
                          name="name"
                          required
                          placeholder="John Smith"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calcPhone">Phone Number *</Label>
                        <Input
                          id="calcPhone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="+44 7624 000 000"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calcEmail">Email Address *</Label>
                      <Input
                        id="calcEmail"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="bg-background/50"
                      />
                    </div>

                    {category === "property" && (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="calcHouseName">House Name / Number *</Label>
                          <Input
                            id="calcHouseName"
                            name="houseName"
                            required
                            placeholder="e.g. 12 or Rose Cottage"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="calcPostcode">Postcode *</Label>
                          <Input
                            id="calcPostcode"
                            name="postcode"
                            required
                            placeholder="e.g. IM2 1BB"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="calcMessage">Additional Information</Label>
                      <Textarea
                        id="calcMessage"
                        name="message"
                        placeholder="Any other details about your project..."
                        rows={3}
                        className="bg-background/50 resize-none"
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setStep(3)}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="electric"
                        size="lg"
                        className="gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Request Accurate Quote
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}
