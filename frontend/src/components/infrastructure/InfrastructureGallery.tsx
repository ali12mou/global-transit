import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";

export type InfrastructureItem = {
  _id: string;
  name: string;
  imageUrl?: string;
  order?: number;
};

const IMAGE_BOX = "relative aspect-[4/3] w-full overflow-hidden bg-slate-100";

function InfrastructureCard({
  item,
  className = "",
  hideName = false,
}: {
  item: InfrastructureItem;
  className?: string;
  hideName?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(10,22,40,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(10,22,40,0.1)] ${className}`}
    >
      <div className="h-1 shrink-0 bg-gradient-to-r from-[color:var(--color-gt-navy)] via-[color:var(--color-gt-accent-green)] to-[color:var(--color-gt-blue)]" />
      <div className={IMAGE_BOX}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name?.trim() || t("home.imagePlaceholder")}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <FaWarehouse className="h-12 w-12 text-slate-300" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--color-gt-navy)]/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      {!hideName && (
        <div className="flex min-h-[4.5rem] flex-1 items-center justify-center border-t border-slate-100 px-4 py-3 text-center">
          <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-semibold leading-snug text-[color:var(--color-gt-navy)]">
            {item.name?.trim() || t("home.imagePlaceholder")}
          </h3>
        </div>
      )}
    </article>
  );
}

function MarqueeTrack({
  items,
  durationSec,
  renderCard,
}: {
  items: InfrastructureItem[];
  durationSec: number;
  renderCard: (item: InfrastructureItem) => ReactNode;
}) {
  const loopItems = [...items, ...items];
  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <div
        className="gt-logo-marquee items-stretch"
        style={{ ["--gt-marquee-duration" as string]: `${durationSec}s` }}
      >
        {loopItems.map((item, idx) => (
          <div key={`${item._id}-${idx}`} className="mx-3 w-[280px] shrink-0 sm:w-[300px]">
            {renderCard(item)}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 to-transparent md:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent md:w-20" />
    </div>
  );
}

type HomeProps = {
  variant: "home";
  items: InfrastructureItem[];
  kicker: string;
  title: string;
  emptyText: string;
  viewAllLabel?: string;
};

type PageProps = {
  variant: "page";
  items: InfrastructureItem[];
};

type Props = HomeProps | PageProps;

export function InfrastructureGallery(props: Props) {
  const { t } = useTranslation();
  const sorted = [...props.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (props.variant === "page") {
    if (sorted.length === 0) return null;
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item) => (
          <InfrastructureCard key={item._id} item={item} className="h-full" />
        ))}
      </div>
    );
  }

  const { kicker, title, emptyText, viewAllLabel } = props;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(12,42,92,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(12,42,92,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.28em] text-[color:var(--color-gt-accent-green)]">
            {kicker}
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
            {title}
          </h2>
        </div>

        <div className="mt-12">
          {sorted.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
              {emptyText}
            </p>
          ) : (
            <MarqueeTrack
              items={sorted}
              durationSec={32}
              renderCard={(item) => (
                <InfrastructureCard item={item} className="h-full" hideName />
              )}
            />
          )}
        </div>

        {sorted.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/infrastructures"
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-gt-blue)]/30 bg-white px-6 py-2.5 text-sm font-semibold text-[color:var(--color-gt-blue)] shadow-sm transition hover:bg-[color:var(--color-gt-blue)] hover:text-white"
            >
              {viewAllLabel ?? t("home.infrastructureViewAll")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
