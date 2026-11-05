import type { Locale } from "@/i18n/config";

type L = Record<Locale, string>;

export type Phase = "assess" | "protect" | "respond";
export type Service = { slug: string; phase: Phase; icon: string; title: L; short: L };

// Titles from cyberpoint.az (AZ). EN/RU are drafts pending client review.
export const services: Service[] = [
  {
    slug: "soc",
    phase: "respond",
    icon: "radar",
    title: { az: "Təhlükəsizlik Əməliyyatları Mərkəzi (SOC)", en: "Security Operations Center (SOC)", ru: "Центр мониторинга безопасности (SOC)" },
    short: { az: "7/24 infrastruktur monitorinqi və insidentlərə reaksiya", en: "24/7 infrastructure monitoring and incident response", ru: "Мониторинг 24/7 и реагирование на инциденты" },
  },
  {
    slug: "penetration-testing",
    phase: "assess",
    icon: "target",
    title: { az: "Nüfuzetmə sınaqları", en: "Penetration testing", ru: "Тестирование на проникновение" },
    short: { az: "Qara, ağ və boz qutu üsulu ilə zəifliklərin aşkarlanması", en: "Black, white and grey box vulnerability discovery", ru: "Поиск уязвимостей методами black, white и grey box" },
  },
  {
    slug: "secure-code-review",
    phase: "assess",
    icon: "code",
    title: { az: "Kod təhlükəsizliyinin yoxlanılması", en: "Secure code review", ru: "Анализ безопасности кода" },
    short: { az: "Veb və mobil tətbiqlərin mənbə kodunun analizi", en: "Source code analysis for web and mobile apps", ru: "Анализ исходного кода веб- и мобильных приложений" },
  },
  {
    slug: "security-awareness",
    phase: "protect",
    icon: "users",
    title: { az: "Kibertəhlükəsizlik maarifləndirməsi", en: "Security awareness training", ru: "Обучение кибергигиене" },
    short: { az: "Əməkdaşların fişinq və sosial mühəndisliyə hazırlığı", en: "Preparing staff for phishing and social engineering", ru: "Подготовка сотрудников к фишингу и социальной инженерии" },
  },
  {
    slug: "attack-simulation",
    phase: "assess",
    icon: "swords",
    title: { az: "Şərti kiberhücum simulyasiyası", en: "Adversary simulation", ru: "Симуляция кибератак" },
    short: { az: "Red, Blue və Purple Team məşqləri", en: "Red, Blue and Purple Team exercises", ru: "Учения Red, Blue и Purple Team" },
  },
  {
    slug: "digital-forensics",
    phase: "respond",
    icon: "search",
    title: { az: "Rəqəmsal istintaq", en: "Digital forensics", ru: "Цифровая криминалистика" },
    short: { az: "Kiberhücumların və məlumat itkilərinin araşdırılması", en: "Investigating attacks and data breaches", ru: "Расследование атак и утечек данных" },
  },
  {
    slug: "solution-implementation",
    phase: "protect",
    icon: "layers",
    title: { az: "Kibertəhlükəsizlik həllərinin tətbiqi", en: "Security solution implementation", ru: "Внедрение решений безопасности" },
    short: { az: "Təhlükəsiz infrastruktur dizaynı və konfiqurasiya", en: "Secure infrastructure design and configuration", ru: "Проектирование и настройка защищённой инфраструктуры" },
  },
  {
    slug: "security-audit",
    phase: "assess",
    icon: "clipboard",
    title: { az: "Kibertəhlükəsizlik auditi", en: "Cybersecurity audit", ru: "Аудит кибербезопасности" },
    short: { az: "CIS Controls əsasında sistematik qiymətləndirmə", en: "Systematic assessment based on CIS Controls", ru: "Системная оценка на основе CIS Controls" },
  },
  {
    slug: "consulting",
    phase: "protect",
    icon: "chat",
    title: { az: "Kibertəhlükəsizlik konsultasiyası", en: "Cybersecurity consulting", ru: "Консалтинг по кибербезопасности" },
    short: { az: "Təhlükəsiz arxitektura və ekspert məsləhəti", en: "Secure architecture and expert advice", ru: "Безопасная архитектура и экспертные консультации" },
  },
];

