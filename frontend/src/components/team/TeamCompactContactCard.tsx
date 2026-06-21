import { FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl, digitsFromPhoneDisplay } from "@/lib/contactReply";
import type { TeamShowcaseMember } from "@/components/team/TeamMemberCard";

type Props = {
  member: TeamShowcaseMember;
  className?: string;
};

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof FaPhone;
  value: string;
  href?: string;
}) {
  const row = (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-gt-accent-orange)]" aria-hidden />
      <span className="text-sm text-slate-700" dir="ltr">
        {value}
      </span>
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="transition hover:text-[color:var(--color-gt-brand-blue)] hover:underline"
      >
        {row}
      </a>
    );
  }

  return row;
}

/** Carte contact direction — texte centré, bordure fine, icônes orange. */
export function TeamCompactContactCard({ member, className = "" }: Props) {
  const name = member.name?.trim() || "—";
  const role = member.title?.trim() ?? "";
  const phone = member.phone?.trim() ?? "";
  const fax = member.fax?.trim() ?? "";
  const email = member.email?.trim() ?? "";
  const waDigits = phone ? digitsFromPhoneDisplay(phone) : null;

  return (
    <article
      className={`flex min-h-[200px] flex-col rounded-sm border border-slate-300 bg-white px-4 py-6 text-center shadow-sm ${className}`}
    >
      <h3 className="font-[family-name:var(--font-display)] text-base font-bold leading-snug text-[color:var(--color-gt-brand-blue)] md:text-[17px]">
        {name}
      </h3>
      {role ? <p className="mt-1.5 text-sm text-slate-500">{role}</p> : null}

      <div className="mt-5 flex flex-1 flex-col items-center justify-end gap-2">
        {phone ? (
          <ContactRow
            icon={waDigits ? FaWhatsapp : FaPhone}
            value={phone}
            href={waDigits ? buildWhatsAppUrl(waDigits) : `tel:${phone.replace(/\s/g, "")}`}
          />
        ) : null}
        {fax ? (
          <ContactRow icon={FaPhone} value={fax} href={`tel:${fax.replace(/\s/g, "")}`} />
        ) : null}
        {email ? (
          <ContactRow icon={FaEnvelope} value={email} href={`mailto:${email}`} />
        ) : null}
      </div>
    </article>
  );
}
