import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
import { getServices, getSettings } from "@/lib/content";
import { meta, resolve } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import Icon from "@/components/Icon";
import LeadForm from "@/components/forms/LeadForm";
import { Reveal } from "@/components/motion/Reveal";
import s from "../pages.module.css";

type P = { params: Promise<{ locale: string }>; searchParams: Promise<{ topic?: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/contact", t.pages.contact.title, t.pages.contact.lede);
}

export default async function ContactPage({ params, searchParams }: P) {
  const { locale, t } = await resolve(params);
  const { topic = "" } = await searchParams;
  const st = getSettings(locale);
  const services = getServices(locale);
  const initial = topic === "academy" || services.some((x) => x.slug === topic) ? topic : "";

  return (
    <>
      <JsonLd data={webPage("ContactPage", locale, `/${locale}/contact`, t.pages.contact.title, t.pages.contact.lede)} />
      <PageHero eyebrow={t.pages.contact.eyebrow} title={t.pages.contact.title} lede={t.pages.contact.lede} crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.contact }]} />
      <section className="container">
        <div className={s.contactGrid}>
          <Reveal className={s.contactCards}>
            <div className={s.contactCard}>
              <Icon name="phone" />
              <div>
                <span>{t.footer.phone}</span>
                <a href={`tel:${st.phone.replace(/\s/g, "")}`}>{st.phone}</a>
              </div>
            </div>
            <div className={s.contactCard}>
              <Icon name="mail" />
              <div>
                <span>{t.footer.email}</span>
                <a href={`mailto:${st.email}`}>{st.email}</a>
              </div>
            </div>
            <div className={s.contactCard}>
              <Icon name="clock" />
              <div>
                <span>{t.footer.hours}</span>
                <strong>{st.hours}</strong>
              </div>
            </div>
            <div className={s.contactCard}>
              <Icon name="pin" />
              <div>
                <span>{t.footer.address}</span>
                <strong>{st.address}</strong>
                {st.mapUrl && (
                  <p style={{ marginTop: 10 }}>
                    <a className="arrow-link" href={st.mapUrl} target="_blank" rel="noreferrer" style={{ fontSize: 15 }}>
                      {t.pages.contact.map} <Icon name="arrow" />
                    </a>
                  </p>
                )}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <LeadForm
              kind="contact"
              t={t.form}
              locale={locale}
              title={t.pages.contact.formTitle}
              topics={[...services.map((x) => ({ value: x.slug, label: x.title })), { value: "academy", label: t.pages.research.academy.topic }]}
              initialTopic={initial}
            />
          </Reveal>
        </div>
        <div className="section-tight" />
      </section>
    </>
  );
}
