import { FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl, digitsFromPhoneDisplay, normalizeWebsiteHref } from "@/lib/contactReply";

type Props = {
  phone?: string;
  email?: string;
  website?: string;
  compact?: boolean;
};

export function TeamContactLinks({ phone, email, website, compact }: Props) {
  const phoneTrim = phone?.trim() ?? "";
  const emailTrim = email?.trim() ?? "";
  const websiteTrim = website?.trim() ?? "";
  const waDigits = phoneTrim ? digitsFromPhoneDisplay(phoneTrim) : null;
  const waUrl = waDigits ? buildWhatsAppUrl(waDigits) : null;
  const siteHref = websiteTrim ? normalizeWebsiteHref(websiteTrim) : "";

  if (!phoneTrim && !emailTrim && !websiteTrim) {
    return <span className="text-slate-400">—</span>;
  }

  const gap = compact ? "gap-1" : "gap-1.5";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col ${gap} ${textSize}`}>
      {phoneTrim &&
        (waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-[#128C7E] hover:text-[#075E54] hover:underline"
            title="WhatsApp"
          >
            <FaWhatsapp className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden />
            <span dir="ltr">{phoneTrim}</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-slate-600" dir="ltr">
            <FaWhatsapp className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            {phoneTrim}
          </span>
        ))}
      {emailTrim && (
        <a
          href={`mailto:${emailTrim}`}
          className="inline-flex items-center gap-1.5 break-all text-[color:var(--color-gt-blue)] hover:underline"
        >
          <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-gt-accent-green)]" aria-hidden />
          {emailTrim}
        </a>
      )}
      {siteHref && (
        <a
          href={siteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 break-all text-[color:var(--color-gt-blue)] hover:underline"
        >
          <FaGlobe className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-gt-accent-green)]" aria-hidden />
          {websiteTrim.replace(/^https?:\/\//i, "")}
        </a>
      )}
    </div>
  );
}
