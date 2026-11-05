import "server-only";
import type { Locale } from "./config";
import az from "./dictionaries/az";
import en from "./dictionaries/en";
import ru from "./dictionaries/ru";

const dictionaries = { az, en, ru };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export type { Dictionary } from "./dictionaries/az";
