import "server-only";
import type { Locale } from "@/i18n/config";
import { all, get, run } from "./db";

/**
 * Admin-editable site texts. The built-in dictionaries (src/i18n/dictionaries) are the defaults;
 * the `texts` table stores overrides per locale and dotted path (JSON-encoded value).
 * Strings override strings; lists (arrays) override whole lists. Anything that no longer matches
 * the built-in structure is ignored, so code updates never break on old overrides.
 */
export type Overrides = Record<string, unknown>;

export function textsRev(): string {
  return get<{ value: string }>("SELECT value FROM settings WHERE key = 'texts_rev'")?.value ?? "0";
}

export function bumpTextsRev() {
  run("INSERT INTO settings (key, value) VALUES ('texts_rev', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", String(Date.now()));
}

export function readOverrides(locale: Locale): Overrides {
  const out: Overrides = {};
  for (const r of all<{ path: string; value: string }>("SELECT path, value FROM texts WHERE locale = ?", locale)) {
    try {
      out[r.path] = JSON.parse(r.value);
    } catch {
      /* ignore broken row */
    }
  }
  return out;
}

export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setAt(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let o = obj;
  for (const k of keys.slice(0, -1)) o = o[k] as Record<string, unknown>;
  o[keys[keys.length - 1]] = value;
}

/** True when `value` has the same shape as the built-in `base` (string, list of strings, list of flat objects or tuples). */
function sameShape(base: unknown, value: unknown): boolean {
  if (typeof base === "string") return typeof value === "string";
  if (!Array.isArray(base) || !Array.isArray(value)) return false;
  const sample = base[0];
  return value.every((v) => {
    if (typeof sample === "string") return typeof v === "string";
    if (Array.isArray(sample)) return Array.isArray(v) && v.every((x) => typeof x === "string");
    if (sample && typeof sample === "object") return !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every((x) => typeof x === "string");
    return false;
  });
}

export function applyOverrides<T extends object>(base: T, ov: Overrides): T {
  const keys = Object.keys(ov);
  if (!keys.length) return base;
  const out = structuredClone(base) as Record<string, unknown>;
  for (const path of keys) {
    const def = getAt(base, path);
    const val = ov[path];
    if (def === undefined || !sameShape(def, val)) continue;
    if (typeof val === "string" && !val.trim()) continue; // empty = use the built-in text
    if (Array.isArray(val) && Array.isArray(def) && def[0] && typeof def[0] === "object" && !Array.isArray(def[0])) {
      // keep every built-in key present on each item (new items may miss optional ones)
      const keysOf = Object.keys(def[0] as object);
      setAt(out, path, val.map((v) => Object.fromEntries(keysOf.map((k) => [k, String((v as Record<string, string>)[k] ?? "")]))));
      continue;
    }
    setAt(out, path, val);
  }
  return out as T;
}
