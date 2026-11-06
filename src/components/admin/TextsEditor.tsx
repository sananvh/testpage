"use client";

import { useMemo, useState } from "react";
import type { Field, FieldData, ListField, Section } from "@/lib/admin/texts-schema";

type Locale = "az" | "en" | "ru";
const LOCALES: Locale[] = ["az", "en", "ru"];
type L3<T> = Record<Locale, T>;
type Row = { id: number; shared: Record<string, string>; loc: L3<Record<string, string>> };

let uid = 0;
const nextId = () => ++uid;

/* ---------- list <-> rows ---------- */
function cellOf(f: ListField, item: unknown, key: string): string {
  if (f.itemType === "string") return typeof item === "string" ? item : "";
  if (f.itemType === "tuple") return Array.isArray(item) ? String(item[Number(key)] ?? "") : "";
  return item && typeof item === "object" ? String((item as Record<string, unknown>)[key] ?? "") : "";
}
function toRows(f: ListField, lists: L3<unknown>): Row[] {
  const arr = (l: Locale) => (Array.isArray(lists[l]) ? (lists[l] as unknown[]) : []);
  const n = Math.max(...LOCALES.map((l) => arr(l).length));
  return Array.from({ length: n }, (_, i) => ({
    id: nextId(),
    shared: Object.fromEntries(f.fields.filter((x) => x.shared).map((x) => [x.key, cellOf(f, arr("az")[i], x.key)])),
    loc: Object.fromEntries(LOCALES.map((l) => [l, Object.fromEntries(f.fields.filter((x) => !x.shared).map((x) => [x.key, cellOf(f, arr(l)[i], x.key)]))])) as L3<Record<string, string>>,
  }));
}
function fromRows(f: ListField, rows: Row[]): L3<unknown[]> {
  return Object.fromEntries(
    LOCALES.map((l) => [
      l,
      rows.map((r) => {
        const val = (k: string, shared: boolean) => (shared ? r.shared[k] : r.loc[l][k]) ?? "";
        if (f.itemType === "string") return val("v", false);
        if (f.itemType === "tuple") return f.fields.map((x) => val(x.key, x.shared));
        return Object.fromEntries(f.fields.map((x) => [x.key, val(x.key, x.shared)]));
      }),
    ]),
  ) as L3<unknown[]>;
}

/* ---------- inputs ---------- */
function Box({ long, value, onChange, placeholder, label }: { long: boolean; value: string; onChange: (v: string) => void; placeholder?: string; label: string }) {
  return long ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(8, Math.max(2, Math.ceil(value.length / 60)))} placeholder={placeholder} aria-label={label} />
  ) : (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} />
  );
}

function TextRow({ f, data }: { f: Extract<Field, { kind: "text" }>; data: FieldData }) {
  const def = data.def as L3<string>;
  const [v, setV] = useState<L3<string>>(data.cur as L3<string>);
  const changed = LOCALES.some((l) => (v[l] || def[l]) !== def[l]);
  return (
    <div className={`tf${changed ? " tf-changed" : ""}`}>
      <div className="tf-head">
        <strong>{f.label}</strong>
        {changed && <span className="tf-badge">dəyişdirilib</span>}
        {changed && (
          <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => setV(def)}>
            ↺ Orijinal
          </button>
        )}
      </div>
      <div className="tf-grid">
        {LOCALES.map((l) => (
          <label key={l} className="tf-cell">
            <span>{l.toUpperCase()}</span>
            <Box long={f.long} value={v[l]} onChange={(x) => setV({ ...v, [l]: x })} placeholder={def[l]} label={`${f.label} (${l.toUpperCase()})`} />
            <input type="hidden" name={`t|${f.path}|${l}`} value={v[l]} />
          </label>
        ))}
      </div>
    </div>
  );
}

