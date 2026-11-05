import "server-only";
import type { Locale } from "@/i18n/config";
import { all, get, type Row } from "./db";

export function pick(row: Row, field: string, locale: Locale): string {
  const v = row[`${field}_${locale}`];
  if (typeof v === "string" && v.trim()) return v;
  const az = row[`${field}_az`];
  return typeof az === "string" ? az : "";
}

export function lines(text: string) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

/* ---------- Services ---------- */
export type Service = {
  id: number; slug: string; phase: "assess" | "protect" | "respond"; icon: string;
  title: string; short: string; body: string; features: string[];
};
function toService(r: Row, l: Locale): Service {
  return {
    id: Number(r.id), slug: String(r.slug), phase: r.phase as Service["phase"], icon: String(r.icon),
    title: pick(r, "title", l), short: pick(r, "short", l), body: pick(r, "body", l), features: lines(pick(r, "features", l)),
  };
}
export const getServices = (l: Locale) => all("SELECT * FROM services WHERE published = 1 ORDER BY sort, id").map((r) => toService(r, l));
export function getService(slug: string, l: Locale) {
  const r = get("SELECT * FROM services WHERE slug = ? AND published = 1", slug);
  return r ? toService(r, l) : null;
}

/* ---------- Products ---------- */
export type ProductGroup = "appsec" | "endpoint" | "network" | "identity" | "data" | "secops";
export type Product = { id: number; slug: string; name: string; full: string; group: ProductGroup; desc: string; body: string };
function toProduct(r: Row, l: Locale): Product {
  return {
    id: Number(r.id), slug: String(r.slug), name: String(r.name), full: String(r.full_name), group: r.grp as ProductGroup,
    desc: pick(r, "desc", l), body: pick(r, "body", l),
  };
}
export const getProducts = (l: Locale) => all("SELECT * FROM products WHERE published = 1 ORDER BY sort, id").map((r) => toProduct(r, l));
export function getProduct(slug: string, l: Locale) {
  const r = get("SELECT * FROM products WHERE slug = ? AND published = 1", slug);
  return r ? toProduct(r, l) : null;
}
export const productGroups: ProductGroup[] = ["appsec", "endpoint", "network", "identity", "data", "secops"];

/* ---------- Partners / clients / certificates ---------- */
export type Partner = { id: number; name: string; logo: string; logoDark: string; url: string; tags: string[] };
export const getPartners = (): Partner[] =>
  all("SELECT * FROM partners WHERE published = 1 ORDER BY sort, id").map((r) => ({
    id: Number(r.id), name: String(r.name), logo: String(r.logo), logoDark: String(r.logo_dark || r.logo), url: String(r.url),
    tags: String(r.tags).split(",").map((t) => t.trim()).filter(Boolean),
  }));

export type Client = { id: number; name: string; logo: string; logoDark: string; url: string; sector: string };
export const clientSectors = ["government", "finance", "telecom", "health", "industry", "technology", "nonprofit", "other"] as const;
export const getClients = (): Client[] =>
  all("SELECT * FROM clients WHERE published = 1 ORDER BY sort, id").map((r) => ({
    id: Number(r.id), name: String(r.name), logo: String(r.logo), logoDark: String(r.logo_dark || r.logo), url: String(r.url), sector: String(r.sector),
  }));

export type Certificate = { id: number; name: string; logo: string; logoDark: string; kind: "company" | "team"; issuer: string };
export const getCertificates = (): Certificate[] =>
  all("SELECT * FROM certificates WHERE published = 1 ORDER BY sort, id").map((r) => ({
    id: Number(r.id), name: String(r.name), logo: String(r.logo), logoDark: String(r.logo_dark || r.logo), kind: r.kind as Certificate["kind"], issuer: String(r.issuer),
  }));

