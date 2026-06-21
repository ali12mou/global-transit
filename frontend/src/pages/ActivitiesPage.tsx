import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ActivityZigzagSection, type ActivityBlock } from "@/components/activities/ActivityZigzagSection";
import { apiFetch } from "@/api/client";
import { parseActivityContent, resolveMediaUrl } from "@/lib/parseActivityContent";

type Service = {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  published?: boolean;
};

function mapService(svc: Service): ActivityBlock {
  const raw = String(svc.description ?? "").trim();
  const parsed = parseActivityContent(raw);
  return {
    _id: svc._id,
    title: svc.title,
    imageUrl: resolveMediaUrl(String(svc.imageUrl ?? "")),
    intro: parsed.intro || (parsed.bullets.length === 0 ? raw : ""),
    bullets: parsed.bullets,
  };
}

/** Page publique alimentée par Admin → Services (`GET /api/activity-services`, publiés uniquement). */
export function ActivitiesPage() {
  const { t } = useTranslation();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["activity-services-page"],
    queryFn: () => apiFetch<Service[]>("/api/activity-services", { auth: false }),
  });

  const blocks = [...services]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapService);

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-orange)]">
            {t("publicPages.activitiesKicker")}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
            {t("publicPages.activitiesTitle")}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {t("publicPages.activitiesIntro")}
          </p>
        </div>
      </section>

      {isLoading && (
        <p className="px-6 py-16 text-center text-slate-600">{t("publicPages.loading")}</p>
      )}
      {error && (
        <p className="px-6 py-16 text-center text-red-700">{t("publicPages.errorLoad")}</p>
      )}
      {!isLoading && !error && blocks.length === 0 && (
        <p className="px-6 py-16 text-center text-slate-500">{t("publicPages.activitiesEmpty")}</p>
      )}

      {blocks.map((block, idx) => (
        <ActivityZigzagSection key={block._id} block={block} imageLeft={idx % 2 === 0} />
      ))}

      {!isLoading && blocks.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-14">
          <div className="mx-auto flex max-w-6xl justify-center px-6">
            <Link
              to="/contact"
              className="inline-flex rounded-full bg-[color:var(--color-gt-brand-blue)] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              {t("contact.formTitle")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
