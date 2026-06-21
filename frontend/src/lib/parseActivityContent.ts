export type ActivityBullet = { label: string; text: string };

/** Parse le contenu admin : paragraphe d’intro puis lignes « **Titre:** description » ou « Titre|description ». */
export function parseActivityContent(raw: string): { intro: string; bullets: ActivityBullet[] } {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const introParts: string[] = [];
  const bullets: ActivityBullet[] = [];

  for (const line of lines) {
    const boldColon = line.match(/^(?:[-*•]\s*)?\*\*(.+?)\*\*:\s*(.+)$/);
    if (boldColon) {
      bullets.push({ label: boldColon[1]!.trim(), text: boldColon[2]!.trim() });
      continue;
    }

    const plainColon = line.match(/^(?:[-*•]\s*)(.+?):\s*(.+)$/);
    if (plainColon && plainColon[1]!.length < 80) {
      bullets.push({ label: plainColon[1]!.replace(/^\*\*|\*\*$/g, "").trim(), text: plainColon[2]!.trim() });
      continue;
    }

    const pipe = line.match(/^(?:[-*•]\s*)?(.+?)\|(.+)$/);
    if (pipe) {
      bullets.push({
        label: pipe[1]!.replace(/^\*\*|\*\*$/g, "").trim(),
        text: pipe[2]!.trim(),
      });
      continue;
    }

    if (bullets.length === 0) {
      introParts.push(line);
    }
  }

  return { intro: introParts.join(" "), bullets };
}

export function resolveMediaUrl(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) return t;
  return `/uploads/${t.replace(/^\/+/, "")}`;
}
