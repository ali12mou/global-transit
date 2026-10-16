import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import {
  IoAlertCircleOutline,
  IoArrowForward,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoGlobeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { apiFetch } from "@/api/client";
import { buildWhatsAppUrl, COMPANY_WHATSAPP_DIGITS } from "@/lib/contactReply";

/** Pays proposés (codes ISO) : noms traduits automatiquement par le navigateur (Intl.DisplayNames). */
const COUNTRIES = ["DJ", "ET", "SO", "KE", "SS", "SD", "ER", "UG", "TZ", "RW", "YE", "AE", "SA", "CN", "IN", "TR", "FR", "IT", "BE", "NL", "DE", "US"] as const;
const SUBJECTS = ["quote", "info", "tracking", "customs", "partnership", "other"] as const;
const SERVICES = [
  { value: "Clearance", key: "clearance" },
  { value: "Logistics", key: "logistics" },
  { value: "Transit", key: "transit" },
  { value: "Système douanes", key: "customs" },
  { value: "Documents", key: "documents" },
  { value: "Autre", key: "other" },
] as const;
const PREFERRED = ["email", "phone", "whatsapp"] as const;
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Avenue du Général de Gaulle, Djibouti");

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[color:var(--color-gt-brand-blue-light)] focus:ring-4 focus:ring-[color:var(--color-gt-brand-blue-light)]/12";

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ n, Icon, children }: { n: number; Icon: typeof IoPersonOutline; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 sm:col-span-2">
      <span className="gt-brand-blue-bg flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">{n}</span>
      <Icon className="h-5 w-5 text-[color:var(--color-gt-gold)]" aria-hidden />
      <h3 className="text-base font-semibold text-[color:var(--color-gt-navy)]">{children}</h3>
    </div>
  );
}

