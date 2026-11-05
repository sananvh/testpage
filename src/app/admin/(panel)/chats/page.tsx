import Link from "next/link";
import { redirect } from "next/navigation";
import { all, get } from "@/lib/db";

type Row = { id: number; session_id: string; locale: string; transcript: string; turns: number; mode: string; consultation: number; is_read: number; updated_at: string };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ session?: string; deleted?: string }> }) {
  const { session, deleted } = await searchParams;
  if (session) {
    const hit = get<{ id: number }>("SELECT id FROM assistant_chats WHERE session_id = ?", session);
    if (hit) redirect(`/admin/chats/${hit.id}`);
  }
  const rows = all<Row>("SELECT * FROM assistant_chats ORDER BY updated_at DESC LIMIT 300");
  const ai = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  return (
    <>
      <div className="head">
        <div>
          <h1>AI söhbətlər</h1>
          <p>Saytdakı AI köməkçi ilə ziyarətçilərin söhbətləri</p>
        </div>
      </div>
      {!ai && (
        <p className="alert alert-warn">
          ANTHROPIC_API_KEY qurulmayıb: köməkçi sadə rejimdə işləyir (səhifə keçidləri və hazır cavablar). Tam AI cavabları üçün serverdə açarı əlavə edin.
        </p>
      )}
      {deleted && <p className="alert alert-ok">Silindi.</p>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        {rows.length === 0 ? (
          <p style={{ padding: 22, color: "var(--ink-3)" }}>Hələ söhbət yoxdur.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>İlk sual</th>
                <th>Sual sayı</th>
                <th>Dil</th>
                <th>Rejim</th>
                <th>Konsultasiya</th>
                <th>Yenilənib</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const first = (JSON.parse(r.transcript) as { role: string; text: string }[]).find((m) => m.role === "user")?.text ?? "—";
                return (
                  <tr key={r.id} className={r.is_read ? "" : "unread"}>
                    <td>
                      <Link className="title" href={`/admin/chats/${r.id}`}>
                        {first.length > 70 ? first.slice(0, 70) + "…" : first}
                      </Link>{" "}
                      {!r.is_read && <span className="badge badge-new">Yeni</span>}
                    </td>
                    <td>{r.turns}</td>
                    <td>{r.locale.toUpperCase()}</td>
                    <td>{r.mode === "ai" ? "AI" : "Sadə"}</td>
                    <td>{r.consultation ? <span className="badge badge-on">Bəli</span> : "—"}</td>
                    <td style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{r.updated_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
