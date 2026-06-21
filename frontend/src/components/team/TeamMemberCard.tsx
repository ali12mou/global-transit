import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaEnvelope,
  FaGlobe,
  FaGraduationCap,
  FaUserTie,
  FaWhatsapp,
} from "react-icons/fa";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { buildWhatsAppUrl, digitsFromPhoneDisplay, normalizeWebsiteHref } from "@/lib/contactReply";

export type TeamShowcaseMember = {
  _id: string;
  order?: number;
  title?: string;
  name: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  formation?: string;
  description?: string;
  imageUrl?: string;
  layout?: "standard" | "compact";
};

/** Largeur et ratio image identiques sur accueil et page À propos */
export const TEAM_CARD_WIDTH = "w-[min(100%,360px)] sm:w-[360px]";
export const TEAM_CARD_SHELL =
  "flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 transition duration-300 hover:shadow-[0_20px_50px_rgba(10,22,40,0.12)] hover:ring-slate-300";
export const TEAM_IMAGE_BOX = "relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100";

function ContactAction({
  icon: Icon,
  label,
  href,
  variant,
}: {
  icon: typeof FaWhatsapp;
  label: string;
  href: string;
  variant: "whatsapp" | "email" | "website";
}) {
  const isWa = variant === "whatsapp";
  const isWeb = variant === "website";
  const bg = isWa
    ? "bg-[#25D366]"
    : isWeb
      ? "bg-[color:var(--color-gt-brand-blue)]"
      : "bg-[color:var(--color-gt-navy)]";
  const text = isWa ? "text-emerald-800" : "text-[color:var(--color-gt-blue)]";

  return (
    <a
      href={href}
      target={isWa || isWeb ? "_blank" : undefined}
      rel={isWa || isWeb ? "noopener noreferrer" : undefined}
      className="group/action flex items-center gap-3 rounded-xl py-1 transition hover:opacity-90"
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition group-hover/action:scale-105 ${bg}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span
        className={`min-w-0 break-all text-sm font-semibold leading-snug group-hover/action:underline ${text}`}
        dir="ltr"
      >
        {label}
      </span>
    </a>
  );
}

type Props = {
  member: TeamShowcaseMember;
  /** Active le snap pour le carrousel horizontal */
  snap?: boolean;
  className?: string;
};

export function TeamMemberCard({ member, snap, className = "" }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const role = member.title?.trim() ?? "";
  const name = member.name?.trim() || "—";
  const phone = member.phone?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  const website = member.website?.trim() ?? "";
  const formation = member.formation?.trim() ?? "";
  const description = member.description?.trim() ?? "";
  const waDigits = phone ? digitsFromPhoneDisplay(phone) : null;
  const siteHref = website ? normalizeWebsiteHref(website) : "";
  const longDesc = description.length > 140;

  return (
    <article
      className={`${TEAM_CARD_SHELL} ${TEAM_CARD_WIDTH} shrink-0 ${className}`}
      style={snap ? { scrollSnapAlign: "center" } : undefined}
    >
      <div className={TEAM_IMAGE_BOX}>
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={name}
            className="h-full w-full object-cover object-[center_15%]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <FaUserTie className="h-16 w-16 text-slate-300" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[color:var(--color-gt-navy)]/35 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {role ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
            {role}
          </p>
        ) : (
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">—</p>
        )}
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[color:var(--color-gt-navy)] sm:text-2xl">
          {name}
        </h3>

        <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("about.teamContactHeading")}
          </p>
          {waDigits && phone ? (
            <ContactAction
              icon={FaWhatsapp}
              label={phone}
              href={buildWhatsAppUrl(waDigits)}
              variant="whatsapp"
            />
          ) : (
            <p className="text-xs text-slate-400">{t("home.teamNoPhone")}</p>
          )}
          {email ? (
            <ContactAction icon={FaEnvelope} label={email} href={`mailto:${email}`} variant="email" />
          ) : (
            <p className="text-xs text-slate-400">{t("home.teamNoEmail")}</p>
          )}
          {siteHref ? (
            <ContactAction
              icon={FaGlobe}
              label={website.replace(/^https?:\/\//i, "")}
              href={siteHref}
              variant="website"
            />
          ) : null}
        </div>

        {description ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("about.teamColDescription")}
            </p>
            <p className={`text-sm leading-relaxed text-slate-600 ${longDesc && !expanded ? "line-clamp-3" : ""}`}>
              {description}
            </p>
            {longDesc && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:underline"
              >
                {expanded ? (
                  <>
                    <IoChevronUp className="h-3.5 w-3.5" />
                    {t("about.readLess")}
                  </>
                ) : (
                  <>
                    <IoChevronDown className="h-3.5 w-3.5" />
                    {t("about.readMore")}
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}

        {formation ? (
          <div className="mt-3 rounded-xl border border-[color:var(--color-gt-blue)]/15 bg-[color:var(--color-gt-blue)]/[0.04] p-3">
            <p className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-gt-blue)]">
              <FaGraduationCap className="h-3.5 w-3.5" aria-hidden />
              {t("about.teamColFormation")}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{formation}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TeamMemberCardSkeleton() {
  return (
    <div className={`${TEAM_CARD_WIDTH} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}>
      <div className={`${TEAM_IMAGE_BOX} animate-pulse bg-slate-200`} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}
