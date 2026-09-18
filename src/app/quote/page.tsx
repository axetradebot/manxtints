"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, 
  ArrowLeft,
  MessageSquare,
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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FadeIn } from "@/components/motion"
import { trackLead } from "@/lib/metaPixel"
import { submitLead } from "@/lib/submitLead"
import { track } from "@/lib/analytics"
import { quoteProperty, quoteVehicle, formatGBP, guaranteeUpsell, MIN_JOB, GUARANTEE_PRICE } from "@/lib/pricing"
import {
  defaultTier,
  hasTiers,
  isTierKey,
  rateFor,
  tiers,
  zoneFromPostcode,
  zones,
  type PropertyRateKey,
  type TierKey,
  type ZoneKey,
} from "@/lib/pricing.zones"
import { useZone } from "@/components/zone/zone-provider"
import { ZoneChip, ZoneNotice } from "@/components/zone/zone-chip"
import { TierCards } from "@/components/tiers/tier-cards"
import { QuoteEnquiryForm } from "@/components/quote-enquiry-form"

// Vehicle packages — prices come from the pricing zone (see lib/pricing.zones.ts)
const vehiclePackages = {
  car: {
    "2": { windows: "Rear 3 windows + boot", description: "Back 3 windows including boot window" },
    "4": { windows: "Rear 5 windows + boot", description: "All passenger windows + boot window" }
  },
  suv: {
    "2": { windows: "Rear windows + boot", description: "All rear windows including boot" },
    "4": { windows: "Rear 4 windows + boot", description: "All passenger windows + boot window" }
  }
} as const

/** Line added to the lead when the postcode could not be matched to a pricing area. */
const UNMAPPED_POSTCODE_LINE = "We'll confirm your area's pricing with your quote."

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
    answer: "The calculator provides a rough estimate based on typical measurements and pricing. Actual costs may vary based on window complexity, film type availability, and installation requirements.",
  },
  {
    question: "How do you quote without a visit?",
    answer: "We quote everything remotely from your measurements or photos, and our installer re-measures on the day before fitting. If anything differs from the quote, we'll agree it with you before work starts.",
  },
  {
    question: "How long until I receive my quote?",
    answer: "If you use our DIY Calculator, your quote — including the 10% discount — is calculated instantly on screen. Send photos through Quote Enquiry and we usually come back the same day.",
  },
  {
    question: "Can I change my mind after getting a quote?",
    answer: "Of course! Our quotes are completely obligation-free. Take your time to decide — there's no pressure and no expiry on quotes.",
  },
]

export default function QuotePage() {
  const [activeTab, setActiveTab] = useState("calculator")

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab")
    if (tab !== "visit" && tab !== "enquiry") return
    // Deferred so the deep-link alias doesn't force a synchronous cascading render.
    const id = requestAnimationFrame(() => setActiveTab("enquiry"))
    return () => cancelAnimationFrame(id)
  }, [])
  
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-10 md:pt-14 pb-8 md:pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1920&q=80"
            alt="Get a quote"
            fill
            priority
            sizes="100vw"
            quality={60}
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="electric" className="mb-6">Free quotes online — no visit needed</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Get Your
                <span className="text-gradient block">Free Quote</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Two ways to get your personalized quote — but here&apos;s the smart move...
              </p>

              {/* 10% Off DIY Calculator Promo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative inline-block max-w-2xl pt-4"
              >
                {/* Floating SAVE 10% badge */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 right-4 sm:right-6 z-10"
                >
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm px-3 py-1.5 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    SAVE 10%
                  </Badge>
                </motion.div>

                <div className="relative rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-400/10 p-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg mb-1">
                        Use our DIY Calculator and get <span className="text-green-600 dark:text-green-400">10% off automatically!</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Skip the wait — instant quote, instant discount. Takes 2 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quote Options */}
      <section className="pt-2 pb-16 md:pt-4 md:pb-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} className="space-y-12" onValueChange={setActiveTab}>
            <FadeIn immediate>
              <TabsList className="grid grid-cols-2 max-w-2xl mx-auto h-auto p-2 bg-card/50">
                <TabsTrigger 
                  value="calculator" 
                  className="relative py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white gap-2"
                >
                  <Calculator className="h-5 w-5" />
                  <span className="hidden sm:inline">DIY Calculator</span>
                  <span className="sm:hidden">Calculator</span>
                  <Badge className="absolute -top-2 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-[10px] px-2 py-0.5 shadow-md">
                    SAVE 10%
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="enquiry" 
                  className="py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="hidden sm:inline">Quote Enquiry</span>
                  <span className="sm:hidden">Enquiry</span>
                </TabsTrigger>
              </TabsList>
            </FadeIn>

            <TabsContent value="enquiry">
              <QuoteEnquiryForm onSwitchToCalculator={() => {
                setActiveTab("calculator")
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }} />
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

