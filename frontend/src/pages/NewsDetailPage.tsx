import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaRegClock } from "react-icons/fa";
import { apiFetch } from "@/api/client";
import { formatRelativePast } from "@/lib/relativeTime";

type NewsDoc = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  imageUrl: string;
  publishedAt?: string;
};

function PublisherAvatar() {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--color-gt-blue)] to-[#0a1628] text-sm font-bold tracking-tight text-white shadow-md ring-2 ring-white sm:h-14 sm:w-16 sm:text-base"
      aria-hidden
    >
      GT
    </div>
  );
}

const shellPx = "px-3 sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16";
const articleMax =
  "mx-auto w-full max-w-[min(100%,48rem)] xl:max-w-[min(100%,52rem)] 2xl:max-w-[min(100%,56rem)]";
const imageMax =
  "mx-auto w-full max-w-[min(100%,56rem)] xl:max-w-[min(100%,60rem)] 2xl:max-w-[min(100%,64rem)]";

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news", slug],
    queryFn: () => apiFetch<NewsDoc>(`/api/news/${encodeURIComponent(slug ?? "")}`, { auth: false }),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <div className={`mx-auto w-full max-w-[1920px] ${shellPx} py-16 sm:py-20 md:py-24`}>
          <div className={`${articleMax} animate-pulse space-y-4 rounded-xl border border-slate-200 bg-white p-6 sm:rounded-2xl sm:p-8 md:p-10`}>
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-10 w-full max-w-lg rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !article) {
    return (
      <div className={`mx-auto w-full max-w-[1920px] ${shellPx} py-16 sm:py-20`}>
        <div className={articleMax}>
          <p className="text-red-700">{t("publicPages.errorLoad")}</p>
          <Link to="/actualites" className="mt-4 inline-block text-[color:var(--color-gt-blue)] hover:underline">
            {t("publicPages.backToList")}
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(i18n.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const rel =
    article.publishedAt != null
      ? formatRelativePast(new Date(article.publishedAt), i18n.language, t("publicPages.justNow"))
      : "";

  return (
    <article className="min-h-screen bg-[#f3f2ef] pb-12 sm:pb-16 md:pb-20">
      <div className="border-b border-slate-200/80 bg-white">
        <div className={`mx-auto w-full max-w-[1920px] ${shellPx} py-4 sm:py-5 md:py-6`}>
          <div className={articleMax}>
            <Link
              to="/actualites"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[color:var(--color-gt-blue)] hover:underline sm:min-h-0"
            >
              <FaArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t("publicPages.backToList")}
            </Link>
          </div>
        </div>
      </div>

      <div className={`mx-auto w-full max-w-[1920px] ${shellPx} pt-6 sm:pt-8 md:pt-10`}>
        <div className={`${articleMax} rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-6 md:p-8 lg:p-10`}>
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:gap-5">
            <PublisherAvatar />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t("brand.line1")}</p>
              <p className="text-xs font-medium text-slate-500">{t("brand.line2")}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                {rel && <span>{rel}</span>}
                {rel && dateStr ? <span aria-hidden>·</span> : null}
                {dateStr && (
                  <span className="inline-flex items-center gap-1.5">
                    <FaRegClock className="opacity-70" aria-hidden />
                    {dateStr}
                  </span>
                )}
                {(rel || dateStr) ? <span aria-hidden>·</span> : null}
                <span>{t("publicPages.newsPublisherRole")}</span>
              </div>
            </div>
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[color:var(--color-gt-navy)] sm:mt-8 sm:text-2xl md:text-3xl xl:text-4xl xl:leading-tight">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 border-l-4 border-[color:var(--color-gt-gold)] py-1 pl-3 text-base leading-relaxed text-slate-600 sm:pl-4 sm:text-lg md:text-xl">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {article.imageUrl ? (
        <div className={`mx-auto w-full max-w-[1920px] ${shellPx} pt-6 sm:pt-8`}>
          <div className={`${imageMax} overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm sm:rounded-2xl`}>
            <img
              src={article.imageUrl}
              alt=""
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] md:aspect-[2/1] xl:aspect-[2.2/1]"
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      <div className={`mx-auto w-full max-w-[1920px] ${shellPx} py-8 sm:py-10 md:py-12`}>
        <div className={`${articleMax} rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:rounded-2xl sm:p-6 md:p-8 lg:p-10 xl:p-12`}>
          <div className="space-y-5 text-[15px] leading-[1.85] text-slate-800 sm:text-base md:text-[17px] md:leading-[1.8] 2xl:text-lg">
            {article.body
              ? article.body.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {para}
                  </p>
                ))
              : null}
          </div>
        </div>
      </div>
    </article>
  );
}
