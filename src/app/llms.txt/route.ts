import { getDictionary } from "@/i18n/get-dictionary";
import { getFaqs, getProducts, getServices, getSettings } from "@/lib/content";
import { SITE } from "@/lib/schema";

export const dynamic = "force-dynamic";

/** llms.txt (https://llmstxt.org): a curated, Markdown index of the site for AI agents. */
export async function GET() {
  const t = getDictionary("en");
  const s = getSettings("en");
  const u = (p: string) => `${SITE}${p}`;
  const body = `# Cyberpoint

> Cyberpoint (Cyberpoint MMC) is a cybersecurity company in Baku, Azerbaijan. It runs a 24/7 Security Operations Center (SOC) and provides penetration testing, secure code review, adversary simulation (Red/Blue/Purple Team), digital forensics, cybersecurity audits (CIS Controls), consulting, security awareness training and deployment of products from 27 global vendors. Its management systems are certified to ISO/IEC 27001 and ISO 9001 (Intertek), and its R&D team has registered three CVEs.

Website languages: Azerbaijani (/az, default), English (/en), Russian (/ru). Every page has a Markdown version at /md/{locale}/{path}. Contact: ${s.phone} · ${s.email} · ${s.address} · available ${s.hours}.

## Company
- [About Cyberpoint](${u("/md/en/about")}): who we are, approach ("think red, act blue"), mission, vision, values
- [Certifications](${u("/md/en/certificates")}): ISO/IEC 27001, ISO 9001 and team certifications (OSCP, OSWE, CEH and more)
- [Research & CVEs](${u("/md/en/research")}): vulnerabilities discovered by the R&D team
- [Partners](${u("/md/en/partners")}): technology vendors and the product areas they cover
- [Clients](${u("/md/en/clients")}): organisations Cyberpoint works with, by sector
- [Contact](${u("/md/en/contact")}): phone, email, address, hours

## Services
${getServices("en").map((x) => `- [${x.title}](${u(`/md/en/services/${x.slug}`)}): ${x.short}`).join("\n")}

## Products
${getProducts("en").map((p) => `- [${p.name} — ${p.full}](${u(`/md/en/products/${p.slug}`)}): ${p.desc}`).join("\n")}

## FAQ
${getFaqs("en").map((f) => `- [${f.question}](${u(`/en/faq#faq-${f.id}`)})`).join("\n")}

## Machine-readable data
- [Full site content, English](${u("/llms-full.txt")}): every page in one Markdown file
- [Full site content, Azerbaijani](${u("/az/llms-full.txt")})
- [Full site content, Russian](${u("/ru/llms-full.txt")})
- [Public JSON API](${u("/api/public")}): services, products, partners, clients, certifications, news, FAQ, company (OpenAPI: ${u("/api/public/openapi.json")})
- [News RSS (en)](${u("/en/news/feed.xml")}), [az](${u("/az/news/feed.xml")}), [ru](${u("/ru/news/feed.xml")})
- [Sitemap](${u("/sitemap.xml")})

## Optional
- [News](${u("/md/en/news")}): company news and events
- [Careers](${u("/md/en/careers")})
- [Privacy policy](${u("/md/en/privacy")})
- ${t.meta.description}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=600", "Access-Control-Allow-Origin": "*" } });
}
