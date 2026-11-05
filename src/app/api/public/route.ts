import { RESOURCES } from "@/lib/ai/public-data";
import { SITE } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      name: "Cyberpoint public content API",
      description: "Read-only structured data about Cyberpoint for AI agents and integrations. Free to use with attribution.",
      languages: ["az", "en", "ru"],
      usage: `${SITE}/api/public/{resource}?locale=en`,
      resources: Object.fromEntries(RESOURCES.map((r) => [r, `${SITE}/api/public/${r}?locale=en`])),
      openapi: `${SITE}/api/public/openapi.json`,
      llms_txt: `${SITE}/llms.txt`,
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=600" } },
  );
}
