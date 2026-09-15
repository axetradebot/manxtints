import { hasStat, site } from "@/site.config"

/**
 * Genuine customer reviews, copied verbatim with names as they appear on
 * Google / Facebook. Never add a review that was not left by a real customer.
 */
export interface Review {
  name: string
  content: string
  rating: number
  date: string
  source: "google" | "facebook"
}

export const reviews: Review[] = [
  {
    name: "Jamie Powell",
    content:
      "We enquired about window tints primarily to help our elderly neighbour with privacy issues in his lounge. Axel was great—we asked lots of questions, which he answered so well, so much so we had ours done too! The whole experience was excellent from start to finish.",
    rating: 5,
    date: "April 2026",
    source: "google",
  },
  {
    name: "Rob Hulley",
    content:
      "Got my windows tinted today. Great job, swift installation, and very happy with the result. Will be perfect once summer arrives. Thanks Axel.",
    rating: 5,
    date: "April 2026",
    source: "google",
  },
  {
    name: "Chris S",
    content:
      "Great job by Axel. Showed up on time, explained everything clearly, and did the job professionally with proper cleaning when done. Highly recommend.",
    rating: 5,
    date: "April 2026",
    source: "google",
  },
  {
    name: "Andrea Barker",
    content:
      "Had a skylight tinted to help with heat and glare. Fabulous from start to finish! Great value, brilliant customer service—highly recommended. Will go back for more window work.",
    rating: 5,
    date: "April 2026",
    source: "google",
  },
  {
    name: "Deborah Bridson",
    content:
      "Another first class job by Axel—this is the third lot of windows we have had tinted on our house and it makes a real difference to privacy. Axel provides an excellent service and we wouldn't hesitate to recommend him.",
    rating: 5,
    date: "March 2026",
    source: "google",
  },
  {
    name: "Greg Manning",
    content: "Excellent service, quality job, quick, reasonable prices and a nice man 👍",
    rating: 5,
    date: "March 2026",
    source: "google",
  },
  {
    name: "Stewart Hunter",
    content:
      "Extremely pleased with the service and quality of the job. Axel is a great guy who turned up exactly when he said he would and did a top class job—very rare these days. His prices are also very reasonable; I was pleasantly surprised.",
    rating: 5,
    date: "February 2026",
    source: "google",
  },
  {
    name: "Kim Fletcher",
    content: "Excellent service from ManxTints. Very helpful and reliable.",
    rating: 5,
    date: "February 2026",
    source: "google",
  },
  {
    name: "Fraser Kinley",
    content:
      "A few questions asked online and quickly made an appointment to measure and explain options. About a week later had one-way mirror film applied. Nice friendly service. Highly recommend.",
    rating: 5,
    date: "20 February 2026",
    source: "facebook",
  },
  {
    name: "Geordie Larter",
    content:
      "Arrived on time, did a great job, very helpful—would recommend and use again. Thank you.",
    rating: 5,
    date: "11 February 2026",
    source: "facebook",
  },
  {
    name: "Paul King",
    content:
      "A huge thank you to Manx Tints for the fantastic job on my living room windows. The service was top-notch from start to finish. Axel was very polite and professional throughout the process. If you are looking for high-quality window tinting, I highly recommend Axel at Manx Tints.",
    rating: 5,
    date: "6 January 2026",
    source: "facebook",
  },
  {
    name: "Nina Marie Jensen",
    content:
      "We received a brilliant service from Axel from start to finish. Really pleased with our windows! Thanks very much!",
    rating: 5,
    date: "December 2025",
    source: "facebook",
  },
  {
    name: "Tracey Brown",
    content:
      "Axel came today and fitted our two front windows with the tint, absolutely brilliant job, he is quick, efficient, neat and tidy and totally prepared. Really decent guy and I highly recommend him. Delighted with the job done.",
    rating: 5,
    date: "November 2025",
    source: "facebook",
  },
  {
    name: "Ashlea Dentith",
    content:
      "Manx tints - what a lovely guy! Fantastic service, really pleased. Axel went above and beyond and fitted us in ASAP due to side effects from radiotherapy in my eye. I needed the brightness of the house reducing, it allowed me to be in my home after 9 days of being in a dark room. As well as some privacy on our large glass windows! Super clean and quick. Thanks Axel - always recommending you.",
    rating: 5,
    date: "July 2025",
    source: "facebook",
  },
  {
    name: "Sue Perry",
    content: "My windows look fab! Privacy restored.. great customer service too. Would highly recommend.",
    rating: 5,
    date: "May 2025",
    source: "facebook",
  },
  {
    name: "Kelly Dedman",
    content:
      "Windows look great! Excellent service, and the guys were quick, efficient and tidy. Highly recommend.",
    rating: 5,
    date: "March 2025",
    source: "facebook",
  },
  {
    name: "Ara Hunter",
    content:
      "Axel from Manx Tints did a fantastic job at my home today. He was professional, quick, and precise with the window tinting. Very happy with the service!",
    rating: 5,
    date: "October 2024",
    source: "facebook",
  },
  {
    name: "Moyra Kean",
    content: "A great job and the customer service is the best. I highly recommend them for all your window tints.",
    rating: 5,
    date: "March 2024",
    source: "facebook",
  },
  {
    name: "Craig Walmsley",
    content:
      "Absolutely awesome job and so happy with what they have done to my windows. So professional, really nice people to speak to and rapid to getting a quote back and doing the job. I will be using them again to do my top windows in my house for sure.",
    rating: 5,
    date: "March 2024",
    source: "facebook",
  },
  {
    name: "Brooke Cafearo",
    content:
      "I've had some privacy tint fitted on my lounge windows. I can see out but no one can see in! I'm SO impressed!!! Axe was efficient and professional! Would highly recommend!",
    rating: 5,
    date: "January 2024",
    source: "facebook",
  },
]

