import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { notFound } from "next/navigation";
import { get, run } from "@/lib/db";
import { deleteSubmission, markSubmission } from "../../../actions";

type S = { id: number; type: string; name: string; email: string; phone: string; company: string; topic: string; message: string; attachment: string; locale: string; emailed: number; is_read: number; created_at: string };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const s = get<S>("SELECT * FROM submissions WHERE id = ?", id);
  if (!s) notFound();
  if (!s.is_read) run("UPDATE submissions SET is_read = 1 WHERE id = ?", id);
  return (
    <>
      <div className="head">
        <div>
          <Link href="/admin/submissions" className="crumb">← Müraciətlər</Link>
          <h1>{s.name}</h1>
          <p>{s.type === "career" ? "Karyera müraciəti" : "Saytdan sorğu"} · {s.created_at}</p>
        </div>
        <div className="actions">
          <a className="abtn abtn-primary abtn-sm" href={`mailto:${s.email}`}>Cavab yaz</a>
          <form action={markSubmission.bind(null, id, false)}>
            <button type="submit" className="abtn abtn-sm">Oxunmamış et</button>
          </form>
          <form action={deleteSubmission.bind(null, id)}>
            <ConfirmButton>Sil</ConfirmButton>
          </form>
        </div>
      </div>
      <div className="card">
        <dl className="dl">
          <dt>E-poçt</dt>
          <dd><a href={`mailto:${s.email}`}>{s.email}</a></dd>
          {s.phone && (<><dt>Telefon</dt><dd><a href={`tel:${s.phone}`}>{s.phone}</a></dd></>)}
          {s.company && (<><dt>Şirkət</dt><dd>{s.company}</dd></>)}
          {s.topic && (<><dt>{s.type === "career" ? "İstiqamət" : "Xidmət"}</dt><dd>{s.topic}</dd></>)}
          <dt>Dil</dt>
          <dd>{s.locale.toUpperCase()}</dd>
          <dt>E-poçtla göndərilib</dt>
          <dd>{s.emailed ? "Bəli" : "Xeyr (SMTP qurulmayıb və ya xəta)"}</dd>
          {s.attachment && (<><dt>CV</dt><dd><a className="abtn abtn-sm" href={`/api/admin/cv/${encodeURIComponent(s.attachment)}`}>CV-ni yüklə</a></dd></>)}
        </dl>
        {s.message && <div className="message">{s.message}</div>}
      </div>
    </>
  );
}
