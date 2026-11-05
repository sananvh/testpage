import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { all } from "@/lib/db";
import { addUser, changePassword, removeUser } from "../../actions";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const me = await requireAdmin();
  const { saved, error } = await searchParams;
  const users = all<{ id: number; email: string; created_at: string }>("SELECT id, email, created_at FROM users ORDER BY id");
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
                  <td>{u.email}{u.id === me.id ? " (siz)" : ""}</td>
                  <td style={{ textAlign: "right" }}>
                    {u.id !== me.id && (
                      <form action={removeUser.bind(null, u.id)}>
                        <ConfirmButton>Sil</ConfirmButton>
                      </form>
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