// DIY Calculator Component
function DIYCalculator() {
  const [step, setStep] = useState(1)
  // Vehicle category is temporarily disabled — keeping the union for future re-enable
  const [category, setCategory] = useState<"vehicle" | "property" | null>("property")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  // Vehicle-specific state — kept for future re-enable
  const [vehicleType, setVehicleType] = useState<"car" | "suv" | null>(null)
  const [doorCount, setDoorCount] = useState<"2" | "4" | null>(null)
  // const [selectedFilm, setSelectedFilm] = useState(filmTypes[1]) // SAVED FOR FUTURE USE
  const [windows, setWindows] = useState<Window[]>([])
  // Film tier (Standard / Premium) for house + conservatory. Commercial has one film.
  const [tier, setTier] = useState<TierKey>(defaultTier)
  const [extendedGuarantee, setExtendedGuarantee] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const calcStartedRef = useRef(false)

  // `?tier=premium|standard` (services page CTAs, ads) pre-selects the film
  // but never skips the tier step — the customer still sees both cards.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tier")
    if (!isTierKey(param)) return
    const id = requestAnimationFrame(() => setTier(param))
    return () => cancelAnimationFrame(id)
  }, [])

  // Regional pricing. Every rate below reads from the resolved zone so a
  // change (chip or postcode) recalculates the open quote live.
  const { zone, zoneKey, source: zoneSource, setZone } = useZone()
  // Zone derived from the postcode typed at the final step:
  //   undefined = nothing typed yet · null = does not parse as a postcode (unmapped)
  const [postcodeZone, setPostcodeZone] = useState<ZoneKey | null | undefined>(undefined)
  // Set when the postcode moves the customer to a different area. `pending`
  // stays true until the recalculated total has actually rendered, and the
  // submit button is disabled for that window — the price never changes
  // silently after they have seen a total.
  const [reprice, setReprice] = useState<{ from: ZoneKey; to: ZoneKey; oldTotal: number; pending: boolean } | null>(null)

  // Cache the window list in sessionStorage so "Add more windows" (and
  // accidental refreshes) never lose what's been typed.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mt_calc_windows")
      if (saved) {
        const parsed = JSON.parse(saved) as Window[]
        if (Array.isArray(parsed) && parsed.length > 0) setWindows(parsed)
      }
    } catch { /* ignore corrupt cache */ }
  }, [])

  useEffect(() => {
    try {
      if (windows.length > 0) {
        sessionStorage.setItem("mt_calc_windows", JSON.stringify(windows))
      } else {
        sessionStorage.removeItem("mt_calc_windows")
      }
    } catch { /* storage full/unavailable — non-critical */ }
  }, [windows])

  const addWindow = () => {
    track('calc_windows_added', { count: windows.length + 1 })
    setWindows([
      ...windows,
      { id: crypto.randomUUID(), name: `Window ${windows.length + 1}`, width: 0, height: 0 }
    ])
  }

  const updateWindow = (id: string, field: keyof Window, value: string | number) => {
    if (!calcStartedRef.current) {
      calcStartedRef.current = true
      track('calc_started')
    }
    setWindows(windows.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ))
  }

  const removeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id))
  }

  // Tiers only apply to house + conservatory. Commercial is priced on its single
  // film and still gets the guarantee upsell.
  const tierApplies = hasTiers(selectedType)
  const effectiveTier: TierKey = tierApplies ? tier : "standard"
  const chosenTier = tiers[effectiveTier]
  // Premium includes the 10-year guarantee, so there is nothing to upsell.
  const guaranteeIncluded = tierApplies && tier === "premium"
  const guaranteeAdded = !guaranteeIncluded && extendedGuarantee

  // Get vehicle price from selected options (zone-specific)
  const getVehiclePrice = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return 0
    return zone.vehicle[vehicleType][doorCount]
  }

  // Get vehicle description from selected options
  const getVehicleDescription = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return ""
    return vehiclePackages[vehicleType][doorCount].description
  }

  // Get vehicle windows info from selected options
  const getVehicleWindows = () => {
    if (category !== "vehicle" || !vehicleType || !doorCount) return ""
    return vehiclePackages[vehicleType][doorCount].windows
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

  // All pricing rules (per-window £10 floor, £100 job floor, discount, voucher
  // and guarantee ordering) live in src/lib/pricing.ts. The rate is the
  // chosen tier's zone rate; the upsell is only priced when it is not included.
  const getQuote = () => {
    if (category === "vehicle") {
      return quoteVehicle(getVehiclePrice(), extendedGuarantee)
    }
    const pricePerSqM = selectedType ? rateFor(zone, selectedType as PropertyRateKey, effectiveTier) : 0
    return quoteProperty(windows, pricePerSqM, guaranteeAdded)
  }

  // Quoted as a pound figure everywhere: what the 10-year upgrade would add
  // to the total on screen right now.
  const guaranteeUpgradePrice = () => {
    const base = quoteProperty(
      windows,
      selectedType ? rateFor(zone, selectedType as PropertyRateKey, effectiveTier) : 0,
      true
    )
    return base.guaranteeCost
  }

  // Log the funnel's price-shown moment once per arrival at the summary step,
  // and again if the area or film (and therefore the price) changes while it is shown.
  useEffect(() => {
    if (step === 4) {
      const q = getQuote()
      track('calc_price_shown', {
        total: Number(q.finalTotal.toFixed(2)),
        windows: windows.length,
        areaSqM: Number(q.totalAreaSqM.toFixed(2)),
        pricePerSqM: q.pricePerSqM,
        projectType: category === "vehicle" ? "vehicle" : selectedType,
        jobFloorApplied: q.jobFloorApplied,
        guarantee: guaranteeAdded || guaranteeIncluded,
        tier: tierApplies ? tier : null,
        guarantee_added: guaranteeAdded,
        guarantee_included: guaranteeIncluded,
        guarantee_price: guaranteeIncluded ? 0 : guaranteeUpgradePrice(),
        zone: zoneKey,
        zoneSource,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, zoneKey, tier])

  const chooseTier = (next: TierKey) => {
    if (next !== tier) {
      track('tier_selected', {
        tier: next,
        from: tier,
        projectType: selectedType,
        pricePerSqM: selectedType ? rateFor(zone, selectedType as PropertyRateKey, next) : null,
        zone: zoneKey,
        step,
      })
    }
    setTier(next)
    // Premium includes the guarantee; an upsell ticked on Standard shouldn't carry over.
    if (next === "premium") setExtendedGuarantee(false)
  }

  // The postcode-driven reprice is "rendered" once the zone it asked for is
  // the zone this render was computed with.
  useEffect(() => {
    setReprice((r) => (r && r.pending && r.to === zoneKey ? { ...r, pending: false } : r))
  }, [zoneKey])

  /**
   * Reconfirms the pricing area from the postcode. If it differs from the
   * area on screen, the zone switches, the total recalculates visibly (old
   * total struck through) and submit is held until the new total has rendered.
   * Returns true when a reprice was triggered.
   */
  const reconcilePostcode = (rawPostcode: string): boolean => {
    const derived = zoneFromPostcode(rawPostcode)
    setPostcodeZone(derived)
    if (derived && derived !== zoneKey) {
      const current = getQuote()
      setReprice({ from: zoneKey, to: derived, oldTotal: current.finalTotal, pending: true })
      setZone(derived, "postcode")
      return true
    }
    return false
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Belt and braces: never submit a total priced for a different area than
    // the postcode says. If the postcode moves the zone, show the reprice and
    // let the customer re-read the total before submitting.
    if (category === "property") {
      const typedPostcode = formData.get('postcode')?.toString() || ''
      if (reconcilePostcode(typedPostcode)) return
    }
    if (reprice?.pending) return

    setIsSubmitting(true)
    const currentQuote = getQuote()

    const discountAmount = currentQuote.discountAmount.toFixed(2)
    const finalPrice = currentQuote.finalTotal.toFixed(2)

    // Fire Meta Lead event (Pixel + CAPI) BEFORE submitting so the browser
    // Pixel beacon is sent while the page is still alive. Awaited so fbq has
    // fired; trackLead never throws and is internally time-capped.
    const calcName = formData.get('name')?.toString().trim()
    await trackLead({
      contentName: 'diy_calculator',
      value: 10,
      email: formData.get('email')?.toString() || undefined,
      phone: formData.get('phone')?.toString() || undefined,
      firstName: calcName ? calcName.split(' ')[0] : undefined,
      zip: formData.get('postcode')?.toString() || undefined,
    })

    let leadService = ''
    let leadQuoteSummary = ''

    if (category === "vehicle") {
      // Vehicle submission
      const vehicleLabel = getVehicleLabel()
      const vehicleDescription = getVehicleDescription()

      leadService = `DIY Calculator — Vehicle (${vehicleLabel})`
      leadQuoteSummary = `Quote: £${finalPrice} incl. 10% DIY discount${extendedGuarantee ? `, 10yr guarantee (+£${GUARANTEE_PRICE})` : ''}. Package: ${vehicleDescription} (${zone.label})`

      formData.append('_subject', `New Vehicle Quote Request - ${vehicleLabel} - £${finalPrice}${extendedGuarantee ? ' (10yr Guarantee)' : ''}`)
      formData.append('Category', 'Vehicle')
      formData.append('Pricing Area', zone.label)
      formData.append('Vehicle Type', vehicleLabel)
      formData.append('Package', vehicleDescription)
      formData.append('10 Year Guarantee', extendedGuarantee ? `YES (+£${GUARANTEE_PRICE})` : 'No - Standard 5 Year')
      formData.append('Subtotal', `£${currentQuote.subtotal.toFixed(2)}`)
      formData.append('DIY Calculator Discount (10%)', `-£${discountAmount}`)
      formData.append('Final Total (with 10% DIY discount)', `£${finalPrice}`)
    } else {
      // Property submission
      const projectTypeName = selectedType === 'house' ? 'Residential' : 
                             selectedType === 'conservatory' ? 'Conservatory' : 
                             selectedType === 'commercial' ? 'Commercial' : selectedType

      const tierSuffix = tierApplies ? ` (${chosenTier.label})` : ''
      leadService = `DIY Calculator — ${projectTypeName || 'Property'}${tierSuffix}`
      const guaranteeLine = guaranteeAdded
        ? ` + ${guaranteeUpsell.years}-year guarantee ${formatGBP(currentQuote.guaranteeCost)}`
        : guaranteeIncluded
          ? ` (${chosenTier.guaranteeYears}-year guarantee included)`
          : ''
      const quoteLine = currentQuote.jobFloorApplied
        ? `£${currentQuote.baseTotal.toFixed(2)} (minimum job charge)${guaranteeLine}${guaranteeAdded ? ` = £${finalPrice}` : ''}`
        : `£${finalPrice} incl. 10% DIY discount${guaranteeLine}`
      const filmLine = tierApplies ? ` Film: ${chosenTier.label} (${chosenTier.film}).` : ''
      leadQuoteSummary = `Quote: ${quoteLine}. ${windows.length} window(s), ${currentQuote.totalAreaSqM.toFixed(2)}m² @ £${currentQuote.pricePerSqM}/m² (${zone.label}).${filmLine}`
      if (postcodeZone === null) {
        leadQuoteSummary += ` ${UNMAPPED_POSTCODE_LINE}`
      }

      formData.append('_subject', `New Property Quote Request - ${projectTypeName}${tierSuffix} - £${finalPrice}${guaranteeAdded ? ' (10yr Guarantee)' : ''}`)
      formData.append('Category', 'Property')
      formData.append('Project Type', projectTypeName || 'Not specified')
      if (tierApplies) {
        formData.append('Film Tier', `${chosenTier.label} — ${chosenTier.film}`)
      }
      formData.append('Pricing Area', `${zone.label}${postcodeZone === null ? ' (postcode not matched — confirm pricing)' : ''}`)
      formData.append('Total Area (m²)', currentQuote.totalAreaSqM.toFixed(2))
      formData.append('Price per m²', `£${currentQuote.pricePerSqM}`)
      formData.append(
        '10 Year Guarantee',
        guaranteeIncluded
          ? 'Included with Premium'
          : guaranteeAdded
            ? `YES (+${formatGBP(currentQuote.guaranteeCost)})`
            : 'No - Standard 5 Year'
      )
      formData.append('Subtotal', `£${currentQuote.subtotal.toFixed(2)}`)
      formData.append('DIY Calculator Discount (10%)', `-£${discountAmount}`)
      if (currentQuote.jobFloorApplied) {
        formData.append('Minimum Job Charge', `Applied — total floored to £${MIN_JOB}`)
      }
      formData.append('Final Total (with 10% DIY discount)', `£${finalPrice}${currentQuote.jobFloorApplied ? ' (minimum job charge)' : ''}`)
      formData.append('Number of Windows', windows.length.toString())
      
      // Add individual window measurements with their priced contribution
      currentQuote.lines.forEach((line, index) => {
        formData.append(
          `Window ${index + 1}`,
          `${line.name}: ${line.width}cm x ${line.height}cm = ${line.areaSqM.toFixed(2)}m² — £${line.price.toFixed(2)}${line.floorApplied ? ' (min per window)' : ''}`
        )
      })
      
      // Add property address details
      const houseName = formData.get('houseName')
      const postcode = formData.get('postcode')
      if (houseName) formData.append('House Name/Number', houseName.toString())
      if (postcode) formData.append('Postcode', postcode.toString())
    }
    
    const userMessage = formData.get('message')?.toString().trim() || ''

    const success = await submitLead(
      {
        name: calcName || '',
        phone: formData.get('phone')?.toString() || '',
        email: formData.get('email')?.toString() || '',
        address: [formData.get('houseName')?.toString(), formData.get('postcode')?.toString()]
          .filter(Boolean)
          .join(', '),
        service: leadService,
        message: userMessage ? `${userMessage}\n\n${leadQuoteSummary}` : leadQuoteSummary,
        gotcha: formData.get('_gotcha')?.toString() || '',
      },
      formData
    )

    if (success) {
      track('calc_submitted', {
        total: Number(finalPrice),
        jobFloorApplied: currentQuote.jobFloorApplied,
        projectType: category === "vehicle" ? "vehicle" : selectedType,
        tier: category === "property" && tierApplies ? tier : null,
        guarantee_added: category === "vehicle" ? extendedGuarantee : guaranteeAdded,
        guarantee_included: category === "property" && guaranteeIncluded,
        guarantee_price: Number(currentQuote.guaranteeCost.toFixed(2)),
        zone: zoneKey,
        zoneSource,
        postcodeMatched: postcodeZone !== null,
      })
      setIsSubmitted(true)
    } else {
      alert('There was an error submitting the form. Please try again.')
    }

    setIsSubmitting(false)
  }

  const quote = getQuote()

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
              setCategory("property")
              setSelectedType(null)
              setVehicleType(null)
              setDoorCount(null)
              setWindows([])
              setTier(defaultTier)
              setExtendedGuarantee(false)
              setPostcodeZone(undefined)
              setReprice(null)
            }} variant="outline" size="lg">
              Start New Quote
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <FadeIn immediate>
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* Vehicles: select → review. Tiered property: type → windows → film → review.
                Commercial has one film, so its tier step is skipped. */}
            {(category === "vehicle" ? [1, 4] : tierApplies || !selectedType ? [1, 2, 3, 4] : [1, 2, 4]).map((s, index, arr) => {
              const isActive = step >= s
              const lineActive = step > s

              return (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
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
            {step === 3 && "Choose your film"}
            {step === 4 && "Review & submit"}
          </p>
          {/* Always visible while prices are on screen: which area, and a one-tap change */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <ZoneChip onChange={() => setReprice(null)} />
            {step === 1 && <ZoneNotice />}
          </div>
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

                  {/* Property Type Cards — bigger, more prominent layout */}
                  <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                    {propertyTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = selectedType === type.id
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          whileHover={{ scale: isSelected ? 1.02 : 1.04, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedType(type.id)}
                          className={`relative p-6 sm:p-8 rounded-2xl border-2 transition-all text-center ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                              : "border-border hover:border-primary/50 bg-card/50"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
                            >
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </motion.div>
                          )}
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-gradient-to-br from-primary to-cyan-400 shadow-lg shadow-primary/30"
                              : "bg-gradient-to-br from-primary/80 to-cyan-400/80"
                          }`}>
                            <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-background" />
                          </div>
                          <h4 className="text-lg sm:text-xl font-bold mb-1">{type.label}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {type.id === "house" && "Homes & flats"}
                            {type.id === "conservatory" && "Roof Panels"}
                            {type.id === "commercial" && "Offices, shops & buildings"}
                          </p>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Vehicle category is temporarily disabled. Change `false` to `true` below to re-enable. */}
                  {false && (
                  <motion.div whileHover={{ scale: category === "vehicle" ? 1 : 1.02 }}>
                      <Card 
                        className={`cursor-pointer transition-all h-full ${
                          category === "vehicle" 
                            ? "border-primary bg-primary/5" 
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setCategory("vehicle")
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
                  )}
                  {/* end of Vehicle category block */}

                  <div className="flex justify-end">
                    <Button
                      variant="electric"
                      size="lg"
                      onClick={() => {
                        if (windows.length === 0) addWindow()
                        setStep(2)
                      }}
                      disabled={!selectedType}
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
                      not the frame.
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
                      onClick={() => setStep(tierApplies ? 3 : 4)}
                      disabled={windows.some(w => w.width === 0 || w.height === 0)}
                      className="gap-2"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Film tier — shown before any total, so the price the
                  customer first sees is already for the film they chose. */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Choose your film</h3>
                    <p className="text-muted-foreground">
                      Both give one-way privacy by day. Premium keeps the view from inside clear and doubles the guarantee.
                    </p>
                  </div>

                  <TierCards
                    value={tier}
                    onChange={chooseTier}
                    rateType={selectedType === "conservatory" ? "conservatory" : "house"}
                  />

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(2)}
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
                      data-tier-continue
                    >
                      Continue with {tiers[tier].label}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <motion.div
                  key="step4"
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
                      {tierApplies && (
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-muted-foreground">Film</span>
                          <span className="font-medium text-right" data-quote-tier={tier}>
                            {chosenTier.label} <span className="text-muted-foreground font-normal">({chosenTier.film})</span>
                            <button
                              type="button"
                              onClick={() => setStep(3)}
                              className="ml-2 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                              Compare tiers
                            </button>
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Windows</span>
                        <span className="font-medium">{windows.length} window{windows.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Area</span>
                        <span className="font-medium">{quote.totalAreaSqM.toFixed(2)} m²</span>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-muted-foreground">Price per m²</span>
                        <span className="font-medium">£{quote.pricePerSqM}</span>
                      </div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-muted-foreground">Pricing area</span>
                        <ZoneChip size="sm" onChange={() => setReprice(null)} />
                      </div>

                      {/* Per-window breakdown — shows the £10 minimum transparently */}
                      <div className="pt-3 border-t border-border/50 space-y-2">
                        {quote.lines.map((line) => (
                          <div key={`${line.name}-${line.width}-${line.height}`} className="flex justify-between items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {line.name}: {line.width}cm x {line.height}cm = {line.areaSqM.toFixed(2)}m²
                            </span>
                            <span className="font-medium whitespace-nowrap">
                              £{line.price.toFixed(2)}
                              {line.floorApplied && (
                                <span className="text-muted-foreground font-normal"> (min per window)</span>
                              )}
                            </span>
                          </div>
                        ))}
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

                  {/* Single Total with DIY Calculator 10% Discount */}
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                      className="relative overflow-hidden rounded-3xl border-2 border-green-500 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-400/10 shadow-xl shadow-green-500/10"
                    >
                      {/* Animated shimmer top stripe */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
                      
                      {/* DIY Discount badge */}
                      <div className="absolute top-0 right-0">
                        <motion.div
                          animate={{ scale: [1, 1.04, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-lg"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          DIY CALCULATOR DISCOUNT
                        </motion.div>
                      </div>

                      <div className="p-8 pt-12 text-center">
                        {/* Discount applied banner (hidden when the £100 minimum absorbs it) */}
                        {!quote.jobFloorApplied && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/30"
                          >
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                              10% off applied — for using the calculator!
                            </span>
                          </motion.div>
                        )}

                        <p className="text-sm font-medium text-muted-foreground mb-2">Your Total</p>

                        {/* Postcode moved the customer to a different area — shown before they can submit */}
                        <AnimatePresence>
                          {reprice && (
                            <motion.div
                              key={`${reprice.from}-${reprice.to}`}
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              role="status"
                              aria-live="polite"
                              data-reprice-notice
                              data-reprice-pending={reprice.pending ? "true" : "false"}
                              className="mx-auto mb-4 max-w-md rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900"
                            >
                              <p className="font-semibold">
                                Your postcode is in the {zones[reprice.to].label} area — prices updated.
                              </p>
                              <p className="mt-1 text-amber-800">
                                <span className="line-through">£{reprice.oldTotal.toFixed(2)}</span>
                                <span aria-hidden> → </span>
                                <span className="sr-only">now</span>
                                <span className="font-semibold">
                                  {reprice.pending ? "recalculating…" : `£${quote.finalTotal.toFixed(2)}`}
                                </span>
                                <span className="ml-1 text-xs">(10% DIY discount and minimums reapplied)</span>
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Strikethrough original */}
                        {!quote.jobFloorApplied && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-1"
                          >
                            <span className="text-lg text-muted-foreground">
                              <span className="line-through">
                                £{(quote.subtotal + quote.guaranteeCost).toFixed(2)}
                              </span>
                            </span>
                          </motion.div>
                        )}

                        {/* Big satisfying total */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.35, type: "spring", bounce: 0.5 }}
                          className="flex flex-col items-center justify-center mb-3"
                        >
                          <span className="text-7xl md:text-8xl font-bold text-gradient leading-none">
                            £{quote.finalTotal.toFixed(2)}
                          </span>
                          <span className="mt-3 text-sm font-medium text-muted-foreground tracking-wide">
                            All prices include VAT
                          </span>
                        </motion.div>

                        {/* Minimum job note + add-more-windows nudge */}
                        {quote.jobFloorApplied && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="mb-6 space-y-3"
                          >
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                              Minimum job size is £{MIN_JOB} — want to add some extra windows to get full value?
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setStep(2)}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add more windows
                            </Button>
                          </motion.div>
                        )}

                        {/* Savings call-out */}
                        {!quote.jobFloorApplied && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg mb-6"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="font-bold">
                              You saved £{quote.discountAmount.toFixed(2)}
                            </span>
                          </motion.div>
                        )}

                        {/* Benefits row */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground flex-wrap"
                        >
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            10% discount included
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            No hidden fees
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-green-500" />
                            All-in price
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Guarantee — Premium includes 10 years; everything else can add it
                        for max(£29, 10% of the total), always shown as a pound figure. */}
                    {category === "property" && (guaranteeIncluded ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        data-guarantee-included
                        className="flex items-center gap-3 rounded-xl border-2 border-green-500/40 bg-green-500/5 p-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{chosenTier.guaranteeYears}-year guarantee included ✓</p>
                          <p className="text-sm text-muted-foreground">Film and workmanship covered for a decade with {chosenTier.label}.</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        data-guarantee-upsell
                        data-guarantee-added={guaranteeAdded ? "true" : "false"}
                        className={`relative overflow-hidden rounded-xl border-2 p-4 transition-colors ${
                          guaranteeAdded
                            ? "border-amber-500 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-red-500/10"
                            : "border-dashed border-amber-500/50 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <motion.button
                            type="button"
                            role="checkbox"
                            aria-checked={guaranteeAdded}
                            aria-label={`Extend your guarantee to ${guaranteeUpsell.years} years for ${formatGBP(guaranteeUpgradePrice())}`}
                            onClick={() => setExtendedGuarantee(!extendedGuarantee)}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
                              guaranteeAdded
                                ? "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500"
                                : "border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {guaranteeAdded && <Check className="h-5 w-5 text-white" />}
                          </motion.button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Shield className="h-5 w-5 text-amber-500" />
                              <p className="font-semibold">
                                {guaranteeAdded
                                  ? `${guaranteeUpsell.years}-year guarantee added`
                                  : `Extend your guarantee to ${guaranteeUpsell.years} years`}
                              </p>
                              <span className="text-amber-600 dark:text-amber-400 font-bold" data-guarantee-price>
                                — {formatGBP(guaranteeAdded ? quote.guaranteeCost : guaranteeUpgradePrice())}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Covers film and workmanship for a decade instead of five years. Any peeling, bubbles or discolouration and we replace the film,{" "}
                              <span className="font-medium text-foreground">no questions asked</span>.
                            </p>
                            {guaranteeAdded ? (
                              <button
                                type="button"
                                onClick={() => setExtendedGuarantee(false)}
                                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                              >
                                Remove — keep the {chosenTier.guaranteeYears}-year guarantee
                              </button>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setExtendedGuarantee(true)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Add {guaranteeUpsell.years}-year guarantee for {formatGBP(guaranteeUpgradePrice())}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Flexible payment helper note */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="relative rounded-xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Need to spread the cost?</p>
                          <p className="text-sm text-muted-foreground">
                            Just message the ManxTints team and we&apos;ll find a flexible payment arrangement that suits you. We&apos;re here to help.
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
                    {/* Honeypot — hidden from real users; bots that fill it are filtered out */}
                    <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
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
                            autoComplete="postal-code"
                            placeholder="e.g. IM2 1BB"
                            className="bg-background/50"
                            onBlur={(e) => reconcilePostcode(e.target.value)}
                            onChange={(e) => {
                              // Reconfirm as soon as the outward code parses, so the
                              // customer sees any change before reaching the button.
                              if (zoneFromPostcode(e.target.value)) reconcilePostcode(e.target.value)
                            }}
                          />
                          {postcodeZone === null && (
                            <p className="text-xs text-muted-foreground" data-postcode-unmapped>
                              We couldn&apos;t match that postcode to an area. {UNMAPPED_POSTCODE_LINE}
                            </p>
                          )}
                          {postcodeZone && postcodeZone === zoneKey && (
                            <p className="text-xs text-muted-foreground">
                              Priced for {zone.label}.
                            </p>
                          )}
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

                    <p className="text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
                      By booking ManxTints LTD you agree to our{" "}
                      <Link
                        href="/terms"
                        className="underline underline-offset-2 hover:text-foreground"
                      >
                        terms &amp; conditions
                      </Link>
                      .
                    </p>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setStep(category === "vehicle" ? 1 : tierApplies ? 3 : 2)}
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
                        disabled={isSubmitting || Boolean(reprice?.pending)}
                        aria-disabled={isSubmitting || Boolean(reprice?.pending)}
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
                            Book Installation
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
