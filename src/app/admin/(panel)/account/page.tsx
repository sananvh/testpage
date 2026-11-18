import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin, takeSessionData } from "@/lib/auth";
import { all } from "@/lib/db";
import { addUser, changePassword, regenerateBackupCodes, removeUser, resetTwoFactor } from "../../actions";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; codes?: string; backup?: string }> }) {
  const me = await requireAdmin();
  const { saved, error, codes, backup } = await searchParams;
  const users = all<{ id: number; email: string; created_at: string; totp_enabled: number; backup_codes: string }>("SELECT id, email, created_at, totp_enabled, backup_codes FROM users ORDER BY id");
  const left = (u: { backup_codes: string }) => {
    try {
      return (JSON.parse(u.backup_codes) as unknown[]).length;
    } catch {
      return 0;
    }
  };
  const myLeft = left(users.find((u) => u.id === me.id) ?? { backup_codes: "[]" });
  let newCodes: string[] = [];
  if (codes) {
    try {
      newCodes = (JSON.parse((await takeSessionData()) || "{}").backupCodes as string[]) ?? [];
    } catch {
      newCodes = [];
    }
  }
  return (
    <>
      <div className="head">
        <div>
          <h1>Hesab və istifadəçilər</h1>
          <p>{me.email}</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {backup && (
        <p className="alert alert-warn">
          Ehtiyat kodu ilə daxil oldunuz. Qalan ehtiyat kodları: {backup}. Telefonunuz itibsə, başqa admindən iki faktorlu girişinizi sıfırlamağı xahiş edin və ya aşağıda yeni kodlar yaradın.
        </p>
      )}
      <div className="card form" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18 }}>İki faktorlu giriş</h2>
        <p style={{ margin: 0 }}>
          Status: <span className="tfa-on">Aktiv</span> · autentifikator tətbiqi · qalan ehtiyat kodları: <b>{myLeft}</b> / 10
        </p>
        {newCodes.length > 0 ? (
          <>
            <p className="alert alert-ok" style={{ margin: 0 }}>Yeni ehtiyat kodları yaradıldı. Köhnə kodlar artıq işləmir. Bu kodlar yalnız indi göstərilir:</p>
            <ol className="backup-codes">
              {newCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          </>
        ) : (
          <form action={regenerateBackupCodes} className="actions">
            <ConfirmButton message="Yeni ehtiyat kodları yaradılsın? Köhnə kodlar dərhal etibarsız olacaq." className="abtn abtn-sm">
              Yeni ehtiyat kodları yarat
            </ConfirmButton>
            <small style={{ color: "var(--ink-3)" }}>Köhnə kodları itirmisinizsə və ya azalıbsa istifadə edin.</small>
          </form>
        )}
      </div>
      <div className="grid2" style={{ alignItems: "start" }}>
        <form action={changePassword} className="form card">
          <h2 style={{ fontSize: 18 }}>Şifrəni dəyiş</h2>
          <label className="field"><span>Cari şifrə</span><input type="password" name="current" autoComplete="current-password" required /></label>
          <label className="field"><span>Yeni şifrə</span><input type="password" name="next" autoComplete="new-password" minLength={10} required /><small>Ən azı 10 simvol.</small></label>
          <label className="field"><span>Yeni şifrə (təkrar)</span><input type="password" name="confirm" autoComplete="new-password" required /></label>
          <div className="actions"><button type="submit" className="abtn abtn-primary">Dəyiş</button></div>
        </form>
        <div className="card form">
          <h2 style={{ fontSize: 18 }}>İstifadəçilər</h2>
          <table>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.id === me.id ? " (siz)" : ""}
                    <br />
                    <small className={u.totp_enabled ? "tfa-on" : "tfa-off"}>{u.totp_enabled ? `2FA aktiv · ${left(u)} ehtiyat kodu` : "2FA növbəti girişdə quraşdırılacaq"}</small>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {u.id !== me.id && (
                      <div className="actions" style={{ justifyContent: "flex-end", padding: 0 }}>
                        {u.totp_enabled ? (
                          <form action={resetTwoFactor.bind(null, u.id)}>
                            <ConfirmButton message={`${u.email} üçün iki faktorlu giriş sıfırlansın? Növbəti girişdə yenidən quraşdırmalı olacaq.`} className="abtn abtn-sm">
                              2FA sıfırla
                            </ConfirmButton>
                          </form>
                        ) : null}
                        <form action={removeUser.bind(null, u.id)}>
                          <ConfirmButton>Sil</ConfirmButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form action={addUser} className="form">
            <label className="field"><span>Yeni istifadəçi e-poçtu</span><input type="email" name="email" required /></label>
            <label className="field"><span>Şifrə</span><input type="password" name="password" minLength={10} autoComplete="new-password" required /></label>
            <div className="actions"><button type="submit" className="abtn">+ Əlavə et</button></div>
          </form>
        </div>
      </div>
    </>
  );
}
