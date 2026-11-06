import "server-only";
import type { Locale } from "./config";
import az from "./dictionaries/az";
import en from "./dictionaries/en";
import ru from "./dictionaries/ru";
import type { Dictionary } from "./dictionaries/az";
import { applyOverrides, readOverrides, textsRev } from "@/lib/texts";

/** Built-in texts (defaults shown and restored in the admin). */
export const baseDictionaries: Record<Locale, Dictionary> = { az, en, ru };

let cache: { rev: string; dicts: Partial<Record<Locale, Dictionary>> } = { rev: "", dicts: {} };

/** Built-in texts merged with the overrides edited in the admin panel (Saytın mətnləri). */
export function getDictionary(locale: Locale): Dictionary {
  const rev = textsRev();
  if (cache.rev !== rev) cache = { rev, dicts: {} };
  return (cache.dicts[locale] ??= applyOverrides(baseDictionaries[locale], readOverrides(locale)));
}

export type { Dictionary } from "./dictionaries/az";
