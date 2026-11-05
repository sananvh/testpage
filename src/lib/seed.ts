import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { certificates, clients, partners } from "@/content/logos";
import { products } from "@/content/services";
import { seedNews } from "./seed-news";
import { seedFaq } from "./seed-faq";
import { seedServices } from "./seed-services";
import { hashPassword } from "./password";

// Technology domains each vendor is associated with (product slugs). Editable in admin.
const partnerTags: Record<string, string> = {
  Brandefense: "ti", "Check Point": "ngfw", Cisco: "ngfw", CrowdStrike: "edr,xdr,ti", CyberArk: "pam",
  Elastic: "siem", F5: "waf", Forcepoint: "dlp", Fortinet: "ngfw,edr", "Fudo Security": "pam", Imperva: "waf",
  Invicti: "dast", Krontech: "pam", LogScale: "siem", "Palo Alto Networks": "ngfw,xdr,soar", Rapid7: "dast,siem",
  Roksit: "dns", Snyk: "sast", Splunk: "siem,soar", Synopsys: "sast,dast", "Vectra AI": "xdr", Wallarm: "waf",
};

const clientSectors: Record<string, string> = {
  "A2Z Technologies": "technology", "AFB Bank": "finance", AKTA: "nonprofit", Azerconnect: "telecom", AZnet: "telecom",
  "İcbari Tibbi Sığorta üzrə Dövlət Agentliyi": "government",
  "İqtisadiyyat Nazirliyi — İnformasiya Texnologiyaları və Məlumat İdarəetmə Mərkəzi": "government",
  "Kapital Bank": "finance", "MİDA": "government", "Norm Sement": "industry", "Respublika Diaqnostika Mərkəzi": "health",
};

