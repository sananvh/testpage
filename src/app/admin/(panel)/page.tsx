import Link from "next/link";
import { all, get } from "@/lib/db";
import { resources } from "@/lib/admin/resources";

export default async function Dashboard() {
  const count = (table: string) => get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`)?.n ?? 0;
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE is_read = 0")?.n ?? 0;
  const recent = all<{ id: number; type: string; name: string; email: string; created_at: string; is_read: number; emailed: number }>(
    "SELECT id, type, name, email, created_at, is_read, emailed FROM submissions ORDER BY id DESC LIMIT 8",
  );
  const smtp = Boolean(process.env.SMTP_HOST);
  return (
    <>
      <div className="head">
        <div>
          <h1>İcmal</h1>
          <p>Saytın məzmunu və daxil olan müraciətlər</p>
        </div>
        <Link href="/admin/news/new" className="abtn abtn-primary">+ Yeni xəbər</Link>
      </div>
      {!smtp && (
        <p className="alert alert-warn">
          E-poçt göndərişi qurulmayıb (SMTP_HOST). Müraciətlər burada saxlanılır, lakin info@cyberpoint.az ünvanına göndərilmir.
        </p>
      )}
      <div className="stats">
        <Link href="/admin/submissions" className="card stat">
          <b>{unread}</b>
          <span>Oxunmamış müraciət</span>
        </Link>
        {Object.values(resources).map((r) => (
          <Link key={r.key} href={`/admin/${r.key}`} className="card stat">
            <b>{count(r.table)}</b>
            <span>{r.label}</span>
          </Link>
        ))}
      </div>
      <div className="card">
        <div className="head" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 18 }}>Son müraciətlər</h2>
          <Link href="/admin/submissions" className="abtn abtn-sm">Hamısı</Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: "var(--ink-3)" }}>Hələ müraciət yoxdur. Saytdakı əlaqə və karyera formaları buraya düşəcək.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className={s.is_read ? "" : "unread"}>
                    <td>
                      <Link className="title" href={`/admin/submissions/${s.id}`}>{s.name}</Link>
                    </td>
                    <td>{s.email}</td>
                    <td><span className="badge">{s.type === "career" ? "Karyera" : "Sorğu"}</span></td>
                    <td style={{ color: "var(--ink-3)" }}>{s.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
