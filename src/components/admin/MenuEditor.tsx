"use client";

import { useState } from "react";

type Page = { key: string; label: string; path: string };

/** Pick and order the pages shown in the site's top menu. */
export default function MenuEditor({ pages, selected, action }: { pages: Page[]; selected: string[]; action: (fd: FormData) => Promise<void> }) {
  const [order, setOrder] = useState<string[]>(() => [...selected, ...pages.map((p) => p.key).filter((k) => !selected.includes(k))]);
  const [on, setOn] = useState<Set<string>>(() => new Set(selected));
  const byKey = Object.fromEntries(pages.map((p) => [p.key, p]));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  };
  const chosen = order.filter((k) => on.has(k));
  return (
    <form action={action} className="form card">
      <input type="hidden" name="menu" value={JSON.stringify(chosen)} />
      <ol className="li-items">
        {order.map((k, i) => (
          <li key={k} className="li-item">
            <div className="li-bar">
              <label className="check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={on.has(k)}
                  onChange={(e) => {
                    const n = new Set(on);
                    if (e.target.checked) n.add(k);
                    else n.delete(k);
                    setOn(n);
                  }}
                />
                <strong>{byKey[k].label}</strong>
              </label>
              <code className="seo-path">{byKey[k].path}</code>
              <span className="li-tools">
                <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yuxarı">↑</button>
                <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Aşağı">↓</button>
              </span>
            </div>
          </li>
        ))}
      </ol>
      <p className="hint">Yuxarı menyuda {chosen.length} səhifə. {chosen.length > 6 ? "Diqqət: 6-dan çox səhifə kiçik noutbuk ekranlarında sığmaya bilər." : "Tövsiyə: 5–6 səhifə."}</p>
      <div className="actions">
        <button type="submit" className="abtn abtn-primary">Yadda saxla</button>
      </div>
    </form>
  );
}
