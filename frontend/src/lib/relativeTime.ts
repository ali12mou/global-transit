/** Date dans le passé → libellé relatif (Intl.RelativeTimeFormat). */
export function formatRelativePast(date: Date, locale: string, justNowLabel: string): string {
  const ms = Date.now() - date.getTime();
  if (ms < 0) {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
  }
  const min = Math.floor(ms / 60_000);
  if (min < 1) return justNowLabel;

  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (min < 60) return rtf.format(-min, "minute");
  if (hr < 24) return rtf.format(-hr, "hour");
  if (day < 7) return rtf.format(-day, "day");
  if (week < 5) return rtf.format(-week, "week");
  if (month < 12) return rtf.format(-month, "month");
  return rtf.format(-year, "year");
}
