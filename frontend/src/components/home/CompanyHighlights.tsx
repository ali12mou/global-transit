import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";
import {
  IoArrowForward,
  IoBoatOutline,
  IoChatbubblesOutline,
  IoCheckmarkDoneOutline,
  IoDocumentTextOutline,
  IoFlagOutline,
  IoMapOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
} from "react-icons/io5";
import { buildWhatsAppUrl, COMPANY_WHATSAPP_DIGITS } from "@/lib/contactReply";
import { yearsOfExperience } from "@/lib/companyYears";

const STEPS: { Icon: IconType; key: string }[] = [
  { Icon: IoChatbubblesOutline, key: "step1" },
  { Icon: IoDocumentTextOutline, key: "step2" },
  { Icon: IoShieldCheckmarkOutline, key: "step3" },
  { Icon: IoBoatOutline, key: "step4" },
  { Icon: IoFlagOutline, key: "step5" },
];

const REASONS: { Icon: IconType; key: string }[] = [
  { Icon: IoMapOutline, key: "why1" },
  { Icon: IoCheckmarkDoneOutline, key: "why2" },
  { Icon: IoSpeedometerOutline, key: "why3" },
  { Icon: IoPeopleOutline, key: "why4" },
];

/** Notre méthode (5 étapes) + pourquoi nous choisir + appel à l'action devis. */
export function CompanyHighlights({ showProcess = true, showWhy = true }: { showProcess?: boolean; showWhy?: boolean }) {
  const { t, i18n } = useTranslation();
  const whatsapp = useMemo(() => buildWhatsAppUrl(COMPANY_WHATSAPP_DIGITS, t("contact.whatsappPrefilledMessage")), [t, i18n.language]);

  return (
    <>
      {showProcess && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-gold)]">{t("highlights.processKicker")}</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
                {t("highlights.processTitle")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{t("highlights.processIntro")}</p>
            </div>
            <ol className="relative mt-14 grid gap-6 md:grid-cols-5 md:gap-4">
              <span
                className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-0.5 bg-[repeating-linear-gradient(90deg,#e3bf34_0_10px,transparent_10px_18px)] md:block"
                aria-hidden
              />
              {STEPS.map(({ Icon, key }, i) => (
                <li key={key} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="gt-brand-blue-bg relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-blue-900/20 ring-4 ring-white">
                    <Icon className="h-7 w-7" aria-hidden />
                    <span className="gt-gold-gradient absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-[color:var(--color-gt-navy-deep)] ring-2 ring-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="md:mt-5">
                    <h3 className="font-semibold text-[color:var(--color-gt-navy)]">{t(`highlights.${key}Title`)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`highlights.${key}Text`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {showWhy && (
        <section className="relative overflow-hidden bg-[linear-gradient(160deg,#04307f_0%,#021a55_60%,#010f3a_100%)] py-16 text-white md:py-24">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[color:var(--color-gt-gold-bright)]/10 blur-3xl" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-gold-bright)]">{t("highlights.whyKicker")}</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight md:text-4xl">{t("highlights.whyTitle")}</h2>
              <p className="mt-5 text-base leading-relaxed text-white/75">{t("highlights.whyIntro")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="gt-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-[color:var(--color-gt-navy-deep)] shadow-lg shadow-black/25 transition hover:-translate-y-0.5"
                >
                  {t("highlights.ctaQuote")}
                  <IoArrowForward className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <FaWhatsapp className="h-5 w-5 text-[#25d366]" aria-hidden />
                  {t("highlights.ctaWhatsapp")}
                </a>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {REASONS.map(({ Icon, key }) => (
                <li key={key} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition hover:bg-white/[0.1]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-gt-gold-bright)]/15 text-[color:var(--color-gt-gold-bright)]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold">{t(`highlights.${key}Title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{t(`highlights.${key}Text`, { years: yearsOfExperience() })}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

/** Bandeau final « Demander un devis ». */
export function QuoteBanner() {
  const { t, i18n } = useTranslation();
  const whatsapp = useMemo(() => buildWhatsAppUrl(COMPANY_WHATSAPP_DIGITS, t("contact.whatsappPrefilledMessage")), [t, i18n.language]);
  return (
    <section className="bg-[#f3f6fb] py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0a4fc4_0%,#043994_45%,#021a55_100%)] px-6 py-10 text-white shadow-[0_30px_60px_-30px_rgba(1,15,58,0.6)] md:flex md:items-center md:justify-between md:gap-10 md:px-12">
          <div className="gt-gold-gradient absolute inset-y-0 left-0 w-1.5" aria-hidden />
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">{t("highlights.ctaTitle")}</h2>
            <p className="mt-2 max-w-2xl text-white/80">{t("highlights.ctaText")}</p>
          </div>
          <div className="mt-6 flex shrink-0 flex-wrap gap-3 md:mt-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[color:var(--color-gt-brand-blue)] transition hover:-translate-y-0.5"
            >
              {t("highlights.ctaQuote")}
              <IoArrowForward className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <FaWhatsapp className="h-5 w-5" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
