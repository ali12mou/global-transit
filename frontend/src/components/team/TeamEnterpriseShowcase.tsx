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
  email?: string;
  website?: string;
  formation?: string;
  description?: string;
  imageUrl?: string;
};

type Props = {
  members: TeamShowcaseMember[];
  /** `home` : cartes compactes (photo, titre, nom, téléphone, email). `about` : fiche complète. */
  variant?: "home" | "about";
};

function ContactRow({
  icon: Icon,
  label,
  href,
  external,
  tone = "default",
}: {
  icon: typeof FaWhatsapp;
  label: string;
  href: string;
  external?: boolean;
  tone?: "whatsapp" | "default";
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition hover:bg-slate-50 ${
        tone === "whatsapp"
          ? "border-emerald-100 bg-emerald-50/60 text-emerald-900 hover:border-emerald-200"
          : "border-slate-200 bg-white text-[color:var(--color-gt-navy)]"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${tone === "whatsapp" ? "text-[#25D366]" : "text-[color:var(--color-gt-accent-green)]"}`}
        aria-hidden
      />
      <span className="min-w-0 break-all font-medium" dir={tone === "whatsapp" ? "ltr" : undefined}>
        {label}
      </span>
    </a>
  );
}

function TeamMemberCard({
  member,
  variant = "about",
}: {
  member: TeamShowcaseMember;
  variant?: "home" | "about";
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isHome = variant === "home";

  const role = member.title?.trim() ?? "";
  const description = member.description?.trim() ?? "";
  const formation = member.formation?.trim() ?? "";
  const phone = member.phone?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  const website = member.website?.trim() ?? "";
  const waDigits = phone ? digitsFromPhoneDisplay(phone) : null;
  const siteHref = website ? normalizeWebsiteHref(website) : "";
  const longText = description.length > (isHome ? 160 : 280);

  const hasContacts = Boolean((waDigits && phone) || email || siteHref);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(10,22,40,0.07)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_14px_44px_rgba(10,22,40,0.12)]">
      <div className="h-1 shrink-0 bg-gradient-to-r from-[color:var(--color-gt-navy)] via-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)]" />

      <div
        className={`relative w-full shrink-0 overflow-hidden bg-slate-200 ${
          isHome ? "h-[300px] sm:h-[320px]" : "h-[340px] sm:h-[380px]"
        }`}
      >
        {member.imageUrl ? (
          <img
            src={member.imageUrl}
            alt={member.name}
            className="h-full w-full object-cover object-[center_20%] transition duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <FaUserTie className="h-24 w-24 text-slate-300" aria-hidden />
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${isHome ? "gap-3 p-5" : "gap-4 p-5 md:p-6"}`}>
        <div className="border-b border-slate-100 pb-3">
          {role ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-gt-accent-green)]">
              {role}
            </p>
          ) : (
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">—</p>
          )}
          <h3
            className={`mt-1 font-[family-name:var(--font-display)] font-bold leading-tight text-[color:var(--color-gt-navy)] ${
              isHome ? "text-xl sm:text-2xl" : "text-2xl"
            }`}
          >
            {member.name}
          </h3>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("about.teamContactHeading")}
          </p>
          {waDigits && phone ? (
            <ContactRow
              icon={FaWhatsapp}
              label={phone}
              href={buildWhatsAppUrl(waDigits)}
              external
              tone="whatsapp"
            />
          ) : isHome ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {t("home.teamNoPhone")}
            </p>
          ) : null}
          {email ? (
            <ContactRow icon={FaEnvelope} label={email} href={`mailto:${email}`} />
          ) : isHome ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {t("home.teamNoEmail")}
            </p>
          ) : null}
          {!isHome && siteHref && (
            <ContactRow
              icon={FaGlobe}
              label={website.replace(/^https?:\/\//i, "")}
              href={siteHref}
              external
            />
          )}
          {!isHome && !hasContacts && (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {t("about.teamNoContact")}
            </p>
          )}
        </div>

        {description && !isHome ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("about.teamColDescription")}
            </p>
            <p className={`text-sm leading-relaxed text-slate-600 ${longText && !expanded ? "line-clamp-5" : ""}`}>
              {description}
            </p>
            {longText && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:underline"
              >
                {expanded ? (
                  <>
                    <IoChevronUp className="h-4 w-4" />
                    {t("about.readLess")}
                  </>
                ) : (
                  <>
                    <IoChevronDown className="h-4 w-4" />
                    {t("about.readMore")}
                  </>
                )}
              </button>
            )}
          </div>
        ) : null}

        {description && isHome ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("about.teamColDescription")}
            </p>
            <p className={`text-sm leading-relaxed text-slate-600 ${longText && !expanded ? "line-clamp-3" : ""}`}>
              {description}
            </p>
            {longText && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:underline"
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

        {formation && !isHome ? (
          <div className="rounded-xl border border-[color:var(--color-gt-blue)]/15 bg-[color:var(--color-gt-blue)]/[0.04] p-4">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-gt-blue)]">
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

export function TeamEnterpriseShowcase({ members, variant = "about" }: Props) {
  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const isHome = variant === "home";
  const gridClass =
    sorted.length === 1
      ? "mx-auto max-w-lg"
      : isHome
        ? "sm:grid-cols-2 xl:grid-cols-2"
        : "sm:grid-cols-2";

  return (
    <div className={`grid gap-6 md:gap-8 ${gridClass}`}>
      {sorted.map((member) => (
        <TeamMemberCard key={member._id} member={member} variant={variant} />
      ))}
    </div>
  );
}
