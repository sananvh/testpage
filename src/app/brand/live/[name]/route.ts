import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";
import { BRAND_ASSETS, brandUpload } from "@/lib/site";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

/** Serves a brand asset: the version uploaded in the admin (Logo və şəkillər) or the built-in file. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const asset = BRAND_ASSETS[name];
  if (!asset) return new Response("Not found", { status: 404 });
  let file = path.join(process.cwd(), "public", "brand", asset.file);
  const up = brandUpload(name);
  if (up.startsWith("/uploads/")) {
    const candidate = path.join(UPLOAD_DIR, path.basename(up));
    if (fs.existsSync(candidate)) file = candidate;
  }
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!type || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      // SVGs can carry scripts: never let them run, even if opened directly
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
    },
  });
}
