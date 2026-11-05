import JsonLd from "@/components/seo/JsonLd";
import { articleLd } from "@/lib/schema";
/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { getNews, getNewsItem } from "@/lib/content";
import { meta, resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import PageHero from "@/components/ui/PageHero";
import RichText from "@/components/ui/RichText";
import SectionHead from "@/components/ui/SectionHead";
import { NewsCard, formatDate, ui } from "@/components/ui/Cards";
import { Link } from "@/components/motion/ViewTransitions";
import { RevealMedia } from "@/components/motion/Reveal";
import s from "../../pages.module.css";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const n = getNewsItem(slug, locale);
  return n ? meta(locale, `/news/${slug}`, n.title, n.body.slice(0, 160), n.image || undefined, { type: "article", publishedTime: n.date }) : {};
}

export default async function ArticlePage({ params }: P) {
  const { slug } = await params;
  const { locale, t } = await resolve(params);
  const item = getNewsItem(slug, locale);
  if (!item) notFound();
  const all = getNews(locale);
  const idx = all.findIndex((n) => n.slug === slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx < all.length - 1 ? all[idx + 1] : null;
  const more = all.filter((n) => n.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd data={articleLd(item, locale)} />
      <PageHero
        eyebrow={formatDate(item.date, locale)}
        title={item.title}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.news, href: `/${locale}/news` }, { label: item.title.length > 48 ? item.title.slice(0, 48) + "…" : item.title }]}
      />
      <article className="container">
        <div className={s.article}>
          {item.image && (
            <RevealMedia className={s.articleMedia}>
              <img src={item.image} alt="" />
            </RevealMedia>
          )}
          {!item.translated && <p className={s.notice}>ⓘ {t.pages.news.notTranslated}</p>}
          <RichText text={item.body} />
          <nav className={s.prevNext} aria-label={t.pages.news.more}>
            {older ? (
              <Link href={`/${locale}/news/${older.slug}`}>
                <span>← {t.pages.news.prev}</span>
                <strong>{older.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link href={`/${locale}/news/${newer.slug}`}>
                <span>{t.pages.news.next} →</span>
                <strong>{newer.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </article>
      <section className="section">
        <div className="container">
          <SectionHead title={t.pages.news.more} action={{ href: `/${locale}/news`, label: t.common.allNews }} />
          <ul className={ui.grid3}>
            {more.map((n) => (
              <li key={n.slug}>
                <NewsCard item={n} locale={locale} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
