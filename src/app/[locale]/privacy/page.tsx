import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPrivacy } from "@/lib/site";
import PageHero from "@/components/ui/PageHero";
import RichText from "@/components/ui/RichText";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return meta(locale, "/privacy", getDictionary(locale).pages.privacy.title, getPrivacy(locale).split("\n")[0]);
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  return (
    <>
      <JsonLd data={webPage("WebPage", locale, `/${locale}/privacy`, t.pages.privacy.title)} />
      <PageHero eyebrow={t.pages.privacy.updated} title={t.pages.privacy.title} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.pages.privacy.title }]} />
      <section className="container">
        <RichText text={getPrivacy(locale)} />
        <div className="section-tight" />
      </section>
    </>
  );
}
