import JsonLd from "@/components/seo/JsonLd";
import { itemList, webPage } from "@/lib/schema";
import { getPartners, getProducts, productGroups } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import FilterGrid from "@/components/ui/FilterGrid";
import { CtaPanel } from "@/components/ui/Cards";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/partners", t.pages.partners.title, t.pages.partners.lede);
}

export default async function PartnersPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const products = getProducts(locale);
  const groupOf = (slug: string) => products.find((p) => p.slug === slug)?.group;
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug.toUpperCase();
  const items = getPartners().map((p) => {
    const groups = [...new Set(p.tags.map(groupOf).filter(Boolean))] as string[];
    return {
      id: p.id, name: p.name, light: p.logo, dark: p.logoDark, href: p.url || undefined,
      cats: groups.length ? groups : ["other"],
      caption: p.tags.map(nameOf).join(" · "),
    };
  });
  const filters = [...productGroups.map((g) => ({ key: g, label: t.common.groups[g] })), { key: "other", label: t.common.other }];

  return (
    <>
      <JsonLd data={[webPage("CollectionPage", locale, `/${locale}/partners`, t.pages.partners.title, t.pages.partners.lede), itemList(t.pages.partners.title, items.map((x) => ({ name: x.name, url: `/${locale}/partners` })))]} />
      <PageHero
        eyebrow={t.pages.partners.eyebrow}
        title={t.pages.partners.title}
        lede={t.pages.partners.lede}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.partners }]}
      />
      <section className="container">
        <FilterGrid items={items} filters={filters} allLabel={t.common.all} />
        <div className="section">
          <CtaPanel title={t.pages.product.ctaTitle} text={t.pages.product.ctaText} href={`/${locale}/contact`} button={t.nav.cta} />
        </div>
      </section>
    </>
  );
}
