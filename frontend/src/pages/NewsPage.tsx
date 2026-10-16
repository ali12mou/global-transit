import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaRegCommentDots } from "react-icons/fa";
import { apiFetch } from "@/api/client";
import { formatRelativePast } from "@/lib/relativeTime";
import { NewsEngagement } from "@/components/news/NewsEngagement";

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  imageUrl: string;
  publishedAt?: string;
  views?: number;
  likes?: number;
};

function estimateReadMinutes(body: string, excerpt: string): number {
  const words = `${excerpt} ${body}`.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm sm:rounded-2xl"
        >
          <div className="animate-pulse p-4 sm:p-5">
            <div className="flex gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200 sm:h-12 sm:w-12" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-36 rounded bg-slate-200 sm:w-40" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
            </div>
            <div className="mt-4 h-5 w-full max-w-lg rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-100" />
            <div className="mt-4 aspect-[4/3] w-full rounded-lg bg-slate-200 sm:aspect-[16/9]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PublisherAvatar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-gt-blue)] to-[#0a1628] text-xs font-bold tracking-tight text-white shadow-md ring-2 ring-white sm:h-12 sm:w-12 sm:text-sm ${className}`}
      aria-hidden
    >
      GT
    </div>
  );
}

function SidebarCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-5 xl:sticky xl:top-24 xl:p-6 2xl:top-28">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <PublisherAvatar />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{t("brand.line1")}</p>
          <p className="text-xs text-slate-500">{t("brand.line2")}</p>
        </div>
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--color-gt-navy)] sm:text-lg">
        {t("publicPages.newsSidebarTitle")}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("publicPages.newsSidebarBody")}</p>
    </div>
  );
}

export function NewsPage() {
  const { t, i18n } = useTranslation();
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["news-page"],
    queryFn: () => apiFetch<NewsItem[]>("/api/news", { auth: false }),
  });

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <div className="relative border-l-4 border-[color:var(--color-gt-gold)] py-8 pl-4 sm:py-10 sm:pl-6 md:py-12 md:pl-8 lg:py-14 xl:py-16 xl:pl-10 2xl:pl-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 sm:text-[11px] sm:tracking-[0.28em]">
              {t("publicPages.newsKicker")}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[color:var(--color-gt-navy)] sm:text-3xl md:text-4xl xl:text-[2.5rem] 2xl:text-[2.75rem] 2xl:leading-tight">
              {t("publicPages.newsTitle")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px] md:text-base 2xl:max-w-3xl 2xl:text-lg">
              {t("publicPages.newsIntro")}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1920px] px-3 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-14 2xl:px-16 2xl:py-16">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-center xl:gap-10 2xl:gap-14">
          <div className="min-w-0 w-full xl:flex-1 xl:max-w-[min(100%,720px)] 2xl:max-w-[min(100%,800px)]">
            {isLoading && <FeedSkeleton />}
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800 sm:text-base">
                {t("publicPages.errorLoad")}
              </p>
            )}
            {!isLoading && !error && items.length === 0 && (
              <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-12 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:px-8 sm:py-16 md:px-10">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/80">
                    <FaRegCommentDots className="text-2xl text-slate-400" aria-hidden />
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--color-gt-navy)] sm:text-2xl">
                    {t("publicPages.newsEmptyTitle")}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{t("publicPages.newsEmptyBody")}</p>
                  <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-950/90 sm:text-sm">
                    {t("publicPages.newsEmptyHint")}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && items.length > 0 && (
              <div className="flex flex-col gap-3 sm:gap-4">
                {items.map((n) => {
                  const published = n.publishedAt ? new Date(n.publishedAt) : undefined;
                  const rel =
                    published != null
                      ? formatRelativePast(published, i18n.language, t("publicPages.justNow"))
                      : "";
                  const mins = estimateReadMinutes(n.body ?? "", n.excerpt);

                  return (
                    <article
                      key={n._id}
                      className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:rounded-2xl"
                    >
                      <div className="p-4 pb-3 sm:p-5 sm:pb-4 md:p-6">
                        <div className="flex gap-3 sm:gap-4">
                          <PublisherAvatar />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{t("brand.line1")}</p>
                                <p className="text-xs font-medium text-slate-500">{t("brand.line2")}</p>
                              </div>
                              {rel && (
                                <time dateTime={n.publishedAt} className="shrink-0 text-[11px] text-slate-400 sm:text-xs">
                                  {rel}
                                </time>
                              )}
                            </div>
                            <p className="mt-2 text-[10px] text-slate-400 sm:mt-3 sm:text-[11px]">
                              {t("publicPages.newsPublisherRole")} · {mins} {t("publicPages.minRead")}
                            </p>
                          </div>
                        </div>

                        <Link to={`/actualites/${encodeURIComponent(n.slug)}`} className="group mt-4 block">
                          <h2 className="text-[1.05rem] font-semibold leading-snug text-slate-900 transition group-hover:text-[color:var(--color-gt-blue)] sm:text-lg md:text-[1.15rem]">
                            {n.title}
                          </h2>
                          {n.excerpt && (
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-[15px] md:line-clamp-4">
                              {n.excerpt}
                            </p>
                          )}
                        </Link>
                      </div>

                      {n.imageUrl ? (
                        <Link to={`/actualites/${encodeURIComponent(n.slug)}`} className="block">
                          <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-[16/9] md:aspect-[1.85/1] xl:aspect-[2.1/1]">
                            <img
                              src={n.imageUrl}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </div>
                        </Link>
                      ) : null}

                      <div className="space-y-3 border-t border-slate-100 px-4 py-3 sm:px-5 md:px-6 md:py-4">
                        <NewsEngagement slug={n.slug} title={n.title} likes={n.likes} views={n.views} />
                        <div className="flex justify-end">
                          <Link
                            to={`/actualites/${encodeURIComponent(n.slug)}`}
                            className="min-h-[44px] min-w-[44px] content-center text-sm font-semibold text-[color:var(--color-gt-blue)] transition hover:underline sm:min-h-0 sm:min-w-0"
                          >
                            {t("publicPages.readMore")} →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 xl:w-[min(100%,320px)] 2xl:w-[min(100%,380px)]">
            <SidebarCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
