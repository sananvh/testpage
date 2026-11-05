"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import LogoTile from "./LogoTile";
import s from "./ui.module.css";

export type FilterItem = { id: number; name: string; light: string; dark?: string; cats: string[]; caption?: string; href?: string };

export default function FilterGrid({
  items, filters, allLabel, variant = "wide",
}: {
  items: FilterItem[];
  filters: { key: string; label: string }[];
  allLabel: string;
  variant?: "wide" | "square";
}) {
  const [active, setActive] = useState<string>("all");
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of items) for (const c of new Set(it.cats)) m[c] = (m[c] ?? 0) + 1;
    return m;
  }, [items]);
  const shown = active === "all" ? items : items.filter((i) => i.cats.includes(active));
  const usable = filters.filter((f) => counts[f.key]);

  return (
    <>
      <div className={s.filters} role="group" aria-label="Filter">
        <button type="button" className="chip" aria-pressed={active === "all"} onClick={() => setActive("all")}>
          {allLabel} <span className="chip-count">{items.length}</span>
        </button>
        {usable.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={active === f.key} onClick={() => setActive(f.key)}>
            {f.label} <span className="chip-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>
      <motion.ul layout className={s.logoGrid}>
        <AnimatePresence mode="popLayout">
          {shown.map((it) => (
            <motion.li
              key={it.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoTile name={it.name} light={it.light} dark={it.dark} caption={it.caption ?? ""} href={it.href} variant={variant} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}
