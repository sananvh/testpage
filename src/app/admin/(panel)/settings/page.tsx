import { all } from "@/lib/db";
import { saveSettings } from "../../actions";

const fields: { key: string; label: string; help?: string }[] = [
  { key: "phone", label: "Telefon" },
  { key: "email", label: "E-poçt (saytda göstərilən)", help: "Formaların göndərildiyi ünvan serverdə MAIL_TO ilə təyin olunur." },
  { key: "hours", label: "İş saatları" },
  { key: "address_az", label: "Ünvan (AZ)" },
  { key: "address_en", label: "Ünvan (EN)" },
  { key: "address_ru", label: "Ünvan (RU)" },
  { key: "map_url", label: "Xəritə linki (Google Maps)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X (Twitter)" },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const m = Object.fromEntries(all<{ key: string; value: string }>("SELECT key, value FROM settings").map((r) => [r.key, r.value]));
  return (
    <>
      <div className="head">
        <div>
          <h1>Əlaqə və sosial şəbəkələr</h1>
          <p>Header, footer və əlaqə səhifəsində göstərilir. Boş buraxılan sosial şəbəkə gizlənir.</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      <form action={saveSettings} className="form card">
        <div className="grid2">
          {fields.map((f) => (
            <label key={f.key} className="field">
              <span>{f.label}</span>
              <input type="text" name={f.key} defaultValue={m[f.key] ?? ""} />
              {f.help && <small>{f.help}</small>}
            </label>
          ))}
        </div>
        <div className="actions">
          <button type="submit" className="abtn abtn-primary">Yadda saxla</button>
        </div>
      </form>
    </>
  );
}
