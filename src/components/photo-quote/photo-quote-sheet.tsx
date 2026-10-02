"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CountUp } from "@/components/trust/count-up"
import { ZoneChip } from "@/components/zone/zone-chip"
import { useZone } from "@/components/zone/zone-provider"
import { track } from "@/lib/analytics"
import { buildPhotoQuoteLead, UNMAPPED_POSTCODE_LINE } from "@/lib/leadPayload"
import { trackEnquiryStarted, trackLead } from "@/lib/metaPixel"
import { preparePhoto, type PhotoWarning } from "@/lib/photoQuote.image"
import { pricePhotoQuote } from "@/lib/photoQuote.pricing"
import {
  PANE_TYPE_LABELS,
  PHOTO_QUOTE_MAX_PHOTOS,
  PROPERTY_TYPE_LABELS,
  panesFromClient,
  type ClientPane,
  type EstimateResponse,
  type PhotoQuotePriceDTO,
  type PriceResponse,
} from "@/lib/photoQuote.schema"
import { zoneFromPostcode, zones, type ZoneKey } from "@/lib/pricing.zones"
import { submitLead } from "@/lib/submitLead"
import { cn } from "@/lib/utils"
import { Turnstile, TURNSTILE_SITE_KEY, type TurnstileHandle } from "./turnstile"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "photos" | "estimating" | "price" | "contact" | "done"

interface PhotoItem {
  id: string
  preview: string
  status: "preparing" | "uploading" | "ready" | "failed"
  progress: number
  url: string | null
  warnings: PhotoWarning[]
  /** Flagged by the estimate as too poor to measure from */
  unusable?: boolean
}

type ErrorCode =
  | "rate_limited"
  | "high_demand"
  | "unavailable"
  | "no_panes"
  | "model_error"
  | "turnstile"
  | "bad_photo"
  | "network"
  | "session"

const ERROR_COPY: Record<ErrorCode, { title: string; body: string; calculator: boolean }> = {
  rate_limited: {
    title: "That's the photo-quote limit for now",
    body: "You can try again later — or use the calculator for an instant exact price and 10% off.",
    calculator: true,
  },
  high_demand: {
    title: "High demand right now",
    body: "Our photo estimator is busy. Use the calculator for an instant exact price — it only takes a tape measure.",
    calculator: true,
  },
  unavailable: {
    title: "Photo quotes aren't available right now",
    body: "Use the calculator for an instant price, or send us the photos through Quote Enquiry and we'll price them by hand.",
    calculator: true,
  },
  no_panes: {
    title: "We couldn't make out any windows",
    body: "Try again with the whole frame in shot, from inside, in daylight if you can.",
    calculator: false,
  },
  model_error: {
    title: "Something went wrong looking at your photos",
    body: "Give it another go. If it keeps happening, the calculator gives an exact price straight away.",
    calculator: true,
  },
  turnstile: {
    title: "We couldn't verify you're not a robot",
    body: "Please try again.",
    calculator: false,
  },
  bad_photo: {
    title: "One of the photos didn't upload properly",
    body: "Remove it and add it again.",
    calculator: false,
  },
  network: {
    title: "Connection problem",
    body: "Check your signal and try again.",
    calculator: false,
  },
  session: {
    title: "This session has expired",
    body: "Close and reopen the photo quote to start again.",
    calculator: false,
  },
}

const WARNING_COPY: Record<PhotoWarning, string> = {
  blurry: "Looks blurry — retake?",
  dark: "Looks dark — retake?",
}

const LOADING_LINES = ["Looking at your windows…", "Counting the panes…", "Working out the glass area…"]

// ---------------------------------------------------------------------------
// Upload with progress
// ---------------------------------------------------------------------------

function uploadPhoto(blob: Blob, session: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("session", session)
    form.append("file", blob, "window.jpg")
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/photo-quote/upload")
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as { url?: string; error?: string }
        if (xhr.status >= 200 && xhr.status < 300 && typeof data.url === "string") resolve(data.url)
        else reject(new Error(data.error || `upload_${xhr.status}`))
      } catch {
        reject(new Error("upload_parse"))
      }
    }
    xhr.onerror = () => reject(new Error("network"))
    xhr.send(form)
  })
}

