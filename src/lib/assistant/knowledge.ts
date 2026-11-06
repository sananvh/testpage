import "server-only";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCertificates, getClients, getCves, getFaqs, getNews, getPartners, getProducts, getServices, getSettings } from "@/lib/content";

/** Site pages the assistant may open, with their path suffix (prefixed by /{locale}). */
export const STATIC_PAGES = [
  ["", "home"], ["/about", "about"], ["/services", "services"], ["/products", "products"], ["/partners", "partners"],
  ["/clients", "clients"], ["/certificates", "certificates"], ["/research", "research"], ["/news", "news"],
  ["/faq", "faq"], ["/careers", "careers"], ["/contact", "contact"], ["/privacy", "privacy"],
] as const;

/** Every path the navigate tool accepts, without the locale prefix. */
export function allowedPaths(locale: Locale): Set<string> {
  const set = new Set<string>(STATIC_PAGES.map(([p]) => p));
  for (const s of getServices(locale)) set.add(`/services/${s.slug}`);
  for (const p of getProducts(locale)) set.add(`/products/${p.slug}`);
  for (const n of getNews(locale)) set.add(`/news/${n.slug}`);
  return set;
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

/**
 * Plain-text knowledge base built from the database. Deterministic ordering and no timestamps,
 * so the cached system prompt prefix stays byte-identical between requests in the same locale.
 */
export function buildKnowledge(locale: Locale): string {
  const t = getDictionary(locale);
  const st = getSettings(locale);
  const out: string[] = [];

  out.push("# PAGES (path → page)");
  for (const [p, key] of STATIC_PAGES) out.push(`${p || "/"} → ${(t.nav as Record<string, unknown>)[key] ?? key}`);

  out.push("\n# COMPANY");
  out.push(`${t.pages.about.lede}`);
  out.push(t.home.about.lede);
  for (const w of t.pages.about.who) out.push(`- ${w.title}: ${w.text}`);
  out.push(t.pages.about.audience);
  for (const m of t.pages.about.mvv) out.push(`- ${m.title}: ${m.text}`);
  out.push(`Approach "Think red, act blue": ${t.home.approach.lede}`);
  for (const s of t.home.approach.steps) out.push(`- ${s.title}: ${s.text}`);
  out.push(`Key figures: ${t.home.stats.map((s) => `${s.value} ${s.label}`).join("; ")}`);

  out.push("\n# CONTACT");
  out.push(`Phone: ${st.phone} | Email: ${st.email} | Hours: ${st.hours} | Address: ${st.address}`);

  out.push("\n# SERVICES (path /services/{slug})");
  for (const s of getServices(locale)) {
    out.push(`\n## ${s.title} — slug: ${s.slug} — stage: ${t.common.phases[s.phase].label}`);
    out.push(s.short);
    out.push(s.body);
    if (s.features.length) out.push(`Includes: ${s.features.join("; ")}`);
  }

  out.push("\n# PRODUCTS (path /products/{slug})");
  const partners = getPartners();
  for (const p of getProducts(locale)) {
    const vendors = partners.filter((v) => v.tags.includes(p.slug)).map((v) => v.name);
    out.push(`- ${p.name} (${p.full}) — slug: ${p.slug} — ${t.common.groups[p.group]}: ${p.desc}. ${p.body}${vendors.length ? ` Vendors: ${vendors.join(", ")}.` : ""}`);
  }

  out.push("\n# TECHNOLOGY PARTNERS");
  out.push(partners.map((p) => p.name).join(", "));

  out.push("\n# CLIENTS");
  const sectors = t.common.sectors as Record<string, string>;
  out.push(getClients().map((c) => `${c.name} (${sectors[c.sector] ?? c.sector})`).join("; "));

  out.push("\n# CERTIFICATIONS");
  const certs = getCertificates();
  out.push(`Company: ${certs.filter((c) => c.kind === "company").map((c) => `${c.name}${c.issuer ? ` (${c.issuer})` : ""}`).join(", ")}`);
  out.push(`Team: ${certs.filter((c) => c.kind === "team").map((c) => c.name).join(", ")}`);

  out.push("\n# RESEARCH (R&D) — path /research");
  out.push(t.pages.research.lede);
  getCves(locale).forEach((c) => out.push(`- ${c.id}: ${c.product} (${c.driver}) — ${c.impact}`));
  const ac = t.pages.research.academy;
  out.push(`\n## ${ac.title} (${ac.badge}) — path /research; interest form: /contact?topic=academy`, ac.lede, ac.text);

  out.push("\n# CAREERS — path /careers");
  out.push(`${t.pages.careers.lede} ${t.pages.careers.formText}`);

  out.push("\n# FAQ (path /faq)");
  for (const f of getFaqs(locale)) out.push(`Q: ${f.question}\nA: ${f.answer}`);

  out.push("\n# NEWS (path /news/{slug}, newest first)");
  for (const n of getNews(locale, 20)) out.push(`- ${n.date} — ${n.title} — slug: ${n.slug} — ${clip(n.body.replace(/\s+/g, " "), 260)}`);

  return out.join("\n");
}
