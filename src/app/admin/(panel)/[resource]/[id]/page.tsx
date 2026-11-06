import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { notFound } from "next/navigation";
import { get, type Row } from "@/lib/db";
import { resources } from "@/lib/admin/resources";
import ResourceForm from "@/components/admin/ResourceForm";
import { deleteResource, saveResource } from "../../../actions";

type P = { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ error?: string; saved?: string }> };

const publicPath: Record<string, (row: Row) => string> = {
  news: (r) => `/az/news/${r.slug}`,
  services: (r) => `/az/services/${r.slug}`,
  products: (r) => `/az/products/${r.slug}`,
  partners: () => "/az/partners",
  clients: () => "/az/clients",
  certificates: () => "/az/certificates",
  faqs: (r) => `/az/faq#faq-${r.id}`,
  cves: () => "/az/research",
};

export default async function EditPage({ params, searchParams }: P) {
  const { resource, id } = await params;
  const { error, saved } = await searchParams;
  const r = resources[resource];
  if (!r) notFound();
  const row = get<Row>(`SELECT * FROM ${r.table} WHERE id = ?`, Number(id));
  if (!row) notFound();
  return (
    <>
      <div className="head">
        <div>
          <Link href={`/admin/${r.key}`} className="crumb">← {r.label}</Link>
          <h1>{String(row[r.titleColumn] ?? r.singular)}</h1>
        </div>
        <div className="actions">
          <a href={publicPath[r.key]?.(row) ?? "/az"} target="_blank" rel="noreferrer" className="abtn abtn-sm">Saytda bax ↗</a>
          <form action={deleteResource.bind(null, r.key, Number(id))}>
            <ConfirmButton>Sil</ConfirmButton>
          </form>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      <ResourceForm resource={r} row={row} action={saveResource.bind(null, r.key, Number(id))} />
    </>
  );
}
