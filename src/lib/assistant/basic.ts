import "server-only";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProducts, getServices, getSettings } from "@/lib/content";
import type { AssistantAction } from "./tools";

/**
 * Basic mode: works without an API key. Recognises navigation, theme and language commands
 * in AZ / EN / RU and answers from site content. Used when ANTHROPIC_API_KEY is not configured.
 */
const PAGES: [RegExp, string, keyof ReturnType<typeof getDictionary>["nav"]][] = [
  [/xidmət|service|услуг|сервис/i, "/services", "services"],
  [/məhsul|product|продукт|решени/i, "/products", "products"],
  [/tərəfdaş|vendor|partner|партн[её]р/i, "/partners", "partners"],
  [/müştəri|client|customer|клиент|заказчик/i, "/clients", "clients"],
  [/sertifikat|certif|iso|сертифик/i, "/certificates", "certificates"],
  [/tədqiqat|research|r&d|cve|исследов/i, "/research", "research"],
  [/xəbər|news|media|новост/i, "/news", "news"],
  [/karyera|vakansiya|iş yeri|career|job|vacanc|карьер|ваканс|работ/i, "/careers", "careers"],
  [/əlaqə|ünvan|telefon|contact|address|phone|контакт|адрес|телефон|связ/i, "/contact", "contact"],
  [/haqq|biz kim|about|who are you|о (вас|нас|компании)|кто вы/i, "/about", "about"],
  [/ana səhifə|home|главн/i, "", "home"],
];

const SERVICE_HINTS: Record<string, RegExp> = {
  soc: /\bsoc\b|monitor|мониторинг|siem xidmət/i,
  "penetration-testing": /pentest|penetration|nüfuz|проникнов|пентест/i,
  "secure-code-review": /kod|code review|source code|кода/i,
  "security-awareness": /maarif|awareness|phishing|fişinq|обучен|фишинг/i,
  "attack-simulation": /red team|blue team|purple|simulyas|simulation|симуляц/i,
  "digital-forensics": /istintaq|forensic|криминалист|расследов/i,
  "solution-implementation": /tətbiq|implement|внедрен/i,
  "security-audit": /audit|аудит/i,
  consulting: /konsultasiya|consult|консалт|консульт/i,
};

const T = {
  az: {
    opened: (p: string) => `${p} səhifəsini açdım.`,
    theme: (d: boolean) => (d ? "Qaranlıq rejimə keçdim." : "İşıqlı rejimə keçdim."),
    lang: "Dili dəyişdim.",
    contact: (s: ReturnType<typeof getSettings>) => `Bizimlə ${s.phone} nömrəsi və ${s.email} ünvanı ilə əlaqə saxlaya bilərsiniz. İş rejimi: ${s.hours}.`,
    consult: "Konsultasiya üçün əlaqə formasını açdım. Ad, e-poçt və ehtiyacınızı yazın, komandamız sizinlə əlaqə saxlayacaq.",
    fallback: "Hazırda sadə rejimdə işləyirəm və səhifələr arasında keçid edə bilərəm. Məsələn: “xidmətlər”, “pentest”, “müştərilər”, “əlaqə” və ya “qaranlıq rejim” yazın.",
  },
  en: {
    opened: (p: string) => `I've opened the ${p} page.`,
    theme: (d: boolean) => (d ? "Switched to dark mode." : "Switched to light mode."),
    lang: "Language switched.",
    contact: (s: ReturnType<typeof getSettings>) => `You can reach us at ${s.phone} or ${s.email}. We're available ${s.hours}.`,
    consult: "I've opened the contact form. Leave your name, email and what you need, and our team will get back to you.",
    fallback: "I'm running in basic mode right now and can take you around the site. Try “services”, “penetration testing”, “clients”, “contact” or “dark mode”.",
  },
  ru: {
    opened: (p: string) => `Открыл страницу «${p}».`,
    theme: (d: boolean) => (d ? "Включил тёмную тему." : "Включил светлую тему."),
    lang: "Язык переключён.",
    contact: (s: ReturnType<typeof getSettings>) => `Связаться с нами можно по телефону ${s.phone} или по почте ${s.email}. Режим работы: ${s.hours}.`,
    consult: "Открыл форму обратной связи. Укажите имя, e-mail и задачу, и наша команда свяжется с вами.",
    fallback: "Сейчас я работаю в базовом режиме и могу переходить по разделам сайта. Например: «услуги», «пентест», «клиенты», «контакты» или «тёмная тема».",
  },
} as const;

