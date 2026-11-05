import JsonLd from "@/components/seo/JsonLd";
import { itemList, webPage } from "@/lib/schema";
/* eslint-disable @next/next/no-img-element */
import { countNews, getNews } from "@/lib/content";
import { meta, resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import { NewsCard, formatDate, ui } from "@/components/ui/Cards";
import { Link } from "@/components/motion/ViewTransitions";
import { Reveal, RevealMedia } from "@/components/motion/Reveal";
import Icon from "@/components/Icon";
import s from "../pages.module.css";

const PER_PAGE = 9;
type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/news", t.pages.news.title, t.pages.news.lede);
}

export default async function NewsPage({ params, searchParams }: P) {
  const { locale, t } = await resolve(params);
  const total = countNews();
  const pages = Math.max(1, Math.ceil((total - 1) / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number((await searchParams).page) || 1));
  const [featured] = getNews(locale, 1);
  const list = getNews(locale, PER_PAGE, 1 + (page - 1) * PER_PAGE);

  return (
    <>
      <JsonLd data={[webPage("CollectionPage", locale, `/${locale}/news`, t.pages.news.title, t.pages.news.lede), itemList(t.pages.news.title, [featured, ...list].filter(Boolean).map((n) => ({ name: n!.title, url: `/${locale}/news/${n!.slug}` })))]} />
      <PageHero eyebrow={t.pages.news.eyebrow} title={t.pages.news.title} lede={t.pages.news.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.news }]} />
      <section className="container">
        {featured && page === 1 && (
          <Link href={`/${locale}/news/${featured.slug}`} className={s.featured}>
            <RevealMedia className={s.featuredMedia}>
              {featured.image && <img src={featured.image} alt="" />}
            </RevealMedia>
            <Reveal delay={0.15} className={s.featuredText}>
              <time className="muted" dateTime={featured.date}>
                {formatDate(featured.date, locale)}
              </time>
              <h2 className="h2">{featured.title}</h2>
              <span className="arrow-link">
                {t.common.readMore} <Icon name="arrow" />
              </span>
            </Reveal>
          </Link>
        )}
        <ul className={ui.grid3} style={{ rowGap: 48 }}>
          {list.map((n, i) => (
            <Reveal as="li" key={n.slug} delay={(i % 3) * 0.08}>
              <NewsCard item={n} locale={locale} />
            </Reveal>
          ))}
        </ul>
        {pages > 1 && (
          <nav className={s.pager} aria-label="Pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`/${locale}/news${n > 1 ? `?page=${n}` : ""}`} className={`chip ${n === page ? "is-active" : ""}`} aria-current={n === page ? "page" : undefined}>
                {n}
              </Link>
            ))}
          </nav>
        )}
        <div className="section-tight" />
      </section>
    </>
  );
}
