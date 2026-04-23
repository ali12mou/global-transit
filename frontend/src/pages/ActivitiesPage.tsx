import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { apiFetch } from "@/api/client";

type Service = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

export function ActivitiesPage() {
  const { t } = useTranslation();
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["activity-services-page"],
    queryFn: () => apiFetch<Service[]>("/api/activity-services", { auth: false }),
  });

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-accent-green)]">
            {t("publicPages.activitiesKicker")}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
            {t("publicPages.activitiesTitle")}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{t("publicPages.activitiesIntro")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        {isLoading && <p className="text-slate-600">{t("publicPages.loading")}</p>}
        {error && <p className="text-red-700">{t("publicPages.errorLoad")}</p>}
        {!isLoading && !error && services.length === 0 && (
          <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
        )}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <article
              key={s._id}
              className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">—</div>
                )}
                <span className="absolute bottom-3 end-3 rounded-md bg-[color:var(--color-gt-navy)]/90 px-2 py-1 text-xs font-bold text-white">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--color-gt-navy)]">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            to="/contact"
            className="inline-flex rounded-full bg-[color:var(--color-gt-blue)] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            {t("contact.formTitle")}
          </Link>
        </div>
      </section>
    </div>
  );
}
