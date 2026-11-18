import JsonLd from "@/components/seo/JsonLd";
import { softwareLd, webPage } from "@/lib/schema";
import { getCves, getOwnProducts, getRndNews } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import SectionHead from "@/components/ui/SectionHead";
import { NewsCard, ui } from "@/components/ui/Cards";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/components/motion/ViewTransitions";
import Icon from "@/components/Icon";
import OwnProducts from "@/components/ui/OwnProducts";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/research", t.pages.research.title, t.pages.research.lede);
}


export default async function ResearchPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const r = t.pages.research;
  const news = getRndNews(locale); // news marked for R&D in the admin
  const cves = getCves(locale);
  const own = getOwnProducts(locale);
  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/research`, r.title, r.lede), { "@context": "https://schema.org", "@type": "ItemList", name: r.cvesTitle, itemListElement: cves.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: `${c.id}: ${c.product} (${c.driver})`, description: c.impact, url: `https://www.cve.org/CVERecord?id=${c.id}`, creator: { "@id": `${process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://cyberpoint.az"}/#organization` } } })) }, ...softwareLd(own)]} />
      <PageHero eyebrow={r.eyebrow} title={r.title} lede={r.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.research }]} />
      {own.length > 0 && (
        <section className="container" aria-labelledby="rnd-products-title">
          <SectionHead id="rnd-products-title" eyebrow={t.pages.products.own.badge} title={r.own.title} lede={r.own.lede} />
          <OwnProducts products={own} t={t.pages.products.own} />
          <div className="section-tight" />
        </section>
      )}
      <section className="container">
        <SectionHead title={r.cvesTitle} />
        <Reveal className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">{r.cols.id}</th>
                <th scope="col">{r.cols.product}</th>
                <th scope="col">{r.cols.driver}</th>
                <th scope="col">{r.cols.impact}</th>
              </tr>
            </thead>
            <tbody>
              {cves.map((c) => (
                <tr key={c.id}>
                  <td>
                    <a href={`https://www.cve.org/CVERecord?id=${c.id}`} target="_blank" rel="noreferrer">
                      {c.id}
                    </a>
                  </td>
                  <td>{c.product}</td>
                  <td className={s.mono}>{c.driver}</td>
                  <td>{c.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>
      <section className="section" aria-labelledby="academy-title">
        <div className="container">
          <Reveal className={s.academy}>
            <div className={s.academyLogo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/academy-logo.svg" alt="Cyberpoint Academy" className="logo-light" width={3616} height={840} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/academy-logo-reversed.svg" alt="" aria-hidden="true" className="logo-dark" width={3616} height={840} />
            </div>
            <div className={s.academyText}>
              <span className={s.soon}>
                <i aria-hidden="true" />
                {r.academy.badge}
              </span>
              <h2 id="academy-title" className="h2">
                {r.academy.title}
              </h2>
              <p className={s.academyLede}>{r.academy.lede}</p>
              <p>{r.academy.text}</p>
              <Link href={`/${locale}/contact?topic=academy`} className="btn btn-primary">
                {r.academy.button}
                <span className="btn-icon">
                  <Icon name="arrow" />
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={r.newsTitle} />
            <ul className={news.length >= 3 ? ui.grid3 : ui.grid2}>
              {news.map((n) => (
                <li key={n.slug}>
                  <NewsCard item={n} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
