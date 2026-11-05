import JsonLd from "@/components/seo/JsonLd";
import { productLd, webPage } from "@/lib/schema";
import { notFound } from "next/navigation";
import { getPartners, getProduct, getProducts } from "@/lib/content";
import { meta, resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import PageHero from "@/components/ui/PageHero";
import RichText from "@/components/ui/RichText";
import SectionHead from "@/components/ui/SectionHead";
import LogoTile from "@/components/ui/LogoTile";
import { CtaPanel, ProductCard, ui } from "@/components/ui/Cards";
import { Reveal } from "@/components/motion/Reveal";
import s from "../../pages.module.css";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = getProduct(slug, locale);
  return p ? meta(locale, `/products/${slug}`, `${p.name} — ${p.full}`, `${p.desc}. ${p.body}`) : {};
}

export default async function ProductPage({ params }: P) {
  const { slug } = await params;
  const { locale, t } = await resolve(params);
  const p = getProduct(slug, locale);
  if (!p) notFound();
  const vendors = getPartners().filter((v) => v.tags.includes(p.slug));
  const others = getProducts(locale).filter((x) => x.slug !== p.slug);
  const related = [...others.filter((x) => x.group === p.group), ...others.filter((x) => x.group !== p.group)].slice(0, 3);

  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/products/${p.slug}`, `${p.name} — ${p.full}`, p.desc), productLd(p, locale, t.common.groups[p.group], vendors.map((v) => v.name))]} />
      <PageHero
        eyebrow={t.common.groups[p.group]}
        title={`${p.name} · ${p.full}`}
        lede={p.desc}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.products, href: `/${locale}/products` }, { label: p.name }]}
      />
      <section className="container">
        <div className={s.detail}>
          <Reveal>
            <RichText text={p.body} />
          </Reveal>
          <Reveal delay={0.1} className={s.aside}>
            <h2>{t.pages.product.ctaTitle}</h2>
            <p className="muted">{t.pages.product.ctaText}</p>
          </Reveal>
        </div>
      </section>
      {vendors.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <SectionHead title={t.pages.product.vendors} />
            <ul className={ui.logoGrid}>
              {vendors.map((v) => (
                <li key={v.id}>
                  <LogoTile name={v.name} light={v.logo} dark={v.logoDark} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="section">
        <div className="container">
          <SectionHead title={t.common.allProducts} action={{ href: `/${locale}/products`, label: t.common.viewAll }} />
          <ul className={ui.grid3}>
            {related.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 0.08}>
                <ProductCard product={r} locale={locale} groupLabel={t.common.groups[r.group]} />
              </Reveal>
            ))}
          </ul>
          <div className="section-tight" style={{ paddingBottom: 0 }}>
            <CtaPanel title={t.pages.product.ctaTitle} text={t.pages.product.ctaText} href={`/${locale}/contact`} button={t.nav.cta} />
          </div>
        </div>
      </section>
    </>
  );
}
