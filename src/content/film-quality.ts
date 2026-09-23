/**
 * Copy for the "Why ManxTints" film-quality section and the matching FAQ.
 * Kept in one place so the compatibility-check wording is identical wherever
 * it appears. Plain, human tone; no em dashes.
 */

export const FILM_QUALITY_COPY = {
  eyebrow: "Why ManxTints",
  headline: "Not all window film is the same.",
  subline: "The film on your glass matters more than the price on the quote.",
  closer: "For premium homes, there's a premium choice. Use ManxTints.",
  primaryCta: { label: "Get an instant quote", href: "/quote" },
  secondaryCta: { label: "See our two films", href: "/services#tiers" },
}

export const CHEAP_FILM_PARAGRAPH =
  "Most UK installers fit low-cost, high-absorption films. They soak up heat instead of reflecting it, which stresses double glazing, can void your glass warranty and can cause seal failure or thermal cracking."

export const COMPATIBILITY_CHECK_PARAGRAPH =
  "We only use premium, low-absorption films chosen for glass compatibility. Every job is checked against the manufacturer's film-to-glass chart before we fit, so your double glazing stays sound and your warranty stays intact."

export const REAL_HOMES_PARAGRAPH =
  "Our dual-reflective films keep the one-way effect by day and stay clear from inside at night, so you're not living behind a mirror after dark. If you want the best film on the market, this is it."

export const DOUBLE_GLAZING_FAQ = {
  question: "Will window film damage my double glazing?",
  answer: `Not when the right film is fitted. ${CHEAP_FILM_PARAGRAPH} ${COMPATIBILITY_CHECK_PARAGRAPH}`,
}

export interface ComparisonRow {
  label: string
  typical: string
  manx: string
}

/**
 * Two-column strip. `manx` is always the tick column. Guarantee years come
 * from site.config so the strip can never disagree with the guarantee panel.
 */
export function buildComparisonRows(guarantee: { workmanshipYears: number; extendedYears: number }): ComparisonRow[] {
  const { workmanshipYears, extendedYears } = guarantee
  const guaranteeLine =
    workmanshipYears > 0 && extendedYears > 0
      ? `${workmanshipYears} years, ${extendedYears} on Premium`
      : workmanshipYears > 0
        ? `${workmanshipYears} years, written`
        : "Written, honoured by us"

  return [
    { label: "Film type", typical: "Budget high-absorption", manx: "Premium low-absorption" },
    { label: "Glass compatibility check", typical: "Rarely", manx: "Every job" },
    { label: "Night-time view from inside", typical: "Mirrored", manx: "Clear (Premium tier)" },
    { label: "Guarantee", typical: "Varies", manx: guaranteeLine },
    { label: "Installers", typical: "Unvetted", manx: "Vetted, insured" },
  ]
}
