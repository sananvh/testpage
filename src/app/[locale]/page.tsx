import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCertificates, getClients, getCves, getFaqs, getNews, getPartners, getProducts, getServices } from "@/lib/content";
import { faqLd, webPage } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/components/sections/hero/Hero";
import {
  About, Approach, CertificatesSection, ClientsSection, FaqSection, GlobalEvents, LatestNews, PartnersSection, Products, Services, TrustMarquee,
} from "@/components/sections/Home";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const partners = getPartners();
  const faqs = getFaqs(locale, { home: true });

  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}`, t.meta.title, t.meta.description), ...(faqs.length ? [faqLd(faqs, locale, `/${locale}`)] : [])]} />
      <Hero locale={locale} t={t} />
      <GlobalEvents t={t} />
      <TrustMarquee t={t} partners={partners} />
      <About locale={locale} t={t} />
      <Services locale={locale} t={t} services={getServices(locale)} />
      <div className="section-tight" />
      <Products locale={locale} t={t} products={getProducts(locale)} />
      <Approach locale={locale} t={t} cves={getCves(locale)} />
      <PartnersSection locale={locale} t={t} partners={partners} />
      <ClientsSection locale={locale} t={t} clients={getClients()} />
      <CertificatesSection locale={locale} t={t} certificates={getCertificates()} />
      <LatestNews locale={locale} t={t} news={getNews(locale, 6)} />
      <FaqSection locale={locale} t={t} faqs={faqs} />
    </>
  );
}
