/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPending } from "@/lib/auth";
import { verifyTwoFactor } from "../../actions";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const pending = await getPending(["2fa"]);
  if (!pending) redirect("/admin/login");
  const { error } = await searchParams;
  return (
    <main className="login">
      <form action={verifyTwoFactor} className="card login-card">
        <img src="/brand/live/logo" alt="Cyberpoint" height={36} />
        <h1>İki faktorlu giriş</h1>
        <p className="login-note">Autentifikator tətbiqindəki (Google Authenticator, Microsoft Authenticator, Authy) 6 rəqəmli kodu daxil edin.</p>
        {error && <p className="alert alert-error">{error}</p>}
        <label className="field">
          <span>Təsdiq kodu</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9a-zA-Z\- ]{6,12}" maxLength={12} required autoFocus className="otp-input" placeholder="123456" />
          <small>Telefonunuz yanınızda deyilsə, ehtiyat kodlarından birini (məs. k7m2-9qxp) yazın. Hər ehtiyat kodu bir dəfə işləyir.</small>
        </label>
        <button type="submit" className="abtn abtn-primary">Təsdiqlə</button>
        <Link href="/admin/login" className="login-back">← Başqa hesabla daxil ol</Link>
      </form>
    </main>
  );
}
