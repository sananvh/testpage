import { Link } from "../motion/ViewTransitions";
import { Reveal, RevealWords } from "../motion/Reveal";
import { breadcrumbs } from "@/lib/schema";
import JsonLd from "../seo/JsonLd";
import s from "./ui.module.css";

type Crumb = { label: string; href?: string };

export default function PageHero({
  eyebrow, title, lede, crumbs, children, aside,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className={s.pageHero}>
      {crumbs && <JsonLd data={breadcrumbs(crumbs)} />}
      <div className="container">
        {crumbs && (
          <nav aria-label="Breadcrumb">
            <ol className={s.crumbs}>
              {crumbs.map((c, i) => (
                <li key={i}>{c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</li>
              ))}
            </ol>
          </nav>
        )}
        <div className={`${s.pageHeroGrid} ${aside ? s.withAside : ""}`}>
          <div className={s.pageHeroText}>
            {eyebrow && (
              <Reveal y={12}>
                <p className="eyebrow">{eyebrow}</p>
              </Reveal>
            )}
            <h1 className="h1">
              <RevealWords text={title} />
            </h1>
            {lede && (
              <Reveal delay={0.15}>
                <p className="lede">{lede}</p>
              </Reveal>
            )}
            {children && <Reveal delay={0.25}>{children}</Reveal>}
          </div>
          {aside && <Reveal delay={0.2} className={s.pageHeroAside}>{aside}</Reveal>}
        </div>
      </div>
    </section>
  );
}
