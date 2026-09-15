import { hasStat, site } from "@/site.config"
import { overallRating } from "@/content/reviews"

/**
 * LocalBusiness + Organization schema built entirely from site.config.
 * aggregateRating is only emitted when there are genuine reviews on file
 * (or live totals set in config) — it always matches what the page shows.
 */
export function OrganizationJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/images/logo3.png`,
    image: `${site.url}${site.hero.image}`,
    description: `${site.tagline} serving the ${site.areasServed}. Online quotes, deposit-protected booking and installation by vetted local ManxTints installers.`,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Douglas",
      addressRegion: "Isle of Man",
      addressCountry: "IM",
    },
    areaServed: site.areasServedList.map((name) => ({ "@type": "AdministrativeArea", name })),
    sameAs: [site.social.facebook, site.social.instagram],
    priceRange: "££",
  }

  const rating = overallRating()
  if (rating) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.rating,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  if (hasStat(site.stats.installersInNetwork)) {
    data.numberOfEmployees = { "@type": "QuantitativeValue", value: site.stats.installersInNetwork }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
