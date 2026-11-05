// Admin content model. Each resource maps to one SQLite table.
// "localized" fields expand to <name>_az, <name>_en, <name>_ru columns.

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "image" | "date" | "tags";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  localized?: boolean;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  rows?: number;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  order: string;
  titleColumn: string;
  listColumns: { name: string; label: string; type?: "image" | "bool" | "date" }[];
  fields: Field[];
};

const groups = [
  { value: "appsec", label: "Tətbiq təhlükəsizliyi" },
  { value: "endpoint", label: "Son nöqtə" },
  { value: "network", label: "Şəbəkə" },
  { value: "identity", label: "İdentifikasiya" },
  { value: "data", label: "Məlumat" },
  { value: "secops", label: "Təhlükəsizlik əməliyyatları" },
];

const icons = ["radar", "target", "code", "users", "swords", "search", "layers", "clipboard", "chat", "shield", "eye", "graduation"].map((v) => ({ value: v, label: v }));

const body = "Boş sətir = yeni abzas · “- ” ilə başlayan sətir = siyahı · “## ” = başlıq · linklər avtomatik aktivləşir.";

export const resources: Record<string, Resource> = {
  news: {
    key: "news", table: "news", label: "Xəbərlər", singular: "Xəbər", order: "date DESC, id DESC", titleColumn: "title_az",
    listColumns: [{ name: "image", label: "", type: "image" }, { name: "title_az", label: "Başlıq" }, { name: "date", label: "Tarix", type: "date" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "title", label: "Başlıq", type: "text", localized: true, required: true },
      { name: "slug", label: "URL (slug)", type: "text", required: true, help: "Yalnız latın hərfləri, rəqəmlər və “-”. Məs: yeni-memorandum" },
      { name: "date", label: "Tarix", type: "date", required: true },
      { name: "image", label: "Şəkil", type: "image", help: "JPG, PNG və ya WEBP, maks. 5 MB. Tövsiyə: 1600×1000" },
      { name: "body", label: "Mətn", type: "textarea", localized: true, rows: 14, help: body },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  services: {
    key: "services", table: "services", label: "Xidmətlər", singular: "Xidmət", order: "sort, id", titleColumn: "title_az",
    listColumns: [{ name: "title_az", label: "Ad" }, { name: "phase", label: "Mərhələ" }, { name: "sort", label: "Sıra" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "title", label: "Ad", type: "text", localized: true, required: true },
      { name: "slug", label: "URL (slug)", type: "text", required: true },
      { name: "phase", label: "Mərhələ", type: "select", options: [{ value: "assess", label: "Qiymətləndir" }, { value: "protect", label: "Qoru" }, { value: "respond", label: "Aşkarla və cavab ver" }] },
      { name: "icon", label: "İkon", type: "select", options: icons },
      { name: "short", label: "Qısa təsvir", type: "text", localized: true },
      { name: "body", label: "Ətraflı mətn", type: "textarea", localized: true, rows: 12, help: body },
      { name: "features", label: "Xidmətə daxildir", type: "textarea", localized: true, rows: 5, help: "Hər sətirdə bir bənd." },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  products: {
    key: "products", table: "products", label: "Məhsullar", singular: "Məhsul", order: "sort, id", titleColumn: "name",
    listColumns: [{ name: "name", label: "Ad" }, { name: "full_name", label: "Tam adı" }, { name: "grp", label: "Qrup" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "name", label: "Qısa ad (məs. SIEM)", type: "text", required: true },
      { name: "full_name", label: "Tam adı", type: "text" },
      { name: "slug", label: "URL (slug)", type: "text", required: true, help: "Tərəfdaşların teqlərində də bu slug istifadə olunur." },
      { name: "grp", label: "Qrup", type: "select", options: groups },
      { name: "desc", label: "Qısa təsvir", type: "text", localized: true },
      { name: "body", label: "Ətraflı mətn", type: "textarea", localized: true, rows: 8, help: body },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  partners: {
    key: "partners", table: "partners", label: "Tərəfdaşlar", singular: "Tərəfdaş", order: "sort, id", titleColumn: "name",
    listColumns: [{ name: "logo", label: "", type: "image" }, { name: "name", label: "Ad" }, { name: "tags", label: "Məhsul teqləri" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "name", label: "Ad", type: "text", required: true },
      { name: "logo", label: "Loqo (işıqlı fon üçün)", type: "image", help: "Şəffaf PNG tövsiyə olunur." },
      { name: "logo_dark", label: "Loqo (qaranlıq fon üçün)", type: "image", help: "İstəyə bağlı. Boş qalsa, əsas loqo istifadə olunur." },
      { name: "url", label: "Sayt", type: "text" },
      { name: "tags", label: "Məhsul teqləri", type: "tags", help: "Vergüllə: siem,soar. Məhsul səhifəsində “tərəfdaş vendorlar” bölməsini müəyyən edir." },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  clients: {
    key: "clients", table: "clients", label: "Müştərilər", singular: "Müştəri", order: "sort, id", titleColumn: "name",
    listColumns: [{ name: "logo", label: "", type: "image" }, { name: "name", label: "Ad" }, { name: "sector", label: "Sahə" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "name", label: "Ad", type: "text", required: true },
      { name: "logo", label: "Loqo (işıqlı fon üçün)", type: "image" },
      { name: "logo_dark", label: "Loqo (qaranlıq fon üçün)", type: "image" },
      { name: "url", label: "Sayt", type: "text" },
      {
        name: "sector", label: "Sahə", type: "select",
        options: [
          { value: "government", label: "Dövlət" }, { value: "finance", label: "Maliyyə" }, { value: "telecom", label: "Telekom" },
          { value: "health", label: "Səhiyyə" }, { value: "industry", label: "Sənaye" }, { value: "technology", label: "Texnologiya" },
          { value: "nonprofit", label: "Assosiasiya" }, { value: "other", label: "Digər" },
        ],
      },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  faqs: {
    key: "faqs", table: "faqs", label: "FAQ", singular: "Sual", order: "sort, id", titleColumn: "question_az",
    listColumns: [{ name: "question_az", label: "Sual" }, { name: "service_slug", label: "Xidmət" }, { name: "home", label: "Ana səhifə", type: "bool" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "question", label: "Sual", type: "text", localized: true, required: true },
      { name: "answer", label: "Cavab", type: "textarea", localized: true, rows: 6, required: true, help: "Qısa və dəqiq cavab. Google və AI köməkçilər bu mətni birbaşa göstərə bilər." },
      { name: "service_slug", label: "Xidmət səhifəsində göstər (slug, istəyə bağlı)", type: "text", help: "Məs: soc, penetration-testing. Boş qalsa yalnız FAQ səhifəsində görünür." },
      { name: "home", label: "Ana səhifədə göstər", type: "checkbox" },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
  certificates: {
    key: "certificates", table: "certificates", label: "Sertifikatlar", singular: "Sertifikat", order: "sort, id", titleColumn: "name",
    listColumns: [{ name: "logo", label: "", type: "image" }, { name: "name", label: "Ad" }, { name: "kind", label: "Növ" }, { name: "published", label: "Dərc", type: "bool" }],
    fields: [
      { name: "name", label: "Ad", type: "text", required: true },
      { name: "kind", label: "Növ", type: "select", options: [{ value: "company", label: "Şirkət sertifikatı (ISO və s.)" }, { value: "team", label: "Komanda sertifikatı" }] },
      { name: "issuer", label: "Verən qurum", type: "text" },
      { name: "logo", label: "Şəkil (işıqlı fon üçün)", type: "image" },
      { name: "logo_dark", label: "Şəkil (qaranlıq fon üçün)", type: "image" },
      { name: "sort", label: "Sıra", type: "number" },
      { name: "published", label: "Saytda göstər", type: "checkbox" },
    ],
  },
};

export const LOCALES = ["az", "en", "ru"] as const;

/** Column names a resource writes (localized fields expanded). */
export function columnsOf(r: Resource): string[] {
  return r.fields.flatMap((f) => (f.localized ? LOCALES.map((l) => `${f.name}_${l}`) : [f.name]));
}

export const SETTING_KEYS = ["phone", "email", "hours", "address_az", "address_en", "address_ru", "map_url", "linkedin", "facebook", "instagram", "x"] as const;
