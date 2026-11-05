import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import SectionHead from "@/components/ui/SectionHead";
import Icon from "@/components/Icon";
import LeadForm from "@/components/forms/LeadForm";
import { Reveal } from "@/components/motion/Reveal";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/careers", t.pages.careers.title, t.pages.careers.lede);
}

export default async function CareersPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const c = t.pages.careers;
  return (
    <>
      <JsonLd data={webPage("WebPage", locale, `/${locale}/careers`, c.title, c.lede)} />
      <PageHero eyebrow={c.eyebrow} title={c.title} lede={c.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.careers }]} />
      <section className="container">
        <SectionHead title={c.whyTitle} />
        <ul className={s.featureGrid}>
          {c.why.map((w, i) => (
            <Reveal as="li" key={w.title} delay={i * 0.08}>
              <div className={s.featureCard}>
                <span className={s.heroIcon} style={{ width: 52, height: 52, borderRadius: 16, marginBottom: 12 }}>
                  <Icon name={w.icon} />
                </span>
                <h3 className="h3">{w.title}</h3>
                <p>{w.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="section" id="apply">
        <div className={`container ${s.split}`}>
          <div>
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 className="h2" style={{ marginTop: 18 }}>
              {c.formTitle}
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>
              {c.formText}
            </p>
          </div>
          <Reveal>
            <LeadForm kind="career" t={t.form} locale={locale} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