const productBodies: Record<string, { az: string; en: string; ru: string }> = {
  sast: {
    az: "Statik tətbiq təhlükəsizliyi testi kodu işə salmadan, hazırlanma mərhələsində zəiflikləri tapır. CI/CD prosesinə inteqrasiya olunaraq tərtibatçılara düzəlişləri erkən etməyə imkan verir.",
    en: "Static application security testing finds vulnerabilities in code without running it, during development. Integrated into CI/CD, it lets developers fix issues early, when they are cheapest to fix.",
    ru: "Статический анализ безопасности приложений находит уязвимости в коде без его запуска, ещё на этапе разработки. Интеграция в CI/CD позволяет исправлять проблемы на ранней стадии.",
  },
  dast: {
    az: "Dinamik test işlək tətbiqi kənardan, hücumçu baxışından yoxlayır və konfiqurasiya, autentifikasiya və injection kimi zəiflikləri aşkarlayır.",
    en: "Dynamic testing examines a running application from the outside, the way an attacker would, revealing configuration, authentication and injection flaws.",
    ru: "Динамическое тестирование проверяет работающее приложение снаружи, глазами атакующего, выявляя ошибки конфигурации, аутентификации и инъекции.",
  },
  waf: {
    az: "Veb tətbiq firewall-u veb saytları və API-ləri SQL injection, XSS, bot hücumları və DDoS kimi təhdidlərdən qoruyur.",
    en: "A web application firewall protects websites and APIs from threats such as SQL injection, XSS, bot attacks and DDoS.",
    ru: "Межсетевой экран для веб-приложений защищает сайты и API от SQL-инъекций, XSS, бот-атак и DDoS.",
  },
  edr: {
    az: "EDR son nöqtələrdə (kompüter və serverlərdə) şübhəli fəaliyyəti real vaxtda aşkarlayır, hücumu dayandırır və araşdırma üçün məlumat toplayır.",
    en: "EDR detects suspicious activity on endpoints (workstations and servers) in real time, stops attacks and collects data for investigation.",
    ru: "EDR в реальном времени выявляет подозрительную активность на конечных точках, останавливает атаки и собирает данные для расследования.",
  },
  xdr: {
    az: "XDR son nöqtə, şəbəkə, bulud və e-poçt məlumatlarını birləşdirərək hücumları vahid platformada aşkarlamağa və onlara cavab verməyə imkan verir.",
    en: "XDR combines endpoint, network, cloud and email telemetry so attacks can be detected and answered from one platform.",
    ru: "XDR объединяет телеметрию конечных точек, сети, облака и почты для обнаружения атак и реагирования на одной платформе.",
  },
  ngfw: {
    az: "Yeni nəsil firewall tətbiq səviyyəsində nəzarət, müdaxilənin qarşısının alınması (IPS) və təhdid kəşfiyyatı ilə şəbəkə trafikini qoruyur.",
    en: "A next-generation firewall protects network traffic with application-level control, intrusion prevention (IPS) and threat intelligence.",
    ru: "Межсетевой экран нового поколения защищает трафик с помощью контроля приложений, предотвращения вторжений (IPS) и разведданных об угрозах.",
  },
  dns: {
    az: "DNS təhlükəsizliyi zərərli domenlərə müraciətləri ad həlli mərhələsində bloklayır, fişinq və zərərli proqram əlaqələrinin qarşısını alır.",
    en: "DNS security blocks requests to malicious domains at the name-resolution stage, cutting off phishing and malware connections.",
    ru: "DNS-защита блокирует обращения к вредоносным доменам на этапе разрешения имён, пресекая фишинг и связь вредоносного ПО.",
  },
  pam: {
    az: "PAM imtiyazlı hesablara girişi idarə edir, sessiyaları qeydə alır və parolları qoruyur, beləliklə ən kritik sistemlərə nəzarəti təmin edir.",
    en: "PAM manages access to privileged accounts, records sessions and vaults credentials, keeping control over your most critical systems.",
    ru: "PAM управляет доступом к привилегированным учётным записям, записывает сессии и хранит пароли, обеспечивая контроль над критичными системами.",
  },
  dlp: {
    az: "DLP həssas məlumatların e-poçt, veb, USB və bulud kanalları ilə təşkilatdan kənara sızmasının qarşısını alır.",
    en: "DLP prevents sensitive data from leaving the organisation through email, web, USB and cloud channels.",
    ru: "DLP предотвращает утечку конфиденциальных данных через почту, веб, USB и облачные каналы.",
  },
  siem: {
    az: "SIEM bütün sistemlərdən logları toplayır, korrelyasiya edir və təhlükəsizlik hadisələrini real vaxtda aşkarlayır. SOC-un əsas alətidir.",
    en: "SIEM collects and correlates logs from all systems and detects security events in real time. It is the core tool of a SOC.",
    ru: "SIEM собирает и коррелирует логи всех систем и выявляет события безопасности в реальном времени. Это основной инструмент SOC.",
  },
  soar: {
    az: "SOAR təkrarlanan təhlükəsizlik əməliyyatlarını playbook-lar vasitəsilə avtomatlaşdırır və insidentlərə cavab müddətini qısaldır.",
    en: "SOAR automates repetitive security operations with playbooks and shortens incident response time.",
    ru: "SOAR автоматизирует рутинные операции безопасности с помощью плейбуков и сокращает время реагирования.",
  },
  ti: {
    az: "Təhdid kəşfiyyatı aktual hücum göstəricilərini və hücumçu taktikalarını təqdim edərək müdafiəni proaktiv etməyə kömək edir.",
    en: "Threat intelligence delivers current indicators of compromise and attacker tactics so your defense can be proactive.",
    ru: "Разведка угроз предоставляет актуальные индикаторы компрометации и тактики атакующих для проактивной защиты.",
  },
};

