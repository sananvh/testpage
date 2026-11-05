import fs from "node:fs";
import path from "node:path";
import { getAdmin } from "@/lib/auth";
import { PRIVATE_DIR } from "@/lib/db";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const name = path.basename(decodeURIComponent((await params).file));
  const full = path.join(PRIVATE_DIR, name);
  if (!name.startsWith("cv-") || !fs.existsSync(full)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(full), {
    headers: {
      "Content-Type": TYPES[path.extname(name)] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