export type ReviewSource = Review["source"]

export interface PlatformRating {
  source: ReviewSource
  label: "Google" | "Facebook"
  /** Average rating, 1 decimal. */
  rating: number
  count: number
  href: string
}

function average(list: Review[]): number {
  if (list.length === 0) return 0
  const total = list.reduce((sum, r) => sum + r.rating, 0)
  return Math.round((total / list.length) * 10) / 10
}

/**
 * Rating + review count for a platform. Uses the live figures from
 * `site.stats` when set, otherwise derives them from the genuine reviews
 * above — never a made-up number. Returns null when there is nothing to show.
 */
export function platformRating(source: ReviewSource): PlatformRating | null {
  const list = reviews.filter((r) => r.source === source)
  const override =
    source === "google"
      ? { rating: site.stats.googleRating, count: site.stats.googleReviewCount }
      : { rating: site.stats.facebookRating, count: site.stats.facebookReviewCount }

  const rating = hasStat(override.rating) ? override.rating : average(list)
  const count = hasStat(override.count) ? override.count : list.length
  if (!hasStat(rating) || !hasStat(count)) return null

  return {
    source,
    label: source === "google" ? "Google" : "Facebook",
    rating,
    count,
    href: source === "google" ? site.social.googleReviews : site.social.facebookReviews,
  }
}

/** Every platform that has something honest to show, Google first. */
export function platformRatings(): PlatformRating[] {
  return (["google", "facebook"] as ReviewSource[])
    .map(platformRating)
    .filter((p): p is PlatformRating => p !== null)
}

/** Share of reviews on file that are 5-star, as a whole percentage (0 when there are none). */
export function fiveStarShare(): number {
  if (reviews.length === 0) return 0
  return Math.floor((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)
}

/** Overall figure across all platforms, for structured data. */
export function overallRating(): { rating: number; count: number } | null {
  const platforms = platformRatings()
  const count = platforms.reduce((n, p) => n + p.count, 0)
  if (count === 0) return null
  const rating = Math.round((platforms.reduce((sum, p) => sum + p.rating * p.count, 0) / count) * 10) / 10
  return { rating, count }
}
