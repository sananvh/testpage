/* eslint-disable @next/next/no-img-element */
import type { OwnProduct } from "@/lib/content";
import type { Dictionary } from "@/i18n/dictionaries/az";
import { Reveal } from "../motion/Reveal";
import Icon from "../Icon";
import s from "./own.module.css";

/**
 * Cyberpoint's own products (R&D), managed in the admin under "Cyberpoint məhsulları".
 * Each card links out to the product's own website. One product = wide card; several = grid.
 */
export default function OwnProducts({ products, t }: { products: OwnProduct[]; t: Dictionary["pages"]["products"]["own"] }) {
  if (!products.length) return null;
  const single = products.length === 1;
  return (
    <ul className={`${s.grid} ${single ? s.single : ""}`}>
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={i * 0.08}>
          <article className={s.card}>
            <a className={s.logoPanel} href={p.url || undefined} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} — ${t.visit}`} tabIndex={-1}>
              <img src={p.logo} alt="" className="logo-light" />
              <img src={p.logoDark} alt="" className="logo-dark" />
              <span className={s.rings} aria-hidden="true" />
            </a>
            <div className={s.body}>
              <div className={s.badges}>
                <span className={s.badge}>
                  <Icon name="shield" />
                  {t.badge}
                </span>
                {p.isNew && <span className={`${s.badge} ${s.new}`}>{t.newBadge}</span>}
              </div>
              <h3 className={s.name}>{p.name}</h3>
              {p.tagline && <p className={s.tagline}>{p.tagline}</p>}
              {p.description && <p className={s.desc}>{p.description}</p>}
              {p.features.length > 0 && (
                <ul className={s.features}>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
              <div className={s.actions}>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    {t.visit}
                    <span className="btn-icon">
                      <Icon name="arrow" />
                    </span>
                  </a>
                )}
                {(p.appIos || p.appAndroid) && (
                  <span className={s.apps}>
                    {t.apps}
                    {p.appIos && (
                      <a href={p.appIos} target="_blank" rel="noopener noreferrer">
                        App Store
                      </a>
                    )}
                    {p.appAndroid && (
                      <a href={p.appAndroid} target="_blank" rel="noopener noreferrer">
                        Google Play
                      </a>
                    )}
                  </span>
                )}
              </div>
              <span className={s.host}>{p.url.replace(/^https:\/\//, "").replace(/\/$/, "")}</span>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
