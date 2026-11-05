# Cyberpoint website + admin panel

Next.js 15 · React 19 · TypeScript · SQLite (built into Node 22) · AZ / EN / RU · light & dark mode

## What's inside
**Public site** (`/az`, `/en`, `/ru`)
Home · About · Services (+9 detail pages) · Products (+12) · Partners · Clients · Certifications · Research (R&D/CVEs) · News (+articles) · Careers (CV upload) · Contact · Privacy · Search · 404

**Motion & UX** (patterns from jis.az / primecotton.az / tezode.az)
- Page switches with the View Transitions API; header stays in place
- Lenis smooth scrolling (desktop), Framer Motion scroll reveals, word-by-word headline reveal, count-up stats
- Text-roll hover on navigation, full-screen menu with search, header collapses to floating pills on scroll
- Swiper carousels, logo marquee, filterable partner/client grids
- Light/dark mode toggle with circular reveal; respects `prefers-reduced-motion`

**Admin panel** (`/admin`)
- News, services, products, partners, clients, certificates: add / edit / delete / publish, AZ-EN-RU tabs, image upload
- Inbox for contact and career requests (CV download), contact details & social links, users and password change

**AI assistant** (bottom-right on every page)
- Chat in AZ / EN / RU powered by Claude (`claude-opus-5-5`, low effort for fast replies; refusal fallbacks enabled), answering only from the site's own content (services, products, partners, clients, certificates, research, news, contacts — rebuilt from the database on each request, so admin edits are picked up immediately)
- Opens the right page while answering (uses the page transitions), switches light/dark mode and language, and can take a consultation request in chat (saved to the inbox and emailed like the contact form, only after the visitor confirms)
- Voice mode: browser speech recognition + read-aloud with a hands-free loop (Chrome, Edge, Safari; Firefox gets text only). Azerbaijani read-aloud uses a Turkish voice when the device has no Azerbaijani one
- Conversations are listed in the admin under “AI söhbətlər”
- Without `ANTHROPIC_API_KEY` it runs in **basic mode**: keyword navigation and prepared answers from site content, so it never breaks

**SEO & AI access** (details: `docs/03-seo-and-ai-access.md`)
- Full metadata, hreflang, schema.org JSON-LD on every page type, sitemap with images, RSS, FAQ with `FAQPage` markup
- AI crawlers welcomed in `robots.txt`; `/llms.txt`, `/llms-full.txt`, Markdown version of every page (`/md/{locale}/{path}`), public JSON API (`/api/public`, OpenAPI spec)
- Lighthouse: SEO 100 · Best Practices 100 · Accessibility 100

**Forms** go to `info@cyberpoint.az` over SMTP and are always stored in the admin inbox (rate-limited, honeypot anti-spam, CV type checks).

## Run locally
```bash
npm install
npm run dev            # http://localhost:3000  → /az
```
On first start the database is created in `./data` and filled with the migrated content.
If `ADMIN_PASSWORD` is not set, a random admin password is written to `data/initial-admin.txt`.

## Test link (Render, free)
New → Blueprint on render.com, pick this repo; `render.yaml` does the rest. Steps and limits: `docs/04-test-deploy-render.md`.

## Deploy on a VPS (Docker)
```bash
cp .env.example .env   # fill in SITE_URL, ADMIN_*, SESSION_SECRET, SMTP_*
docker compose up -d --build
```
- App listens on `127.0.0.1:3000`; put Nginx or Caddy in front for HTTPS.
- All data (database, uploaded images, CVs) lives in the `cyberpoint-data` volume — back it up.
- Without Docker: Node ≥ 22.13, `npm ci && npm run build && npm start`, set `DATA_DIR` to a persistent folder.

## Environment
| Variable | Purpose |
|---|---|
| `SITE_URL` | Canonical URL for sitemap / Open Graph |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account (used once, when the DB is created) |
| `SESSION_SECRET` | 32+ chars, signs admin sessions (auto-generated into `data/` if empty) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Mail server for form emails |
| `MAIL_FROM`, `MAIL_TO` | Sender and recipient (default `info@cyberpoint.az`) |
| `ANTHROPIC_API_KEY` | Enables full AI answers in the assistant (basic mode without it) |
| `ASSISTANT_MODEL` | Optional model override (default `claude-opus-5-5`) |
| `DATA_DIR` | Data folder (default `./data`, Docker `/app/data`) |
| `NOINDEX` | `1` on test/staging copies: robots.txt blocks all crawlers, pages get `noindex` |

## Structure
```
src/app/[locale]/        public pages          src/app/admin/        admin panel + server actions
src/app/api/forms        form endpoint (api/assistant: AI chat)         src/app/uploads       serves uploaded images
src/components/layout    header, menu, footer   src/components/motion transitions, smooth scroll, reveals
src/components/sections  home sections          src/components/ui     cards, grids, carousel, rich text
src/lib/                 db, seed, content, auth, mail, assistant/ (knowledge, tools, basic mode)
src/i18n/dictionaries    UI text (az.ts is the reference)
public/brand             logo SVGs (vectorised from the official artwork), og.png
public/logos, public/news  migrated partner/client/certificate logos and news images
docs/                    plans and source material from the old site
```

## Content notes
- EN/RU text is a draft translation for review; news article bodies are AZ-only until translated in the admin (the site shows a notice).
- Logo names were identified from the artwork; partner technology tags and client sectors are editable in the admin.
- The privacy policy is a draft — have it reviewed before launch.
