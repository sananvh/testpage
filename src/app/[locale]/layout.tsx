import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCertificates, getServices, getSettings } from "@/lib/content";
import { organization, website } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import { meta } from "@/lib/page";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeSync, themeScript } from "@/components/layout/Theme";
import { ViewTransitions } from "@/components/motion/ViewTransitions";
import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionProvider from "@/components/motion/MotionProvider";
import Assistant from "@/components/assistant/Assistant";
import "../globals.css";

export const dynamic = "force-dynamic";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const SITE = process.env.SITE_URL ?? "https://cyberpoint.az";

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070b26" },
  ],
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const base = meta(locale, "", t.meta.title, t.meta.description);
  return {
    ...base,
    metadataBase: new URL(SITE),
    title: { default: t.meta.title, template: "%s · Cyberpoint" },
    applicationName: "Cyberpoint",
    authors: [{ name: "Cyberpoint", url: SITE }],
    creator: "Cyberpoint",
    publisher: "Cyberpoint",
    category: "Cybersecurity",
    keywords: ["kibertəhlükəsizlik", "cybersecurity Azerbaijan", "кибербезопасность Азербайджан", "SOC", "pentest", "penetration testing Baku", "SIEM", "digital forensics", "ISO 27001", "Cyberpoint"],
    formatDetection: { telephone: true, email: true, address: true },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    icons: { icon: "/icon.svg", apple: "/brand/apple-touch-icon.png" },
    manifest: "/manifest.webmanifest",
    other: { "ai-content-index": "/llms.txt" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale as Locale);
  const settings = getSettings(locale);
  const services = getServices(locale).map((sv) => ({ slug: sv.slug, title: sv.title }));
  const allServices = getServices(locale);
  const certs = getCertificates();

  return (
    <html lang={locale} className={`${manrope.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="alternate" type="application/rss+xml" title={`Cyberpoint — ${t.nav.news}`} href={`/${locale}/news/feed.xml`} />
        <link rel="alternate" type="text/plain" title="LLM index" href="/llms.txt" />
        <JsonLd
          data={[
            organization(settings, locale, {
              description: t.meta.description,
              services: allServices.map((x) => x.title),
              credentials: certs.filter((c) => c.kind === "company").map((c) => c.name),
            }),
            website(locale),
          ]}
        />
      </head>
      <body>
        <ViewTransitions>
          <MotionProvider>
          <ThemeSync />
          <SmoothScroll />
          <Header
            locale={locale}
            t={t.nav}
            services={services}
            contact={{ phone: settings.phone, email: settings.email, socials: settings.socials }}
          />
          <main id="main">{children}</main>
          <Footer locale={locale} t={t} settings={settings} />
          <Assistant locale={locale} t={t.assistant} />
          </MotionProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
