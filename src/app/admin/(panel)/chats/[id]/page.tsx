import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { get, run } from "@/lib/db";
import { deleteChat } from "../../../actions";

type Row = { id: number; session_id: string; locale: string; transcript: string; turns: number; mode: string; consultation: number; is_read: number; created_at: string; updated_at: string };

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const r = get<Row>("SELECT * FROM assistant_chats WHERE id = ?", id);
  if (!r) notFound();
  if (!r.is_read) run("UPDATE assistant_chats SET is_read = 1 WHERE id = ?", id);
  const turns = JSON.parse(r.transcript) as { role: "user" | "assistant"; text: string }[];
  return (
    <>
      <div className="head">
        <div>
          <Link href="/admin/chats" className="crumb">← AI söhbətlər</Link>
          <h1>Söhbət #{r.id}</h1>
          <p>
            {r.created_at} – {r.updated_at} · {r.locale.toUpperCase()} · {r.mode === "ai" ? "AI rejimi" : "Sadə rejim"}
            {r.consultation ? " · Konsultasiya sorğusu göndərilib" : ""}
          </p>
        </div>
        <form action={deleteChat.bind(null, id)}>
          <ConfirmButton>Sil</ConfirmButton>
        </form>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {turns.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              className="message"
              style={{ marginTop: 0, maxWidth: "75%", background: m.role === "user" ? "#e7f0ff" : "#fafbfe" }}
            >
              <small style={{ display: "block", color: "var(--ink-3)", marginBottom: 4 }}>{m.role === "user" ? "Ziyarətçi" : "AI köməkçi"}</small>
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
