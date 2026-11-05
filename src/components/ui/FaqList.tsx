import type { Faq } from "@/lib/content";
import { Reveal } from "../motion/Reveal";
import s from "./faq.module.css";

/** Accessible accordion built on <details>; answers stay in the HTML for search engines and AI crawlers. */
export default function FaqList({ faqs, openFirst = false }: { faqs: Faq[]; openFirst?: boolean }) {
  return (
    <ul className={s.list}>
      {faqs.map((f, i) => (
        <Reveal as="li" key={f.id} delay={Math.min(i, 6) * 0.04}>
          <details className={s.item} id={`faq-${f.id}`} open={openFirst && i === 0}>
            <summary className={s.q}>
              <span>{f.question}</span>
              <i aria-hidden="true" />
            </summary>
            <div className={s.a}>
              {f.answer.split(/\n\s*\n/).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </details>
        </Reveal>
      ))}
    </ul>
  );
}
