import "server-only";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPrivacy } from "@/lib/site";
import {
  getCertificates, getClients, getFaqs, getNews, getNewsItem, getPartners, getProduct, getProducts, getService, getServices, getSettings, productGroups,
  getCves,
} from "@/lib/content";
import { SITE } from "@/lib/schema";

const url = (p: string) => `${SITE}${p}`;
const LANG_NAME: Record<Locale, string> = { az: "Azərbaycanca", en: "English", ru: "Русский" };

function footer(locale: Locale, path: string) {
  const alt = locales.map((l) => `[${LANG_NAME[l]}](${url(`/md/${l}${path}`)})`).join(" · ");
  return `\n\n---\nSource: ${url(`/${locale}${path}`)} · Other languages: ${alt} · Index: ${url("/llms.txt")}\n`;
}

function contactBlock(locale: Locale) {
  const t = getDictionary(locale);
  const s = getSettings(locale);
  return `- ${t.footer.phone}: ${s.phone}\n- ${t.footer.email}: ${s.email}\n- ${t.footer.hours}: ${s.hours}\n- ${t.footer.address}: ${s.address}`;
}

/** Markdown version of a site page, for AI agents and LLM ingestion. Returns null for unknown paths. */
export function pageMarkdown(locale: Locale, path: string): string | null {
  const t = getDictionary(locale);
  const seg = path.split("/").filter(Boolean);
  const [section, slug] = seg;
  let md: string | null = null;

  if (!section) {
    const svcs = getServices(locale);
    md = `# Cyberpoint — ${t.home.hero.title} ${t.home.hero.accent}.\n\n> ${t.home.hero.lede}\n\n## ${t.home.events.title}\n${t.home.events.lede}\n\n${t.home.events.items.map((e) => `- **${e.name}** (${e.full}, ${e.place}): ${t.home.events.role}`).join("\n")}\n\n## ${t.home.about.title}\n${t.home.about.lede}\n\n${t.home.about.advantages.map((a) => `- **${a.title}**: ${a.text}`).join("\n")}\n\n## ${t.home.services.title}\n${svcs.map((s) => `- [${s.title}](${url(`/${locale}/services/${s.slug}`)}): ${s.short}`).join("\n")}\n\n## ${t.common.allProducts}\n${getProducts(locale).map((p) => `- [${p.name} — ${p.full}](${url(`/${locale}/products/${p.slug}`)}): ${p.desc}`).join("\n")}\n\n## Key figures\n${t.home.stats.map((s) => `- ${s.value}: ${s.label}`).join("\n")}\n\n## ${t.footer.contact}\n${contactBlock(locale)}`;
  } else if (section === "about" && !slug) {
    const a = t.pages.about;
    md = `# ${a.title}\n\n${a.lede}\n\n## ${a.whoTitle}\n${a.who.map((w) => `- **${w.title}**: ${w.text}`).join("\n")}\n\n## ${a.audienceTitle}\n${a.audience}\n\n## Think red, act blue\n${t.home.approach.lede}\n\n${t.home.approach.steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.text}`).join("\n")}\n\n## ${a.mvvTitle}\n${a.mvv.map((m) => `- **${m.title}**: ${m.text}`).join("\n")}`;
  } else if (section === "services" && !slug) {
    const svcs = getServices(locale);
    md = `# ${t.pages.services.title}\n\n${t.pages.services.lede}\n\n${(["assess", "protect", "respond"] as const)
      .map((ph) => `## ${t.common.phases[ph].label}\n${t.common.phases[ph].text}\n\n${svcs.filter((s) => s.phase === ph).map((s) => `- [${s.title}](${url(`/${locale}/services/${s.slug}`)}): ${s.short}`).join("\n")}`)
      .join("\n\n")}`;
  } else if (section === "services" && slug) {
    const s = getService(slug, locale);
    if (s) {
      const faqs = getFaqs(locale, { service: s.slug });
      md = `# ${s.title}\n\n> ${s.short}\n\n${t.pages.service.phase}: ${t.common.phases[s.phase].label}\n\n${s.body}${s.features.length ? `\n\n## ${t.pages.service.includes}\n${s.features.map((f) => `- ${f}`).join("\n")}` : ""}${faqs.length ? `\n\n## ${t.pages.service.faqTitle}\n${faqs.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n")}` : ""}\n\n## ${t.nav.cta}\n${contactBlock(locale)}`;
    }
  } else if (section === "products" && !slug) {
    const prods = getProducts(locale);
    md = `# ${t.pages.products.title}\n\n${t.pages.products.lede}\n\n${productGroups
      .filter((g) => prods.some((p) => p.group === g))
      .map((g) => `## ${t.common.groups[g]}\n${prods.filter((p) => p.group === g).map((p) => `- [${p.name} — ${p.full}](${url(`/${locale}/products/${p.slug}`)}): ${p.desc}`).join("\n")}`)
      .join("\n\n")}`;
  } else if (section === "products" && slug) {
    const p = getProduct(slug, locale);
    if (p) {
      const vendors = getPartners().filter((v) => v.tags.includes(p.slug)).map((v) => v.name);
      md = `# ${p.name} — ${p.full}\n\n> ${p.desc}\n\n${t.common.groups[p.group]}\n\n${p.body}${vendors.length ? `\n\n## ${t.pages.product.vendors}\n${vendors.map((v) => `- ${v}`).join("\n")}` : ""}\n\n${t.pages.product.ctaText}`;
    }
  } else if (section === "partners" && !slug) {
    const prods = getProducts(locale);
    md = `# ${t.pages.partners.title}\n\n${t.pages.partners.lede}\n\n${getPartners()
      .map((p) => `- **${p.name}**${p.tags.length ? `: ${p.tags.map((tag) => prods.find((x) => x.slug === tag)?.name ?? tag).join(", ")}` : ""}`)
      .join("\n")}`;
  } else if (section === "clients" && !slug) {
    const sectors = t.common.sectors as Record<string, string>;
    md = `# ${t.pages.clients.title}\n\n${t.pages.clients.lede}\n\n${getClients().map((c) => `- **${c.name}** (${sectors[c.sector] ?? c.sector})`).join("\n")}`;
  } else if (section === "certificates" && !slug) {
    const c = getCertificates();
    md = `# ${t.pages.certificates.title}\n\n${t.pages.certificates.lede}\n\n## ${t.pages.certificates.company}\n${c.filter((x) => x.kind === "company").map((x) => `- ${x.name}${x.issuer ? ` (${x.issuer})` : ""}`).join("\n")}\n\n## ${t.pages.certificates.team}\n${c.filter((x) => x.kind === "team").map((x) => `- ${x.name}`).join("\n")}`;
  } else if (section === "research" && !slug) {
    const r = t.pages.research;
    md = `# ${r.title}\n\n${r.lede}\n\n## ${r.cvesTitle}\n| ${r.cols.id} | ${r.cols.product} | ${r.cols.driver} | ${r.cols.impact} |\n|---|---|---|---|\n${getCves(locale).map((c) => `| [${c.id}](https://www.cve.org/CVERecord?id=${c.id}) | ${c.product} | ${c.driver} | ${c.impact} |`).join("\n")}\n\n## ${r.academy.title} (${r.academy.badge})\n${r.academy.lede}\n\n${r.academy.text}\n\n[${r.academy.button}](${url(`/${locale}/contact?topic=academy`)})`;
  } else if (section === "news" && !slug) {
    md = `# ${t.pages.news.title}\n\n${t.pages.news.lede}\n\n${getNews(locale).map((n) => `- ${n.date} — [${n.title}](${url(`/${locale}/news/${n.slug}`)})`).join("\n")}`;
  } else if (section === "news" && slug) {
    const n = getNewsItem(slug, locale);
    if (n) md = `# ${n.title}\n\nPublished: ${n.date}${n.translated ? "" : ` · ${t.pages.news.notTranslated}`}\n\n${n.body}`;
  } else if (section === "faq" && !slug) {
    md = `# ${t.pages.faq.title}\n\n${t.pages.faq.lede}\n\n${getFaqs(locale).map((f) => `## ${f.question}\n${f.answer}`).join("\n\n")}`;
  } else if (section === "careers" && !slug) {
    const c = t.pages.careers;
    md = `# ${c.title}\n\n${c.lede}\n\n## ${c.whyTitle}\n${c.why.map((w) => `- **${w.title}**: ${w.text}`).join("\n")}\n\n## ${c.formTitle}\n${c.formText} ${url(`/${locale}/careers#apply`)}`;
  } else if (section === "contact" && !slug) {
    md = `# ${t.pages.contact.title}\n\n${t.pages.contact.lede}\n\n${contactBlock(locale)}\n\n${t.pages.contact.formTitle}: ${url(`/${locale}/contact`)}`;
  } else if (section === "privacy" && !slug) {
    md = `# ${t.pages.privacy.title}\n\n${t.pages.privacy.updated}\n\n${getPrivacy(locale)}`;
  }
  return md ? md + footer(locale, path) : null;
}

/** Every public page path (without locale), in reading order. */
export function allPagePaths(locale: Locale): string[] {
  return [
    "", "/about", "/services", ...getServices(locale).map((s) => `/services/${s.slug}`),
    "/products", ...getProducts(locale).map((p) => `/products/${p.slug}`),
    "/partners", "/clients", "/certificates", "/research", "/faq",
    "/news", ...getNews(locale).map((n) => `/news/${n.slug}`), "/careers", "/contact", "/privacy",
  ];
}

/** Whole site as one Markdown document (llms-full.txt). */
export function fullMarkdown(locale: Locale): string {
  const parts = allPagePaths(locale)
    .map((p) => pageMarkdown(locale, p))
    .filter((x): x is string => Boolean(x))
    .map((md) => md.replace(/\n\n---\nSource:[^\n]*\n$/, "").replace(/^# /, "# ").trim());
  return `# Cyberpoint — full site content (${LANG_NAME[locale]})\n\n> Complete text of ${SITE}/${locale} for AI systems. Generated from the live website database. Index: ${SITE}/llms.txt\n\n${parts.join("\n\n---\n\n")}\n`;
}
