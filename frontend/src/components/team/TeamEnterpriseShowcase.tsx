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
  fallbackTitle?: string;
  fallbackDescription?: string;
};

function ContactChip({
  href,
  label,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  icon: typeof FaWhatsapp;
  tone: "whatsapp" | "email" | "web";
}) {
  const tones = {
    whatsapp:
      "border-emerald-200/80 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300",
    email: "border-slate-200 bg-white text-[color:var(--color-gt-navy)] hover:bg-slate-50 hover:border-slate-300",
    web: "border-[color:var(--color-gt-blue)]/20 bg-[color:var(--color-gt-blue)]/5 text-[color:var(--color-gt-blue)] hover:bg-[color:var(--color-gt-blue)]/10",
  };
  const iconColors = {
    whatsapp: "text-[#25D366]",
    email: "text-[color:var(--color-gt-accent-green)]",
    web: "text-[color:var(--color-gt-blue)]",
  };

  return (
    <a
      href={href}
      target={tone === "email" ? undefined : "_blank"}
      rel={tone === "email" ? undefined : "noopener noreferrer"}
      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition sm:flex-none sm:justify-start ${tones[tone]}`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${iconColors[tone]}`} aria-hidden />
      <span className="truncate" dir={tone === "email" ? undefined : "ltr"}>
        {label}
      </span>
    </a>
  );
}

function TeamMemberCard({
  member,
  fallbackTitle,
  fallbackDescription,
}: {
  member: TeamShowcaseMember;
  fallbackTitle?: string;
  fallbackDescription?: string;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const role = member.title?.trim() || fallbackTitle || "";
  const description = member.description?.trim() || fallbackDescription?.trim() || "";
  const formation = member.formation?.trim() || "";
  const phone = member.phone?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  const website = member.website?.trim() ?? "";
  const waDigits = phone ? digitsFromPhoneDisplay(phone) : null;
  const siteHref = website ? normalizeWebsiteHref(website) : "";

  const longText = description.length > 220;

  const contacts = [
    waDigits && phone
      ? { key: "wa", href: buildWhatsAppUrl(waDigits), label: phone, icon: FaWhatsapp, tone: "whatsapp" as const }
      : null,
    email ? { key: "mail", href: `mailto:${email}`, label: email, icon: FaEnvelope, tone: "email" as const } : null,
    siteHref
      ? {
          key: "web",
          href: siteHref,
          label: website.replace(/^https?:\/\//i, ""),
          icon: FaGlobe,
          tone: "web" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    icon: typeof FaWhatsapp;
    tone: "whatsapp" | "email" | "web";
  }>;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(10,22,40,0.06)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_40px_rgba(10,22,40,0.1)]">
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-[color:var(--color-gt-navy)] via-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)]" />

      <div className="relative aspect-[4/5] max-h-72 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:max-h-80">
        {member.imageUrl ? (
          <>
            <img
              src={member.imageUrl}
              alt={member.name}
              className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-gt-navy)]/90 via-[color:var(--color-gt-navy)]/25 to-transparent" />
          </>
        ) : (
          <>
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[color:var(--color-gt-navy)]/15 to-[color:var(--color-gt-accent-green)]/15">
              <FaUserTie className="h-20 w-20 text-slate-300" aria-hidden />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-gt-navy)]/85 via-[color:var(--color-gt-navy)]/30 to-transparent" />
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          {role && (
            <span className="mb-2 inline-block rounded-md bg-[color:var(--color-gt-accent-green)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
              {role}
            </span>
          )}
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white drop-shadow-sm">
            {member.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {contacts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contacts.map((c) => (
              <ContactChip key={c.key} href={c.href} label={c.label} icon={c.icon} tone={c.tone} />
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">{t("about.teamNoContact")}</p>
        )}

        {description && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              {t("about.teamColDescription")}
              <span className="h-px flex-1 bg-slate-200" />
            </p>
            <p
              className={`text-sm leading-relaxed text-slate-600 ${longText && !expanded ? "line-clamp-4" : ""}`}
            >
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
        )}

        {formation && (
          <div className="mt-3 rounded-xl border border-[color:var(--color-gt-blue)]/10 bg-[color:var(--color-gt-blue)]/[0.03] p-4">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--color-gt-blue)]">
              <FaGraduationCap className="h-3.5 w-3.5" aria-hidden />
              {t("about.teamColFormation")}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">{formation}</p>
          </div>
        )}

        {!description && !formation && (
          <p className="mt-4 text-sm text-slate-400">—</p>
        )}
      </div>
    </article>
  );
}

export function TeamEnterpriseShowcase({ members, fallbackTitle, fallbackDescription }: Props) {
  const sorted = [...members].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const gridClass =
    sorted.length === 1 ? "mx-auto max-w-md sm:grid-cols-1" : "sm:grid-cols-2";

  return (
    <div className={`grid gap-6 xl:gap-8 ${gridClass}`}>
      {sorted.map((member) => (
        <TeamMemberCard
          key={member._id}
          member={member}
          fallbackTitle={fallbackTitle}
          fallbackDescription={fallbackDescription}
        />
      ))}
    </div>
  );
}
