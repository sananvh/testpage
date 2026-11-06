import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
import { getNews } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { cves } from "@/content/research";
import PageHero from "@/components/ui/PageHero";
import SectionHead from "@/components/ui/SectionHead";
import { NewsCard, ui } from "@/components/ui/Cards";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/components/motion/ViewTransitions";
import Icon from "@/components/Icon";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/research", t.pages.research.title, t.pages.research.lede);
}

const RND_SLUGS = ["3-new-cves", "rnd-center"];

export default async function ResearchPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const r = t.pages.research;
  const news = getNews(locale).filter((n) => RND_SLUGS.includes(n.slug));
  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/research`, r.title, r.lede), { "@context": "https://schema.org", "@type": "ItemList", name: r.cvesTitle, itemListElement: cves.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: `${c.id}: ${c.product} (${c.driver})`, description: r.impacts[i], url: `https://www.cve.org/CVERecord?id=${c.id}`, creator: { "@id": `${process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || "https://cyberpoint.az"}/#organization` } } })) }]} />
      <PageHero eyebrow={r.eyebrow} title={r.title} lede={r.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.research }]} />
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
              {cves.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <a href={`https://www.cve.org/CVERecord?id=${c.id}`} target="_blank" rel="noreferrer">
                      {c.id}
                    </a>
                  </td>
                  <td>{c.product}</td>
                  <td className={s.mono}>{c.driver}</td>
                  <td>{r.impacts[i]}</td>
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
            <ul className={ui.grid2}>
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
