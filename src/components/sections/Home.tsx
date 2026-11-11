/* eslint-disable @next/next/no-img-element */
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import type { Certificate, Client, Cve, Faq, NewsItem, Partner, Product, Service } from "@/lib/content";
import FaqList from "../ui/FaqList";
import { Link } from "../motion/ViewTransitions";
import { Reveal, RevealWords } from "../motion/Reveal";
import Icon from "../Icon";
import Carousel from "../ui/Carousel";
import { NewsCard, ProductCard, ServiceCard, ui } from "../ui/Cards";
import LogoTile, { ThemedLogo } from "../ui/LogoTile";
import SectionHead from "../ui/SectionHead";
import s from "./home.module.css";

type L = { locale: Locale; t: Dictionary };

/** Global events where Cyberpoint provided cybersecurity services (texts: Saytın mətnləri → Ana səhifə). */
export function GlobalEvents({ t }: { t: Dictionary }) {
  const e = t.home.events;
  if (!e.items.length) return null;
  return (
    <section className={s.events} aria-labelledby="events-title">
      <div className="container">
        <div className={s.eventsHead}>
          <div>
            <p className="eyebrow">{e.eyebrow}</p>
            <h2 id="events-title" className="h2">
              <RevealWords text={e.title} />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className={s.eventsLede}>{e.lede}</p>
          </Reveal>
        </div>
        <ul className={s.eventGrid}>
          {e.items.map((ev, i) => (
            <Reveal as="li" key={`${ev.name}-${i}`} delay={i * 0.08} className={s.eventCard}>
              <span className={s.eventRole}>
                <Icon name="shield" />
                {e.role}
              </span>
              <strong className={s.eventName}>{ev.name}</strong>
              <span className={s.eventFull}>{ev.full}</span>
              <span className={s.eventPlace}>
                <Icon name="pin" />
                {ev.place}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function TrustMarquee({ t, partners }: { t: Dictionary; partners: Partner[] }) {
  return (
    <section className={s.trust} aria-label={t.home.trustLabel}>
      <div className={`container ${s.trustRow}`}>
        <p className={s.trustLabel}>{t.home.trustLabel}</p>
        <div className={s.marquee}>
          {[0, 1].map((copy) => (
            <ul key={copy} className={s.track} aria-hidden={copy === 1 ? true : undefined}>
              {partners.map((p) => (
                <li key={p.id} className={s.trustLogo}>
                  <ThemedLogo name={copy === 0 ? p.name : ""} light={p.logo} dark={p.logoDark} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About({ locale, t }: L) {
  const a = t.home.about;
  return (
    <section className="section" aria-labelledby="about-title">
      <div className={`container ${s.about}`}>
        <div className={s.aboutCopy}>
          <Reveal y={12}>
            <p className="eyebrow">{a.eyebrow}</p>
          </Reveal>
          <h2 id="about-title" className="h2">
            <RevealWords text={a.title} />
          </h2>
          <Reveal delay={0.1}>
            <p className="lede">{a.lede}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href={`/${locale}/about`} className="btn btn-dark">
              {a.cta}
              <span className="btn-icon">
                <Icon name="arrow" />
              </span>
            </Link>
          </Reveal>
        </div>
        <ul className={s.advantages}>
          {a.advantages.map((adv, i) => (
            <Reveal as="li" key={adv.title} delay={0.08 * i} className={s.advantage}>
              <span className={s.advIcon}>
                <Icon name={adv.icon} />
              </span>
              <h3 className="h3">{adv.title}</h3>
              <p>{adv.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Services({ locale, t, services }: L & { services: Service[] }) {
  const h = t.home.services;
  return (
    <section className="section bg-2" aria-labelledby="services-title">
      <div className="container">
        <SectionHead id="services-title" eyebrow={h.eyebrow} title={h.title} lede={h.lede} action={{ href: `/${locale}/services`, label: t.common.allServices }} />
        <ul className={ui.grid3}>
          {services.map((sv, i) => (
            <Reveal as="li" key={sv.slug} delay={(i % 3) * 0.08}>
              <ServiceCard service={sv} locale={locale} phaseLabel={t.common.phases[sv.phase].label} more={t.common.learnMore} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Products({ locale, t, products }: L & { products: Product[] }) {
  const h = t.home.products;
  return (
    <section className={s.productsWrap} aria-labelledby="products-title">
      <div className={s.productsPanel}>
        <div className="container">
          <SectionHead light id="products-title" eyebrow={h.eyebrow} title={h.title} lede={h.lede} />
          <Carousel label={h.title} perView={4} dark prevLabel={t.pages.news.prev} nextLabel={t.pages.news.next}>
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} locale={locale} groupLabel={t.common.groups[p.group]} />
            ))}
          </Carousel>
          <div className={s.productsFoot}>
            <Link href={`/${locale}/products`} className="btn btn-light">
              {t.common.allProducts}
              <span className="btn-icon">
                <Icon name="arrow" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Approach({ locale, t, cves }: L & { cves: Cve[] }) {
  const a = t.home.approach;
  const icons = ["shield", "eye", "graduation"];
  return (
    <section className="section" aria-labelledby="approach-title">
      <div className={`container ${s.approach}`}>
        <div>
          <Reveal y={12}>
            <p className="eyebrow">{a.eyebrow}</p>
          </Reveal>
          <h2 id="approach-title" className={s.approachTitle}>
            Think <span className={s.red}>red</span>,<br />
            act <span className={s.blue}>blue</span>
          </h2>
          <Reveal delay={0.1}>
            <p className="lede">{a.lede}</p>
          </Reveal>
          <ol className={s.steps}>
            {a.steps.map((st, i) => (
              <Reveal as="li" key={st.title} delay={0.1 * i} className={s.step}>
                <span className={s.stepNum}>0{i + 1}</span>
                <div>
                  <h3 className="h3">
                    <Icon name={st.icon || icons[i % icons.length]} className={s.stepIcon} /> {st.title}
                  </h3>
                  <p>{st.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal delay={0.15} className={s.rnd}>
          <p className={s.rndLabel}>{a.rndLabel}</p>
          <p className={s.rndValue}>{a.rndValue}</p>
          <p className={s.rndText}>{a.rndText}</p>
          <ul className={s.cves}>
            {cves.map((c) => (
              <li key={c.id}>
                <a href={`https://www.cve.org/CVERecord?id=${c.id}`} target="_blank" rel="noreferrer">
                  {c.id}
                </a>
                <span>
                  {c.product} · {c.driver}
                </span>
              </li>
            ))}
          </ul>
          <Link href={`/${locale}/research`} className="btn btn-light btn-sm">
            {a.rndCta}
            <span className="btn-icon">
              <Icon name="arrow" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function PartnersSection({ locale, t, partners }: L & { partners: Partner[] }) {
  const h = t.home.partners;
  return (
    <section className="section bg-2" aria-labelledby="partners-title">
      <div className="container">
        <SectionHead id="partners-title" eyebrow={h.eyebrow} title={h.title} lede={h.lede} action={{ href: `/${locale}/partners`, label: t.common.viewAll }} />
        <ul className={ui.logoGrid}>
          {partners.slice(0, 12).map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 6) * 0.05}>
              <LogoTile name={p.name} light={p.logo} dark={p.logoDark} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ClientsSection({ locale, t, clients }: L & { clients: Client[] }) {
  const h = t.home.clients;
  return (
    <section className="section" aria-labelledby="clients-title">
      <div className="container">
        <SectionHead id="clients-title" eyebrow={h.eyebrow} title={h.title} lede={h.lede} action={{ href: `/${locale}/clients`, label: t.common.viewAll }} />
        <ul className={ui.logoGrid}>
          {clients.map((c, i) => (
            <Reveal as="li" key={c.id} delay={(i % 6) * 0.05}>
              <LogoTile name={c.name} light={c.logo} dark={c.logoDark} caption={t.common.sectors[c.sector as keyof Dictionary["common"]["sectors"]] ?? ""} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CertificatesSection({ locale, t, certificates }: L & { certificates: Certificate[] }) {
  const h = t.home.certificates;
  const company = certificates.filter((c) => c.kind === "company");
  const team = certificates.filter((c) => c.kind === "team");
  return (
    <section className="section bg-2" aria-labelledby="certs-title">
      <div className="container">
        <SectionHead id="certs-title" eyebrow={h.eyebrow} title={h.title} lede={h.lede} action={{ href: `/${locale}/certificates`, label: t.common.viewAll }} />
        <div className={s.certs}>
          <ul className={s.certCompany}>
            {company.map((c) => (
              <Reveal as="li" key={c.id} className={s.isoCard}>
                <span className={s.isoMedia}>
                  <ThemedLogo name={c.name} light={c.logo} dark={c.logoDark} />
                </span>
                <span>
                  <strong>{c.name}</strong>
                  <span>{c.issuer}</span>
                </span>
              </Reveal>
            ))}
          </ul>
          <ul className={s.certTeam}>
            {team.slice(0, 15).map((c, i) => (
              <Reveal as="li" key={c.id} delay={(i % 5) * 0.04} className={s.badge}>
                <ThemedLogo name={c.name} light={c.logo} dark={c.logoDark} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function LatestNews({ locale, t, news }: L & { news: NewsItem[] }) {
  return (
    <section className="section" aria-labelledby="news-title">
      <div className="container">
        <SectionHead id="news-title" eyebrow={t.home.news.eyebrow} title={t.home.news.title} />
        <Carousel label={t.home.news.title} perView={3} prevLabel={t.pages.news.prev} nextLabel={t.pages.news.next}>
          {news.map((n) => (
            <NewsCard key={n.slug} item={n} locale={locale} />
          ))}
        </Carousel>
        <div className={s.newsFoot}>
          <Link href={`/${locale}/news`} className="arrow-link">
            {t.common.allNews} <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ locale, t, faqs }: L & { faqs: Faq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="section bg-2" aria-labelledby="faq-title">
      <div className={`container ${s.faq}`}>
        <SectionHead id="faq-title" eyebrow={t.home.faq.eyebrow} title={t.home.faq.title} action={{ href: `/${locale}/faq`, label: t.pages.faq.more }} />
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}
