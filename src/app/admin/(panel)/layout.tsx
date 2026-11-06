/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { get } from "@/lib/db";
import { resources } from "@/lib/admin/resources";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unread = get<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE is_read = 0")?.n ?? 0;
  const newChats = get<{ n: number }>("SELECT COUNT(*) AS n FROM assistant_chats WHERE is_read = 0")?.n ?? 0;
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/admin" className="side-logo">
          <img src="/brand/live/logo-reversed" alt="Cyberpoint" height={28} />
        </Link>
        <nav>
          <Link href="/admin">İcmal</Link>
          <Link href="/admin/submissions">
            Müraciətlər {unread > 0 && <b className="pill">{unread}</b>}
          </Link>
          <Link href="/admin/chats">
            AI söhbətlər {newChats > 0 && <b className="pill">{newChats}</b>}
          </Link>
          <p className="side-label">Məzmun</p>
          {Object.values(resources).map((r) => (
            <Link key={r.key} href={`/admin/${r.key}`}>
              {r.label}
            </Link>
          ))}
          <p className="side-label">Sayt</p>
          <Link href="/admin/texts">Saytın mətnləri</Link>
          <Link href="/admin/menu">Yuxarı menyu</Link>
          <Link href="/admin/seo">SEO</Link>
          <Link href="/admin/brand">Logo və paylaşım şəkli</Link>
          <Link href="/admin/privacy">Məxfilik siyasəti</Link>
          <p className="side-label">Sistem</p>
          <Link href="/admin/settings">Əlaqə və sosial şəbəkələr</Link>
          <Link href="/admin/account">Hesab və istifadəçilər</Link>
          <a href="/az" target="_blank" rel="noreferrer">Saytı aç ↗</a>
        </nav>
        <form action={logout} className="side-foot">
          <span>{user.email}</span>
          <button type="submit" className="abtn abtn-ghost abtn-sm">Çıxış</button>
        </form>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
