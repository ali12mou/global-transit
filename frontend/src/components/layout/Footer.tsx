import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaLinkedin, FaTwitter, FaGlobe, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[color:var(--color-gt-navy-deep)] text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{t("footer.tagline")}</p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.linkedin.com/company/115782426/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10"
                aria-label="Site"
              >
                <FaGlobe />
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white">{t("footer.aboutTitle")}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/a-propos" className="text-slate-400 hover:text-white">
                  {t("footer.company")}
                </Link>
              </li>
              <li>
                <Link to="/a-propos#equipe" className="text-slate-400 hover:text-white">
                  {t("footer.team")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white">{t("footer.activitiesTitle")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Clearance</li>
              <li>Logistics</li>
              <li>Transit</li>
              <li>Système douanes</li>
              <li>Documents</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg text-white">{t("footer.hqTitle")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2 text-slate-300">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[color:var(--color-gt-accent-green)]" />
                {t("footer.address")}
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <FaPhone className="text-[color:var(--color-gt-accent-green)]" />
                +253 21 34 17 16
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <FaPhone className="text-[color:var(--color-gt-accent-green)]" />
                +253 77 82 18 32
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <FaWhatsapp className="text-[color:var(--color-gt-accent-green)]" />
                +253 77 69 61 30 (WhatsApp)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <FaEnvelope className="text-[color:var(--color-gt-accent-green)]" />
                info@gttsgroup.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p>{t("footer.copyright", { year })}</p>
            <p className="mt-1">
              {t("footer.developedBy")}{" "}
              <a href="https://geosomtech.fr" className="text-[color:var(--color-gt-accent-green)] hover:underline">
                geosomtech.fr
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[color:var(--color-gt-accent-green)]">
            <Link to="/admin/login" className="hover:underline">
              {t("footer.admin")}
            </Link>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:underline">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:underline">
              {t("footer.terms")}
            </a>
            <a href="#" className="hover:underline">
              {t("footer.compliance")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
