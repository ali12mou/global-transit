/** Numéro WhatsApp entreprise (sans +), utilisé pour les liens wa.me côté site public. */
export const COMPANY_WHATSAPP_DIGITS = "25377696130";

/** Extrait un numéro exploitable pour wa.me à partir du texte du message (formulaire contact). */
export function extractPhoneDigitsFromMessage(message: string): string | null {
  if (!message?.trim()) return null;
  const lines = message.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(
      /(?:Téléphone|Phone|Tel|WhatsApp|Téléphone\s*:|Phone\s*:|Tel\s*:)\s*([+0-9\s().-]+)/im
    );
    if (m?.[1]) {
      const digits = m[1].replace(/\D/g, "");
      if (digits.length >= 8) return normalizeDjiboutiWhatsAppDigits(digits);
    }
  }
  const any = message.match(/(?:\+?253|253)?\s*(7[0-9]{7})/);
  if (any?.[1]) {
    const d = any[1].replace(/\D/g, "");
    if (d.length === 8) return `253${d}`;
  }
  return null;
}

export function normalizeDjiboutiWhatsAppDigits(digits: string): string {
  if (digits.startsWith("253")) return digits;
  if (digits.length === 9 && digits.startsWith("77")) return `253${digits}`;
  if (digits.length === 8 && digits.startsWith("77")) return `253${digits}`;
  return digits;
}

/** Numéro affiché → chiffres pour wa.me (null si trop court). */
export function digitsFromPhoneDisplay(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return normalizeDjiboutiWhatsAppDigits(digits);
}

export function normalizeWebsiteHref(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function buildWhatsAppUrl(phoneDigits: string, prefilledBody?: string): string {
  const q = prefilledBody ? `?text=${encodeURIComponent(prefilledBody)}` : "";
  return `https://wa.me/${phoneDigits}${q}`;
}

export function buildMailtoReply(email: string, fullName: string, subjectPrefix = "Global Transit"): string {
  const subject = encodeURIComponent(`Re: ${subjectPrefix} — ${fullName}`);
  const body = encodeURIComponent(
    `Bonjour ${fullName},\n\n\n\n—\n${subjectPrefix}`
  );
  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}