export function seedIfEmpty(db: DatabaseSync) {
  const count = (db.prepare("SELECT COUNT(*) AS n FROM services").get() as { n: number }).n;
  if (count > 0) return;

  db.exec("BEGIN");
  try {
    const s = db.prepare(`INSERT INTO services (slug, phase, icon, sort, title_az, title_en, title_ru, short_az, short_en, short_ru,
      body_az, body_en, body_ru, features_az, features_en, features_ru) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    seedServices.forEach((v, i) =>
      s.run(v.slug, v.phase, v.icon, i, v.title.az, v.title.en, v.title.ru, v.short.az, v.short.en, v.short.ru,
        v.body.az, v.body.en, v.body.ru, v.features.az, v.features.en, v.features.ru),
    );

    const p = db.prepare(`INSERT INTO products (slug, name, full_name, grp, sort, desc_az, desc_en, desc_ru, body_az, body_en, body_ru)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    products.forEach((v, i) => {
      const b = productBodies[v.slug];
      p.run(v.slug, v.name, v.full, v.group, i, v.desc.az, v.desc.en, v.desc.ru, b.az, b.en, b.ru);
    });

    const light = (src: string) => src.replace(/\.png$/, "-light.png");
    const pa = db.prepare("INSERT INTO partners (name, logo, logo_dark, tags, sort) VALUES (?,?,?,?,?)");
    partners.forEach((v, i) => pa.run(v.name, light(v.src), v.src, partnerTags[v.name] ?? "", i));

    const cl = db.prepare("INSERT INTO clients (name, logo, logo_dark, sector, sort) VALUES (?,?,?,?,?)");
    clients.forEach((v, i) => cl.run(v.name, light(v.src), v.src, clientSectors[v.name] ?? "other", i));

    const ce = db.prepare("INSERT INTO certificates (name, logo, logo_dark, kind, issuer, sort) VALUES (?,?,?,?,?,?)");
    certificates.forEach((v, i) => {
      const company = v.name.startsWith("ISO");
      const name = v.name.replace(" (Intertek)", "");
      ce.run(name, light(v.src), v.src, company ? "company" : "team", company ? "Intertek" : "", company ? i - 100 : i);
    });

    const n = db.prepare(`INSERT INTO news (slug, date, image, title_az, title_en, title_ru, body_az) VALUES (?,?,?,?,?,?,?)`);
    seedNews.forEach((v) => n.run(v.slug, v.date, v.image, v.title.az, v.title.en, v.title.ru, v.body_az));

    const st = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const settings: Record<string, string> = {
      phone: "+994 12 526 33 33",
      email: "info@cyberpoint.az",
      hours: "7/24",
      address_az: "Bakı şəhəri, Nizami rayonu, Heydər Əliyev prospekti 189 B",
      address_en: "189B Heydar Aliyev Ave, Nizami district, Baku, Azerbaijan",
      address_ru: "г. Баку, Низаминский район, проспект Гейдара Алиева 189 B",
      map_url: "https://www.google.com/maps/search/?api=1&query=Heyd%C9%99r+%C6%8Fliyev+prospekti+189B+Bak%C4%B1",
      linkedin: "https://www.linkedin.com/company/cyberpoint-az",
      facebook: "https://www.facebook.com/cyberpoint.az",
      instagram: "https://instagram.com/cyberpoint.az",
      x: "https://twitter.com/cyberpointaz",
    };
    for (const [k, v] of Object.entries(settings)) st.run(k, v);

    // First admin user
    const email = process.env.ADMIN_EMAIL ?? "admin@cyberpoint.az";
    let password = process.env.ADMIN_PASSWORD;
    if (!password) {
      password = crypto.randomBytes(9).toString("base64url");
      const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
      fs.writeFileSync(path.join(dir, "initial-admin.txt"), `email: ${email}\npassword: ${password}\n\nChange it after first login and delete this file.\n`, { mode: 0o600 });
      console.warn(`[cyberpoint] Created admin ${email}. Password written to ${dir}/initial-admin.txt`);
    }
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, hashPassword(password));

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

/** Seeds the FAQ separately so existing databases get it too. */
export function seedFaqIfEmpty(db: DatabaseSync) {
  const n = (db.prepare("SELECT COUNT(*) AS n FROM faqs").get() as { n: number }).n;
  if (n > 0) return;
  const st = db.prepare(`INSERT INTO faqs (service_slug, sort, home, question_az, question_en, question_ru, answer_az, answer_en, answer_ru)
    VALUES (?,?,?,?,?,?,?,?,?)`);
  const homeIdx = new Set([0, 1, 2, 3, 8, 11]);
  seedFaq.forEach((f, i) => st.run(f.service ?? "", i, homeIdx.has(i) ? 1 : 0, f.q.az, f.q.en, f.q.ru, f.a.az, f.a.en, f.a.ru));
}
