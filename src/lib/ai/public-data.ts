import "server-only";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { cves } from "@/content/research";
import { getCertificates, getClients, getFaqs, getNews, getPartners, getProducts, getServices, getSettings } from "@/lib/content";
import { SITE } from "@/lib/schema";

export const RESOURCES = ["company", "services", "products", "partners", "clients", "certificates", "research", "news", "faq"] as const;
export type ResourceName = (typeof RESOURCES)[number];

const u = (p: string) => (p.startsWith("http") ? p : `${SITE}${p}`);

/** Structured, read-only public data for AI agents and integrations. */
export function publicData(name: ResourceName, locale: Locale) {
  const t = getDictionary(locale);
  switch (name) {
    case "company": {
      const s = getSettings(locale);
      return {
        name: "Cyberpoint", legal_name: "Cyberpoint MMC", url: SITE, locale, description: t.meta.description, summary: t.pages.about.lede,
        slogan: "Bir addım öndə", approach: { name: "Think red, act blue", description: t.home.approach.lede, steps: t.home.approach.steps },
        mission_vision_values: t.pages.about.mvv, key_figures: t.home.stats,
        contact: { phone: s.phone, email: s.email, hours: s.hours, address: s.address, map: s.mapUrl, page: u(`/${locale}/contact`) },
        social: s.socials, languages: ["az", "en", "ru"], area_served: "Azerbaijan",
      };
    }
    case "services":
      return getServices(locale).map((s) => ({
        slug: s.slug, title: s.title, summary: s.short, stage: s.phase, stage_label: t.common.phases[s.phase].label,
        description: s.body, includes: s.features, url: u(`/${locale}/services/${s.slug}`), markdown: u(`/md/${locale}/services/${s.slug}`),
      }));
    case "products": {
      const partners = getPartners();
      return getProducts(locale).map((p) => ({
        slug: p.slug, name: p.name, full_name: p.full, group: p.group, group_label: t.common.groups[p.group], summary: p.desc, description: p.body,
        vendors: partners.filter((v) => v.tags.includes(p.slug)).map((v) => v.name), url: u(`/${locale}/products/${p.slug}`),
      }));
    }
    case "partners":
      return getPartners().map((p) => ({ name: p.name, product_areas: p.tags, logo: u(p.logo), website: p.url || null }));
    case "clients": {
      const sectors = t.common.sectors as Record<string, string>;
      return getClients().map((c) => ({ name: c.name, sector: c.sector, sector_label: sectors[c.sector] ?? c.sector, logo: u(c.logo) }));
    }
    case "certificates":
      return getCertificates().map((c) => ({ name: c.name, type: c.kind, issuer: c.issuer || null, image: u(c.logo) }));
    case "research":
      return cves.map((c, i) => ({ id: c.id, product: c.product, driver: c.driver, impact: t.pages.research.impacts[i], record: `https://www.cve.org/CVERecord?id=${c.id}` }));
    case "news":
      return getNews(locale).map((n) => ({
        slug: n.slug, date: n.date, title: n.title, body: n.body, body_language: n.translated ? locale : "az",
        image: n.image ? u(n.image) : null, url: u(`/${locale}/news/${n.slug}`),
      }));
    case "faq":
      return getFaqs(locale).map((f) => ({ id: f.id, question: f.question, answer: f.answer, service: f.service || null, url: u(`/${locale}/faq#faq-${f.id}`) }));
  }
}
