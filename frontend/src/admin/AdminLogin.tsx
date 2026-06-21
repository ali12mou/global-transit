import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoArrowBack, IoLockClosedOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { apiFetch, setToken } from "@/api/client";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AdminLogin() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        auth: false,
      });
      setToken(res.token);
      nav("/admin");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040a14]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-[color:var(--color-gt-blue)]/25 blur-[100px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[90px]" />

      <div className="relative z-20 flex justify-end px-4 pt-5 md:px-8 md:pt-8">
        <LanguageSwitcher variant="onDark" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center gap-12 px-4 pb-16 pt-4 md:flex-row md:items-stretch md:justify-between md:gap-16 md:px-8 lg:max-w-7xl">
        <div className="flex max-w-xl flex-1 flex-col justify-center text-white md:py-8">
          <div className="inline-flex w-fit rounded-2xl border border-white/15 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
            <Logo variant="header" className="max-w-[min(100%,320px)]" />
          </div>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-amber-400/90 to-transparent md:w-16" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300/95">Global Transit</span>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.35rem]">
            {t("admin.loginTitle")}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">{t("admin.loginSubtitle")}</p>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-sm">
            <IoShieldCheckmarkOutline className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/90" aria-hidden />
            <span>{t("admin.loginSecurityNote")}</span>
          </div>
          <Link
            to="/"
            className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-amber-200/95 underline-offset-4 transition hover:text-white hover:underline"
          >
            <IoArrowBack className="h-5 w-5 shrink-0" aria-hidden />
            {t("admin.backToSite")}
          </Link>
        </div>

        <div className="w-full max-w-[440px] shrink-0 md:flex md:items-center">
          <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[color:var(--color-gt-blue)] via-amber-500/90 to-[color:var(--color-gt-blue)]" />
            <div className="p-8 md:p-10">
              <div className="mb-8 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-[color:var(--color-gt-blue)] shadow-inner ring-1 ring-slate-200/80">
                  <IoLockClosedOutline className="h-7 w-7" aria-hidden />
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">
                    {t("admin.loginCardTitle")}
                  </h2>
                  <p className="text-sm font-medium text-slate-500">{t("admin.loginBackOffice")}</p>
                </div>
              </div>

              {err && (
                <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</p>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("admin.email")}
                  </label>
                  <input
                    id="admin-email"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 text-sm text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-gt-blue)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-gt-blue)]/15"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="admin@globaltransit.local"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("admin.password")}
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 text-sm text-slate-900 shadow-inner outline-none transition focus:border-[color:var(--color-gt-blue)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-gt-blue)]/15"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[color:var(--color-gt-navy)] to-[#0f2847] py-4 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-slate-900/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? t("admin.signingIn") : t("admin.signIn")}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                <Link to="/" className="font-semibold text-[color:var(--color-gt-blue)] hover:underline">
                  {t("admin.backToSite")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
