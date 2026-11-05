import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import { Link } from "../../motion/ViewTransitions";
import { CountUp, Reveal, RevealWords } from "../../motion/Reveal";
import Icon from "../../Icon";
import NetworkCanvas from "./NetworkCanvas";
import SocPanel from "./SocPanel";
import s from "./hero.module.css";

export default function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const h = t.home.hero;
  return (
    <section className={s.wrap} aria-labelledby="hero-title">
      <div className={s.frame}>
        <NetworkCanvas className={s.canvas} />
        <div className={s.grid}>
          <div className={s.copy}>
            <Reveal y={12}>
              <span className={s.eyebrow}>
                <span className="pulse" aria-hidden="true" />
                {h.eyebrow}
              </span>
            </Reveal>
            <h1 id="hero-title" className={s.title}>
              <RevealWords text={h.title} />
              <span className={s.accent}>
                <RevealWords text={h.accent} delay={0.35} />
                <i aria-hidden="true">.</i>
              </span>
            </h1>
            <Reveal delay={0.45}>
              <p className={s.lede}>{h.lede}</p>
            </Reveal>
            <Reveal delay={0.6} className={s.ctas}>
              <Link href={`/${locale}/contact`} className="btn btn-light">
                {h.primary}
                <span className="btn-icon">
                  <Icon name="arrow" />
                </span>
              </Link>
              <Link href={`/${locale}/services`} className="btn btn-outline-light">
                {h.secondary}
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.4} y={48} className={s.panelWrap}>
            <SocPanel t={t.soc} />
          </Reveal>
        </div>
        <dl className={s.stats}>
          {t.home.stats.map((st, i) => (
            <Reveal key={st.label} delay={0.7 + i * 0.08} className={s.stat}>
              <dt>{st.label}</dt>
              <dd>
                <CountUp value={st.value} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
