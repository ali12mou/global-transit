import { useState } from "react";
import { FaShip } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoAlertCircleOutline,
  IoArrowBack,
  IoBarChartOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoNewspaperOutline,
  IoNotificationsOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { apiFetch, setToken } from "@/api/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogisticsScene } from "@/components/brand/LogisticsScene";

/** Dernier email utilisé pour se connecter sur cet appareil (pré-rempli à la prochaine visite). */
const REMEMBER_KEY = "gt_admin_email";

function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

const FEATURES = [
  { Icon: IoBarChartOutline, key: "admin.loginFeatureStats" },
  { Icon: IoNewspaperOutline, key: "admin.loginFeatureContent" },
  { Icon: IoNotificationsOutline, key: "admin.loginFeatureMessages" },
] as const;

const CORRIDOR = ["Djibouti", "Dire Dawa", "Addis-Abeba"] as const;

export function AdminLogin() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const sessionExpired = Boolean((location.state as { expired?: boolean } | null)?.expired);
  const [email, setEmail] = useState(readRememberedEmail);
  const [remember, setRemember] = useState(() => readRememberedEmail() !== "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* stockage indisponible : rien à mémoriser */
      }
      nav("/admin");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-gt-brand-blue-light)] focus:ring-4 focus:ring-[color:var(--color-gt-brand-blue-light)]/12";

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f6fb] lg:flex-row">
      {/* Panneau de marque */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_35%,#0b4cc2_0%,#04307f_40%,#021a55_72%,#010b2c_100%)] text-white lg:flex lg:min-h-screen lg:w-[54%] lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          aria-hidden
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path d="M-20 620 C 200 460, 380 700, 600 500 S 820 320, 860 380" fill="none" stroke="#e3bf34" strokeWidth="1.4" strokeDasharray="2 10" />
          <path d="M-20 200 C 220 300, 380 120, 560 240 S 760 520, 860 440" fill="none" stroke="#9cc0ff" strokeWidth="1.2" strokeDasharray="2 10" />
        </svg>

        <div className="relative flex items-center justify-between px-6 pt-6 sm:px-10 lg:pt-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white">
            <IoArrowBack className="h-4 w-4" aria-hidden />
            {t("admin.backToSite")}
          </Link>
          <div className="lg:hidden">
            <LanguageSwitcher variant="onDark" />
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 lg:flex" aria-hidden>
            {CORRIDOR.map((city, i) => (
              <span key={city} className="flex items-center gap-2">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-gt-gold-bright)] shadow-[0_0_10px_#e3bf34]" />
                  {city}
                </span>
                {i < CORRIDOR.length - 1 && <span className="h-px w-8 bg-gradient-to-r from-[color:var(--color-gt-gold-bright)]/70 to-white/20" />}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col items-center px-6 pb-4 pt-6 text-center sm:px-10 lg:justify-center lg:pb-40">
          <div className="relative grid w-36 place-items-center sm:w-44 lg:w-44 xl:w-48" aria-hidden>
            <div className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,#ffffff_0%,rgba(244,248,255,.95)_34%,rgba(178,206,255,.45)_52%,transparent_71%)]" />
            <svg className="gt-orbit-spin absolute inset-[-22%] h-[144%] w-[144%] overflow-visible" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="gt-login-gold" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#f7dc7a" />
                  <stop offset=".5" stopColor="#e3bf34" />
                  <stop offset="1" stopColor="#b8860b" />
                </linearGradient>
              </defs>
              <ellipse cx="100" cy="100" rx="94" ry="38" transform="rotate(-24 100 100)" fill="none" stroke="url(#gt-login-gold)" strokeWidth="1.6" />
              <ellipse cx="100" cy="100" rx="88" ry="30" transform="rotate(36 100 100)" fill="none" stroke="url(#gt-login-gold)" strokeWidth="1" strokeOpacity=".7" />
              <circle cx="185.9" cy="61.8" r="2.6" fill="#f5d66b" />
            </svg>
            <img src="/brand/gt-logo.webp" alt="" width={640} height={602} className="relative w-[92%] drop-shadow-[0_16px_26px_rgba(1,12,48,0.38)]" />
          </div>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gt-gold-bright)]">
            Global Transit and Transport Services
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.6rem]">
            {t("admin.loginTitle")}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">{t("admin.loginSubtitle")}</p>

          <ul className="mt-6 hidden w-full max-w-md gap-2.5 text-left sm:grid">
            {FEATURES.map(({ Icon, key }) => (
              <li key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 backdrop-blur-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-gt-gold-bright)]/15 text-[color:var(--color-gt-gold-bright)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm text-white/90">{t(key)}</span>
              </li>
            ))}
          </ul>

        </div>
        <LogisticsScene className="pointer-events-none relative h-28 w-full sm:h-36 lg:absolute lg:inset-x-0 lg:bottom-0 lg:h-40" />
        <div className="gt-gold-gradient relative h-1 w-full lg:hidden" aria-hidden />
      </section>

      {/* Formulaire */}
      <section className="relative flex flex-1 flex-col">
        <div className="hidden justify-end px-10 pt-8 lg:flex">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="gt-fade-up w-full max-w-[420px]">
            <span className="gt-brand-blue-bg relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-blue-900/25" aria-hidden>
              <svg className="gt-orbit-spin absolute -inset-2 h-20 w-20" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="37" fill="none" stroke="#e3bf34" strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="4 6" />
                <circle cx="40" cy="3" r="3" fill="#e3bf34" />
              </svg>
              <FaShip className="gt-bob h-8 w-8 text-[color:var(--color-gt-gold-bright)]" />
              <span className="absolute inset-x-3 bottom-3 h-px bg-white/40" />
            </span>
            <h2 className="mt-6 font-[family-name:var(--font-display)] text-[1.9rem] font-bold leading-tight text-[color:var(--color-gt-navy)]">
              {t("admin.loginCardTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{t("admin.loginCardHint")}</p>

            {sessionExpired && !err && (
              <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
                <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                {t("admin.sessionExpired")}
              </p>
            )}
            {err && (
              <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <span>
                  <span className="block font-semibold">{t("admin.loginErrorTitle")}</span>
                  {err}
                </span>
              </p>
            )}

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="admin-email" className="text-sm font-semibold text-slate-700">
                  {t("admin.email")}
                </label>
                <div className="relative mt-2">
                  <IoMailOutline className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    id="admin-email"
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="nom@gttsgroup.com"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700">
                  {t("admin.password")}
                </label>
                <div className="relative mt-2">
                  <IoLockClosedOutline className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? t("admin.hidePassword") : t("admin.showPassword")}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <IoEyeOffOutline className="h-5 w-5" /> : <IoEyeOutline className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="gt-brand-blue-bg relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-900/25 transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-70"
              >
                {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
                {loading ? t("admin.signingIn") : t("admin.signIn")}
              </button>
              <label className="-mt-1 flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-slate-300 accent-[color:var(--color-gt-brand-blue-light)]"
                />
                {t("admin.rememberEmail")}
              </label>
            </form>

            <p className="mt-8 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              <IoShieldCheckmarkOutline className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              {t("admin.loginSecurityNote")}
            </p>
          </div>
        </div>
        <p className="px-6 pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Global Transit and Transport Services — {t("admin.loginBackOffice")}
        </p>
      </section>
    </div>
  );
}
