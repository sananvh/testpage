import JsonLd from "@/components/seo/JsonLd";
import { itemList, softwareLd, webPage } from "@/lib/schema";
import { getOwnProducts, getProducts, productGroups } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import { CtaPanel, ProductCard, ui } from "@/components/ui/Cards";
import { Reveal } from "@/components/motion/Reveal";
import OwnProducts from "@/components/ui/OwnProducts";
import SectionHead from "@/components/ui/SectionHead";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/products", t.pages.products.title, t.pages.products.lede);
}

export default async function ProductsPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const products = getProducts(locale);
  const own = getOwnProducts(locale);
  const o = t.pages.products.own;
  return (
    <>
      <JsonLd data={[webPage("CollectionPage", locale, `/${locale}/products`, t.pages.products.title, t.pages.products.lede), itemList(t.pages.products.title, products.map((x) => ({ name: `${x.name} — ${x.full}`, url: `/${locale}/products/${x.slug}` }))), ...softwareLd(own)]} />
      <PageHero
        eyebrow={t.pages.products.eyebrow}
        title={t.pages.products.title}
        lede={t.pages.products.lede}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.products }]}
      />
      {own.length > 0 && (
        <section className="container" aria-labelledby="own-products-title">
          <SectionHead id="own-products-title" eyebrow={o.eyebrow} title={o.title} lede={o.lede} />
          <OwnProducts products={own} t={o} />
          <div className="section-tight" />
        </section>
      )}
      <div className="container">
        {productGroups
          .filter((g) => products.some((p) => p.group === g))
          .map((g, i) => (
            <section key={g} className={s.phaseBlock} aria-labelledby={`grp-${g}`}>
              <div className={s.phaseSide}>
                <span className={s.phaseIndex}>0{i + 1}</span>
                <h2 id={`grp-${g}`} className="h3">
                  {t.common.groups[g]}
                </h2>
              </div>
              <ul className={ui.grid3}>
                {products
                  .filter((p) => p.group === g)
                  .map((p, j) => (
                    <Reveal as="li" key={p.slug} delay={j * 0.06}>
                      <ProductCard product={p} locale={locale} groupLabel={t.common.groups[g]} />
                    </Reveal>
                  ))}
              </ul>
            </section>
          ))}
        <div className="section-tight">
          <CtaPanel title={t.pages.product.ctaTitle} text={t.pages.product.ctaText} href={`/${locale}/contact`} button={t.nav.cta} />
        </div>
      </div>
    </>
  );
}
