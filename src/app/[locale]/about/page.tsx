import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
import { getCves, getPartners } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import SectionHead from "@/components/ui/SectionHead";
import Icon from "@/components/Icon";
import { CountUp, Reveal } from "@/components/motion/Reveal";
import { Approach, TrustMarquee } from "@/components/sections/Home";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/about", t.pages.about.title, t.pages.about.lede);
}

export default async function AboutPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const a = t.pages.about;
  return (
    <>
      <JsonLd data={webPage("AboutPage", locale, `/${locale}/about`, a.title, a.lede)} />
      <PageHero eyebrow={a.eyebrow} title={a.title} lede={a.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.about }]} />
      <section className="container">
        <dl className={s.statsBand}>
          {t.home.stats.map((st) => (
            <div key={st.label}>
              <dd>
                <CountUp value={st.value} />
              </dd>
              <dt>{st.label}</dt>
            </div>
          ))}
        </dl>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead title={a.whoTitle} />
          <ul className={s.featureGrid}>
            {a.who.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 0.08}>
                <div className={s.featureCard}>
                  <span className={s.featureNum}>0{i + 1}</span>
                  <h3 className="h3">{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <section className="section bg-2">
        <div className={`container ${s.split}`}>
          <div>
            <p className="eyebrow">{a.audienceTitle}</p>
          </div>
          <Reveal>
            <p className="lede" style={{ fontSize: "clamp(20px, 2vw, 28px)", color: "var(--ink)", lineHeight: 1.45 }}>
              {a.audience}
            </p>
          </Reveal>
        </div>
      </section>
      <Approach locale={locale} t={t} cves={getCves(locale)} />
      <section className="section bg-2">
        <div className="container">
          <SectionHead title={a.mvvTitle} />
          <ul className={s.mvv}>
            {a.mvv.map((m, i) => (
              <Reveal as="li" key={m.key} delay={i * 0.08}>
                <div className={s.mvvCard}>
                  <Icon name={m.key} />
                  <h3 className="h3">{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <TrustMarquee t={t} partners={getPartners()} />
      <div className="section-tight" />
    </>
  );
}