function ListRow({ f, data }: { f: ListField; data: FieldData }) {
  const defRows = useMemo(() => JSON.stringify(fromRows(f, toRows(f, data.def))), [f, data.def]);
  const [rows, setRows] = useState<Row[]>(() => toRows(f, data.cur));
  const value = JSON.stringify(fromRows(f, rows));
  const changed = value !== defRows;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };
  const add = () =>
    setRows([
      ...rows,
      {
        id: nextId(),
        shared: Object.fromEntries(f.fields.filter((x) => x.shared).map((x) => [x.key, x.options?.[0] ?? ""])),
        loc: Object.fromEntries(LOCALES.map((l) => [l, Object.fromEntries(f.fields.filter((x) => !x.shared).map((x) => [x.key, ""]))])) as L3<Record<string, string>>,
      },
    ]);
  const setCell = (id: number, l: Locale | null, k: string, x: string) =>
    setRows(rows.map((r) => (r.id !== id ? r : l ? { ...r, loc: { ...r.loc, [l]: { ...r.loc[l], [k]: x } } } : { ...r, shared: { ...r.shared, [k]: x } })));

  return (
    <div className={`tf tf-list${changed ? " tf-changed" : ""}`}>
      <div className="tf-head">
        <strong>{f.label}</strong>
        <span className="tf-count">{rows.length} element</span>
        {changed && <span className="tf-badge">dəyişdirilib</span>}
        {changed && (
          <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => setRows(toRows(f, data.def))}>
            ↺ Orijinal siyahı
          </button>
        )}
      </div>
      <input type="hidden" name={`l|${f.path}`} value={value} />
      <ol className="li-items">
        {rows.map((r, i) => (
          <li key={r.id} className="li-item">
            <div className="li-bar">
              <b>#{i + 1}</b>
              {f.fields
                .filter((x) => x.shared)
                .map((x) => (
                  <label key={x.key} className="li-shared">
                    <span>{x.label}</span>
                    <select value={r.shared[x.key]} onChange={(e) => setCell(r.id, null, x.key, e.target.value)}>
                      {!x.options?.includes(r.shared[x.key]) && <option value={r.shared[x.key]}>{r.shared[x.key] || "—"}</option>}
                      {x.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              <span className="li-tools">
                <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Yuxarı">
                  ↑
                </button>
                <button type="button" className="abtn abtn-soft abtn-sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Aşağı">
                  ↓
                </button>
                <button type="button" className="abtn abtn-danger abtn-sm" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} aria-label="Sil">
                  Sil
                </button>
              </span>
            </div>
            {f.fields
              .filter((x) => !x.shared)
              .map((x) => (
                <div key={x.key} className="li-field">
                  {f.fields.filter((y) => !y.shared).length > 1 && <span className="li-label">{x.label}</span>}
                  <div className="tf-grid">
                    {LOCALES.map((l) => (
                      <label key={l} className="tf-cell">
                        <span>{l.toUpperCase()}</span>
                        <Box long={x.long} value={r.loc[l][x.key] ?? ""} onChange={(v) => setCell(r.id, l, x.key, v)} label={`${f.label} #${i + 1} ${x.label} (${l.toUpperCase()})`} placeholder={l !== "az" ? r.loc.az[x.key] : ""} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </li>
        ))}
      </ol>
      <button type="button" className="abtn abtn-sm" onClick={add}>
        + Element əlavə et
      </button>
    </div>
  );
}

export default function TextsEditor({ sections, data, action }: { sections: Section[]; data: Record<string, FieldData>; action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="texts-form">
      {sections.length > 1 && (
        <nav className="texts-toc" aria-label="Bölmələr">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
        </nav>
      )}
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="card texts-section">
          <h2>{s.title}</h2>
          {s.fields.map((f) => (f.kind === "text" ? <TextRow key={f.path} f={f} data={data[f.path]} /> : <ListRow key={f.path} f={f} data={data[f.path]} />))}
        </section>
      ))}
      <div className="texts-save">
        <span>Boş buraxılan xana orijinal mətni göstərir. EN/RU boş qalsa AZ mətni istifadə olunur (siyahılarda).</span>
        <button type="submit" className="abtn abtn-primary">
          Yadda saxla
        </button>
      </div>
    </form>
  );
}
