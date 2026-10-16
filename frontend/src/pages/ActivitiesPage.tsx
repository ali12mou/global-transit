import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ActivityZigzagSection, type ActivityBlock } from "@/components/activities/ActivityZigzagSection";
import { apiFetch } from "@/api/client";
import { parseActivityContent, resolveMediaUrl } from "@/lib/parseActivityContent";
import { localizeService } from "@/lib/localizeService";
import { CompanyHighlights, QuoteBanner } from "@/components/home/CompanyHighlights";
import type { TFunction } from "i18next";

type Service = {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  published?: boolean;
};

function mapService(svc: Service, t: TFunction, isFrench: boolean): ActivityBlock {
  const loc = localizeService({ title: svc.title, description: svc.description }, t, isFrench);
  const raw = String(loc.description ?? "").trim();
  const parsed = parseActivityContent(raw);
  return {
    _id: svc._id,
    title: loc.title,
    imageUrl: resolveMediaUrl(String(svc.imageUrl ?? "")),
    intro: parsed.intro || (parsed.bullets.length === 0 ? raw : ""),
    bullets: parsed.bullets,
  };
}

/** Page publique alimentée par Admin → Services (`GET /api/activity-services`, publiés uniquement). */
export function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const isFrench = i18n.resolvedLanguage?.startsWith("fr") ?? false;

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["activity-services-page"],
    queryFn: () => apiFetch<Service[]>("/api/activity-services", { auth: false }),
  });

  const blocks = [...services]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((svc) => mapService(svc, t, isFrench));

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-gold)]">
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

      <CompanyHighlights showWhy={false} />
      <QuoteBanner />
    </div>
  );
}
