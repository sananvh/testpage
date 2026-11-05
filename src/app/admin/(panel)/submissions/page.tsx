import Link from "next/link";
import { all } from "@/lib/db";

type P = { searchParams: Promise<{ deleted?: string; type?: string }> };

export default async function SubmissionsPage({ searchParams }: P) {
  const { deleted, type } = await searchParams;
  const rows = all<{ id: number; type: string; name: string; email: string; company: string; topic: string; created_at: string; is_read: number; emailed: number; attachment: string }>(
    `SELECT id, type, name, email, company, topic, created_at, is_read, emailed, attachment FROM submissions ${type ? "WHERE type = ?" : ""} ORDER BY id DESC LIMIT 500`,
    ...(type ? [type] : []),
  );
  return (
    <>
      <div className="head">
        <div>
          <h1>Müraciətlər</h1>
          <p>Əlaqə, konsultasiya və karyera formalarından gələn sorğular</p>
        </div>
        <div className="actions">
          <Link href="/admin/submissions" className="abtn abtn-sm">Hamısı</Link>
          <Link href="/admin/submissions?type=contact" className="abtn abtn-sm">Sorğular</Link>
          <Link href="/admin/submissions?type=career" className="abtn abtn-sm">Karyera</Link>
        </div>
      </div>
      {deleted && <p className="alert alert-ok">Silindi.</p>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        {rows.length === 0 ? (
          <p style={{ padding: 22, color: "var(--ink-3)" }}>Müraciət yoxdur.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>E-poçt</th>
                <th>Növ</th>
                <th>Mövzu</th>
                <th>E-poçt göndərildi</th>
                <th>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={s.is_read ? "" : "unread"}>
                  <td>
                    <Link className="title" href={`/admin/submissions/${s.id}`}>
                      {s.name}
                    </Link>{" "}
                    {!s.is_read && <span className="badge badge-new">Yeni</span>}
                  </td>
                  <td>{s.email}</td>
                  <td>{s.type === "career" ? "Karyera" : "Sorğu"}{s.attachment ? " · CV" : ""}</td>
                  <td>{s.topic || s.company || "—"}</td>
                  <td>{s.emailed ? <span className="badge badge-on">Bəli</span> : <span className="badge">Xeyr</span>}</td>
                  <td style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{s.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
