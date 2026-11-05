import { Link } from "../motion/ViewTransitions";
import { Reveal, RevealWords } from "../motion/Reveal";
import Icon from "../Icon";
import s from "./ui.module.css";

export default function SectionHead({
  eyebrow, title, lede, action, id, light,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: { href: string; label: string };
  id?: string;
  light?: boolean;
}) {
  return (
    <div className={`${s.sectionHead} ${light ? s.onFeature : ""}`}>
      <div className={s.sectionHeadText}>
        {eyebrow && (
          <Reveal y={12}>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
        )}
        <h2 id={id} className="h2">
          <RevealWords text={title} />
        </h2>
        {lede && (
          <Reveal delay={0.12}>
            <p className="lede">{lede}</p>
          </Reveal>
        )}
      </div>
      {action && (
        <Reveal delay={0.2}>
          <Link href={action.href} className={`btn ${light ? "btn-outline-light" : "btn-outline"}`}>
            {action.label}
            <span className="btn-icon">
              <Icon name="arrow" />
            </span>
          </Link>
        </Reveal>
      )}
    </div>
  );
}
