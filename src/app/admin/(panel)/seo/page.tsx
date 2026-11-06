import { getDictionary } from "@/i18n/get-dictionary";
import { getAt } from "@/lib/texts";
import { SEO_PAGES, getSeoAll } from "@/lib/site";
import { saveSeo } from "../../actions";

const LOCALES = ["az", "en", "ru"] as const;

function defaults(root: string, l: (typeof LOCALES)[number]) {
  const t = getDictionary(l);
  if (root === "meta") return { title: t.meta.title, description: t.meta.description };
  const node = getAt(t, root) as Record<string, string> | undefined;
  return { title: node?.title ?? "", description: node?.lede ?? "" };
}

export default async function SeoAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const seo = getSeoAll();
  return (
    <>
      <div className="head">
        <div>
          <h1>SEO: səhifə başlıqları və təsvirləri</h1>
          <p>Google nəticələrində və sosial şəbəkə paylaşımlarında görünən başlıq və təsvir. Boş xana səhifənin öz başlığını və giriş mətnini istifadə edir (boz rəngdə göstərilir).</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      <form action={saveSeo} className="texts-form">
        {SEO_PAGES.map((p) => {
          const e = seo[p.path] ?? {};
          const key = p.path || "/";
          return (
            <section key={key} className="card texts-section">
              <h2>
                {p.label} <code className="seo-path">/{"{dil}"}{p.path}</code>
              </h2>
              {(["title", "description"] as const).map((k) => (
                <div key={k} className="tf">
                  <div className="tf-head">
                    <strong>{k === "title" ? "Başlıq (title)" : "Təsvir (description)"}</strong>
                    <span className="tf-count">{k === "title" ? "Tövsiyə: 50–60 simvol. Saytın adı “· Cyberpoint” avtomatik əlavə olunur." : "Tövsiyə: 120–160 simvol."}</span>
                  </div>
                  <div className="tf-grid">
                    {LOCALES.map((l) => (
                      <label key={l} className="tf-cell">
                        <span>{l.toUpperCase()}</span>
                        {k === "title" ? (
                          <input type="text" name={`${key}|${k}_${l}`} defaultValue={e[`${k}_${l}`] ?? ""} placeholder={defaults(p.textsRoot, l)[k]} maxLength={120} />
                        ) : (
                          <textarea name={`${key}|${k}_${l}`} defaultValue={e[`${k}_${l}`] ?? ""} placeholder={defaults(p.textsRoot, l)[k]} rows={3} maxLength={320} />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
        <div className="texts-save">
          <span>Xəbər, xidmət və məhsul səhifələri öz başlıq və mətnlərini avtomatik istifadə edir.</span>
          <button type="submit" className="abtn abtn-primary">Yadda saxla</button>
        </div>
      </form>
    </>
  );
}
