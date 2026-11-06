/* eslint-disable @next/next/no-img-element */
import { BRAND_ASSETS, brandUpload, setting } from "@/lib/site";
import { saveBrand } from "../../actions";

export default async function BrandAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const rev = setting("brand_rev") || "0";
  return (
    <>
      <div className="head">
        <div>
          <h1>Logo və paylaşım şəkli</h1>
          <p>Yeni fayl yükləyin və “Yadda saxla” düyməsini sıxın. Dəyişiklik bütün saytda görünür (brauzer keşinə görə bir neçə dəqiqə çəkə bilər).</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      <form action={saveBrand} className="form">
        <div className="brand-grid">
          {Object.entries(BRAND_ASSETS).map(([name, a]) => {
            const custom = !!brandUpload(name);
            return (
              <div key={name} className="card brand-card">
                <div className="tf-head">
                  <strong>{a.label}</strong>
                  {custom && <span className="tf-badge">yüklənmiş</span>}
                </div>
                <div className={`brand-preview${a.dark ? " brand-dark" : ""}${name === "og" ? " brand-og" : ""}`}>
                  <img src={`/brand/live/${name}?v=${rev}`} alt="" />
                </div>
                <input type="file" name={name} accept={a.svg ? "image/svg+xml,image/png,image/webp" : "image/png,image/jpeg"} />
                <small>{a.help}</small>
                {custom && (
                  <label className="check">
                    <input type="checkbox" name={`${name}__reset`} value="1" /> Orijinal fayla qaytar
                  </label>
                )}
              </div>
            );
          })}
        </div>
        <div className="texts-save">
          <span>Tab ikonu (CP) proqram tərəfindən idarə olunur.</span>
          <button type="submit" className="abtn abtn-primary">Yadda saxla</button>
        </div>
      </form>
    </>
  );
}
