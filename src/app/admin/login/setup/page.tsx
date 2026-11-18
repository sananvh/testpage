/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getPending } from "@/lib/auth";
import { otpauthUri } from "@/lib/totp";
import { confirmTwoFactorSetup, finishTwoFactorSetup } from "../../actions";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const pending = await getPending(["setup", "codes"]);
  if (!pending) redirect("/admin/login");
  const { error } = await searchParams;

  if (pending.stage === "codes") {
    let codes: string[] = [];
    try {
      codes = JSON.parse(pending.data);
    } catch {
      codes = [];
    }
    return (
      <main className="login">
        <form action={finishTwoFactorSetup} className="card login-card login-wide">
          <img src="/brand/live/logo" alt="Cyberpoint" height={36} />
          <h1>Ehtiyat kodları</h1>
          <p className="alert alert-ok">İki faktorlu giriş aktivləşdirildi.</p>
          <p className="login-note">
            Telefonunuzu itirsəniz, bu kodlarla daxil ola bilərsiniz. Hər kod <b>bir dəfə</b> işləyir. Onları çap edin və ya şifrə menecerində saxlayın: bu səhifə <b>yalnız indi</b> göstərilir.
          </p>
          <ol className="backup-codes">
            {codes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <button type="submit" className="abtn abtn-primary">Kodları saxladım, panelə keç</button>
        </form>
      </main>
    );
  }

  const secret = pending.data;
  const qr = await QRCode.toString(otpauthUri(secret, pending.email), { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b1036", light: "#ffffff" } });
  const qrSrc = `data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`;
  return (
    <main className="login">
      <form action={confirmTwoFactorSetup} className="card login-card login-wide">
        <img src="/brand/live/logo" alt="Cyberpoint" height={36} />
        <h1>İki faktorlu girişi quraşdırın</h1>
        <p className="login-note">Admin panelinə giriş üçün şifrədən əlavə telefonunuzdakı tətbiqin kodu tələb olunur. Bu, bir dəfəlik quraşdırmadır.</p>
        {error && <p className="alert alert-error">{error}</p>}
        <ol className="setup-steps">
          <li>
            Telefonunuza <b>Google Authenticator</b>, <b>Microsoft Authenticator</b> və ya <b>Authy</b> tətbiqini quraşdırın.
          </li>
          <li>
            Tətbiqdə “+” düyməsini sıxıb bu QR kodu skan edin:
            <div className="qr-box">
              <img src={qrSrc} alt="İki faktorlu giriş üçün QR kod" width={196} height={196} />
              <div>
                <span>Skan edə bilmirsinizsə, bu açarı əl ilə daxil edin:</span>
                <code className="secret">{secret.match(/.{1,4}/g)?.join(" ")}</code>
                <span>Hesab: {pending.email}</span>
              </div>
            </div>
          </li>
          <li>Tətbiqin göstərdiyi 6 rəqəmli kodu yazın:</li>
        </ol>
        <label className="field">
          <span>Təsdiq kodu</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required className="otp-input" placeholder="123456" />
        </label>
        <button type="submit" className="abtn abtn-primary">Aktivləşdir</button>
      </form>
    </main>
  );
}
