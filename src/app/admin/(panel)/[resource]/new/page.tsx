import Link from "next/link";
import { notFound } from "next/navigation";
import { resources } from "@/lib/admin/resources";
import ResourceForm from "@/components/admin/ResourceForm";
import { saveResource } from "../../../actions";

type P = { params: Promise<{ resource: string }>; searchParams: Promise<{ error?: string }> };

export default async function NewPage({ params, searchParams }: P) {
  const { resource } = await params;
  const { error } = await searchParams;
  const r = resources[resource];
  if (!r) notFound();
  return (
    <>
      <div className="head">
        <div>
          <Link href={`/admin/${r.key}`} className="crumb">← {r.label}</Link>
          <h1>Yeni {r.singular.toLowerCase()}</h1>
        </div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      <ResourceForm resource={r} action={saveResource.bind(null, r.key, null)} />
    </>
  );
}
