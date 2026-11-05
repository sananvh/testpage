"use server";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession, rateLimit, requireAdmin } from "@/lib/auth";
import { get, run, UPLOAD_DIR, PRIVATE_DIR } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { columnsOf, LOCALES, resources, SETTING_KEYS } from "@/lib/admin/resources";

const IMAGE_TYPES: Record<string, string> = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif" };
const MAX_IMAGE = 5 * 1024 * 1024;

function back(url: string, params: Record<string, string>): never {
  const q = new URLSearchParams(params).toString();
  redirect(`${url}${url.includes("?") ? "&" : "?"}${q}`);
}

/* ---------- Auth ---------- */
export async function login(formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) back("/admin/login", { error: "Çox sayda cəhd. 15 dəqiqə sonra yenidən yoxlayın." });
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = get<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE lower(email) = ?", email);
  if (!user || !verifyPassword(password, user.password_hash)) back("/admin/login", { error: "E-poçt və ya şifrə yanlışdır." });
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Images ---------- */
async function saveImage(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Yalnız PNG, JPG, WEBP və ya GIF şəkillər qəbul olunur.");
  if (file.size > MAX_IMAGE) throw new Error("Şəkil 5 MB-dan böyük olmamalıdır.");
  const buf = Buffer.from(await file.arrayBuffer());
  // Basic magic-number check
  const sig = buf.subarray(0, 12).toString("hex");
  const ok = sig.startsWith("89504e47") || sig.startsWith("ffd8ff") || sig.startsWith("47494638") || (sig.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP");
  if (!ok) throw new Error("Şəkil faylı tanınmadı.");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

/* ---------- Generic CRUD ---------- */
export async function saveResource(key: string, id: number | null, formData: FormData) {
  await requireAdmin();
  const r = resources[key];
  if (!r) redirect("/admin");
  const base = `/admin/${key}`;
  const editUrl = id ? `${base}/${id}` : `${base}/new`;

  const values: Record<string, string | number> = {};
  try {
    for (const f of r.fields) {
      const names = f.localized ? LOCALES.map((l) => `${f.name}_${l}`) : [f.name];
      for (const col of names) {
        const raw = formData.get(col);
        if (f.type === "checkbox") values[col] = raw ? 1 : 0;
        else if (f.type === "number") values[col] = Number(raw) || 0;
        else if (f.type === "image") {
          const file = formData.get(col);
          if (formData.get(`${col}__remove`)) values[col] = "";
          else if (file instanceof File && file.size > 0) values[col] = await saveImage(file);
          else values[col] = String(formData.get(`${col}__current`) ?? "");
        } else if (f.type === "tags") {
          values[col] = String(raw ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).join(",");
        } else values[col] = String(raw ?? "").replace(/\r\n/g, "\n").trim();
      }
      if (f.required) {
        const first = f.localized ? `${f.name}_az` : f.name;
        if (!String(values[first] ?? "").trim()) throw new Error(`“${f.label}” mütləqdir${f.localized ? " (AZ)" : ""}.`);
      }
      if (f.name === "slug") {
        const slug = String(values.slug);
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug yalnız kiçik latın hərfləri, rəqəmlər və “-” ola bilər.");
        const clash = get<{ id: number }>(`SELECT id FROM ${r.table} WHERE slug = ? AND id != ?`, slug, id ?? 0);
        if (clash) throw new Error("Bu slug artıq istifadə olunur.");
      }
      if (f.type === "date" && values[f.name] && !/^\d{4}-\d{2}-\d{2}$/.test(String(values[f.name]))) throw new Error("Tarix formatı yanlışdır.");
    }
  } catch (e) {
    back(editUrl, { error: e instanceof Error ? e.message : "Xəta baş verdi." });
  }

  const cols = columnsOf(r);
  if (id) {
    run(`UPDATE ${r.table} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, ...cols.map((c) => values[c]), id);
    back(editUrl, { saved: "1" });
  }
  const info = run(`INSERT INTO ${r.table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, ...cols.map((c) => values[c]));
  back(`${base}/${info.lastInsertRowid}`, { saved: "1" });
}

export async function deleteResource(key: string, id: number) {
  await requireAdmin();
  const r = resources[key];
  if (!r) redirect("/admin");
  run(`DELETE FROM ${r.table} WHERE id = ?`, id);
  back(`/admin/${key}`, { deleted: "1" });
}

export async function togglePublished(key: string, id: number) {
  await requireAdmin();
  const r = resources[key];
  if (!r) redirect("/admin");
  run(`UPDATE ${r.table} SET published = 1 - published WHERE id = ?`, id);
  redirect(`/admin/${key}`);
}

/* ---------- Submissions ---------- */
export async function markSubmission(id: number, read: boolean) {
  await requireAdmin();
  run("UPDATE submissions SET is_read = ? WHERE id = ?", read ? 1 : 0, id);
  redirect(read ? `/admin/submissions/${id}` : "/admin/submissions");
}

export async function deleteSubmission(id: number) {
  await requireAdmin();
  const row = get<{ attachment: string }>("SELECT attachment FROM submissions WHERE id = ?", id);
  if (row?.attachment) {
    const file = path.join(PRIVATE_DIR, path.basename(row.attachment));
    fs.rmSync(file, { force: true });
  }
  run("DELETE FROM submissions WHERE id = ?", id);
  back("/admin/submissions", { deleted: "1" });
}

/* ---------- Settings ---------- */
export async function saveSettings(formData: FormData) {
  await requireAdmin();
  for (const k of SETTING_KEYS) {
    run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", k, String(formData.get(k) ?? "").trim());
  }
  back("/admin/settings", { saved: "1" });
}

/* ---------- Account ---------- */
export async function changePassword(formData: FormData) {
  const user = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const row = get<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", user.id);
  if (!row || !verifyPassword(current, row.password_hash)) back("/admin/account", { error: "Cari şifrə yanlışdır." });
  if (next.length < 10) back("/admin/account", { error: "Yeni şifrə ən azı 10 simvol olmalıdır." });
  if (next !== confirm) back("/admin/account", { error: "Şifrələr uyğun gəlmir." });
  run("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(next), user.id);
  back("/admin/account", { saved: "1" });
}

export async function addUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) back("/admin/account", { error: "E-poçt yanlışdır." });
  if (password.length < 10) back("/admin/account", { error: "Şifrə ən azı 10 simvol olmalıdır." });
  if (get("SELECT id FROM users WHERE lower(email) = ?", email)) back("/admin/account", { error: "Bu istifadəçi artıq mövcuddur." });
  run("INSERT INTO users (email, password_hash) VALUES (?, ?)", email, hashPassword(password));
  back("/admin/account", { saved: "1" });
}

export async function removeUser(id: number) {
  const me = await requireAdmin();
  if (id === me.id) back("/admin/account", { error: "Öz hesabınızı silə bilməzsiniz." });
  run("DELETE FROM users WHERE id = ?", id);
  back("/admin/account", { saved: "1" });
}

/* ---------- AI chats ---------- */
export async function deleteChat(id: number) {
  await requireAdmin();
  run("DELETE FROM assistant_chats WHERE id = ?", id);
  back("/admin/chats", { deleted: "1" });
}
