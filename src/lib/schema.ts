import { SITE_URL } from "./sitemap-config";
import { Strain, SeedBank, BlogPost } from "./types";
import { seedBankCount } from "./strain-utils";

// JSON-LD builders — one per page type, following Google's recommended
// structured data for each. Rendered via <JsonLd data={...} />.

const ORG_ID = `${SITE_URL}/#organization`;

/** Site-wide: who runs this site. Rendered in the root layout. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "GrowingWeed",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "GrowingWeed is the grower's guide to cannabis — cultivation guides for every stage of the grow, plus 30,000+ strains compared across the world's most trusted seed banks.",
  };
}

/** Site-wide: enables the sitelinks search box. Rendered in the root layout. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "GrowingWeed",
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/strains?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Breadcrumb trail for detail pages. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Strain pages: Product with rating. Prices intentionally omitted —
 *  listed offers are indicative, not live retailer quotes. */
export function strainProductSchema(strain: Strain) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${strain.name} Cannabis Seeds`,
    description: strain.description,
    url: `${SITE_URL}/strains/${strain.slug}`,
    category: "Cannabis Seeds",
    ...(strain.image ? { image: `${SITE_URL}${strain.image}` } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "THC", value: `${strain.thc}%` },
      { "@type": "PropertyValue", name: "CBD", value: `${strain.cbd}%` },
      { "@type": "PropertyValue", name: "Seed Banks Stocking", value: seedBankCount(strain) },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: strain.rating,
      reviewCount: strain.reviewCount,
      bestRating: 5,
    },
  };
}

/** Seed bank pages: the store as an OnlineStore with its rating. */
export function seedBankSchema(bank: SeedBank) {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: bank.name,
    url: bank.url,
    logo: `${SITE_URL}${bank.logo}`,
    description: bank.description,
    foundingDate: String(bank.established),
    mainEntityOfPage: `${SITE_URL}/seed-banks/${bank.slug}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: bank.rating,
      reviewCount: bank.reviewCount,
      bestRating: 5,
    },
  };
}

/** Grow guide / blog posts. */
export function blogPostSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/${post.slug}`,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    articleSection: post.category,
    ...(post.image ? { image: post.image } : {}),
  };
}

/** Collection indexes (seed banks list, grow guides list). */
export function itemListSchema(
  name: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Help page: FAQ rich results. */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
