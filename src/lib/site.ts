import "server-only";
import type { Locale } from "@/i18n/config";
import { get, run } from "./db";
import { privacy as privacyDefault } from "@/content/privacy";
import { DEFAULT_MENU, MENU_PAGES, type MenuKey } from "./menu";

export function setting(key: string): string {
  return get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key)?.value ?? "";
}
export function setSetting(key: string, value: string) {
  run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, value);
}

/* ---------- SEO per page ---------- */
export const SEO_PAGES: { path: string; label: string; textsRoot: string }[] = [
  { path: "", label: "Ana səhifə", textsRoot: "meta" },
  { path: "/about", label: "Haqqımızda", textsRoot: "pages.about" },
  { path: "/services", label: "Xidmətlər", textsRoot: "pages.services" },
  { path: "/products", label: "Məhsullar", textsRoot: "pages.products" },
  { path: "/partners", label: "Tərəfdaşlar", textsRoot: "pages.partners" },
  { path: "/clients", label: "Müştərilər", textsRoot: "pages.clients" },
  { path: "/certificates", label: "Sertifikatlar", textsRoot: "pages.certificates" },
  { path: "/research", label: "Tədqiqat və inkişaf", textsRoot: "pages.research" },
  { path: "/news", label: "Xəbərlər", textsRoot: "pages.news" },
  { path: "/faq", label: "FAQ", textsRoot: "pages.faq" },
  { path: "/careers", label: "Karyera", textsRoot: "pages.careers" },
  { path: "/contact", label: "Əlaqə", textsRoot: "pages.contact" },
  { path: "/privacy", label: "Məxfilik siyasəti", textsRoot: "pages.privacy" },
];
export type SeoEntry = Record<string, string>;
export function getSeoAll(): Record<string, SeoEntry> {
  try {
    const v = JSON.parse(setting("seo") || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
export function seoFor(path: string, locale: Locale): { title: string; description: string } {
  const e = getSeoAll()[path] ?? {};
  return { title: (e[`title_${locale}`] ?? "").trim(), description: (e[`description_${locale}`] ?? "").trim() };
}

/* ---------- Privacy policy ---------- */
export function getPrivacy(locale: Locale): string {
  return setting(`privacy_${locale}`).trim() || privacyDefault[locale];
}

/* ---------- Top menu ---------- */
export function getMenu(): MenuKey[] {
  try {
    const v = JSON.parse(setting("menu_top") || "null");
    if (Array.isArray(v)) {
      const keys = v.filter((k): k is MenuKey => MENU_PAGES.some((p) => p.key === k));
      if (keys.length) return [...new Set(keys)];
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_MENU;
}

/* ---------- Brand assets (logos, share image) ---------- */
export const BRAND_ASSETS: Record<string, { file: string; label: string; help: string; dark?: boolean; svg: boolean }> = {
  logo: { file: "logo.svg", label: "Logo (işıqlı fon üçün)", help: "Header və işıqlı rejim. SVG və ya şəffaf PNG.", svg: true },
  "logo-reversed": { file: "logo-reversed.svg", label: "Logo (tünd fon üçün)", help: "Qaranlıq rejim, menyu və admin paneli. SVG və ya şəffaf PNG.", dark: true, svg: true },
  "logo-slogan": { file: "logo-slogan.svg", label: "Şüarlı logo (işıqlı fon)", help: "Hazırda ehtiyat üçün. SVG və ya şəffaf PNG.", svg: true },
  "logo-slogan-reversed": { file: "logo-slogan-reversed.svg", label: "Şüarlı logo (tünd fon)", help: "Hazırda saytda istifadə olunmur (ehtiyat). SVG və ya şəffaf PNG.", dark: true, svg: true },
  og: { file: "og.png", label: "Paylaşım şəkli (sosial şəbəkələr)", help: "Link Facebook, LinkedIn, WhatsApp və s.-də paylaşılanda görünür. PNG və ya JPG, 1200×630.", svg: false },
};
export function brandUpload(name: string): string {
  return setting(`brand_${name}`);
}
