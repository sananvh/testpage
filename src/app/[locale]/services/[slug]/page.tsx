import JsonLd from "@/components/seo/JsonLd";
import { faqLd, serviceLd, webPage } from "@/lib/schema";
import { notFound } from "next/navigation";
import { getFaqs, getService, getServices } from "@/lib/content";
import FaqList from "@/components/ui/FaqList";
import { meta, resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import Icon from "@/components/Icon";
import PageHero from "@/components/ui/PageHero";
import RichText from "@/components/ui/RichText";
import SectionHead from "@/components/ui/SectionHead";
import { CtaPanel, ServiceCard, ui } from "@/components/ui/Cards";
import { Link } from "@/components/motion/ViewTransitions";
import { Reveal } from "@/components/motion/Reveal";
import s from "../../pages.module.css";

type P = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const sv = getService(slug, locale);
  return sv ? meta(locale, `/services/${slug}`, sv.title, `${sv.short}. ${sv.body.split(/(?<=[.!?])\s/)[0]}`) : {};
}

export default async function ServicePage({ params }: P) {
  const { slug } = await params;
  const { locale, t } = await resolve(params);
  const sv = getService(slug, locale);
  if (!sv) notFound();
  const others = getServices(locale).filter((x) => x.slug !== sv.slug);
  const faqs = getFaqs(locale, { service: sv.slug });
  const related = [...others.filter((x) => x.phase === sv.phase), ...others.filter((x) => x.phase !== sv.phase)].slice(0, 3);

  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/services/${sv.slug}`, sv.title, sv.short), serviceLd(sv, locale, t.common.phases[sv.phase].label), ...(faqs.length ? [faqLd(faqs, locale, `/${locale}/services/${sv.slug}`)] : [])]} />
      <PageHero
        eyebrow={`${t.pages.service.phase}: ${t.common.phases[sv.phase].label}`}
        title={sv.title}
        lede={sv.short}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.services, href: `/${locale}/services` }, { label: sv.title }]}
        aside={
          <span className={s.heroIcon}>
            <Icon name={sv.icon} />
          </span>
        }
      />
      <section className="container">
        <div className={s.detail}>
          <Reveal>
            <RichText text={sv.body} />
          </Reveal>
          {sv.features.length > 0 && (
            <Reveal delay={0.1} className={s.aside}>
              <h2>{t.pages.service.includes}</h2>
              <ul className={s.checks}>
                {sv.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link href={`/${locale}/contact?topic=${sv.slug}`} className="btn btn-primary">
                {t.nav.cta}
                <span className="btn-icon">
                  <Icon name="arrow" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="section-tight">
          <div className="container" style={{ maxWidth: 1040 }}>
            <SectionHead title={t.pages.service.faqTitle} action={{ href: `/${locale}/faq`, label: t.pages.faq.more }} />
            <FaqList faqs={faqs} />
          </div>
        </section>
      )}
      <section className="section">
        <div className="container">
          <SectionHead title={t.common.related} action={{ href: `/${locale}/services`, label: t.common.allServices }} />
          <ul className={ui.grid3}>
            {related.map((r, i) => (
              <Reveal as="li" key={r.slug} delay={i * 0.08}>
                <ServiceCard service={r} locale={locale} phaseLabel={t.common.phases[r.phase].label} more={t.common.learnMore} />
              </Reveal>
            ))}
          </ul>
          <div className="section-tight" style={{ paddingBottom: 0 }}>
            <CtaPanel title={t.pages.service.ctaTitle} text={t.pages.service.ctaText} href={`/${locale}/contact?topic=${sv.slug}`} button={t.nav.cta} />
          </div>
        </div>
      </section>
    </>
  );
}
