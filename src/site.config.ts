/**
 * The truth file.
 *
 * Every claim on the site (numbers, badges, areas, guarantee wording) is read
 * from here. Components never hardcode a stat, and any stat that is 0 / empty
 * simply does not render — so the site is never wrong, only quieter until the
 * real figures are filled in.
 */
export const site = {
  name: "ManxTints",
  legalName: "ManxTints LTD",
  tagline: "Window Tinting Specialists",
  url: "https://www.manxtints.com",
  email: "manxtints@gmail.com",
  phone: "+44 7624 331401",
  phoneDisplay: "+44 7624 331401",
  registeredLocation: "Douglas, Isle of Man",

  /** Used everywhere the coverage is mentioned. Add "& Ireland" here if/when true. */
  areasServed: "Isle of Man & UK",
  /** Structured-data friendly list. Keep in step with `areasServed`. */
  areasServedList: ["Isle of Man", "United Kingdom"] as string[],

  /**
   * Fill with TRUE figures. Components hide any stat that is 0.
   * Ratings/review counts left at 0 are derived from the genuine reviews in
   * `content/reviews.ts` (see `platformRating`), so set them here only to
   * override with the live totals from Google / Facebook.
   */
  stats: {
    projectsCompleted: 0,
    yearsTrading: 0,
    googleRating: 0,
    googleReviewCount: 12, // live total on Google (Sep 2026)
    facebookRating: 0,
    facebookReviewCount: 14, // live total on Facebook (Sep 2026)
    installersInNetwork: 0,
    /** Minimum years of tinting experience required of every installer. Hidden if 0. */
    installerMinYears: 5,
  } as Record<
    | "projectsCompleted"
    | "yearsTrading"
    | "googleRating"
    | "googleReviewCount"
    | "facebookRating"
    | "facebookReviewCount"
    | "installersInNetwork"
    | "installerMinYears",
    number
  >,

  guarantee: {
    workmanshipYears: 5 as number,
    /** Optional upgrade offered in the DIY calculator; keep in step with pricing. */
    extendedYears: 10 as number,
    satisfactionPromise:
      "If you're not happy with the finish, we'll put it right — free.",
    /** Must stay consistent with /terms (no deposit at or below £500; 24h notice, no cancellation fee). */
    depositLine:
      "Most jobs need no deposit at all. Where one applies, it's held by ManxTints — never the installer — and refunded in full if we can't fit your job.",
    cancellationLine: "Cancel or reschedule with 24 hours' notice at no charge.",
  },

  /** Only true ones; editable. Rendered by BadgeRow as icon + text. */
  badges: [
    "Fully insured installers",
    "5-year workmanship warranty",
    "Deposit-protected booking",
    "Experienced local installers",
  ] as string[],

  /** Real film-brand logos if permitted, else empty (nothing renders). */
  filmPartnerLogos: [] as { name: string; src: string; href?: string }[],

  /**
   * Verifiable credentials shown on About, e.g. "Approved contractor to the Isle of Man Government".
   * The previous site carried that claim; re-add it here once it can be evidenced. Empty = nothing renders.
   */
  credentials: [] as string[],

  /** Film performance claims. Set to 0 to hide the related caption. */
  filmSpec: {
    uvBlockPercent: 99 as number,
    heatRejectionPercent: 91 as number,
  },

  /**
   * Claims about cheap film in the "Why ManxTints" section. The
   * "fail up to {n}x faster" sentence renders ONLY when both a figure and
   * its source are set; leave unset until there is evidence to cite.
   */
  filmClaims: {
    failureMultiplier: undefined as number | undefined,
    /** Where the figure comes from, e.g. a manufacturer's technical bulletin. */
    source: undefined as string | undefined,
  },

  founder: {
    name: "Axel Vinthagen",
    line: "Founder · Window tinter since 2020",
  },

  /**
   * Hero photograph slot.
   * Art direction: a finished conservatory or lounge from inside, daylight,
   * tinted glass clearly visible, no people, room calm and tidy.
   */
  hero: {
    image: "/images/hero.jpg",
    alt: "Lounge windows fitted with ManxTints privacy film in daylight",
    headline: "Cooler rooms. Private homes. Fitted by trusted local installers.",
  },

  social: {
    facebook: "https://facebook.com/manxtints",
    facebookReviews: "https://www.facebook.com/manxtints/reviews",
    instagram: "https://www.instagram.com/manxtintsltd",
    googleReviews:
      "https://www.google.com/search?sca_esv=c4e89c2c5914c7f8&rlz=1C1CHBF_en-GBIM1032IM1032&sxsrf=ANbL-n4DfdEfn1NW6XcXnkj-Dm1-yuc7qg:1778594927633&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOeXcdVt2lmgtKzBRhXCJXS4GpuZ0OdtsvY-tbf0aIRKagdvijPWMeXIXIHwM2m5jza-c5txbeTXiCh34oRJQyNneifQ9&q=ManxTints+LTD+Reviews&sa=X&ved=2ahUKEwiXpPG29rOUAxW2VkEAHTDHAvwQ0bkNegQIIxAF&biw=2133&bih=1012&dpr=0.9",
  },
}

export type Site = typeof site

/** Header/footer lockup sub-line, derived so it can never drift from `areasServed`. */
export const lockupSubline = `${site.tagline} · ${site.areasServed}`

/** True when a stat is a real, positive number. */
export function hasStat(value: number | undefined | null): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
}

/**
 * The substantiated "{n}x faster" sentence, or null when the config has no
 * figure or no source. Never renders a number we cannot back up.
 */
export function filmFailureClaim(
  claims: { failureMultiplier?: number; source?: string } = site.filmClaims
): string | null {
  const n = claims.failureMultiplier
  const hasSource = typeof claims.source === "string" && claims.source.trim().length > 0
  if (!hasStat(n) || !hasSource) return null
  const shown = Number.isInteger(n) ? String(n) : n.toFixed(1)
  return `Some films can cause units to fail up to ${shown}x faster.`
}
