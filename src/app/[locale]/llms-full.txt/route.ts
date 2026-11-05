import { isLocale } from "@/i18n/config";
import { fullMarkdown } from "@/lib/ai/markdown";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  return new Response(fullMarkdown(locale), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=600", "Access-Control-Allow-Origin": "*" } });
}
