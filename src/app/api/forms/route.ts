import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/auth";
import { PRIVATE_DIR, get, run } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_CV = 5 * 1024 * 1024;
const clip = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function cvKind(buf: Buffer, name: string): string | null {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf" && buf.subarray(0, 4).toString() === "%PDF") return ".pdf";
  if (ext === ".docx" && buf[0] === 0x50 && buf[1] === 0x4b) return ".docx";
  if (ext === ".doc" && buf.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))) return ".doc";
  return null;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (!rateLimit(`form:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (clip(data.get("website"), 200)) return NextResponse.json({ ok: true });

  const kind = clip(data.get("kind"), 20) === "career" ? "career" : "contact";
  const lead = {
    name: clip(data.get("name"), 120),
    email: clip(data.get("email"), 160),
    phone: clip(data.get("phone"), 40),
    company: clip(data.get("company"), 160),
    topic: clip(data.get("topic"), 120),
    message: clip(data.get("message"), 4000),
    locale: ["az", "en", "ru"].includes(clip(data.get("locale"), 2)) ? clip(data.get("locale"), 2) : "az",
  };
  const consent = clip(data.get("consent"), 5) === "yes";
  if (!lead.name || !EMAIL.test(lead.email) || !consent || (kind === "contact" && !lead.message)) {
    return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  }

  let attachment = "";
  if (kind === "career") {
    const file = data.get("cv");
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_CV) {
      return NextResponse.json({ ok: false, error: "file" }, { status: 422 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = cvKind(buf, file.name);
    if (!ext) return NextResponse.json({ ok: false, error: "file_type" }, { status: 422 });
    attachment = `cv-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    fs.mkdirSync(PRIVATE_DIR, { recursive: true });
    fs.writeFileSync(path.join(PRIVATE_DIR, attachment), buf, { mode: 0o600 });
  }

  // Resolve service slug to its title for the email.
  const service = lead.topic && kind === "contact" ? get<{ title_az: string }>("SELECT title_az FROM services WHERE slug = ?", lead.topic) : undefined;
  const topicLabel = service?.title_az ?? lead.topic;

  const info = run(
    "INSERT INTO submissions (type, name, email, phone, company, topic, message, attachment, locale) VALUES (?,?,?,?,?,?,?,?,?)",
    kind, lead.name, lead.email, lead.phone, lead.company, topicLabel, lead.message, attachment, lead.locale,
  );

  const subject = kind === "career" ? `Karyera müraciəti: ${lead.name}` : `Saytdan sorğu: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`;
  const fields: [string, string][] = [
    ["Ad", lead.name],
    ["E-poçt", lead.email],
    ["Telefon", lead.phone],
    ["Şirkət", lead.company],
    [kind === "career" ? "İstiqamət" : "Xidmət", topicLabel],
    ["Dil", lead.locale.toUpperCase()],
  ];
  const text = [
    kind === "career" ? "Yeni karyera müraciəti (cyberpoint.az)" : "Yeni sorğu (cyberpoint.az)",
    "",
    ...fields.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    lead.message || "(mesaj yoxdur)",
    "",
    `Admin panel: /admin/submissions/${info.lastInsertRowid}`,
  ].join("\n");

  const sent = await sendMail({
    subject,
    text,
    replyTo: lead.email,
    attachments: attachment ? [{ filename: `CV-${lead.name.replace(/[^\p{L}\p{N}]+/gu, "_")}${path.extname(attachment)}`, path: path.join(PRIVATE_DIR, attachment) }] : undefined,
  });
  if (sent) run("UPDATE submissions SET emailed = 1 WHERE id = ?", Number(info.lastInsertRowid));

  return NextResponse.json({ ok: true });
}
