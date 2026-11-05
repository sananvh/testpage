import { isLocale, type Locale } from "@/i18n/config";
import { publicData, RESOURCES, type ResourceName } from "@/lib/ai/public-data";

export const dynamic = "force-dynamic";

const headers = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=600" };

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const name = (await params).resource.replace(/\.json$/, "") as ResourceName;
  if (!RESOURCES.includes(name)) return Response.json({ error: "unknown_resource", resources: RESOURCES }, { status: 404, headers });
  const q = new URL(request.url).searchParams.get("locale") ?? "en";
  const locale: Locale = isLocale(q) ? q : "en";
  return Response.json({ resource: name, locale, data: publicData(name, locale) }, { headers });
}

export async function OPTIONS() {
  return new Response(null, { headers: { ...headers, "Access-Control-Allow-Methods": "GET, OPTIONS" } });
}
