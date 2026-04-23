import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaWhatsapp } from "react-icons/fa";
import { apiFetch } from "@/api/client";

export function ContactPage() {
  const { t } = useTranslation();
  const contactMut = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch<{ ok: boolean }>("/api/contact", { method: "POST", body: JSON.stringify(body), auth: false }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const first = String(fd.get("firstName") ?? "").trim();
    const last = String(fd.get("lastName") ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || "—";
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const service = String(fd.get("service") ?? "").trim();
    const corridor = String(fd.get("corridor") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const composed = [
      message && `${t("contact.message")}:\n${message}`,
      phone && `${t("contact.phone")}: ${phone}`,
      corridor && `${t("contact.corridor")}: ${corridor}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    contactMut.mutate({
      fullName,
      email,
      service,
      message: composed || message,
    });
  }

  return (
    <div className="bg-[#f5f7f8]">
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">{t("contact.kicker")}</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--color-gt-navy)] md:text-4xl">
              {t("contact.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">{t("contact.intro")}</p>
            <dl className="mt-10 space-y-5 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("contact.office")}</dt>
                <dd className="mt-1 font-medium text-[color:var(--color-gt-navy)]">{t("contact.officeValue")}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("contact.directLine")}</dt>
                <dd className="mt-1 font-medium text-[color:var(--color-gt-navy)]">+253 21 34 17 16</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("contact.emailLabel")}</dt>
                <dd className="mt-1">
                  <a href="mailto:info@gttsgroup.com" className="font-medium text-sky-800 hover:underline">
                    info@gttsgroup.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] md:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[color:var(--color-gt-navy)]">
              {t("contact.formTitle")}
            </h2>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {contactMut.isSuccess && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">
                  {t("contact.success")}
                </p>
              )}
              {contactMut.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
                  {(contactMut.error as Error).message}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {t("contact.firstName")}
                  </label>
                  <input
                    name="firstName"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {t("contact.lastName")}
                  </label>
                  <input
                    name="lastName"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("contact.emailLabel")}</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("contact.phone")}</label>
                <input
                  name="phone"
                  type="tel"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("contact.interestedIn")}</label>
                <select
                  name="service"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">—</option>
                  <option value="Clearance">Clearance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Transit">Transit</option>
                  <option value="Système douanes">{t("contact.svcCustoms")}</option>
                  <option value="Documents">{t("contact.svcDocs")}</option>
                  <option value="Autre">{t("home.serviceOther")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("contact.corridor")}</label>
                <input
                  name="corridor"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  placeholder={t("contact.corridorPh")}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">{t("contact.message")}</label>
                <textarea
                  name="message"
                  rows={4}
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <button
                type="submit"
                disabled={contactMut.isPending}
                className="w-full rounded-lg bg-[color:var(--color-gt-navy)] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
              >
                {contactMut.isPending ? t("contact.submitting") : t("contact.submit")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[color:var(--color-gt-navy-deep)] px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold md:text-2xl">{t("contact.hqFooter")}</h2>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-[color:var(--color-gt-accent-green)]" />
          <ul className="mt-8 space-y-4 text-sm text-white/90">
            <li className="flex gap-3">
              <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[color:var(--color-gt-accent-green)]" />
              {t("footer.address")}
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="shrink-0 text-[color:var(--color-gt-accent-green)]" />
              +253 21 34 17 16
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="shrink-0 text-[color:var(--color-gt-accent-green)]" />
              +253 77 82 18 32
            </li>
            <li className="flex items-center gap-3">
              <FaWhatsapp className="shrink-0 text-[color:var(--color-gt-accent-green)]" />
              +253 77 69 61 30 (WhatsApp)
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="shrink-0 text-[color:var(--color-gt-accent-green)]" />
              <a href="mailto:info@gttsgroup.com" className="hover:underline">
                info@gttsgroup.com
              </a>
            </li>
          </ul>
          <a
            href="https://wa.me/25377696130"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-lg bg-[#1b4332] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 sm:w-auto"
          >
            <FaWhatsapp className="text-lg" />
            {t("contact.whatsappFooter")}
          </a>
        </div>
      </footer>
    </div>
  );
}
