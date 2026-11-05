import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getNews } from "@/lib/content";
import { SITE } from "@/lib/schema";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0 feed of company news. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const t = getDictionary(locale);
  const items = getNews(locale, 30)
    .map((n) => {
      const link = `${SITE}/${locale}/news/${n.slug}`;
      return `    <item>
      <title>${esc(n.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(n.date + "T09:00:00Z").toUTCString()}</pubDate>
      <description>${esc(n.body.replace(/\s+/g, " ").slice(0, 400))}</description>${n.image ? `\n      <enclosure url="${SITE}${n.image}" type="image/${n.image.endsWith(".png") ? "png" : "jpeg"}" length="0" />` : ""}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cyberpoint — ${esc(t.pages.news.title)}</title>
    <link>${SITE}/${locale}/news</link>
    <description>${esc(t.pages.news.lede)}</description>
    <language>${locale}</language>
    <atom:link href="${SITE}/${locale}/news/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
