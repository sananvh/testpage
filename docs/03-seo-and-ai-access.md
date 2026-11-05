# SEO & AI-agent access — what's in place and what to do at launch

## Search engines (classic SEO)
- Every page: unique `<title>` and description, canonical URL, `hreflang` for az / en / ru + `x-default` (→ az), Open Graph + Twitter card, all rendered in `<head>` for every visitor and crawler
- Structured data (schema.org JSON-LD), validated on all page types:
  - Site-wide: `Organization` (contact, address, credentials ISO/IEC 27001 + ISO 9001, social profiles) and `WebSite` with sitelinks `SearchAction`
  - `BreadcrumbList` on every inner page
  - `Service` for each service and product category, with what's included and vendors
  - `NewsArticle` for each article, `FAQPage` on the FAQ page, homepage and service pages, `ItemList` for listings, `AboutPage` / `ContactPage`
- `sitemap.xml`: 138+ URLs (3 languages), language alternates, priorities, news dates and images
- RSS per language: `/az/news/feed.xml`, `/en/news/feed.xml`, `/ru/news/feed.xml`
- Web app manifest, icons, `/.well-known/security.txt` (expected from a security company)
- Lighthouse on 14 pages: **SEO 100, Best Practices 100, Accessibility 100** (light theme); axe-core finds no WCAG A/AA violations in light or dark mode

## AI assistants and agents (GEO / AEO)
| Resource | Purpose |
|---|---|
| `/robots.txt` | Allows all crawlers, with explicit rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot and others. Blocks only `/admin`, private API routes and search results |
| `/llms.txt` | Curated Markdown index of the company, services, products, FAQ and data sources ([llmstxt.org](https://llmstxt.org) standard) |
| `/llms-full.txt`, `/az/llms-full.txt`, `/ru/llms-full.txt` | The entire site as one Markdown document per language |
| `/md/{locale}/{path}` | Markdown version of every page (e.g. `/md/en/services/soc`), linked from each page with `rel="alternate" type="text/markdown"` |
| `/api/public/{resource}?locale=en` | Read-only JSON: company, services, products, partners, clients, certificates, research, news, faq. CORS open. Spec: `/api/public/openapi.json` |
| FAQ | 12 grounded Q&As in 3 languages (admin → FAQ), visible on the site and marked up as `FAQPage` |

All of this is generated live from the database, so edits in the admin panel flow through automatically.

## At launch (your team)
1. Set `SITE_URL=https://cyberpoint.az` in `.env` (all absolute URLs, sitemap and schema use it).
2. **Google Search Console**: verify the domain, submit `https://cyberpoint.az/sitemap.xml`, check "Enhancements" for FAQ and breadcrumbs.
3. **Bing Webmaster Tools**: import from Search Console and submit the sitemap. Bing also feeds ChatGPT search and Copilot.
4. **Yandex Webmaster** (relevant for Russian-language searches in the region): add the site and sitemap.
5. Old site URLs already redirect permanently (`/whoweare` → `/az/about`, `/list` → `/az/news`, `/employees` → `/az/about`, `/brandings` → `/az`), so existing links and rankings carry over.
6. Validate a few pages in Google's Rich Results Test and schema.org validator.
7. Keep publishing news and adding FAQ entries; fresh, specific content is what both search engines and AI assistants reward.
