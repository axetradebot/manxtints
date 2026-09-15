"use client"

import { useState } from "react"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/motion"
import { platformRatings, reviews } from "@/content/reviews"
import { site } from "@/site.config"
import { FacebookIcon, GoogleIcon } from "@/components/trust/trust-icons"

const INITIAL = 6

/** Genuine reviews from content/reviews.ts; platform ratings derived from them (or overridden in config). */
export function ReviewsSection() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? reviews : reviews.slice(0, INITIAL)
  const ratings = platformRatings()

  if (reviews.length === 0) return null

  return (
    <section className="bg-white py-20 md:py-28" id="reviews">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Reviews</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 md:text-5xl">
              What customers say
            </h2>
            {ratings.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {ratings.map((p) => {
                  const Logo = p.source === "google" ? GoogleIcon : FacebookIcon
                  return (
                    <a
                      key={p.source}
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors hover:border-slate-300"
                    >
                      <Logo className="h-5 w-5" />
                      <span className="font-semibold text-slate-900">{p.rating.toFixed(1)}</span>
                      <span className="flex gap-0.5" aria-hidden>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                      <span className="text-sm text-slate-500">
                        {p.count} {p.label} reviews
                      </span>
                    </a>
                  )
                })}
              </div>
            )}
            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
              <a
                href={site.social.googleReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Read all reviews on Google <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={site.social.facebookReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Read all reviews on Facebook <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </FadeIn>

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((review, index) => (
            <li key={`${review.name}-${index}`}>
              <Card className="h-full border-slate-200 bg-white shadow-sm card-hover">
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{review.date}</span>
                  </div>
                  <p className="mb-4 leading-relaxed text-slate-700">&ldquo;{review.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-primary">
                      {review.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.source === "google" ? "Google review" : "Facebook review"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>

        {reviews.length > INITIAL && (
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show fewer reviews" : "Show all reviews"}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
