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

/* ---------- Site texts (Saytın mətnləri) ---------- */
const TEXT_LOCALES = ["az", "en", "ru"] as const;
const clean = (x: unknown) => (typeof x === "string" ? x.replace(/\r\n/g, "\n").trim().slice(0, 4000) : "");

function upsertText(locale: string, path: string, value: unknown, def: unknown) {
  if (value === "" || JSON.stringify(value) === JSON.stringify(def)) run("DELETE FROM texts WHERE locale = ? AND path = ?", locale, path);
  else run("INSERT INTO texts (locale, path, value) VALUES (?, ?, ?) ON CONFLICT(locale, path) DO UPDATE SET value = excluded.value", locale, path, JSON.stringify(value));
}

export async function saveTexts(group: string, formData: FormData) {
  await requireAdmin();
  const { allFields } = await import("@/lib/admin/texts-schema");
  const { baseDictionaries } = await import("@/i18n/get-dictionary");
  const { getAt, bumpTextsRev } = await import("@/lib/texts");
  const fields = allFields(group);
  if (!fields.length) redirect("/admin/texts");
  for (const f of fields) {
    if (f.kind === "text") {
      for (const l of TEXT_LOCALES) {
        if (!formData.has(`t|${f.path}|${l}`)) continue;
        upsertText(l, f.path, clean(formData.get(`t|${f.path}|${l}`)), getAt(baseDictionaries[l], f.path));
      }
      continue;
    }
    const raw = formData.get(`l|${f.path}`);
    if (typeof raw !== "string") continue;
    let parsed: Record<string, unknown[]>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const az = Array.isArray(parsed.az) ? parsed.az.slice(0, 60) : [];
    // Empty EN/RU values fall back to AZ; shared fields (icon, severity) always come from AZ.
    const cell = (l: string, i: number, k: string, shared: boolean) => {
      const own = (parsed[l]?.[i] ?? {}) as Record<string, unknown>;
      const base = (az[i] ?? {}) as Record<string, unknown>;
      if (f.itemType === "string") return clean(parsed[l]?.[i]) || clean(az[i]);
      return shared ? clean(base[k]) : clean(own[k]) || clean(base[k]);
    };
    const keep = az.map((_, i) => f.fields.some((fd) => !fd.shared && cell("az", i, fd.key, false)));
    for (const l of TEXT_LOCALES) {
      const list = az
        .map((_, i) => {
          if (f.itemType === "string") return cell(l, i, "v", false);
          if (f.itemType === "tuple") return f.fields.map((fd) => cell(l, i, fd.key, fd.shared));
          return Object.fromEntries(f.fields.map((fd) => [fd.key, cell(l, i, fd.key, fd.shared)]));
        })
        .filter((_, i) => keep[i]);
      upsertText(l, f.path, list, getAt(baseDictionaries[l], f.path));
    }
  }
  bumpTextsRev();
  back(`/admin/texts/${group}`, { saved: "1" });
}

export async function resetTexts(group: string) {
  await requireAdmin();
  const { TEXT_GROUPS } = await import("@/lib/admin/texts-schema");
  const { bumpTextsRev } = await import("@/lib/texts");
  const g = TEXT_GROUPS.find((x) => x.key === group);
  if (!g) redirect("/admin/texts");
  for (const root of g.roots) run("DELETE FROM texts WHERE path = ? OR path LIKE ?", root, `${root}.%`);
  bumpTextsRev();
  back(`/admin/texts/${group}`, { reset: "1" });
}

/* ---------- Privacy policy ---------- */
export async function savePrivacy(formData: FormData) {
  await requireAdmin();
  const { setSetting } = await import("@/lib/site");
  const { privacy } = await import("@/content/privacy");
  for (const l of TEXT_LOCALES) {
    let v = String(formData.get(`privacy_${l}`) ?? "").replace(/\r\n/g, "\n").trim().slice(0, 60000);
    if (v === privacy[l].trim()) v = "";
    setSetting(`privacy_${l}`, v);
  }
  back("/admin/privacy", { saved: "1" });
}

/* ---------- SEO per page ---------- */
export async function saveSeo(formData: FormData) {
  await requireAdmin();
  const { SEO_PAGES, setSetting } = await import("@/lib/site");
  const out: Record<string, Record<string, string>> = {};
  for (const p of SEO_PAGES) {
    const entry: Record<string, string> = {};
    for (const l of TEXT_LOCALES) {
      for (const k of ["title", "description"]) {
        const v = String(formData.get(`${p.path || "/"}|${k}_${l}`) ?? "").replace(/\s+/g, " ").trim().slice(0, k === "title" ? 120 : 320);
        if (v) entry[`${k}_${l}`] = v;
      }
    }
    if (Object.keys(entry).length) out[p.path] = entry;
  }
  setSetting("seo", JSON.stringify(out));
  back("/admin/seo", { saved: "1" });
}

/* ---------- Brand assets ---------- */
async function saveSvg(file: File): Promise<string> {
  if (file.size > 1024 * 1024) throw new Error("SVG 1 MB-dan böyük olmamalıdır.");
  const text = await file.text();
  if (!/<svg[\s>]/i.test(text)) throw new Error("SVG faylı tanınmadı.");
  if (/<script|<foreignObject|<iframe|<embed|<object|javascript:|\son[a-z]+\s*=/i.test(text)) throw new Error("SVG-də skript və ya aktiv məzmun var. Təmiz SVG yükləyin.");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.svg`;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), text);
  return `/uploads/${name}`;
}

export async function saveBrand(formData: FormData) {
  await requireAdmin();
  const { BRAND_ASSETS, setSetting } = await import("@/lib/site");
  try {
    for (const [name, asset] of Object.entries(BRAND_ASSETS)) {
      if (formData.get(`${name}__reset`)) {
        setSetting(`brand_${name}`, "");
        continue;
      }
      const file = formData.get(name);
      if (!(file instanceof File) || file.size === 0) continue;
      const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
      if (isSvg && !asset.svg) throw new Error(`“${asset.label}”: SVG qəbul olunmur, PNG və ya JPG yükləyin.`);
      if (!asset.svg && !["image/png", "image/jpeg"].includes(file.type)) throw new Error(`“${asset.label}”: yalnız PNG və ya JPG.`);
      setSetting(`brand_${name}`, isSvg ? await saveSvg(file) : await saveImage(file));
    }
  } catch (e) {
    back("/admin/brand", { error: e instanceof Error ? e.message : "Xəta baş verdi." });
  }
  setSetting("brand_rev", String(Date.now()));
  back("/admin/brand", { saved: "1" });
}

/* ---------- Top menu ---------- */
export async function saveMenu(formData: FormData) {
  await requireAdmin();
  const { setSetting } = await import("@/lib/site");
  const { MENU_PAGES } = await import("@/lib/menu");
  let keys: string[] = [];
  try {
    const v = JSON.parse(String(formData.get("menu") ?? "[]"));
    if (Array.isArray(v)) keys = [...new Set(v.filter((k) => MENU_PAGES.some((p) => p.key === k)))];
  } catch {
    /* ignore */
  }
  if (!keys.length) back("/admin/menu", { error: "Ən azı bir səhifə seçin." });
  setSetting("menu_top", JSON.stringify(keys));
  back("/admin/menu", { saved: "1" });
}
