import { fullMarkdown } from "@/lib/ai/markdown";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(fullMarkdown("en"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=600", "Access-Control-Allow-Origin": "*" } });
}
