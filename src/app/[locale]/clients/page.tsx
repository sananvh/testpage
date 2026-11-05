import JsonLd from "@/components/seo/JsonLd";
import { itemList, webPage } from "@/lib/schema";
import { clientSectors, getClients } from "@/lib/content";
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
  return meta(locale, "/clients", t.pages.clients.title, t.pages.clients.lede);
}

export default async function ClientsPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const sectors = t.common.sectors as Record<string, string>;
  const items = getClients().map((c) => ({
    id: c.id, name: c.name, light: c.logo, dark: c.logoDark, href: c.url || undefined,
    cats: [c.sector], caption: sectors[c.sector] ?? "",
  }));
  const filters = clientSectors.map((k) => ({ key: k, label: sectors[k] }));

  return (
    <>
      <JsonLd data={[webPage("CollectionPage", locale, `/${locale}/clients`, t.pages.clients.title, t.pages.clients.lede), itemList(t.pages.clients.title, items.map((x) => ({ name: x.name, url: `/${locale}/clients` })))]} />
      <PageHero
        eyebrow={t.pages.clients.eyebrow}
        title={t.pages.clients.title}
        lede={t.pages.clients.lede}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.clients }]}
      />
      <section className="container">
        <FilterGrid items={items} filters={filters} allLabel={t.common.all} />
        <div className="section">
          <CtaPanel title={t.home.cta.title} text={t.home.cta.text} href={`/${locale}/contact`} button={t.home.cta.button} />
        </div>
      </section>
    </>
  );
}
