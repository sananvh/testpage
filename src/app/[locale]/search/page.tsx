import { search } from "@/lib/content";
import { resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import Icon from "@/components/Icon";
import { Link } from "@/components/motion/ViewTransitions";
import s from "../pages.module.css";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDictionary(locale).pages.search.title, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: P) {
  const { locale, t } = await resolve(params);
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const hits = search(q, locale);
  const sp = t.pages.search;
  return (
    <>
      <PageHero title={q ? `“${q}”` : sp.title} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: sp.title }]}>
        <form action={`/${locale}/search`} className={s.searchForm} role="search">
          <label htmlFor="q" className="sr-only">
            {sp.title}
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder={t.nav.searchPlaceholder} autoFocus={!q} />
          <button type="submit" className="btn btn-primary">
            {t.nav.search}
          </button>
        </form>
      </PageHero>
      <section className="container">
        <p className="muted" style={{ marginBottom: 20 }}>
          {q.trim().length < 2 ? sp.hint : hits.length ? `${hits.length} ${sp.results}` : sp.empty}
        </p>
        {hits.length > 0 && (
          <ul className={s.results}>
            {hits.map((h, i) => (
              <li key={i}>
                <Link href={h.href}>
                  <span className={s.kind}>{sp.kinds[h.kind]}</span>
                  <span>
                    <strong>{h.title}</strong>
                    {h.text && <p>{h.text}</p>}
                  </span>
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="section-tight" />
      </section>
    </>
  );
}
