import "server-only";
import type { Locale } from "@/i18n/config";
import { baseDictionaries, getDictionary } from "@/i18n/get-dictionary";
import { getAt } from "@/lib/texts";
import { ICON_NAMES } from "@/components/Icon";

/* ---------- Types shared with the client editor ---------- */
export type ItemField = { key: string; label: string; shared: boolean; options?: string[]; long: boolean };
export type TextField = { kind: "text"; path: string; label: string; long: boolean };
export type ListField = { kind: "list"; path: string; label: string; itemType: "string" | "object" | "tuple"; fields: ItemField[] };
export type Field = TextField | ListField;
export type Section = { id: string; title: string; fields: Field[] };
type L3<T> = Record<Locale, T>;
export type FieldData = { cur: L3<unknown>; def: L3<unknown> };

const LOCALES: Locale[] = ["az", "en", "ru"];

/* ---------- Groups (admin pages) ---------- */
export const TEXT_GROUPS: { key: string; label: string; hint: string; roots: string[] }[] = [
  { key: "home", label: "Ana səhifə", hint: "Hero, statistika, bloklar, SOC paneli", roots: ["home", "soc"] },
  { key: "about", label: "Haqqımızda", hint: "Səhifə mətni, üstünlüklər, missiya və dəyərlər", roots: ["pages.about"] },
  { key: "services", label: "Xidmətlər səhifəsi", hint: "Siyahı və xidmət səhifələrindəki ümumi yazılar", roots: ["pages.services", "pages.service"] },
  { key: "products", label: "Məhsullar səhifəsi", hint: "Siyahı və məhsul səhifələrindəki ümumi yazılar", roots: ["pages.products", "pages.product"] },
  { key: "partners", label: "Tərəfdaşlar və müştərilər", hint: "Hər iki səhifənin başlıq və mətnləri", roots: ["pages.partners", "pages.clients"] },
  { key: "certificates", label: "Sertifikatlar", hint: "Səhifə başlığı və bölmə adları", roots: ["pages.certificates"] },
  { key: "research", label: "Tədqiqat və inkişaf", hint: "R&D səhifəsi və Cyberpoint Academy bloku", roots: ["pages.research"] },
  { key: "news", label: "Xəbərlər", hint: "Xəbərlər səhifəsinin yazıları", roots: ["pages.news"] },
  { key: "careers", label: "Karyera", hint: "Səhifə mətni, üstünlük kartları, forma başlığı", roots: ["pages.careers"] },
  { key: "contact", label: "Əlaqə", hint: "Əlaqə səhifəsinin yazıları", roots: ["pages.contact"] },
  { key: "faq", label: "FAQ səhifəsi", hint: "Başlıq və yazılar (suallar FAQ bölməsində)", roots: ["pages.faq"] },
  { key: "other", label: "Məxfilik, axtarış, 404", hint: "Kiçik səhifələrin başlıqları", roots: ["pages.privacy", "pages.search", "pages.notFound"] },
  { key: "general", label: "Menyu və ümumi yazılar", hint: "Menyu adları, düymələr, kateqoriya adları, standart SEO", roots: ["meta", "nav", "common"] },
  { key: "forms", label: "Formalar", hint: "Əlaqə və karyera formalarının yazıları", roots: ["form"] },
  { key: "assistant", label: "AI köməkçi", hint: "Salamlama, təklif olunan suallar, düymələr", roots: ["assistant"] },
  { key: "footer", label: "Footer", hint: "Saytın aşağı hissəsi", roots: ["footer"] },
];

