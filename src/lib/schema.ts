import type { Locale } from "@/i18n/config";
import type { Faq, NewsItem, Product, Service, Settings } from "./content";

export const SITE = (process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://cyberpoint.az").replace(/\/$/, "");
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;
const LANG: Record<Locale, string> = { az: "az-AZ", en: "en", ru: "ru-RU" };

export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE}${path.startsWith("/") ? "" : "/"}${path}`);

/** Serialises JSON-LD safely for a <script> tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function organization(settings: Settings, locale: Locale, opts: { description: string; services: string[]; credentials: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Cyberpoint",
    legalName: "Cyberpoint MMC",
    alternateName: ["CyberPoint", "Cyber Point"],
    url: SITE,
    logo: { "@type": "ImageObject", url: abs("/brand/live/logo") },
    image: abs("/brand/live/og"),
    slogan: "Bir addım öndə",
    description: opts.description,
    email: settings.email,
    telephone: settings.phone,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: "Baku", addressCountry: "AZ" },
    areaServed: { "@type": "Country", name: "Azerbaijan" },
    contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", telephone: settings.phone, email: settings.email, availableLanguage: ["az", "en", "ru"], hoursAvailable: "Mo-Su 00:00-23:59" }],
    knowsAbout: ["Cybersecurity", "Security Operations Center", "Penetration testing", "Digital forensics", "SIEM", "Threat intelligence", ...opts.services],
    hasCredential: opts.credentials.map((name) => ({ "@type": "EducationalOccupationalCredential", name })),
    sameAs: settings.socials.map((s) => s.href),
    inLanguage: LANG[locale],
  };
}

export function website(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE,
    name: "Cyberpoint",
    publisher: { "@id": ORG_ID },
    inLanguage: ["az-AZ", "en", "ru-RU"],
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/${locale}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbs(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: abs(c.href) } : {}) })),
  };
}

export function webPage(type: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage" | "SearchResultsPage", locale: Locale, path: string, name: string, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name,
    description,
    inLanguage: LANG[locale],
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };
}

export function serviceLd(s: Service, locale: Locale, category: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(`/${locale}/services/${s.slug}`)}#service`,
    name: s.title,
    serviceType: s.title,
    category,
    description: s.short,
    url: abs(`/${locale}/services/${s.slug}`),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Azerbaijan" },
    availableLanguage: ["az", "en", "ru"],
    inLanguage: LANG[locale],
    ...(s.features.length
      ? { hasOfferCatalog: { "@type": "OfferCatalog", name: s.title, itemListElement: s.features.map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f } })) } }
      : {}),
  };
}

export function productLd(p: Product, locale: Locale, category: string, vendors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(`/${locale}/products/${p.slug}`)}#service`,
    name: `${p.name} — ${p.full}`,
    serviceType: `${p.full} (${p.name}) solutions: selection, deployment and support`,
    category,
    description: `${p.desc}. ${p.body}`,
    url: abs(`/${locale}/products/${p.slug}`),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Azerbaijan" },
    inLanguage: LANG[locale],
    ...(vendors.length ? { brand: vendors.map((name) => ({ "@type": "Brand", name })) } : {}),
  };
}

export function articleLd(n: NewsItem, locale: Locale) {
  const url = abs(`/${locale}/news/${n.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: n.title.slice(0, 110),
    description: n.body.replace(/\s+/g, " ").slice(0, 200),
    image: n.image ? [abs(n.image)] : [abs("/brand/live/og")],
    datePublished: n.date,
    dateModified: n.date,
    inLanguage: n.translated ? LANG[locale] : "az-AZ",
    author: { "@id": ORG_ID, "@type": "Organization", name: "Cyberpoint" },
    publisher: { "@id": ORG_ID },
  };
}

export function faqLd(faqs: Faq[], locale: Locale, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${abs(path)}#faq`,
    inLanguage: LANG[locale],
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function itemList(name: string, items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(it.url) })),
  };
}