export function basicReply(text: string, locale: Locale): { text: string; actions: AssistantAction[] } {
  const q = text.toLocaleLowerCase(locale === "az" ? "az" : locale);
  const actions: AssistantAction[] = [];
  const replies: string[] = [];

  // Language
  const lang: Locale | null = /english|ingilis|англ/.test(q) ? "en" : /rus|русск|по-русски/.test(q) ? "ru" : /azərbaycan|azerbaijani|азерб/.test(q) ? "az" : null;
  if (lang && lang !== locale && /dil|language|язык|switch|keç|переключ|danış|speak|говор|in |на /.test(q)) {
    actions.push({ type: "language", locale: lang });
    replies.push(T[lang].lang);
    locale = lang;
  }

  // Theme
  if (/qaranlıq|dark|тёмн|темн|ночн/.test(q)) {
    actions.push({ type: "theme", theme: "dark" });
    replies.push(T[locale].theme(true));
  } else if (/işıqlı|açıq rejim|light mode|светл|дневн/.test(q)) {
    actions.push({ type: "theme", theme: "light" });
    replies.push(T[locale].theme(false));
  }

  const t = getDictionary(locale);

  // Consultation intent
  if (/konsultasiya al|sorğu|təklif|consultation|quote|contact me|получить консульт|заявк|коммерческ/.test(q)) {
    actions.push({ type: "navigate", path: `/${locale}/contact` });
    replies.push(T[locale].consult);
    return { text: replies.join(" "), actions };
  }

  // Specific service
  const services = getServices(locale);
  const svc = services.find((s) => SERVICE_HINTS[s.slug]?.test(q) || q.includes(s.title.toLocaleLowerCase()));
  if (svc && !/^(xidmətlər|services|услуги)$/.test(q.trim())) {
    actions.push({ type: "navigate", path: `/${locale}/services/${svc.slug}` });
    const first = svc.body.split(/(?<=[.!?])\s/)[0];
    replies.push(`**${svc.title}**: ${first}`);
    if (svc.features.length) replies.push(svc.features.map((f) => `\n- ${f}`).join(""));
    return { text: replies.join(" "), actions };
  }

  // Specific product by name (Unicode-aware boundaries; short acronyms must be written in capitals)
  const product = getProducts(locale).find((p) => {
    const name = p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![\\p{L}\\p{N}])${name}(?![\\p{L}\\p{N}])`, p.name.length <= 4 ? "u" : "iu").test(text);
  });
  if (product) {
    actions.push({ type: "navigate", path: `/${locale}/products/${product.slug}` });
    replies.push(`**${product.name} (${product.full})**: ${product.desc}. ${product.body}`);
    return { text: replies.join(" "), actions };
  }

  // Section
  const page = PAGES.find(([re]) => re.test(q));
  if (page) {
    const [, path, key] = page;
    actions.push({ type: "navigate", path: `/${locale}${path}` });
    if (path === "/contact") replies.push(T[locale].contact(getSettings(locale)));
    else if (path === "/services") replies.push(`${T[locale].opened(t.nav.services)} ${services.map((s) => `\n- ${s.title}`).join("")}`);
    else replies.push(T[locale].opened(String(t.nav[key])));
    return { text: replies.join(" "), actions };
  }

  if (replies.length) return { text: replies.join(" "), actions };
  return { text: T[locale].fallback, actions };
}
