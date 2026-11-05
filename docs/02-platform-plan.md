# Cyberpoint — Platform Plan v2 (JIS-style redesign)

## 1. What the references do (studied: tezode.az, primecotton.az, jis.az)
| Pattern | Where | How it's built |
|---|---|---|
| Light, airy layout, lots of white space, big confident headlines | all three | Next.js, custom fonts |
| Page switches: content fades/slides out, new page fades in, header stays | tezode, primecotton | View Transitions API (`startViewTransition`) |
| Smooth, weighted scrolling | jis.az | Lenis |
| Scroll-linked reveals (text rises, images unmask with clip-path) | primecotton | Framer Motion (`useScroll`, `AnimatePresence`) |
| Inset, rounded full-bleed hero frame with page margin | primecotton | CSS |
| Nav hover: label rolls up and is replaced by a copy | primecotton | duplicated text + transform |
| "Menu" button opens full-screen overlay with search + all links | jis.az | client component |
| Pill chips / pill buttons with round arrow icon | jis, tezode | CSS |
| Big colored rounded panel with carousel + arrow controls | primecotton | Swiper |
| Large rounded media cards with title + one-line description | jis.az | CSS grid |

## 2. Design direction
- **Base:** white / cool light grey; **navy #0D1550** for text and feature blocks; **logo blue #0D6EF5** for actions; **purple #7B2AB8** only as a small accent (as in the logo dot).
- **Logo:** official artwork vectorised to SVG — primary (no slogan), with-slogan version (footer), reversed version for navy blocks, favicon from the "C" pill + dot.
- **Type:** geometric headings that echo the logo; clean body face with full AZ (ə) + RU coverage.
- **Shapes:** generous radius (rounded frames, pill buttons), thin hairlines, no heavy shadows.

## 3. Sitemap (AZ / EN / RU)
```
/                     Home
/about                Who we are · mission/vision/values · approach · numbers
/services             Overview (assess / protect / respond)
/services/[slug]      9 service pages
/products             Overview by domain
/products/[slug]      12 product-category pages (+ related vendors)
/partners             27 technology partners (separate page, filter by domain)
/clients              11 clients (separate page, by sector)
/certificates         Company ISO + team certifications
/research             R&D centre + published CVEs
/news                 News list (filter, pagination)
/news/[slug]          Article (13 migrated)
/careers              Why work with us + open-application form
/contact              Form + details + map link
/privacy, 404, search
```

## 4. Home sections
Hero (inset frame) → trust strip (vendors) → who we are + numbers → services (3 phases) → products panel (carousel) →
think red / act blue + R&D CVEs → **partners** (own section) → **clients** (own section) → certificates →
latest news (carousel) → consultation CTA → footer.

## 5. Functionality
- Contact / consultation / career forms → validated server route → email delivery + stored submissions
- Site search (services, products, news) in the menu overlay
- Language switch keeps the current page; SEO metadata, OG images, sitemap.xml, robots.txt, JSON-LD
- Accessibility (keyboard, reduced motion), image optimisation, static generation where possible
- Optional admin panel (see decisions)

## 6. Build order
1. Logo vectorisation + design tokens + motion system (transitions, smooth scroll, reveals)
2. Layout: header (text-roll nav, menu overlay + search), footer
3. Home page
4. Inner page templates: service, product, partner/client, news article
5. Remaining pages, forms, search, SEO
6. Admin panel (if chosen), QA on desktop/mobile in 3 languages
