/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="login">
      <form action={login} className="card login-card">
        <img src="/brand/live/logo" alt="Cyberpoint" height={36} />
        <h1>İdarəetmə paneli</h1>
        {error && <p className="alert alert-error">{error}</p>}
        <label className="field">
          <span>E-poçt</span>
          <input name="email" type="email" autoComplete="username" required autoFocus />
        </label>
        <label className="field">
          <span>Şifrə</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit" className="abtn abtn-primary">Daxil ol</button>
      </form>
    </main>
  );
}
