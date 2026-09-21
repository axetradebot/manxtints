"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator,
  Check,
  CheckCircle2,
  CircleHelp,
  EyeOff,
  Glasses,
  ImagePlus,
  ShieldCheck,
  Sofa,
  Sparkles,
  ThermometerSun,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FadeIn } from "@/components/motion"
import { trackEnquiryStarted, trackLead } from "@/lib/metaPixel"
import { submitLead } from "@/lib/submitLead"
import { track } from "@/lib/analytics"
import { assembleEnquiryMessage, enquiryServiceLabel } from "@/lib/assembleEnquiry"
import { buildEnquiryJobDetails } from "@/lib/leadPayload"
import { resizeImageForUpload } from "@/lib/resizeImage"
import { useRevealOnMount } from "@/lib/useRevealOnMount"

// The label is what goes into the lead ("Looking for: Privacy, …").
const NEED_OPTIONS: { label: string; hint: string; icon: LucideIcon }[] = [
  { label: "Privacy", hint: "Stop people seeing in by day", icon: EyeOff },
  { label: "Heat reduction", hint: "Cooler rooms in summer", icon: ThermometerSun },
  { label: "Sun fading protection", hint: "Protect floors & furniture", icon: Sofa },
  { label: "Shatter protection", hint: "Holds glass together", icon: ShieldCheck },
  { label: "Glare reduction", hint: "Easier on screens & eyes", icon: Glasses },
  { label: "Not sure, advise me", hint: "We'll recommend a film", icon: CircleHelp },
]

const MAX_PHOTOS = 6

interface PhotoItem {
  id: string
  file: File
  preview: string
}