export function ContactPage() {
  const { t, i18n } = useTranslation();
  const [formKey, setFormKey] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);

  const companyWhatsAppUrl = useMemo(
    () => buildWhatsAppUrl(COMPANY_WHATSAPP_DIGITS, t("contact.whatsappPrefilledMessage")),
    [t, i18n.language]
  );

  const countryName = useMemo(() => {
    const local = new Intl.DisplayNames([i18n.language, "fr"], { type: "region" });
    return (code: string) => local.of(code) ?? code;
  }, [i18n.language]);
  const countryFr = useMemo(() => new Intl.DisplayNames(["fr"], { type: "region" }), []);

  const contactMut = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch<{ ok: boolean }>("/api/contact", { method: "POST", body: JSON.stringify(body), auth: false }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const required = ["firstName", "lastName", "email", "subject", "message"];
    if (required.some((k) => !get(k)) || fd.get("consent") !== "on") {
      setClientError(t("contact.errorRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(get("email"))) {
      setClientError(t("contact.errorEmail"));
      return;
    }
    setClientError(null);
    const civility = get("civility");
    const firstName = get("firstName");
    const lastName = get("lastName");
    const countryCode = get("country");
    contactMut.mutate({
      fullName: [civility, firstName, lastName].filter(Boolean).join(" "),
      firstName,
      lastName,
      company: get("company"),
      jobTitle: get("jobTitle"),
      email: get("email"),
      phone: get("phone"),
      country: countryCode === "other" ? t("contact.countryOther") : countryCode ? (countryFr.of(countryCode) ?? countryCode) : "",
      subject: get("subject") ? t(`contact.subjects.${get("subject")}`, { lng: "fr" }) : "",
      service: get("service"),
      route: get("route"),
      preferredContact: get("preferredContact") ? t(`contact.pref.${get("preferredContact")}`, { lng: "fr" }) : "",
      message: get("message"),
    });
  }

  const channels = [
    { Icon: FaPhoneAlt, title: t("contact.callUs"), value: "+253 21 34 17 16", href: "tel:+25321341716", tone: "bg-blue-50 text-[color:var(--color-gt-brand-blue)]" },
    { Icon: FaWhatsapp, title: "WhatsApp", value: "+253 77 69 61 30", href: companyWhatsAppUrl, tone: "bg-emerald-50 text-emerald-600", external: true },
    { Icon: FaEnvelope, title: t("contact.writeUs"), value: "info@gttsgroup.com", href: "mailto:info@gttsgroup.com", tone: "bg-amber-50 text-[color:var(--color-gt-gold)]" },
    { Icon: FaMapMarkerAlt, title: t("contact.visitUs"), value: t("footer.address"), href: MAPS_URL, tone: "bg-rose-50 text-rose-600", external: true, cta: t("contact.directions") },
  ];

  return (
    <div className="bg-[#f3f6fb]">
      {/* Bandeau */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#04307f_0%,#021a55_60%,#010f3a_100%)] text-white">
        <div className="gt-gold-gradient absolute inset-x-0 bottom-0 h-1" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="gt-fade-up text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-gold-bright)]">{t("contact.kicker")}</p>
          <h1 className="gt-fade-up mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-tight [animation-delay:80ms] md:text-5xl">
            {t("contact.title")}
          </h1>
          <p className="gt-fade-up mt-5 max-w-2xl text-base leading-relaxed text-white/80 [animation-delay:160ms] md:text-lg">{t("contact.intro")}</p>
          <div className="gt-fade-up mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
            <a
              href={companyWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <FaWhatsapp className="h-5 w-5" aria-hidden />
              {t("contact.whatsappCta")}
            </a>
            <a
              href="tel:+25321341716"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              <FaPhoneAlt className="h-4 w-4" aria-hidden />
              +253 21 34 17 16
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-10">
          {/* Canaux de contact */}
          <aside className="min-w-0 space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">{t("contact.channelsTitle")}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{t("contact.channelsIntro")}</p>
            <ul className="space-y-3">
              {channels.map((c) => (
                <li key={c.title}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[color:var(--color-gt-brand-blue-light)]/40 hover:shadow-[0_14px_30px_-14px_rgba(7,26,69,0.3)]"
                  >
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.tone}`}>
                      <c.Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{c.title}</span>
                      <span className="block break-words font-semibold text-[color:var(--color-gt-navy)]" dir={c.href.startsWith("tel") ? "ltr" : undefined}>
                        {c.value}
                      </span>
                      {c.cta ? <span className="text-xs font-semibold text-[color:var(--color-gt-brand-blue)]">{c.cta} →</span> : null}
                    </span>
                    <IoArrowForward className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[color:var(--color-gt-brand-blue)]" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="font-semibold text-[color:var(--color-gt-navy)]">{t("contact.whyTitle")}</p>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
                {(["why1", "why2", "why3"] as const).map((k) => (
                  <li key={k} className="flex gap-2.5">
                    <IoCheckmarkCircle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-gt-brand-blue-light)]" aria-hidden />
                    {t(`contact.${k}`)}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Formulaire */}
          <div className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(7,26,69,0.35)] sm:p-6 md:p-9">
            {contactMut.isSuccess ? (
              <div className="gt-fade-up flex flex-col items-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                  <IoCheckmarkCircle className="h-10 w-10" aria-hidden />
                </span>
                <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">{t("contact.successTitle")}</h2>
                <p className="mt-3 max-w-md text-slate-600">{t("contact.successBody")}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <a
                    href={companyWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    <FaWhatsapp className="h-5 w-5" aria-hidden />
                    {t("contact.successWhatsapp")}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      contactMut.reset();
                      setFormKey((k) => k + 1);
                    }}
                    className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {t("contact.newRequest")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--color-gt-navy)]">{t("contact.formTitle")}</h2>
                  <p className="text-xs text-slate-500">
                    <span className="text-red-600">*</span> {t("contact.requiredNote")}
                  </p>
                </div>
                {(clientError || contactMut.isError) && (
                  <p role="alert" className="mt-5 flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    {clientError ?? (contactMut.error as Error).message}
                  </p>
                )}
                <form key={formKey} onSubmit={onSubmit} noValidate className="mt-7 grid gap-5 sm:grid-cols-2">
                  <SectionTitle n={1} Icon={IoPersonOutline}>
                    {t("contact.sectionYou")}
                  </SectionTitle>
                  <div className="grid grid-cols-[110px_1fr] gap-3 sm:col-span-2 sm:grid-cols-[120px_1fr_1fr]">
                    <Field label={t("contact.civility")}>
                      <select name="civility" className={inputClass} defaultValue="">
                        <option value="">—</option>
                        <option value={t("contact.civMr")}>{t("contact.civMr")}</option>
                        <option value={t("contact.civMrs")}>{t("contact.civMrs")}</option>
                      </select>
                    </Field>
                    <Field label={t("contact.firstName")} required>
                      <input name="firstName" autoComplete="given-name" className={inputClass} required />
                    </Field>
                    <Field label={t("contact.lastName")} required className="col-span-2 sm:col-span-1">
                      <input name="lastName" autoComplete="family-name" className={inputClass} required />
                    </Field>
                  </div>
                  <Field label={t("contact.company")}>
                    <input name="company" autoComplete="organization" className={inputClass} />
                  </Field>
                  <Field label={t("contact.jobTitle")}>
                    <input name="jobTitle" autoComplete="organization-title" className={inputClass} />
                  </Field>
                  <Field label={t("contact.emailLabel")} required>
                    <input name="email" type="email" autoComplete="email" placeholder="nom@entreprise.com" className={inputClass} required />
                  </Field>
                  <Field label={t("contact.phoneWhatsapp")}>
                    <input name="phone" type="tel" autoComplete="tel" placeholder="+253 77 00 00 00" className={inputClass} dir="ltr" />
                  </Field>
                  <Field label={t("contact.country")} className="sm:col-span-2">
                    <select name="country" className={inputClass} defaultValue="">
                      <option value="">—</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {countryName(c)}
                        </option>
                      ))}
                      <option value="other">{t("contact.countryOther")}</option>
                    </select>
                  </Field>

                  <div className="h-px bg-slate-100 sm:col-span-2" />
                  <SectionTitle n={2} Icon={IoGlobeOutline}>
                    {t("contact.sectionNeed")}
                  </SectionTitle>
                  <Field label={t("contact.subject")} required>
                    <select name="subject" className={inputClass} defaultValue="" required>
                      <option value="" disabled>
                        {t("contact.choose")}
                      </option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {t(`contact.subjects.${s}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("contact.interestedIn")}>
                    <select name="service" className={inputClass} defaultValue="">
                      <option value="">—</option>
                      {SERVICES.map((s) => (
                        <option key={s.key} value={s.value}>
                          {t(`contact.services.${s.key}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t("contact.corridor")} className="sm:col-span-2">
                    <input name="route" className={inputClass} placeholder={t("contact.corridorPh")} />
                  </Field>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-sm font-semibold text-slate-700">{t("contact.preferredLabel")}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PREFERRED.map((p, i) => (
                        <label key={p} className="cursor-pointer">
                          <input type="radio" name="preferredContact" value={p} defaultChecked={i === 0} className="peer sr-only" />
                          <span className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition peer-checked:border-[color:var(--color-gt-brand-blue)] peer-checked:bg-[color:var(--color-gt-brand-blue)] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100">
                            {t(`contact.pref.${p}`)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="h-px bg-slate-100 sm:col-span-2" />
                  <SectionTitle n={3} Icon={IoDocumentTextOutline}>
                    {t("contact.sectionMessage")}
                  </SectionTitle>
                  <Field label={t("contact.message")} required className="sm:col-span-2">
                    <textarea name="message" rows={5} className={`${inputClass} resize-y leading-relaxed`} placeholder={t("contact.messagePh")} required />
                  </Field>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600 sm:col-span-2">
                    <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0 accent-[color:var(--color-gt-brand-blue-light)]" required />
                    <span>
                      {t("contact.consent")}
                      <span className="ml-0.5 text-red-600">*</span>
                    </span>
                  </label>
                  <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <IoShieldCheckmarkOutline className="h-4 w-4 text-emerald-600" aria-hidden />
                      {t("contact.privacyNote")}
                    </p>
                    <button
                      type="submit"
                      disabled={contactMut.isPending}
                      className="gt-brand-blue-bg inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-900/25 transition hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-70"
                    >
                      {contactMut.isPending && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                      )}
                      {contactMut.isPending ? t("contact.submitting") : t("contact.submit")}
                      {!contactMut.isPending && <IoArrowForward className="h-4 w-4" aria-hidden />}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