// ---------------------------------------------------------------------------
// Sheet
// ---------------------------------------------------------------------------

interface PhotoQuoteSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "Measure up in the calculator" — parent switches tab and prefills the pane count. */
  onUseCalculator: (paneCount: number) => void
}

export function PhotoQuoteSheet({ open, onOpenChange, onUseCalculator }: PhotoQuoteSheetProps) {
  const { zone, zoneKey } = useZone()
  const reduceMotion = useReducedMotion()

  const [step, setStep] = useState<Step>("photos")
  const [session, setSession] = useState<string | null>(null)
  const [featureEnabled, setFeatureEnabled] = useState(true)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [error, setError] = useState<ErrorCode | null>(null)
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)
  const [panes, setPanes] = useState<ClientPane[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingLine, setLoadingLine] = useState(0)

  const turnstileToken = useRef<string | null>(null)
  const [turnstileReady, setTurnstileReady] = useState(!TURNSTILE_SITE_KEY)
  const turnstileRef = useRef<TurnstileHandle>(null)
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  const photosRef = useRef<PhotoItem[]>([])
  photosRef.current = photos
  const sessionRef = useRef<string | null>(null)
  sessionRef.current = session
  const startedRef = useRef(false)

  // Session token when the sheet opens; fresh state each time.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setStep("photos")
    setError(null)
    setEstimate(null)
    setPanes([])
    setEditingId(null)
    if (!startedRef.current) {
      startedRef.current = true
      track("photo_quote_started", { zone: zoneKey })
    }
    fetch("/api/photo-quote/session", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { token?: string; enabled?: boolean } | null) => {
        if (cancelled) return
        if (data?.token) {
          setSession(data.token)
          setFeatureEnabled(data.enabled !== false)
        } else {
          setError("unavailable")
        }
      })
      .catch(() => !cancelled && setError("network"))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Revoke previews when the sheet closes.
  useEffect(() => {
    if (open) return
    photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
    startedRef.current = false
  }, [open])

  useEffect(() => {
    if (step !== "estimating") return
    setLoadingLine(0)
    const id = setInterval(() => setLoadingLine((n) => (n + 1) % LOADING_LINES.length), 1800)
    return () => clearInterval(id)
  }, [step])

  const updatePhoto = useCallback((id: string, patch: Partial<PhotoItem>) => {
    setPhotos((current) => current.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const addFiles = useCallback(
    async (list: FileList | File[]) => {
      const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"))
      if (incoming.length === 0) return
      const room = PHOTO_QUOTE_MAX_PHOTOS - photosRef.current.length
      const accepted = incoming.slice(0, Math.max(0, room))
      const items: PhotoItem[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        status: "preparing",
        progress: 0,
        url: null,
        warnings: [],
      }))
      setPhotos((current) => [...current, ...items])
      setError(null)

      // Prepare + upload each in the background while the customer keeps adding.
      await Promise.all(
        items.map(async (item, i) => {
          try {
            const prepared = await preparePhoto(accepted[i])
            updatePhoto(item.id, { warnings: prepared.warnings, status: "uploading" })
            // Session may still be arriving on a slow connection.
            let token = session
            for (let tries = 0; !token && tries < 20; tries++) {
              await new Promise((r) => setTimeout(r, 150))
              token = sessionRef.current
            }
            if (!token) throw new Error("session")
            const url = await uploadPhoto(prepared.blob, token, (pct) => updatePhoto(item.id, { progress: pct }))
            updatePhoto(item.id, { status: "ready", progress: 100, url })
          } catch (err) {
            updatePhoto(item.id, { status: "failed" })
            if (err instanceof Error && err.message === "rate_limited") setError("rate_limited")
          }
        })
      )
      const ready = photosRef.current.filter((p) => p.status === "ready").length
      if (ready > 0) track("photo_quote_photos_added", { count: ready })
    },
    [session, updatePhoto]
  )

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const target = current.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return current.filter((p) => p.id !== id)
    })
  }

  const readyPhotos = photos.filter((p) => p.status === "ready" && p.url)
  const busyPhotos = photos.some((p) => p.status === "preparing" || p.status === "uploading")
  const canEstimate = readyPhotos.length > 0 && !busyPhotos && Boolean(session) && featureEnabled && turnstileReady

  const fail = (code: ErrorCode) => {
    setError(code)
    setStep("photos")
    track("photo_quote_failed", { reason: code })
  }

  const requestEstimate = async () => {
    if (!session || readyPhotos.length === 0) return
    setError(null)
    setStep("estimating")
    try {
      const response = await fetch("/api/photo-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session,
          turnstile: turnstileToken.current ?? undefined,
          photos: readyPhotos.map((p) => p.url),
          zone: zoneKey,
        }),
      })
      // Turnstile tokens are single-use: the widget remounts with the photo
      // step and issues a fresh one for any retry.
      turnstileToken.current = null
      if (TURNSTILE_SITE_KEY) setTurnstileReady(false)

      const data = (await response.json().catch(() => null)) as
        | (EstimateResponse & { error?: undefined })
        | { error: string; unusablePhotos?: number[]; url?: string }
        | null
      if (!response.ok || !data || "error" in data && data.error) {
        const code = (data && "error" in data ? data.error : "model_error") as string
        if (code === "no_panes" && data && "unusablePhotos" in data && Array.isArray(data.unusablePhotos)) {
          const bad = new Set(data.unusablePhotos)
          setPhotos((current) =>
            current.map((p) => {
              const idx = readyPhotos.findIndex((r) => r.id === p.id)
              return idx >= 0 && bad.has(idx) ? { ...p, unusable: true } : p
            })
          )
        }
        const known: ErrorCode[] = ["rate_limited", "high_demand", "unavailable", "no_panes", "model_error", "turnstile", "bad_photo", "session"]
        fail(known.includes(code as ErrorCode) ? (code as ErrorCode) : "model_error")
        return
      }

      const est = data as EstimateResponse
      setEstimate(est)
      setPanes(
        est.price.panes.map((p) => ({
          id: p.id,
          label: p.label,
          type: p.type,
          width_cm: p.width_cm,
          height_cm: p.height_cm,
          confidence: p.confidence,
        }))
      )
      if (est.unusablePhotos.length > 0) {
        const bad = new Set(est.unusablePhotos)
        setPhotos((current) =>
          current.map((p) => {
            const idx = readyPhotos.findIndex((r) => r.id === p.id)
            return idx >= 0 && bad.has(idx) ? { ...p, unusable: true } : p
          })
        )
      }
      setStep("price")
      track("photo_quote_price_shown", {
        point: est.price.point,
        low: est.price.low,
        high: est.price.high,
        panes: est.price.panes.length,
        m2: est.price.totalM2,
        zone: est.price.zone,
        cached: est.cached,
      })
    } catch {
      fail("network")
    }
  }

  // Live price for the pane list (client-side, same engine as the server).
  const livePrice: PhotoQuotePriceDTO | null = useMemo(() => {
    if (!estimate || panes.length === 0) return null
    return pricePhotoQuote(panesFromClient(panes), estimate.price.zone)
  }, [estimate, panes])

  const useCalculator = () => {
    onOpenChange(false)
    onUseCalculator(panes.length || readyPhotos.length || 1)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          data-photo-quote-sheet
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed z-[70] flex flex-col bg-background text-foreground shadow-2xl focus:outline-none",
            "inset-0 h-[100dvh] w-full",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[min(100vw-2rem,34rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border/60 px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 sm:px-6 sm:pt-5">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-bold leading-tight">
                {step === "photos" && "Add a photo of each window"}
                {step === "estimating" && "Working out your price"}
                {step === "price" && "Your instant estimate"}
                {step === "contact" && "Book your installation"}
                {step === "done" && "You're booked in"}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                {step === "photos" && "Stand inside, square on, get the whole frame in the shot."}
                {step === "estimating" && "This usually takes a few seconds."}
                {step === "price" && "Tap a pane to adjust it if we've got a size wrong."}
                {step === "contact" && "We'll confirm the exact price before fitting."}
                {step === "done" && "Thanks for choosing ManxTints."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <AnimatePresence mode="wait" initial={false}>
              {step === "photos" && (
                <motion.div
                  key="photos"
                  initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                  className="space-y-5"
                >
                  {error && (
                    <ErrorNotice code={error} onCalculator={useCalculator} onDismiss={() => setError(null)} />
                  )}

                  {!featureEnabled && !error && (
                    <ErrorNotice code="unavailable" onCalculator={useCalculator} />
                  )}

                  {/* Capture inputs — camera (mobile) and library/file picker */}
                  <input
                    ref={cameraInput}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) void addFiles(e.target.files)
                      e.target.value = ""
                    }}
                  />
                  <input
                    ref={libraryInput}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) void addFiles(e.target.files)
                      e.target.value = ""
                    }}
                  />

                  {photos.length === 0 ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        data-photo-quote-camera
                        onClick={() => cameraInput.current?.click()}
                        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-10 text-center transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                          <Camera className="h-7 w-7" />
                        </span>
                        <span className="text-base font-semibold">Take a photo</span>
                        <span className="text-xs text-muted-foreground">One window per photo works best</span>
                      </button>
                      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => libraryInput.current?.click()}>
                        <ImagePlus className="h-4 w-4" />
                        Choose from photos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        <AnimatePresence initial={false}>
                          {photos.map((photo, index) => (
                            <motion.div
                              key={photo.id}
                              layout={!reduceMotion}
                              initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
                              className={cn(
                                "relative aspect-square overflow-hidden rounded-xl border bg-muted",
                                photo.status === "failed" || photo.unusable ? "border-red-400" : "border-border"
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.preview} alt={`Window photo ${index + 1}`} className="h-full w-full object-cover" />
                              {(photo.status === "preparing" || photo.status === "uploading") && (
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
                                  <div
                                    className="h-full bg-primary transition-[width] duration-200"
                                    style={{ width: `${photo.status === "preparing" ? 8 : Math.max(8, photo.progress)}%` }}
                                  />
                                </div>
                              )}
                              {photo.status === "ready" && !photo.unusable && (
                                <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-trust text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                              )}
                              {photo.status === "failed" && (
                                <span className="absolute inset-x-1 bottom-1 rounded-md bg-red-600/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
                                  Upload failed
                                </span>
                              )}
                              {photo.unusable && photo.status === "ready" && (
                                <span className="absolute inset-x-1 bottom-1 rounded-md bg-red-600/90 px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
                                  Too unclear — retake?
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(photo.id)}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background/90"
                                aria-label={`Remove photo ${index + 1}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {photos.length < PHOTO_QUOTE_MAX_PHOTOS && (
                          <button
                            type="button"
                            onClick={() => cameraInput.current?.click()}
                            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary transition-colors hover:border-primary hover:bg-primary/10"
                          >
                            <Plus className="h-6 w-6" />
                            <span className="text-[11px] font-medium leading-tight">Add another window</span>
                          </button>
                        )}
                      </div>

                      {/* Quality hints — never blocking */}
                      {photos.some((p) => p.warnings.length > 0 && p.status !== "failed") && (
                        <ul className="flex flex-wrap gap-1.5">
                          {photos.map((p, i) =>
                            p.warnings.map((w) => (
                              <li
                                key={`${p.id}-${w}`}
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                Photo {i + 1}: {WARNING_COPY[w]}
                              </li>
                            ))
                          )}
                        </ul>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {photos.length} of {PHOTO_QUOTE_MAX_PHOTOS} photos
                        </span>
                        <button type="button" onClick={() => libraryInput.current?.click()} className="font-medium text-primary underline-offset-2 hover:underline">
                          Choose from photos
                        </button>
                      </div>
                    </div>
                  )}

                  <Turnstile
                    ref={turnstileRef}
                    onToken={(t) => {
                      turnstileToken.current = t
                      setTurnstileReady(Boolean(t))
                    }}
                  />
                </motion.div>
              )}

              {step === "estimating" && (
                <motion.div
                  key="estimating"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  className="flex min-h-[18rem] flex-col items-center justify-center gap-6 text-center"
                  aria-live="polite"
                >
                  <div className="relative h-20 w-20">
                    <motion.span
                      className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-primary">
                      <Camera className="h-8 w-8" />
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{LOADING_LINES[loadingLine]}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {readyPhotos.length} photo{readyPhotos.length === 1 ? "" : "s"} · Standard film · {zone.label}
                    </p>
                  </div>
                </motion.div>
              )}

              {step === "price" && estimate && livePrice && (
                <PriceStep
                  key="price"
                  estimate={estimate}
                  price={livePrice}
                  panes={panes}
                  setPanes={setPanes}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  unusableCount={photos.filter((p) => p.unusable).length}
                  onRetake={() => setStep("photos")}
                  onBook={() => setStep("contact")}
                  onCalculator={useCalculator}
                  reduceMotion={Boolean(reduceMotion)}
                />
              )}

              {step === "contact" && estimate && livePrice && session && (
                <ContactStep
                  key="contact"
                  session={session}
                  estimate={estimate}
                  price={livePrice}
                  panes={panes}
                  photoUrls={readyPhotos.map((p) => p.url as string)}
                  onBack={() => setStep("price")}
                  onDone={() => setStep("done")}
                  reduceMotion={Boolean(reduceMotion)}
                />
              )}

              {step === "done" && (
                <motion.div
                  key="done"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[18rem] flex-col items-center justify-center gap-5 text-center"
                >
                  <motion.div
                    initial={reduceMotion ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-400"
                  >
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-2xl font-bold">Thanks!</p>
                    <p className="mt-2 max-w-sm text-muted-foreground">
                      We&apos;ll confirm your slot and the exact price after a quick check of your photos.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA for the photo step */}
          {step === "photos" && (
            <div className="border-t border-border/60 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5">
              <Button
                type="button"
                variant="electric"
                size="xl"
                className="w-full gap-2"
                disabled={!canEstimate}
                data-photo-quote-estimate
                onClick={requestEstimate}
              >
                {busyPhotos ? "Uploading…" : readyPhotos.length > 0 && !turnstileReady ? "Checking…" : "Get my price"}
                {!busyPhotos && turnstileReady && <ArrowRight className="h-5 w-5" />}
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Standard film · prices for {zone.label} · estimate, re-measured on the day
                {TURNSTILE_SITE_KEY ? " · protected by Cloudflare Turnstile" : ""}
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ---------------------------------------------------------------------------
// Error notice
// ---------------------------------------------------------------------------

function ErrorNotice({
  code,
  onCalculator,
  onDismiss,
}: {
  code: ErrorCode
  onCalculator: () => void
  onDismiss?: () => void
}) {
  const copy = ERROR_COPY[code]
  return (
    <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="mt-0.5 text-sm">{copy.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.calculator && (
              <Button type="button" size="sm" onClick={onCalculator} className="gap-1.5">
                <Calculator className="h-4 w-4" />
                Use the calculator
              </Button>
            )}
            {onDismiss && (
              <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Price step
// ---------------------------------------------------------------------------

function PriceStep({
  estimate,
  price,
  panes,
  setPanes,
  editingId,
  setEditingId,
  unusableCount,
  onRetake,
  onBook,
  onCalculator,
  reduceMotion,
}: {
  estimate: EstimateResponse
  price: PhotoQuotePriceDTO
  panes: ClientPane[]
  setPanes: (next: ClientPane[]) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  unusableCount: number
  onRetake: () => void
  onBook: () => void
  onCalculator: () => void
  reduceMotion: boolean
}) {
  const updatePane = (id: string, patch: Partial<ClientPane>) =>
    setPanes(panes.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const removePane = (id: string) => {
    if (panes.length === 1) return
    setPanes(panes.filter((p) => p.id !== id))
    if (editingId === id) setEditingId(null)
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
      className="space-y-5"
    >
      {/* Headline */}
      <div className="text-center" data-photo-quote-price>
        <motion.div
          initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.45, delay: 0.1 }}
          className="text-6xl font-bold leading-none text-gradient sm:text-7xl"
        >
          <CountUp key={price.point} value={price.point} prefix="£" durationMs={900} />
        </motion.div>
        <p className="mt-3 text-base font-medium">
          Likely <span className="font-semibold">£{price.low}</span> to <span className="font-semibold">£{price.high}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Standard film · {price.zoneLabel} · estimate · {price.totalM2.toFixed(1)} m² across {price.panes.length} pane
          {price.panes.length === 1 ? "" : "s"}
        </p>
        <div className="mt-3 flex justify-center">
          <ZoneChip size="sm" />
        </div>
        {price.jobFloorApplied && (
          <p className="mt-2 text-xs text-muted-foreground">Minimum job charge for {price.zoneLabel} is £{price.minJob}.</p>
        )}
      </div>

      {unusableCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {unusableCount} photo{unusableCount === 1 ? " wasn't" : "s weren't"} clear enough to measure from.{" "}
            <button type="button" onClick={onRetake} className="font-semibold underline underline-offset-2">
              Retake {unusableCount === 1 ? "it" : "them"}
            </button>
          </p>
        </div>
      )}

      {/* Pane list */}
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/40" data-photo-quote-panes>
        {price.panes.map((pane) => {
          const editable = panes.find((p) => p.id === pane.id)
          if (!editable) return null
          const isEditing = editingId === pane.id
          return (
            <li key={pane.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{pane.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {PANE_TYPE_LABELS[pane.type]} · {pane.width_cm} × {pane.height_cm} cm · {pane.m2.toFixed(2)} m²
                    {pane.confidence < 0.5 && <span className="ml-1 text-amber-700">· low confidence</span>}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">£{pane.price.toFixed(0)}</span>
                <button
                  type="button"
                  onClick={() => setEditingId(isEditing ? null : pane.id)}
                  className={cn(
                    "rounded-full p-2 transition-colors",
                    isEditing ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-label={isEditing ? `Done editing ${pane.label}` : `Edit ${pane.label}`}
                  aria-expanded={isEditing}
                >
                  {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => removePane(pane.id)}
                  disabled={panes.length === 1}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  aria-label={`Remove ${pane.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {isEditing && (
                  <motion.div
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${pane.id}-w`} className="text-xs">
                          Width (cm)
                        </Label>
                        <Input
                          id={`${pane.id}-w`}
                          type="number"
                          inputMode="numeric"
                          min={10}
                          max={600}
                          value={editable.width_cm}
                          onChange={(e) => updatePane(pane.id, { width_cm: clampCm(e.target.value, 600), confidence: 1 })}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${pane.id}-h`} className="text-xs">
                          Height (cm)
                        </Label>
                        <Input
                          id={`${pane.id}-h`}
                          type="number"
                          inputMode="numeric"
                          min={10}
                          max={400}
                          value={editable.height_cm}
                          onChange={(e) => updatePane(pane.id, { height_cm: clampCm(e.target.value, 400), confidence: 1 })}
                          className="bg-background"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label htmlFor={`${pane.id}-l`} className="text-xs">
                          Label
                        </Label>
                        <Input
                          id={`${pane.id}-l`}
                          value={editable.label}
                          maxLength={60}
                          onChange={(e) => updatePane(pane.id, { label: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>

      {estimate.notes && <p className="text-xs text-muted-foreground">{estimate.notes}</p>}

      <p className="text-center text-xs text-muted-foreground">
        Estimated from your photos. Your installer re-measures on the day and confirms the exact price before fitting.
      </p>

      <div className="space-y-3">
        <Button type="button" variant="electric" size="xl" className="w-full gap-2" onClick={onBook} data-photo-quote-book>
          Book my installation
          <ArrowRight className="h-5 w-5" />
        </Button>
        <button
          type="button"
          onClick={onCalculator}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-trust/50 bg-trust-soft/60 px-4 py-3 text-sm font-medium text-trust transition-colors hover:bg-trust-soft"
        >
          <Calculator className="h-4 w-4" />
          Want the exact price and 10% off? Measure up in the calculator
        </button>
      </div>
    </motion.div>
  )
}

function clampCm(value: string, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 10
  return Math.min(max, Math.max(10, Math.round(n)))
}

// ---------------------------------------------------------------------------
// Contact / booking step
// ---------------------------------------------------------------------------

function ContactStep({
  session,
  estimate,
  price,
  panes,
  photoUrls,
  onBack,
  onDone,
  reduceMotion,
}: {
  session: string
  estimate: EstimateResponse
  price: PhotoQuotePriceDTO
  panes: ClientPane[]
  photoUrls: string[]
  onBack: () => void
  onDone: () => void
  reduceMotion: boolean
}) {
  const { setZone } = useZone()
  const [postcodeZone, setPostcodeZone] = useState<ZoneKey | null | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const startedRef = useRef(false)

  // Price the customer will actually be quoted: moves with the postcode.
  const shownPrice = useMemo(() => {
    if (postcodeZone && postcodeZone !== price.zone) return pricePhotoQuote(panesFromClient(panes), postcodeZone)
    return price
  }, [postcodeZone, price, panes])
  const repriced = postcodeZone !== undefined && postcodeZone !== null && postcodeZone !== price.zone

  const reconcile = (raw: string) => {
    setPostcodeZone(zoneFromPostcode(raw))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = formData.get("name")?.toString().trim() || ""
    const phone = formData.get("phone")?.toString().trim() || ""
    const email = formData.get("email")?.toString().trim() || ""
    const houseName = formData.get("houseName")?.toString().trim() || ""
    const postcode = formData.get("postcode")?.toString().trim() || ""
    const customerNotes = formData.get("message")?.toString() || ""
    const gotcha = formData.get("_gotcha")?.toString() || ""

    setIsSubmitting(true)
    setSubmitError(null)

    // Server recompute: edited panes + postcode-derived zone.
    let serverPrice: PriceResponse | null = null
    try {
      const response = await fetch("/api/photo-quote/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session, panes, zone: price.zone, postcode: postcode || undefined }),
      })
      if (response.ok) serverPrice = (await response.json()) as PriceResponse
    } catch {
      // fall through — the client figure is from the same engine
    }
    const finalPrice = serverPrice?.price ?? shownPrice
    const derivedZone = serverPrice ? serverPrice.postcodeZone : zoneFromPostcode(postcode)
    if (derivedZone && derivedZone !== price.zone) setZone(derivedZone, "postcode")

    const lead = buildPhotoQuoteLead({
      price: finalPrice,
      propertyTypeName: PROPERTY_TYPE_LABELS[estimate.propertyType],
      photoUrls,
      estimateNotes: estimate.notes,
      postcodeUnmapped: derivedZone === null,
      customerNotes,
    })

    formData.set("_subject", `New Photo Quote — ${PROPERTY_TYPE_LABELS[estimate.propertyType]} — est. £${finalPrice.point.toFixed(0)}`)
    formData.set("Category", "Property (photo estimate)")
    formData.set("Pricing Area", finalPrice.zoneLabel)
    formData.set("Estimate", `£${finalPrice.point.toFixed(2)} (range £${finalPrice.low}–£${finalPrice.high})`)
    formData.set("Total Area (m²)", finalPrice.totalM2.toFixed(1))
    formData.set("Number of Panes", String(finalPrice.panes.length))
    photoUrls.forEach((url, i) => formData.set(`Photo ${i + 1}`, url))

    const result = await submitLead(
      {
        name,
        phone,
        email,
        address: [houseName, postcode].filter(Boolean).join(", "),
        service: lead.service,
        message: lead.message,
        gotcha,
        jobDetails: lead.jobDetails,
      },
      formData
    )

    if (!result.accepted) {
      setSubmitError("There was a problem sending your booking. Please try again or call us.")
      setIsSubmitting(false)
      return
    }

    void trackLead(result, {
      contentName: "photo_quote",
      value: Number(finalPrice.point.toFixed(2)),
      email,
      phone,
      firstName: name ? name.split(" ")[0] : undefined,
      zip: postcode || undefined,
    })
    track("photo_quote_booked", {
      point: finalPrice.point,
      low: finalPrice.low,
      high: finalPrice.high,
      panes: finalPrice.panes.length,
      m2: finalPrice.totalM2,
      zone: finalPrice.zone,
      postcodeMatched: derivedZone !== null,
    })
    fetch("/api/photo-quote/booked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session, photos: photoUrls }),
      keepalive: true,
    }).catch(() => {})

    setIsSubmitting(false)
    onDone()
  }

  return (
    <motion.form
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
      onSubmit={handleSubmit}
      onFocusCapture={() => {
        if (startedRef.current) return
        startedRef.current = true
        trackEnquiryStarted("photo_quote")
      }}
      className="space-y-5"
    >
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="rounded-xl border border-border/60 bg-card/50 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Your estimate</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">£{shownPrice.point.toFixed(0)}</p>
        <p className="text-xs text-muted-foreground">
          Likely £{shownPrice.low}–£{shownPrice.high} · Standard film · {shownPrice.zoneLabel}
        </p>
        <AnimatePresence>
          {repriced && (
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900"
              data-photo-quote-repriced
            >
              Your postcode is in the {zones[postcodeZone as ZoneKey].label} area — price updated from £{price.point.toFixed(0)}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pq-name">Full name *</Label>
          <Input id="pq-name" name="name" required autoComplete="name" placeholder="John Smith" className="bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pq-phone">Phone *</Label>
          <Input id="pq-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+44 7624 000 000" className="bg-background" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pq-email">Email *</Label>
        <Input id="pq-email" name="email" type="email" required autoComplete="email" placeholder="john@example.com" className="bg-background" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pq-house">House name / number *</Label>
          <Input id="pq-house" name="houseName" required autoComplete="address-line1" placeholder="e.g. 12 or Rose Cottage" className="bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pq-postcode">Postcode *</Label>
          <Input
            id="pq-postcode"
            name="postcode"
            required
            autoComplete="postal-code"
            placeholder="e.g. IM2 1BB"
            className="bg-background"
            onBlur={(e) => reconcile(e.target.value)}
            onChange={(e) => {
              if (zoneFromPostcode(e.target.value)) reconcile(e.target.value)
            }}
          />
          {postcodeZone === null && (
            <p className="text-xs text-muted-foreground">We couldn&apos;t match that postcode to an area. {UNMAPPED_POSTCODE_LINE}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pq-message">Anything else?</Label>
        <Textarea id="pq-message" name="message" rows={2} placeholder="Access, preferred days, anything we should know…" className="resize-none bg-background" />
      </div>

      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        By booking ManxTints LTD you agree to our{" "}
        <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
          terms &amp; conditions
        </a>
        . Exact price confirmed after a quick check of your photos.
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit" variant="electric" size="lg" className="flex-1 gap-2" disabled={isSubmitting} data-photo-quote-submit>
          {isSubmitting ? (
            <>
              <motion.span
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
              />
              Booking…
            </>
          ) : (
            <>
              Book my installation
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </motion.form>
  )
}
