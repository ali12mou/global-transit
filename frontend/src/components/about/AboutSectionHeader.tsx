type Props = {
  kicker?: string;
  title: string;
  badge?: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
};

export function AboutSectionHeader({
  kicker,
  title,
  badge,
  subtitle,
  align = "left",
  dark = false,
}: Props) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker ? (
        <p
          className={`text-xs font-bold uppercase tracking-[0.28em] ${
            dark ? "text-emerald-200" : "text-[color:var(--color-gt-accent-green)]"
          }`}
        >
          {kicker}
        </p>
      ) : null}
      <div
        className={`mt-3 flex flex-wrap items-end gap-3 ${centered ? "justify-center" : "justify-between"}`}
      >
        <h2
          className={`font-[family-name:var(--font-display)] text-2xl font-bold leading-tight md:text-3xl ${
            dark ? "text-white" : "text-[color:var(--color-gt-navy)]"
          }`}
        >
          {title}
        </h2>
        {badge ? (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              dark
                ? "border border-white/20 bg-white/10 text-emerald-100"
                : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {subtitle ? (
        <p
          className={`mt-3 text-sm leading-relaxed md:text-base ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
      <div
        className={`mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[color:var(--color-gt-navy)] via-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)] ${
          centered ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}
