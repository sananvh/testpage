import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

/** Serves images uploaded through the admin panel from DATA_DIR/uploads. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const name = path.basename((await params).path.join("/"));
  const type = TYPES[path.extname(name).toLowerCase()];
  const full = path.join(UPLOAD_DIR, name);
  if (!type || !fs.existsSync(full)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(full), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
