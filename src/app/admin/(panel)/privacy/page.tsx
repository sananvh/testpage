import { Fragment } from "react";
import { getPrivacy, setting } from "@/lib/site";
import { savePrivacy } from "../../actions";

const LOCALES = ["az", "en", "ru"] as const;

export default async function PrivacyAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  return (
    <>
      <div className="head">
        <div>
          <h1>Məxfilik siyasəti</h1>
          <p>Saytdakı “Məxfilik siyasəti” səhifəsinin mətni. Başlıq və yenilənmə tarixi: Saytın mətnləri → Məxfilik, axtarış, 404.</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      <form action={savePrivacy} className="form card">
        <div className="field">
          <div className="ltabs">
            {LOCALES.map((l, i) => (
              <Fragment key={l}>
                <input type="radio" name="tab-privacy" id={`privacy-${l}`} defaultChecked={i === 0} />
                <label htmlFor={`privacy-${l}`} className="tab">
                  {l.toUpperCase()}
                  {setting(`privacy_${l}`) && <span className="empty-mark"> ✎</span>}
                </label>
              </Fragment>
            ))}
            <span className="ltitle">Siyasətin mətni</span>
            {LOCALES.map((l) => (
              <div key={l} className="panel">
                <textarea name={`privacy_${l}`} defaultValue={getPrivacy(l)} rows={28} />
              </div>
            ))}
          </div>
          <small>Format: “## Başlıq” yeni bölmə, “- ” ilə başlayan sətir siyahı elementi, boş sətir yeni abzasdır. Xananı tam boşaltsanız orijinal mətn bərpa olunur. ✎ dəyişdirilmiş dili göstərir.</small>
        </div>
        <div className="actions">
          <button type="submit" className="abtn abtn-primary">Yadda saxla</button>
        </div>
      </form>
    </>
  );
}