export function QuoteEnquiryForm({ onSwitchToCalculator }: { onSwitchToCalculator: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const successCardRef = useRevealOnMount<HTMLDivElement>(isSubmitted)
  const [needs, setNeeds] = useState<string[]>([])
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [emailError, setEmailError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLLabelElement>(null)
  const startedRef = useRef(false)

  const toggleNeed = (need: string) => {
    setNeeds((current) =>
      current.includes(need) ? current.filter((item) => item !== need) : [...current, need]
    )
  }

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list).filter((file) => file.type.startsWith("image/"))
    setPhotos((current) => {
      const room = MAX_PHOTOS - current.length
      const next = incoming.slice(0, room).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))
      return [...current, ...next]
    })
  }

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return current.filter((photo) => photo.id !== id)
    })
  }

  const uploadPhotos = async (): Promise<{ urls: string[]; failed: boolean }> => {
    if (photos.length === 0) return { urls: [], failed: false }
    try {
      const prepared = await Promise.all(photos.map((photo) => resizeImageForUpload(photo.file)))
      const body = new FormData()
      prepared.forEach((blob, index) => {
        body.append("files", blob, `window-${index + 1}.jpg`)
      })
      const response = await fetch("/api/enquiry-photos", { method: "POST", body })
      if (!response.ok) return { urls: [], failed: true }
      const data = (await response.json().catch(() => null)) as { urls?: string[] } | null
      const urls = Array.isArray(data?.urls) ? data.urls.filter((url) => typeof url === "string") : []
      if (urls.length === 0) return { urls: [], failed: true }
      return { urls, failed: false }
    } catch {
      return { urls: [], failed: true }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email")?.toString().trim() || ""
    const address = formData.get("address")?.toString().trim() || ""
    const name = formData.get("name")?.toString().trim() || ""
    const phone = formData.get("phone")?.toString().trim() || ""
    const description = formData.get("description")?.toString() || ""
    const gotcha = formData.get("_gotcha")?.toString() || ""

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address")
      return
    }
    setEmailError("")
    if (!address) return

    setIsSubmitting(true)

    const upload = await uploadPhotos()
    const message = assembleEnquiryMessage({
      needs,
      propertyType: null,
      description,
      photoUrls: upload.urls,
      photoUploadFailed: upload.failed,
    })
    const service = enquiryServiceLabel(null)

    formData.set("_subject", "New Quote Enquiry")
    formData.set("service", service)
    formData.set("message", message)
    formData.set("name", name)
    formData.set("phone", phone)
    formData.set("email", email)
    formData.set("address", address)

    const result = await submitLead(
      {
        name,
        phone,
        email,
        address,
        service,
        message,
        gotcha,
        jobDetails: buildEnquiryJobDetails({
          propertyType: null,
          filmPreference: null,
          description,
          hasPhotos: upload.urls.length > 0,
        }),
      },
      formData
    )

    if (result.accepted) {
      // Meta Lead only after the endpoint confirmed it; trackLead drops
      // honeypot submissions itself. No value — there is no price yet.
      void trackLead(result, {
        contentName: "quote_enquiry",
        email,
        phone: phone || undefined,
        firstName: name ? name.split(" ")[0] : undefined,
      })
      track("enquiry_submitted", { needs })
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview))
      setIsSubmitted(true)
    } else {
      alert("There was an error submitting the form. Please try again.")
    }

    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <FadeIn>
        <Card ref={successCardRef} className="max-w-2xl mx-auto glass scroll-mt-24">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-background" />
            </motion.div>
            <h3 className="text-3xl font-bold mb-4">Thanks — we&apos;ll be in touch with your quote shortly.</h3>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setNeeds([])
                setPhotos([])
              }}
              variant="outline"
              size="lg"
            >
              Send another enquiry
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return (
    <FadeIn immediate>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border-2 border-green-500/60 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-400/10 p-5"
        >
          <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold mb-1">
                Want <span className="text-green-600 dark:text-green-400">10% off your tint</span> right now?
              </p>
              <p className="text-sm text-muted-foreground">
                Use our DIY Calculator instead — instant quote, automatic 10% discount, no waiting.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={onSwitchToCalculator}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 gap-2 whitespace-nowrap"
            >
              <Calculator className="h-4 w-4" />
              Use Calculator
            </Button>
          </div>
        </motion.div>

        <Card className="glass">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Get a Quote, No Visit Needed</CardTitle>
            <CardDescription>
              Tell us what you&apos;re after and send a couple of photos. We&apos;ll price it up and get back to you, usually the same day.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form
              onSubmit={handleSubmit}
              onFocusCapture={() => {
                if (startedRef.current) return
                startedRef.current = true
                trackEnquiryStarted("quote_enquiry")
              }}
              className="space-y-6"
            >
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <div className="space-y-3">
                <Label>
                  What are you looking for?{" "}
                  <span className="text-muted-foreground font-normal">(pick any that apply)</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {NEED_OPTIONS.map(({ label, hint, icon: Icon }, index) => {
                    const selected = needs.includes(label)
                    return (
                      <motion.button
                        key={label}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleNeed(label)}
                        aria-pressed={selected}
                        className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          selected
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/15"
                            : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/70"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                            selected
                              ? "bg-gradient-to-br from-primary to-cyan-400 text-background"
                              : "bg-primary/10 text-primary group-hover:bg-primary/15"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <span className="space-y-0.5">
                          <span className="block text-sm font-semibold leading-tight">{label}</span>
                          <span className="block text-xs text-muted-foreground leading-snug">{hint}</span>
                        </span>
                        <AnimatePresence>
                          {selected && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  Photos of the job <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <label
                  ref={dropRef}
                  onDragOver={(event) => {
                    event.preventDefault()
                    dropRef.current?.classList.add("border-primary")
                  }}
                  onDragLeave={() => dropRef.current?.classList.remove("border-primary")}
                  onDrop={(event) => {
                    event.preventDefault()
                    dropRef.current?.classList.remove("border-primary")
                    if (event.dataTransfer.files) addFiles(event.dataTransfer.files)
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/50 px-4 py-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <ImagePlus className="h-7 w-7 text-primary" />
                  <span className="text-sm font-medium">Drag photos here or tap to choose</span>
                  <span className="text-xs text-muted-foreground">Up to {MAX_PHOTOS} images</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      if (event.target.files) addFiles(event.target.files)
                      event.target.value = ""
                    }}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  A quick photo of each window from inside helps us quote accurately.
                </p>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <AnimatePresence>
                      {photos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="relative aspect-square rounded-lg overflow-hidden border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 border border-border flex items-center justify-center"
                            aria-label="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="e.g. Two large south-facing lounge windows and a conservatory roof. Looking for privacy without going too dark."
                  rows={4}
                  className="bg-background/50 resize-none"
                />
              </div>

              <div className="border-t border-border/60 pt-6 space-y-6">
                <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Contact</p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full name <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input id="name" name="name" placeholder="John Smith" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7624 000 000"
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="bg-background/50"
                    onChange={() => setEmailError("")}
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Property address / postcode *</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    placeholder="e.g. 12 Rose Cottage, IM2 1BB"
                    className="bg-background/50"
                  />
                </div>
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
                    Sending...
                  </>
                ) : (
                  "Send my enquiry"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}
