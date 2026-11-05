import { Fragment } from "react";

/**
 * Renders admin-edited plain text safely (no HTML):
 * blank line = new paragraph, "- " = bullet, "## " = heading, URLs become links.
 */
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noreferrer">
        {p}
      </a>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

export default function RichText({ text, className = "prose" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const rows = block.split("\n").map((r) => r.trim()).filter(Boolean);
        const bullets = rows.filter((r) => /^[-•]\s+/.test(r));
        if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
        if (bullets.length && bullets.length === rows.length) {
          return (
            <ul key={i}>
              {rows.map((r, j) => (
                <li key={j}>{linkify(r.replace(/^[-•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (bullets.length) {
          const lead = rows.filter((r) => !/^[-•]\s+/.test(r));
          return (
            <Fragment key={i}>
              {lead.map((l, j) => (
                <p key={`p${j}`}>{linkify(l)}</p>
              ))}
              <ul>
                {bullets.map((r, j) => (
                  <li key={j}>{linkify(r.replace(/^[-•]\s+/, ""))}</li>
                ))}
              </ul>
            </Fragment>
          );
        }
        return <p key={i}>{linkify(rows.join(" "))}</p>;
      })}
    </div>
  );
}
