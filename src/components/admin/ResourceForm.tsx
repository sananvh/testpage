/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import type { Field, Resource } from "@/lib/admin/resources";
import { LOCALES } from "@/lib/admin/resources";
import type { Row } from "@/lib/db";

function Input({ f, name, value }: { f: Field; name: string; value: string }) {
  if (f.type === "textarea") return <textarea name={name} defaultValue={value} rows={f.rows ?? 6} />;
  if (f.type === "select")
    return (
      <select name={name} defaultValue={value}>
        {f.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  if (f.type === "number") return <input type="number" name={name} defaultValue={value} />;
  if (f.type === "date") return <input type="date" name={name} defaultValue={value} required={f.required} />;
  return <input type="text" name={name} defaultValue={value} />;
}

function ImageField({ f, value }: { f: Field; value: string }) {
  return (
    <div className="field">
      <span>{f.label}</span>
      <div className="imgfield">
        {value ? <img src={value} alt="" className={f.name.endsWith("_dark") ? "dark" : ""} /> : <img alt="" />}
        <input type="file" name={f.name} accept="image/png,image/jpeg,image/webp,image/gif" />
        <input type="hidden" name={`${f.name}__current`} value={value} />
        {value && (
          <label className="check" style={{ fontWeight: 500 }}>
            <input type="checkbox" name={`${f.name}__remove`} value="1" /> Sil
          </label>
        )}
      </div>
      {f.help && <small>{f.help}</small>}
    </div>
  );
}

export default function ResourceForm({ resource, row, action }: { resource: Resource; row?: Row; action: (fd: FormData) => Promise<void> }) {
  const v = (col: string) => {
    const x = row?.[col];
    if (x === null || x === undefined) return "";
    return String(x);
  };
  return (
    <form action={action} className="form card">
      {resource.fields.map((f) => {
        if (f.type === "image") return <ImageField key={f.name} f={f} value={v(f.name)} />;
        if (f.type === "checkbox")
          return (
            <label key={f.name} className="check">
              <input type="checkbox" name={f.name} value="1" defaultChecked={row ? Number(row[f.name]) === 1 : true} />
              {f.label}
            </label>
          );
        if (f.localized) {
          const id = `${resource.key}-${f.name}`;
          return (
            <div key={f.name} className="field">
              <div className="ltabs">
                {LOCALES.map((l, i) => (
                  <Fragment key={l}>
                    <input type="radio" name={`tab-${id}`} id={`${id}-${l}`} defaultChecked={i === 0} />
                    <label htmlFor={`${id}-${l}`} className="tab">
                      {l.toUpperCase()}
                      {!v(`${f.name}_${l}`) && <span className="empty-mark"> •</span>}
                    </label>
                  </Fragment>
                ))}
                <span className="ltitle">
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {LOCALES.map((l) => (
                  <div key={l} className="panel">
                    <Input f={f} name={`${f.name}_${l}`} value={v(`${f.name}_${l}`)} />
                  </div>
                ))}
              </div>
              {f.help && <small>{f.help}</small>}
            </div>
          );
        }
        return (
          <label key={f.name} className="field">
            <span>
              {f.label}
              {f.required ? " *" : ""}
            </span>
            <Input f={f} name={f.name} value={v(f.name) || (f.type === "date" && !row ? new Date().toISOString().slice(0, 10) : "")} />
            {f.help && <small>{f.help}</small>}
          </label>
        );
      })}
      <div className="actions">
        <button type="submit" className="abtn abtn-primary">
          Yadda saxla
        </button>
      </div>
    </form>
  );
}