/* ---------- News ---------- */
export type NewsItem = { id: number; slug: string; date: string; image: string; title: string; body: string; translated: boolean };
function toNews(r: Row, l: Locale): NewsItem {
  const own = r[`body_${l}`];
  return {
    id: Number(r.id), slug: String(r.slug), date: String(r.date), image: String(r.image),
    title: pick(r, "title", l), body: pick(r, "body", l), translated: l === "az" || (typeof own === "string" && own.trim() !== ""),
  };
}
export const getNews = (l: Locale, limit = 500, offset = 0) =>
  all("SELECT * FROM news WHERE published = 1 ORDER BY date DESC, id DESC LIMIT ? OFFSET ?", limit, offset).map((r) => toNews(r, l));
export const countNews = () => Number(get<{ n: number }>("SELECT COUNT(*) AS n FROM news WHERE published = 1")?.n ?? 0);
export function getNewsItem(slug: string, l: Locale) {
  const r = get("SELECT * FROM news WHERE slug = ? AND published = 1", slug);
  return r ? toNews(r, l) : null;
}

/* ---------- FAQ ---------- */
export type Faq = { id: number; question: string; answer: string; service: string; home: boolean };
export function getFaqs(l: Locale, opts: { service?: string; home?: boolean } = {}): Faq[] {
  let sql = "SELECT * FROM faqs WHERE published = 1";
  const args: string[] = [];
  if (opts.service) {
    sql += " AND service_slug = ?";
    args.push(opts.service);
  }
  if (opts.home) sql += " AND home = 1";
  return all(sql + " ORDER BY sort, id", ...args).map((r) => ({
    id: Number(r.id), question: pick(r, "question", l), answer: pick(r, "answer", l), service: String(r.service_slug), home: Number(r.home) === 1,
  }));
}

/* ---------- Settings ---------- */
export type Settings = {
  phone: string; email: string; hours: string; address: string; mapUrl: string;
  socials: { name: string; href: string }[];
};
export function getSettings(l: Locale): Settings {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    phone: m.phone ?? "", email: m.email ?? "", hours: m.hours ?? "",
    address: m[`address_${l}`] || m.address_az || "", mapUrl: m.map_url ?? "",
    socials: [
      { name: "LinkedIn", href: m.linkedin }, { name: "Facebook", href: m.facebook },
      { name: "Instagram", href: m.instagram }, { name: "X", href: m.x },
    ].filter((s): s is { name: string; href: string } => Boolean(s.href)),
  };
}

/* ---------- Search ---------- */
export type SearchHit = { kind: "service" | "product" | "news" | "partner" | "faq"; title: string; text: string; href: string };
export function search(q: string, l: Locale): SearchHit[] {
  const term = q.trim().toLocaleLowerCase(l === "az" ? "az" : l);
  if (term.length < 2) return [];
  const has = (...s: string[]) => s.some((x) => x.toLocaleLowerCase(l === "az" ? "az" : l).includes(term));
  const hits: SearchHit[] = [];
  for (const s of getServices(l)) if (has(s.title, s.short, s.body)) hits.push({ kind: "service", title: s.title, text: s.short, href: `/${l}/services/${s.slug}` });
  for (const p of getProducts(l)) if (has(p.name, p.full, p.desc, p.body)) hits.push({ kind: "product", title: `${p.name} · ${p.full}`, text: p.desc, href: `/${l}/products/${p.slug}` });
  for (const n of getNews(l)) if (has(n.title, n.body)) hits.push({ kind: "news", title: n.title, text: n.date, href: `/${l}/news/${n.slug}` });
  for (const f of getFaqs(l)) if (has(f.question, f.answer)) hits.push({ kind: "faq", title: f.question, text: f.answer.slice(0, 140) + (f.answer.length > 140 ? "…" : ""), href: `/${l}/faq#faq-${f.id}` });
  for (const p of getPartners()) if (has(p.name)) hits.push({ kind: "partner", title: p.name, text: "", href: `/${l}/partners` });
  return hits.slice(0, 40);
}
