import JsonLd from "@/components/seo/JsonLd";
import { webPage } from "@/lib/schema";
/* eslint-disable @next/next/no-img-element */
import { getCertificates } from "@/lib/content";
import { meta, resolve, type LocaleParams } from "@/lib/page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import PageHero from "@/components/ui/PageHero";
import SectionHead from "@/components/ui/SectionHead";
import LogoTile, { ThemedLogo } from "@/components/ui/LogoTile";
import { Reveal } from "@/components/motion/Reveal";
import s from "../pages.module.css";

export async function generateMetadata({ params }: LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return meta(locale, "/certificates", t.pages.certificates.title, t.pages.certificates.lede);
}

export default async function CertificatesPage({ params }: LocaleParams) {
  const { locale, t } = await resolve(params);
  const certs = getCertificates();
  const company = certs.filter((c) => c.kind === "company");
  const team = certs.filter((c) => c.kind === "team");
  return (
    <>
      <JsonLd data={[webPage("WebPage", locale, `/${locale}/certificates`, t.pages.certificates.title, t.pages.certificates.lede), { "@context": "https://schema.org", "@type": "ItemList", name: t.pages.certificates.title, itemListElement: certs.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "EducationalOccupationalCredential", name: c.name, ...(c.issuer ? { recognizedBy: { "@type": "Organization", name: c.issuer } } : {}) } })) }]} />
      <PageHero
        eyebrow={t.pages.certificates.eyebrow}
        title={t.pages.certificates.title}
        lede={t.pages.certificates.lede}
        crumbs={[{ label: t.nav.home, href: `/${locale}` }, { label: t.nav.certificates }]}
      />
      <section className="container">
        <SectionHead title={t.pages.certificates.company} />
        <ul className={s.isoGrid}>
          {company.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 0.08} className={s.isoCard}>
              <ThemedLogo name={c.name} light={c.logo} dark={c.logoDark} />
              <div>
                <strong>{c.name}</strong>
                <span>{c.issuer}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>
      <section className="section">
        <div className="container">
          <SectionHead title={t.pages.certificates.team} />
          <ul className={s.badgeGrid}>
            {team.map((c, i) => (
              <Reveal as="li" key={c.id} delay={(i % 6) * 0.04}>
                <LogoTile name={c.name} light={c.logo} dark={c.logoDark} caption="" variant="square" />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