/* ---------- Labels ---------- */
const SECTION_TITLES: Record<string, string> = {
  home: "Ana səhifə: ümumi", "home.hero": "Əsas ekran (hero)", "home.events": "Qlobal tədbirlər bloku (hero altında)", "home.about": "“Biz kimik” bloku", "home.services": "Xidmətlər bloku",
  "home.products": "Məhsullar bloku", "home.approach": "“Yanaşmamız” bloku", "home.partners": "Tərəfdaşlar bloku", "home.clients": "Müştərilər bloku",
  "home.certificates": "Sertifikatlar bloku", "home.faq": "FAQ bloku", "home.news": "Xəbərlər bloku", "home.cta": "Səhifə sonundakı çağırış (CTA)",
  soc: "SOC paneli (hero): başlıq", "soc.sources": "SOC paneli: mənbələr (xəritənin yuxarısı)", "soc.systems.edr": "SOC paneli: EDR göstəricisi", "soc.systems.siem": "SOC paneli: SIEM göstəricisi", "soc.systems.soar": "SOC paneli: SOAR göstəricisi", "soc.actions": "SOC paneli: cavab tədbirləri (xəritənin aşağısı)", "soc.steps": "SOC paneli: addımların adları", "soc.edr": "SOC paneli: EDR addımı", "soc.siem": "SOC paneli: SIEM addımı", "soc.soar": "SOC paneli: SOAR addımı", "soc.analyst": "SOC paneli: analitik addımı", "soc.severity": "SOC paneli: səviyyə adları",
  "pages.about": "Haqqımızda səhifəsi", "pages.services": "Xidmətlər: siyahı səhifəsi", "pages.service": "Xidmət səhifəsi (hər xidmət üçün ümumi)",
  "pages.products": "Məhsullar: siyahı səhifəsi", "pages.product": "Məhsul səhifəsi (hər kateqoriya üçün ümumi)", "pages.partners": "Tərəfdaşlar səhifəsi",
  "pages.clients": "Müştərilər səhifəsi", "pages.certificates": "Sertifikatlar səhifəsi", "pages.research": "Tədqiqat və inkişaf səhifəsi",
  "pages.research.cols": "CVE cədvəlinin sütun adları", "pages.research.academy": "Cyberpoint Academy bloku", "pages.news": "Xəbərlər səhifəsi",
  "pages.careers": "Karyera səhifəsi", "pages.contact": "Əlaqə səhifəsi", "pages.faq": "FAQ səhifəsi", "pages.privacy": "Məxfilik siyasəti səhifəsi",
  "pages.search": "Axtarış səhifəsi", "pages.search.kinds": "Axtarış: nəticə növləri", "pages.notFound": "404 (səhifə tapılmadı)",
  meta: "Standart SEO: saytın adı və təsviri", nav: "Menyu və naviqasiya", "nav.menuGroups": "Böyük menyu: qrup adları", common: "Ümumi düymələr və yazılar",
  "common.phases": "Xidmət mərhələləri", "common.phases.assess": "Mərhələ: Qiymətləndir", "common.phases.protect": "Mərhələ: Qoru",
  "common.phases.respond": "Mərhələ: Aşkarla və cavab ver", "common.groups": "Məhsul qruplarının adları", "common.sectors": "Müştəri sektorlarının adları",
  form: "Formalar", assistant: "AI köməkçi", footer: "Footer",
};
const LIST_TITLES: Record<string, string> = {
  "home.stats": "Statistika zolağı (hero altında)", "home.events.items": "Qlobal tədbirlər (kartlar)", "home.about.advantages": "Üstünlük kartları", "home.approach.steps": "Yanaşma addımları",
  "soc.soar.tasks": "SOAR playbook addımları", "soc.analyst.metrics": "Analitik addımı: göstəricilər", "pages.about.who": "“Bizi fərqləndirənlər” kartları", "pages.about.mvv": "Missiya, vizyon, dəyərlər kartları",
  "pages.careers.why": "“Niyə Cyberpoint” kartları", "assistant.suggestions": "Təklif olunan suallar (düymələr)",
};
const KEY_LABELS: Record<string, string> = {
  eyebrow: "Kiçik üst başlıq", title: "Başlıq", lede: "Giriş mətni", text: "Mətn", button: "Düymə", cta: "Düymə", primary: "Əsas düymə",
  secondary: "İkinci düymə", accent: "Vurğulanan sətir", label: "Yazı", value: "Rəqəm / dəyər", icon: "İkon", key: "İkon", description: "Təsvir",
  trustLabel: "Tərəfdaş zolağının yazısı", badge: "Nişan (badge)", topic: "Forma mövzusu", more: "“Daha çox” linki", formTitle: "Forma başlığı",
  formText: "Forma mətni", whyTitle: "Kartlar bölməsinin başlığı", whoTitle: "Kartlar bölməsinin başlığı", mvvTitle: "Missiya bölməsinin başlığı",
  promiseTitle: "Vədlər bölməsinin başlığı", audienceTitle: "Auditoriya bölməsinin başlığı", audience: "Auditoriya mətni", newsTitle: "Xəbərlər bölməsinin başlığı",
  cvesTitle: "CVE cədvəlinin başlığı", rndLabel: "R&D kartı: kiçik başlıq", rndValue: "R&D kartı: rəqəm", rndText: "R&D kartı: mətn", rndCta: "R&D kartı: düymə",
  ctaTitle: "Çağırış başlığı", ctaText: "Çağırış mətni", faqTitle: "Suallar bölməsinin başlığı", includes: "“Daxildir” başlığı", phase: "“Mərhələ” yazısı",
  vendors: "Vendorlar bölməsinin başlığı", company: "“Şirkət” bölməsi", team: "“Komanda” bölməsi", map: "Xəritə linkinin yazısı", updated: "Yenilənmə tarixi yazısı",
  notTranslated: "Tərcümə olunmayıb bildirişi", prev: "“Əvvəlki”", next: "“Növbəti”", empty: "Nəticə yoxdur mesajı", hint: "İpucu", results: "“nəticə” sözü",
  home: "Ana səhifə", ask: "Sual bölməsinin başlığı", askText: "Sual bölməsinin mətni", tagline: "Şüar (footer)", rights: "Hüquqlar sətri",
  greeting: "Salamlama mesajı", full: "Tam adı", place: "Şəhər · il", role: "Rol (hər kartda)", placeholder: "Yazı sahəsində ipucu", privacy: "Məxfilik", launcher: "Açma düyməsinin adı (ekran oxuyucu)",
};
const human = (k: string) => KEY_LABELS[k] ?? k.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/* ---------- Schema builder ---------- */
function itemFields(path: string, sample: unknown, list: unknown[]): { itemType: ListField["itemType"]; fields: ItemField[] } {
  const longOf = (vals: unknown[]) => vals.some((v) => typeof v === "string" && v.length > 70);
  if (typeof sample === "string") return { itemType: "string", fields: [{ key: "v", label: "Mətn", shared: false, long: longOf(list) }] };
  if (Array.isArray(sample)) {
    // tuples, e.g. SOC events: [severity, text]
    return {
      itemType: "tuple",
      fields: sample.map((_, i) =>
        i === 0 && path === "soc.events"
          ? { key: "0", label: "Səviyyə", shared: true, options: ["crit", "warn", "ok"], long: false }
          : { key: String(i), label: "Mətn", shared: false, long: longOf(list.map((x) => (x as unknown[])[i])) },
      ),
    };
  }
  const keys = Object.keys(sample as object);
  return {
    itemType: "object",
    fields: keys.map((k) => {
      const shared = k === "icon" || k === "key";
      return { key: k, label: human(k), shared, options: shared ? ICON_NAMES : undefined, long: longOf(list.map((x) => (x as Record<string, unknown>)[k])) };
    }),
  };
}

