"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator,
  Check,
  CheckCircle2,
  ImagePlus,
  Sparkles,
  X,
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
import { resizeImageForUpload } from "@/lib/resizeImage"

const NEED_OPTIONS = [
  "Privacy",
  "Heat reduction",
  "Sun fading protection",
  "Shatter protection",
  "Glare reduction",
  "Not sure, advise me",
] as const

const PROPERTY_OPTIONS = ["Home", "Conservatory", "Commercial", "Vehicle"] as const

const FILM_PREFERENCE_OPTIONS = ["Standard", "Premium", "Advise me"] as const

const MAX_PHOTOS = 6

interface PhotoItem {
  id: string
  file: File
  preview: string
}

function chipClass(selected: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
    selected
      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
      : "border-border bg-card/50 text-foreground hover:border-primary/50"
  }`
}

export function QuoteEnquiryForm({ onSwitchToCalculator }: { onSwitchToCalculator: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [needs, setNeeds] = useState<string[]>([])
  const [propertyType, setPropertyType] = useState<string | null>(null)
  const [filmPreference, setFilmPreference] = useState<string | null>(null)
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
      propertyType,
      filmPreference,
      description,
      photoUrls: upload.urls,
      photoUploadFailed: upload.failed,
    })
    const service = enquiryServiceLabel(propertyType)

    formData.set("_subject", `New Quote Enquiry — ${propertyType || "Property"}`)
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
      track("enquiry_submitted", { needs, propertyType, filmPreference })
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
            <h3 className="text-3xl font-bold mb-4">Thanks — we&apos;ll be in touch with your quote shortly.</h3>
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setNeeds([])
                setPropertyType(null)
                setFilmPreference(null)
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
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {NEED_OPTIONS.map((need, index) => {
                    const selected = needs.includes(need)
                    return (
                      <motion.button
                        key={need}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => toggleNeed(need)}
                        className={chipClass(selected)}
                        aria-pressed={selected}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                        {need}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  Property type <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_OPTIONS.map((option, index) => {
                    const selected = propertyType === option
                    return (
                      <motion.button
                        key={option}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => setPropertyType(selected ? null : option)}
                        className={chipClass(selected)}
                        aria-pressed={selected}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                        {option}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label>
                  Film preference <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {FILM_PREFERENCE_OPTIONS.map((option, index) => {
                    const selected = filmPreference === option
                    return (
                      <motion.button
                        key={option}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => setFilmPreference(selected ? null : option)}
                        className={chipClass(selected)}
                        aria-pressed={selected}
                        data-film-preference={option}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                        {option}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard is mirror privacy by day; Premium stays clear from inside and includes a 10-year guarantee.{" "}
                  <a href="/services#tiers" className="underline underline-offset-2 hover:text-foreground">Compare the two</a>.
                </p>
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
