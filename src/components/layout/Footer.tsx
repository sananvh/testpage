import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import type { Settings } from "@/lib/content";
import { Link } from "../motion/ViewTransitions";
import { Reveal, RevealWords } from "../motion/Reveal";
import Icon from "../Icon";
import SocialIcon from "../ui/SocialIcon";
import Logo from "./Logo";
import { Roll } from "../ui/Roll";
import s from "./footer.module.css";

type Props = { locale: Locale; t: Dictionary; settings: Settings };

export default function Footer({ locale, t, settings }: Props) {
  const href = (p = "") => `/${locale}${p}`;
  const nav = t.nav;
  const col1 = [
    { label: nav.services, path: "/services" }, { label: nav.products, path: "/products" },
    { label: nav.partners, path: "/partners" }, { label: nav.clients, path: "/clients" }, { label: nav.news, path: "/news" },
  ];
  const col2 = [
    { label: nav.about, path: "/about" }, { label: nav.certificates, path: "/certificates" },
    { label: nav.research, path: "/research" }, { label: nav.faq, path: "/faq" }, { label: nav.careers, path: "/careers" }, { label: nav.contact, path: "/contact" },
  ];

  return (
    <footer className={s.footer}>
      <div className={`container ${s.inner}`}>
        <div className={s.cta}>
          <h2 className={s.ctaTitle}>
            <RevealWords text={t.home.cta.title} />
          </h2>
          <Reveal delay={0.2} className={s.ctaSide}>
            <p>{t.home.cta.text}</p>
            <Link href={href("/contact")} className="btn btn-light">
              {t.home.cta.button}
              <span className="btn-icon">
                <Icon name="arrow" />
              </span>
            </Link>
          </Reveal>
        </div>

        <div className={s.grid}>
          <div className={s.brand}>
            <Logo variant="reversed" height={48} />
            <p>{t.footer.tagline}</p>
            <ul className={s.socials} aria-label={t.footer.follow}>
              {settings.socials.map((so) => (
                <li key={so.name}>
                  <a href={so.href} target="_blank" rel="noreferrer" aria-label={so.name}>
                    <SocialIcon name={so.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={t.footer.navigation}>
            <h3 className={s.heading}>{t.footer.navigation}</h3>
            <ul className={s.links}>
              {col1.map((l) => (
                <li key={l.path}>
                  <Link href={href(l.path)}>
                    <Roll>{l.label}</Roll>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.footer.company}>
            <h3 className={s.heading}>{t.footer.company}</h3>
            <ul className={s.links}>
              {col2.map((l) => (
                <li key={l.path}>
                  <Link href={href(l.path)}>
                    <Roll>{l.label}</Roll>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={s.heading}>{t.footer.contact}</h3>
            <dl className={s.contact}>
              <div>
                <dt>{t.footer.phone}</dt>
                <dd>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </dd>
              </div>
              <div>
                <dt>{t.footer.email}</dt>
                <dd>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </dd>
              </div>
              <div>
                <dt>{t.footer.hours}</dt>
                <dd>{settings.hours}</dd>
              </div>
              <div>
                <dt>{t.footer.address}</dt>
                <dd>
                  {settings.mapUrl ? (
                    <a href={settings.mapUrl} target="_blank" rel="noreferrer">
                      {settings.address}
                    </a>
                  ) : (
                    settings.address
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className={s.bottom}>
          <span>
            © {new Date().getFullYear()} Cyberpoint. {t.footer.rights}
          </span>
          <Link href={href("/privacy")}>{nav.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