function walk(node: Record<string, unknown>, path: string, out: Section[]) {
  const fields: Field[] = [];
  const nested: [string, Record<string, unknown>][] = [];
  for (const [k, v] of Object.entries(node)) {
    const p = `${path}.${k}`;
    if (typeof v === "string") fields.push({ kind: "text", path: p, label: human(k), long: v.length > 70 });
    else if (Array.isArray(v)) fields.push({ kind: "list", path: p, label: LIST_TITLES[p] ?? human(k), ...itemFields(p, v[0], v) });
    else if (v && typeof v === "object") nested.push([p, v as Record<string, unknown>]);
  }
  if (fields.length) out.push({ id: path.replace(/\./g, "-"), title: SECTION_TITLES[path] ?? path, fields });
  for (const [p, v] of nested) walk(v, p, out);
}

export function groupSections(key: string): Section[] {
  const g = TEXT_GROUPS.find((x) => x.key === key);
  if (!g) return [];
  const out: Section[] = [];
  for (const root of g.roots) {
    const node = getAt(baseDictionaries.az, root);
    if (node && typeof node === "object") walk(node as Record<string, unknown>, root, out);
  }
  return out;
}

export function allFields(key: string): Field[] {
  return groupSections(key).flatMap((s) => s.fields);
}

export function fieldData(fields: Field[]): Record<string, FieldData> {
  const cur = Object.fromEntries(LOCALES.map((l) => [l, getDictionary(l)]));
  return Object.fromEntries(
    fields.map((f) => [
      f.path,
      {
        cur: Object.fromEntries(LOCALES.map((l) => [l, getAt(cur[l], f.path)])) as L3<unknown>,
        def: Object.fromEntries(LOCALES.map((l) => [l, getAt(baseDictionaries[l], f.path)])) as L3<unknown>,
      },
    ]),
  );
}
