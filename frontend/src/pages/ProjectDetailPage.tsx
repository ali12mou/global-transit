import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { apiFetch } from "@/api/client";

type Project = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  imageUrl: string;
  featured?: boolean;
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#040a14]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-10 h-12 w-3/4 max-w-xl animate-pulse rounded-lg bg-white/10" />
        <div className="mt-4 h-6 w-full max-w-2xl animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => apiFetch<Project>(`/api/projects/${slug}`, { auth: false }),
    enabled: Boolean(slug),
  });

  const { data: allProjects = [] } = useQuery({
    queryKey: ["projects-page"],
    queryFn: () => apiFetch<Project[]>("/api/projects", { auth: false }),
    enabled: Boolean(project),
  });

  const otherProjects = useMemo(() => {
    if (!slug) return [];
    return allProjects.filter((p) => p.slug !== slug).slice(0, 3);
  }, [allProjects, slug]);

  if (isLoading) {
    return <DetailSkeleton />;
  }
  if (error || !project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24">
        <p className="text-red-700">{t("publicPages.errorLoad")}</p>
        <Link to="/projets" className="mt-4 inline-block text-[color:var(--color-gt-blue)] hover:underline">
          {t("publicPages.backToList")}
        </Link>
      </div>
    );
  }

  const hasBody = Boolean(project.body?.trim());

  return (
    <article className="min-h-screen bg-[#040a14]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 h-[min(68vh,560px)]">
          {project.imageUrl ? (
            <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-[color:var(--color-gt-blue)]/40 to-[#040a14]"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040a14] via-[#0a1628]/88 to-[#0a1628]/45" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.07] via-transparent to-blue-900/20" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-6 md:pb-28 md:pt-10">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/projets"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              {t("publicPages.projectBackToProjects")}
            </Link>
          </div>

          <div className="mt-10 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-amber-400/95 to-transparent md:w-14" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/95">
                {t("publicPages.projectHeroKicker")}
              </span>
              {project.featured ? (
                <span className="rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200/95">
                  {t("publicPages.featured")}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.65rem]">
              {project.title}
            </h1>
            {project.summary ? (
              <p className="mt-5 max-w-3xl border-l-4 border-amber-400/80 py-1 pl-5 text-base leading-relaxed text-slate-300 md:text-lg">
                {project.summary}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-14">
        <div className="mx-auto max-w-3xl rounded-t-3xl bg-white px-4 py-12 shadow-[0_-8px_40px_rgba(0,0,0,0.2)] md:px-10 md:py-14">
          {hasBody ? (
            <div className="space-y-6 text-base leading-[1.8] text-slate-700 md:text-[17px]">
              {project.body.split(/\n\n+/).map((para, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">{t("publicPages.noContent")}</p>
          )}

          <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-gt-blue)] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
            >
              {t("publicPages.projectDiscussCta")}
            </Link>
            <Link
              to="/projets"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[color:var(--color-gt-blue)] hover:underline"
            >
              {t("publicPages.backToList")}
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>

      {otherProjects.length > 0 ? (
        <section className="border-t border-white/10 bg-gradient-to-b from-[#040a14] to-[#050d18] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-gradient-to-r from-amber-400/95 to-transparent" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/95">
                    {t("publicPages.projectsKicker")}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">{t("publicPages.projectExploreMore")}</h2>
              </div>
              <Link
                to="/projets"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400/35 hover:bg-white/10"
              >
                {t("home.seeAllProjects")}
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {otherProjects.map((p, idx) => (
                <Link
                  key={p._id}
                  to={`/projets/${p.slug}`}
                  className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-amber-400/25"
                  style={
                    p.imageUrl
                      ? {
                          backgroundImage: `linear-gradient(to top, rgba(4,10,20,0.92) 0%, rgba(4,10,20,0.4) 45%, rgba(4,10,20,0.12) 100%), url(${p.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          backgroundImage:
                            "linear-gradient(145deg, rgba(12,42,92,0.35) 0%, rgba(4,10,20,0.92) 100%)",
                        }
                  }
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-amber-500/[0.05] opacity-95 transition group-hover:opacity-100" />
                  <div className="relative z-10">
                    <span className="mb-2 inline-flex text-[10px] font-bold tabular-nums tracking-[0.25em] text-amber-400/90">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold leading-snug text-white md:text-xl">{p.title}</h3>
                    {p.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-300">{p.summary}</p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/95 transition group-hover:gap-3">
                      {t("home.projectExplore")}
                      <FaArrowRight className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
