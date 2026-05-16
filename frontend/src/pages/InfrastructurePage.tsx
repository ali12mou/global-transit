import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FaShip, FaTruck, FaWarehouse } from "react-icons/fa";
import { InfrastructureGallery } from "@/components/infrastructure/InfrastructureGallery";
import { apiFetch } from "@/api/client";

type Infrastructure = { _id: string; name: string; imageUrl?: string; order?: number };

export function InfrastructurePage() {
  const { t } = useTranslation();
  const { data: infrastructures = [], isLoading, error } = useQuery({
    queryKey: ["infrastructure-page"],
    queryFn: () => apiFetch<Infrastructure[]>("/api/infrastructures", { auth: false }),
  });

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-[color:var(--color-gt-navy)] text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.4), transparent 55%), radial-gradient(circle at 80% 30%, rgba(244,114,82,0.35), transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.3fr_1fr] md:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
              {t("publicPages.infrastructureKicker")}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight md:text-6xl">
              {t("publicPages.infrastructureTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200/90 md:text-xl">
              {t("publicPages.infrastructureIntro")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 self-end md:gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <FaWarehouse className="text-2xl text-sky-300" />
              <p className="mt-3 text-3xl font-bold">{infrastructures.length || 0}</p>
              <p className="text-xs uppercase tracking-wider text-slate-300">Assets</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <FaTruck className="text-2xl text-[color:var(--color-gt-coral)]" />
              <p className="mt-3 text-3xl font-bold">24/7</p>
              <p className="text-xs uppercase tracking-wider text-slate-300">Service</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <FaShip className="text-2xl text-emerald-300" />
              <p className="mt-3 text-3xl font-bold">DJ</p>
              <p className="text-xs uppercase tracking-wider text-slate-300">Corridor</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        {isLoading && <p className="text-slate-600">{t("publicPages.loading")}</p>}
        {error && <p className="text-red-700">{t("publicPages.errorLoad")}</p>}
        {!isLoading && !error && infrastructures.length === 0 && (
          <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
        )}
        {!isLoading && !error && infrastructures.length > 0 && (
          <InfrastructureGallery variant="page" items={infrastructures} />
        )}
      </section>
    </div>
  );
}
