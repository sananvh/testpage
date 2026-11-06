import Link from "next/link";
import { notFound } from "next/navigation";
import { TEXT_GROUPS, fieldData, groupSections } from "@/lib/admin/texts-schema";
import TextsEditor from "@/components/admin/TextsEditor";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { resetTexts, saveTexts } from "../../../actions";

export default async function TextsGroup({ params, searchParams }: { params: Promise<{ group: string }>; searchParams: Promise<{ saved?: string; reset?: string }> }) {
  const { group } = await params;
  const { saved, reset } = await searchParams;
  const g = TEXT_GROUPS.find((x) => x.key === group);
  if (!g) notFound();
  const sections = groupSections(group);
  const data = fieldData(sections.flatMap((s) => s.fields));
  return (
    <>
      <div className="head">
        <div>
          <p className="crumbs">
            <Link href="/admin/texts">Saytın mətnləri</Link> /
          </p>
          <h1>{g.label}</h1>
          <p>{g.hint}. Dəyişikliklər “Yadda saxla” düyməsindən sonra saytda dərhal görünür.</p>
        </div>
        <form action={resetTexts.bind(null, group)}>
          <ConfirmButton message="Bu bölmədəki bütün dəyişikliklər silinsin və orijinal mətnlər bərpa olunsun?" className="abtn abtn-soft abtn-sm">
            Hamısını orijinala qaytar
          </ConfirmButton>
        </form>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      {reset && <p className="alert alert-ok">Orijinal mətnlər bərpa olundu.</p>}
      <TextsEditor key={`${saved ?? ""}${reset ?? ""}${Date.now()}`} sections={sections} data={data} action={saveTexts.bind(null, group)} />
    </>
  );
}
