import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { apiFetch } from "@/api/client";

type Project = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  featured?: boolean;
};

export function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ["projects-page"],
    queryFn: () => apiFetch<Project[]>("/api/projects", { auth: false }),
  });

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800">
            {t("publicPages.projectsKicker")}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
            {t("publicPages.projectsTitle")}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{t("publicPages.projectsIntro")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        {isLoading && <p className="text-slate-600">{t("publicPages.loading")}</p>}
        {error && <p className="text-red-700">{t("publicPages.errorLoad")}</p>}
        {!isLoading && !error && projects.length === 0 && (
          <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
        )}
        <div className="grid gap-10 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p._id}
              to={`/projets/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] bg-slate-100">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400">
                    Global Transit
                  </div>
                )}
                {p.featured && (
                  <span className="absolute start-4 top-4 rounded-full bg-[color:var(--color-gt-coral)] px-3 py-1 text-xs font-bold text-white">
                    {t("publicPages.featured")}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--color-gt-navy)] group-hover:text-[color:var(--color-gt-blue)] md:text-2xl">
                  {p.title}
                </h2>
                {p.summary && <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{p.summary}</p>}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-gt-blue)]">
                  {t("publicPages.viewProject")}
                  <FaArrowRight className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
