import JsonLd from "@/components/seo/JsonLd";
import { itemList, webPage } from "@/lib/schema";
import { getServices } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import { CtaPanel, ServiceCard, ui } from "@/components/ui/Cards";
import { Reveal } from "@/components/motion/Reveal";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/services", t.pages.services.title, t.pages.services.lede);
}

export default async function ServicesPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const services = getServices(locale);
  const phases = ["assess", "protect", "respond"] as const;
  return (
    <>
      <JsonLd data={[webPage("CollectionPage", locale, `/${locale}/services`, t.pages.services.title, t.pages.services.lede), itemList(t.pages.services.title, services.map((x) => ({ name: x.title, url: `/${locale}/services/${x.slug}` })))]} />
      <PageHero
        eyebrow={t.pages.services.eyebrow}
        title={t.pages.services.title}
        lede={t.pages.services.lede}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.services }]}
      />
      <div className="container">
        {phases.map((ph, i) => (
          <section key={ph} className={s.phaseBlock} aria-labelledby={`phase-${ph}`}>
            <div className={s.phaseSide}>
              <span className={s.phaseIndex}>0{i + 1}</span>
              <h2 id={`phase-${ph}`} className="h2">
                {t.common.phases[ph].label}
              </h2>
              <p>{t.common.phases[ph].text}</p>
            </div>
            <ul className={ui.grid2}>
              {services
                .filter((sv) => sv.phase === ph)
                .map((sv, j) => (
                  <Reveal as="li" key={sv.slug} delay={(j % 2) * 0.08}>
                    <ServiceCard service={sv} locale={locale} phaseLabel={t.common.phases[ph].label} more={t.common.learnMore} />
                  </Reveal>
                ))}
            </ul>
          </section>
        ))}
        <div className="section-tight">
          <CtaPanel title={t.pages.service.ctaTitle} text={t.pages.service.ctaText} href={`/${locale}/contact`} button={t.nav.cta} />
        </div>
      </div>
    </>
  );
}
