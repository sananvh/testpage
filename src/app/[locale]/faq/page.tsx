import { getFaqs } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { faqLd, webPage } from "@/lib/schema";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import FaqList from "@/components/ui/FaqList";
import JsonLd from "@/components/seo/JsonLd";
import { CtaPanel } from "@/components/ui/Cards";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/faq", t.pages.faq.title, t.pages.faq.lede);
}

export default async function FaqPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const faqs = getFaqs(locale);
  const f = t.pages.faq;
  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/faq`, f.title, f.lede), faqLd(faqs, locale, `/${locale}/faq`)]} />
      <PageHero eyebrow={f.eyebrow} title={f.title} lede={f.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: f.title }]} />
      <section className="container" style={{ maxWidth: 1040 }}>
        <FaqList faqs={faqs} openFirst />
        <div className="section-tight">
          <CtaPanel title={f.ask} text={f.askText} href={`/${locale}/contact`} button={t.nav.contact} />
        </div>
      </section>
    </>
  );
}
