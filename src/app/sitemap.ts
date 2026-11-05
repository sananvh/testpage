import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { all } from "@/lib/db";

export const dynamic = "force-dynamic";

const SITE = (process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://cyberpoint.az").replace(/\/$/, "");
const STATIC: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
  ["", 1, "weekly"], ["/services", 0.9, "monthly"], ["/products", 0.8, "monthly"], ["/about", 0.8, "monthly"],
  ["/partners", 0.7, "monthly"], ["/clients", 0.7, "monthly"], ["/certificates", 0.7, "monthly"], ["/research", 0.7, "monthly"],
  ["/faq", 0.7, "monthly"], ["/news", 0.8, "weekly"], ["/careers", 0.5, "monthly"], ["/contact", 0.8, "yearly"], ["/privacy", 0.2, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = all<{ d: string }>("SELECT MAX(date) AS d FROM news WHERE published = 1")[0]?.d;
  const entries: { p: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"]; date?: string; images?: string[] }[] = [
    ...STATIC.map(([p, priority, freq]) => ({ p, priority, freq, date: p === "" || p === "/news" ? latest : undefined })),
    ...all<{ slug: string }>("SELECT slug FROM services WHERE published = 1 ORDER BY sort").map((r) => ({ p: `/services/${r.slug}`, priority: 0.8, freq: "monthly" as const })),
    ...all<{ slug: string }>("SELECT slug FROM products WHERE published = 1 ORDER BY sort").map((r) => ({ p: `/products/${r.slug}`, priority: 0.6, freq: "monthly" as const })),
    ...all<{ slug: string; date: string; image: string }>("SELECT slug, date, image FROM news WHERE published = 1 ORDER BY date DESC").map((r) => ({
      p: `/news/${r.slug}`, priority: 0.6, freq: "yearly" as const, date: r.date, images: r.image ? [`${SITE}${r.image}`] : undefined,
    })),
  ];
  return entries.flatMap(({ p, priority, freq, date, images }) =>
    locales.map((l) => ({
      url: `${SITE}/${l}${p}`,
      lastModified: date ? new Date(date) : undefined,
      changeFrequency: freq,
      priority,
      images,
      alternates: { languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE}/${x}${p}`])), "x-default": `${SITE}/az${p}` } },
    })),
  );
}
