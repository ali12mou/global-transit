import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/api/client";

type Client = { _id: string; name: string; logoUrl: string; url?: string; order: number };

export function ClientsPage() {
  const { t } = useTranslation();
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ["clients-page"],
    queryFn: () => apiFetch<Client[]>("/api/clients", { auth: false }),
  });

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[color:var(--color-gt-blue)]">
          {t("publicPages.clientsKicker")}
        </p>
        <h1 className="mt-3 text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
          {t("publicPages.clientsTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">{t("publicPages.clientsIntro")}</p>

        <div className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm md:p-12">
          {isLoading && <p className="text-center text-slate-600">{t("publicPages.loading")}</p>}
          {error && <p className="text-center text-red-700">{t("publicPages.errorLoad")}</p>}
          {!isLoading && !error && clients.length === 0 && (
            <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
          )}
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {clients.map((c) => (
              <li key={c._id}>
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center transition hover:border-slate-200 hover:bg-white hover:shadow-md">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt={c.name} className="max-h-14 max-w-full object-contain" />
                  ) : (
                    <span className="text-sm font-semibold text-[color:var(--color-gt-navy)]">{c.name}</span>
                  )}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-xs font-medium text-sky-800 hover:underline"
                    >
                      {t("publicPages.visitSite")}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
