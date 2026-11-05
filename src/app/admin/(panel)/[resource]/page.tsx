/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { notFound } from "next/navigation";
import { all, type Row } from "@/lib/db";
import { resources } from "@/lib/admin/resources";
import { deleteResource, togglePublished } from "../../actions";

type P = { params: Promise<{ resource: string }>; searchParams: Promise<{ deleted?: string; q?: string }> };

export default async function ListPage({ params, searchParams }: P) {
  const { resource } = await params;
  const { deleted, q = "" } = await searchParams;
  const r = resources[resource];
  if (!r) notFound();
  const rows = all<Row>(`SELECT * FROM ${r.table} ORDER BY ${r.order}`).filter((row) =>
    q ? String(row[r.titleColumn] ?? "").toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <>
      <div className="head">
        <div>
          <h1>{r.label}</h1>
          <p>{rows.length} qeyd</p>
        </div>
        <div className="actions">
          <form>
            <input name="q" defaultValue={q} placeholder="Axtar…" className="abtn" style={{ background: "#fff", boxShadow: "inset 0 0 0 1px var(--line)", fontWeight: 400, width: 200 }} />
          </form>
          <Link href={`/admin/${r.key}/new`} className="abtn abtn-primary">+ {r.singular} əlavə et</Link>
        </div>
      </div>
      {deleted && <p className="alert alert-ok">Silindi.</p>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              {r.listColumns.map((c) => (
                <th key={c.name}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = Number(row.id);
              return (
                <tr key={id}>
                  {r.listColumns.map((c, i) => {
                    const val = row[c.name];
                    if (c.type === "image") return <td key={c.name}>{val ? <img src={String(val)} alt="" className="thumb" /> : <span className="thumb" />}</td>;
                    if (c.type === "bool" && c.name !== "published")
                      return <td key={c.name}>{val ? <span className="badge badge-on">Bəli</span> : "—"}</td>;
                    if (c.type === "bool")
                      return (
                        <td key={c.name}>
                          <form action={togglePublished.bind(null, r.key, id)} className="inline">
                            <button type="submit" className={`badge ${val ? "badge-on" : ""}`} style={{ border: 0, cursor: "pointer" }} title="Dəyiş">
                              {val ? "Bəli" : "Xeyr"}
                            </button>
                          </form>
                        </td>
                      );
                    const text = String(val ?? "");
                    return (
                      <td key={c.name}>
                        {i === 0 || c.name === r.titleColumn ? (
                          <Link className="title" href={`/admin/${r.key}/${id}`}>{text || "—"}</Link>
                        ) : (
                          text
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <div className="row-actions">
                      <Link href={`/admin/${r.key}/${id}`} className="abtn abtn-sm">Redaktə</Link>
                      <form action={deleteResource.bind(null, r.key, id)}>
                        <ConfirmButton>Sil</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
