# Cyberpoint — Step 1: Sitemap & Content Plan

Stack: Next.js (App Router) · Languages: AZ (default) / EN / RU via `/az`, `/en`, `/ru`
Structure reference: megasec.az · Content source: cyberpoint.az (AZ only today)

## Brand (from supplied logo, slogan removed)
- Navy `#0D1550` (pill "CYBER"), Blue `#0D6EF5` ("POINT"), Purple accent `#7B2AB8` (dot)
- Wordmark only; "Bir addım öndə" slogan not used in the logo (can live as hero copy)

## Sitemap
```
/                      Home
/services              Services overview
/services/[slug]       Service detail (10)
/products              Products overview (12 categories)
/products/[slug]       Product category detail
/about                 About (who we are, mission/vision/values, advantages)
/team                  Our team            (current page is empty → needs content)
/partners              Partners + Clients + Certificates (tabs)
/news                  Media / news list (13 items)
/news/[slug]           Article
/brand                 Brand & catalogs (Catalog 2022 / 2023 PDFs)
/careers               Careers             (new — content from "who we are" employee benefits)
/contact               Contact + request form
/privacy               Privacy policy      (new — needs text)
```

## Header (sticky, megasec pattern)
Logo · Services ▾ (mega-menu, 10 items) · Products ▾ (12 items) · Research & News · About ▾ (Who we are, Team, Partners, Brand, Careers) · Contact · AZ/EN/RU · Light/Dark · CTA "Request consultation"

## Home — section order
1. **Hero** — "Haker kimi düşünərək, hakerlərdən bir addım öndəyik!" + short intro + 2 CTAs (Services / Contact), video/animated background
2. **Intro / Who we are** — "Yeni nəsil kibermüdafiə" + 4 advantages (international certified team, broad range of solutions, 7/24 support, ahead of threats)
3. **Services grid** — 10 cards → detail pages
4. **Products** — 12 categories (SAST, DAST, WAF, EDR, XDR, NGFW, PAM, SIEM, SOAR, DLP, DNS, TI)
5. **Highlight band** — "Think red, act blue" + SOC 7/24 feature
6. **Mission / Vision / Values** — 3 cards
7. **Partners / Clients / Certificates** — tabbed logo carousel (~130 logos on current site)
8. **Latest news** — 3 most recent + "All news"
9. **Contact CTA + form** — "Talk to us about security"
10. **Footer** — Navigation · Contact (phone, email, 7/24, address) · Socials · Privacy · ©

## Services (10) → `/services/[slug]`
| # | AZ title | slug |
|---|---|---|
| 1 | Təhlükəsizlik Əməliyyatları Mərkəzi (SOC) Xidməti | soc |
| 2 | Nüfuzetmə Sınaqları (black/white/grey box) | penetration-testing |
| 3 | Kod təhlükəsizliyinin yoxlanılması | secure-code-review |
| 4 | Kibertəhlükəsizlik Maarifləndirmə Xidməti | security-awareness |
| 5 | Şərti Kiberhücum Simulyasiyası (Red/Blue/Purple) | attack-simulation |
| 6 | Rəqəmsal istintaq (Digital Forensics) | digital-forensics |
| 7 | Kibertəhlükəsizlik Həllərinin Tətbiqi | solution-implementation |
| 8 | Kibertəhlükəsizlik Auditi (CIS Controls) | security-audit |
| 9 | Kibertəhlükəsizlik konsultasiyası | consulting |
| 10 | Kibertəhlükəsizlik məhsulları | → links to /products |

Detail template (megasec style): hero title + summary · content sections · approach/methodology steps · related services · contact CTA.

## Content status
- ✅ Have (AZ): hero, advantages, mission/vision/values, all service texts, products paragraph, partners/clients/certificates intros, who-we-are page, 13 news articles, contact details
- ⚠️ Need from Cyberpoint: EN & RU translations (or I draft them), team members, product-level detail per category, partner/client/certificate names (logos have no names), catalog PDFs, privacy text, stats/numbers (years, projects, clients), high-res logo files (SVG)

## Contact
- info@cyberpoint.az · +994 12 526 33 33 · 7/24
- Bakı şəhəri, Nizami rayonu, Heydər Əliyev prospekti 189 B
- facebook.com/cyberpoint.az · instagram.com/cyberpoint.az · linkedin.com/company/cyberpoint-az · x.com/cyberpointaz
