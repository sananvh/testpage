import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export type LocaleParams = { params: Promise<{ locale: string }> };

export async function resolve(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { locale: locale as Locale, t: getDictionary(locale as Locale) };
}

const OG_LOCALE: Record<Locale, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU" };

/** Per-page metadata: canonical, hreflang (+x-default), Open Graph and Twitter card. */
export function meta(
  locale: Locale,
  path: string,
  title: string,
  description?: string,
  image?: string,
  opts: { type?: "website" | "article"; publishedTime?: string } = {},
): Metadata {
  const url = `/${locale}${path}`;
  const images = [{ url: image || "/brand/og.png", width: image ? undefined : 1200, height: image ? undefined : 630, alt: title }];
  const desc = description?.replace(/\s+/g, " ").trim().slice(0, 300);
  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: { ...Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])), "x-default": `/az${path}` },
      types: { "text/markdown": `/md${url}` },
    },
    openGraph: {
      type: opts.type ?? "website",
      siteName: "Cyberpoint",
      url,
      title,
      description: desc,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description: desc, images: images.map((i) => i.url), site: "@cyberpointaz" },
  };
}