export type ProductGroup = "appsec" | "endpoint" | "network" | "identity" | "data" | "secops";
export type Product = { slug: string; name: string; full: string; group: ProductGroup; desc: L };

// Descriptions follow the product paragraph on cyberpoint.az.
export const products: Product[] = [
  { slug: "sast", name: "SAST", full: "Static Application Security Testing", group: "appsec",
    desc: { az: "Mənbə kodunda zəifliklərin erkən aşkarlanması", en: "Find vulnerabilities early in source code", ru: "Раннее выявление уязвимостей в исходном коде" } },
  { slug: "dast", name: "DAST", full: "Dynamic Application Security Testing", group: "appsec",
    desc: { az: "İşlək tətbiqlərin hücumçu baxışından sınağı", en: "Test running apps from an attacker’s view", ru: "Тестирование работающих приложений глазами атакующего" } },
  { slug: "waf", name: "WAF", full: "Web Application Firewall", group: "appsec",
    desc: { az: "Veb tətbiqlərin və API-lərin müdafiəsi", en: "Protect web applications and APIs", ru: "Защита веб-приложений и API" } },
  { slug: "edr", name: "EDR", full: "Endpoint Detection & Response", group: "endpoint",
    desc: { az: "Son nöqtələrdə hücumların aşkarlanması və dayandırılması", en: "Detect and stop attacks on endpoints", ru: "Обнаружение и блокировка атак на конечных точках" } },
  { slug: "xdr", name: "XDR", full: "Extended Detection & Response", group: "endpoint",
    desc: { az: "Bütün qatlarda vahid aşkarlama və cavab", en: "Unified detection and response across layers", ru: "Единое обнаружение и реагирование на всех уровнях" } },
  { slug: "ngfw", name: "NGFW", full: "Next-Generation Firewall", group: "network",
    desc: { az: "Şəbəkə trafikinin yeni nəsil mühafizəsi", en: "Next-generation network traffic protection", ru: "Защита сетевого трафика нового поколения" } },
  { slug: "dns", name: "DNS", full: "DNS Security", group: "network",
    desc: { az: "Sistem adı səviyyəsində təhdidlərin bloklanması", en: "Block threats at the DNS layer", ru: "Блокировка угроз на уровне DNS" } },
  { slug: "pam", name: "PAM", full: "Privileged Access Management", group: "identity",
    desc: { az: "İmtiyazlı hesablara və idarəetmə girişinə nəzarət", en: "Control privileged accounts and admin access", ru: "Контроль привилегированных учётных записей" } },
  { slug: "dlp", name: "DLP", full: "Data Loss Prevention", group: "data",
    desc: { az: "Həssas məlumatların sızmasının qarşısının alınması", en: "Prevent leaks of sensitive data", ru: "Предотвращение утечек конфиденциальных данных" } },
  { slug: "siem", name: "SIEM", full: "Security Information & Event Management", group: "secops",
    desc: { az: "Logların mərkəzləşdirilmiş monitorinqi və təhlili", en: "Centralised log monitoring and analysis", ru: "Централизованный мониторинг и анализ логов" } },
  { slug: "soar", name: "SOAR", full: "Security Orchestration, Automation & Response", group: "secops",
    desc: { az: "Təhlükəsizlik proseslərinin avtomatlaşdırılması", en: "Automate security workflows", ru: "Автоматизация процессов безопасности" } },
  { slug: "ti", name: "TI", full: "Threat Intelligence", group: "secops",
    desc: { az: "Aktual təhdid kəşfiyyatı ilə proaktiv müdafiə", en: "Proactive defense with current threat intel", ru: "Проактивная защита на основе разведданных об угрозах" } },
];
