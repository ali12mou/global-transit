import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaLinkedin, FaTwitter, FaGlobe, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope, FaCode } from "react-icons/fa";
import { Logo } from "@/components/brand/Logo";
import { buildWhatsAppUrl, COMPANY_WHATSAPP_DIGITS } from "@/lib/contactReply";

/** Crédit de réalisation du site (affiché en bas de page). */
const SITE_DEVELOPER = {
  name: "Ing. Moustapha Mohamed Yacoub",
  phoneDisplay: "+253 77 75 66 38",
  phoneHref: "tel:+25377756638",
} as const;

const linkClass = "text-white/70 transition hover:text-[color:var(--color-gt-gold-bright)]";
const iconClass = "mt-0.5 shrink-0 text-[color:var(--color-gt-gold-bright)]";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(160deg,#032a7a_0%,#021c5c_45%,#010f3a_100%)] text-white">
      <div className="gt-gold-gradient h-1 w-full" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[color:var(--color-gt-gold-bright)]/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr]">
          <div>
            <Logo variant="footer" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.linkedin.com/company/115782426/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-[color:var(--color-gt-gold-bright)] hover:text-[color:var(--color-gt-gold-bright)]"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-[color:var(--color-gt-gold-bright)] hover:text-[color:var(--color-gt-gold-bright)]"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:border-[color:var(--color-gt-gold-bright)] hover:text-[color:var(--color-gt-gold-bright)]"
                aria-label="Site"
              >
                <FaGlobe />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--color-gt-gold-bright)]">
              {t("footer.aboutTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/a-propos" className={linkClass}>
                  {t("footer.company")}
                </Link>
              </li>
              <li>
                <Link to="/equipe" className={linkClass}>
                  {t("footer.team")}
                </Link>
              </li>
              <li>
                <Link to="/actualites" className={linkClass}>
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--color-gt-gold-bright)]">
              {t("footer.activitiesTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>Clearance</li>
              <li>Logistics</li>
              <li>Transit</li>
              <li>Système douanes</li>
              <li>Documents</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--color-gt-gold-bright)]">
              {t("footer.hqTitle")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-3 text-white/80">
                <FaMapMarkerAlt className={iconClass} />
                {t("footer.address")}
              </li>
              <li className="flex gap-3">
                <FaPhone className={iconClass} />
                <a href="tel:+25321341716" className={linkClass} dir="ltr">
                  +253 21 34 17 16
                </a>
              </li>
              <li className="flex gap-3">
                <FaPhone className={iconClass} />
                <a href="tel:+25377821832" className={linkClass} dir="ltr">
                  +253 77 82 18 32
                </a>
              </li>
              <li className="flex gap-3">
                <FaWhatsapp className={iconClass} />
                <a href={buildWhatsAppUrl(COMPANY_WHATSAPP_DIGITS)} target="_blank" rel="noopener noreferrer" className={linkClass} dir="ltr">
                  +253 77 69 61 30 (WhatsApp)
                </a>
              </li>
              <li className="flex gap-3">
                <FaEnvelope className={iconClass} />
                <a href="mailto:info@gttsgroup.com" className={linkClass}>
                  info@gttsgroup.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-xs md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-white/75">{t("footer.copyright", { year })}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/65">
              <FaCode className="text-[color:var(--color-gt-gold-bright)]" aria-hidden />
              <span>{t("footer.builtBy")} :</span>
              <span className="font-semibold text-white">{SITE_DEVELOPER.name}</span>
              <span className="text-white/30" aria-hidden>
                ·
              </span>
              <a
                href={SITE_DEVELOPER.phoneHref}
                className="inline-flex items-center gap-1.5 font-semibold text-[color:var(--color-gt-gold-bright)] hover:underline"
                dir="ltr"
              >
                <FaPhone className="h-3 w-3" aria-hidden />
                {SITE_DEVELOPER.phoneDisplay}
              </a>
              <span className="text-white/30" aria-hidden>
                ·
              </span>
              <a href="https://geosomtech.fr" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                GEOSOM Technologies
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/admin/login" className={linkClass}>
              {t("footer.admin")}
            </Link>
            <span className="text-white/20" aria-hidden>
              |
            </span>
            <a href="#" className={linkClass}>
              {t("footer.privacy")}
            </a>
            <a href="#" className={linkClass}>
              {t("footer.terms")}
            </a>
            <a href="#" className={linkClass}>
              {t("footer.compliance")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
