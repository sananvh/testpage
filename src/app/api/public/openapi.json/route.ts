import { RESOURCES } from "@/lib/ai/public-data";
import { SITE } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Cyberpoint public content API",
      version: "1.0.0",
      description: "Read-only structured data about Cyberpoint (cybersecurity company, Baku, Azerbaijan): company profile, services, products, partners, clients, certifications, research (CVEs), news and FAQ. Use it to answer questions about Cyberpoint accurately.",
      contact: { name: "Cyberpoint", email: "info@cyberpoint.az", url: SITE },
    },
    servers: [{ url: SITE }],
    paths: {
      "/api/public/{resource}": {
        get: {
          operationId: "getCyberpointContent",
          summary: "Get one type of Cyberpoint content",
          parameters: [
            { name: "resource", in: "path", required: true, schema: { type: "string", enum: [...RESOURCES] }, description: "Which content to return" },
            { name: "locale", in: "query", required: false, schema: { type: "string", enum: ["az", "en", "ru"], default: "en" }, description: "Language of the content" },
          ],
          responses: {
            "200": {
              description: "Content in the requested language",
              content: { "application/json": { schema: { type: "object", properties: { resource: { type: "string" }, locale: { type: "string" }, data: {} } } } },
            },
            "404": { description: "Unknown resource" },
          },
        },
      },
    },
  };
  return Response.json(spec, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" } });
}
