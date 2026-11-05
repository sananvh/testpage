import { isLocale } from "@/i18n/config";
import { pageMarkdown } from "@/lib/ai/markdown";

export const dynamic = "force-dynamic";

/** Markdown version of any page: /md/{locale}/{path}, e.g. /md/en/services/soc */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [locale, ...rest] = (await params).path.map((p) => p.replace(/\.md$/, ""));
  if (!locale || !isLocale(locale)) return new Response("Not found", { status: 404 });
  const md = pageMarkdown(locale, rest.length ? `/${rest.join("/")}` : "");
  if (!md) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=600",
      "Access-Control-Allow-Origin": "*",
      Link: `<${(process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://cyberpoint.az").replace(/\/$/, "")}/${locale}${rest.length ? `/${rest.join("/")}` : ""}>; rel="canonical"`,
    },
  });
}
