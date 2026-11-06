import Link from "next/link";
import { all } from "@/lib/db";
import { TEXT_GROUPS } from "@/lib/admin/texts-schema";

export default function TextsIndex() {
  const rows = all<{ path: string }>("SELECT DISTINCT path FROM texts");
  const count = (roots: string[]) => rows.filter((r) => roots.some((x) => r.path === x || r.path.startsWith(`${x}.`))).length;
  return (
    <>
      <div className="head">
        <div>
          <h1>Saytın mətnləri</h1>
          <p>Saytdakı bütün yazılar səhifələrə görə qruplaşdırılıb. Hər mətni AZ, EN və RU dillərində dəyişə, siyahılara element əlavə edə, silə və sırasını dəyişə bilərsiniz.</p>
        </div>
      </div>
      <ul className="tgroups">
        {TEXT_GROUPS.map((g) => {
          const n = count(g.roots);
          return (
            <li key={g.key}>
              <Link href={`/admin/texts/${g.key}`} className="card tgroup">
                <strong>{g.label}</strong>
                <span>{g.hint}</span>
                {n > 0 && <b className="pill">{n} dəyişiklik</b>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
