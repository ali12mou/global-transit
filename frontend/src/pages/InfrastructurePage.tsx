import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/api/client";

type Infrastructure = { _id: string; name: string; imageUrl?: string; order?: number };

export function InfrastructurePage() {
  const { t } = useTranslation();
  const { data: infrastructures = [], isLoading, error } = useQuery({
    queryKey: ["infrastructure-page"],
    queryFn: () => apiFetch<Infrastructure[]>("/api/infrastructures", { auth: false }),
  });

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-gt-blue)]">
          {t("publicPages.infrastructureKicker")}
        </p>
        <h1 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
          {t("publicPages.infrastructureTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          {t("publicPages.infrastructureIntro")}
        </p>

        <div className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm md:p-12">
          {isLoading && <p className="text-center text-slate-600">{t("publicPages.loading")}</p>}
          {error && <p className="text-center text-red-700">{t("publicPages.errorLoad")}</p>}
          {!isLoading && !error && infrastructures.length === 0 && (
            <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
          )}
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {infrastructures.map((item) => (
              <li key={item._id}>
                <article className="flex h-full min-h-[250px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        {t("home.imagePlaceholder")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 p-5">
                    <h3 className="line-clamp-2 break-words font-[family-name:var(--font-display)] text-xl text-[color:var(--color-gt-navy)]">
                      {item.name}
                    </h3>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
