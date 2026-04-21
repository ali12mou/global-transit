import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaArrowRight,
  FaCheck,
  FaGlobe,
  FaShip,
  FaTruck,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { apiFetch } from "@/api/client";
import { HeroBackgroundSlider, HeroSliderDots } from "@/components/home/HeroBackgroundSlider";
import { HERO_SLIDE_COUNT } from "@/components/home/heroSlides";

type SiteConfig = {
  heroTag?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  yearsExperience?: string;
  aboutTitle?: string;
  aboutText?: string;
  missionTitle?: string;
  missionText?: string;
};

type Service = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

type Partner = {
  _id: string;
  name: string;
  type?: string;
  logoUrl: string;
  url?: string;
};

const PARTNER_SECTION_ORDER = ["Ports", "FREE ZONE", "AGENCE"] as const;

function partnerTypeI18nKey(typeKey: string): "Ports" | "FREE_ZONE" | "AGENCE" {
  if (typeKey === "FREE ZONE") return "FREE_ZONE";
  if (typeKey === "AGENCE") return "AGENCE";
  return "Ports";
}
type Client = { _id: string; name: string; logoUrl: string; url?: string };
type Project = {
  _id: string;
  title: string;
  summary: string;
  imageUrl: string;
  slug: string;
};

function LogoMarquee<T extends { _id: string }>({
  items,
  renderItem,
  durationSec = 30,
}: {
  items: T[];
  renderItem: (item: T, idx: number) => ReactNode;
  durationSec?: number;
}) {
  if (items.length === 0) return null;
  const loopItems = [...items, ...items];
  return (
    <div className="group relative overflow-hidden">
      <div
        className="gt-logo-marquee"
        style={{ ["--gt-marquee-duration" as string]: `${durationSec}s` }}
      >
        {loopItems.map((item, idx) => (
          <div key={`${item._id}-${idx}`} className="shrink-0">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:w-16" />
    </div>
  );
}

export function Home() {
  const { t } = useTranslation();
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroSlide((i) => (i + 1) % HERO_SLIDE_COUNT);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);
  const { data: cfgRaw } = useQuery({
    queryKey: ["public-config"],
    queryFn: () => apiFetch<Record<string, unknown>>("/api/config", { auth: false }),
  });
  const site = (cfgRaw?.site ?? {}) as SiteConfig;

  const { data: services = [] } = useQuery({
    queryKey: ["activity-services"],
    queryFn: () => apiFetch<Service[]>("/api/activity-services", { auth: false }),
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: () => apiFetch<Partner[]>("/api/partners", { auth: false }),
  });

  const partnersByType = useMemo(() => {
    const m: Record<string, Partner[]> = { Ports: [], "FREE ZONE": [], AGENCE: [] };
    for (const p of partners) {
      const raw = p.type?.trim();
      const ty = raw && raw in m ? raw : "Ports";
      m[ty]!.push(p);
    }
    return m;
  }, [partners]);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/api/clients", { auth: false }),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-featured"],
    queryFn: () => apiFetch<Project[]>("/api/projects?featured=true", { auth: false }),
  });

  const contactMut = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch<{ ok: boolean }>("/api/contact", { method: "POST", body: JSON.stringify(body), auth: false }),
  });

  function onSubmitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    contactMut.mutate({
      fullName: String(fd.get("fullName") ?? ""),
      email: String(fd.get("email") ?? ""),
      service: String(fd.get("service") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
  }

  const coverageCards = useMemo(
    () =>
      [
        {
          t: t("home.covDjibouti"),
          s: t("home.covDjiboutiBadge"),
          d: t("home.covDjiboutiDesc"),
          icon: "ship" as const,
          ring: "ring-[color:var(--color-gt-blue)]/25",
          grad: "from-[#0c2a5c] via-[color:var(--color-gt-blue)] to-[#152a52]",
        },
        {
          t: t("home.covEthiopia"),
          s: t("home.covEthiopiaBadge"),
          d: t("home.covEthiopiaDesc"),
          icon: "truck" as const,
          ring: "ring-emerald-600/20",
          grad: "from-emerald-800 via-[color:var(--color-gt-accent-green)] to-emerald-700",
        },
        {
          t: t("home.covEastAfrica"),
          s: t("home.covEastAfricaBadge"),
          d: t("home.covEastAfricaDesc"),
          icon: "globe" as const,
          ring: "ring-amber-500/30",
          grad: "from-amber-700 via-amber-600 to-orange-700",
        },
      ] as const,
    [t]
  );

  const flowLabels = useMemo(
    () => [t("home.flowDjibouti"), t("home.flowDireDawa"), t("home.flowAddis"), t("home.flowEastAfrica")],
    [t]
  );

  return (
    <div>
      <section className="relative min-h-[520px] overflow-hidden md:min-h-[560px]">
        <HeroBackgroundSlider activeIndex={heroSlide} />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-gt-navy)]/85 via-[color:var(--color-gt-navy)]/65 to-[color:var(--color-gt-navy)]/45" />
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-24 md:min-h-[560px] md:py-32">
          <span className="mb-4 inline-flex w-fit rounded-sm bg-[color:var(--color-gt-whatsapp)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            {site.heroTag ?? t("home.heroTag")}
          </span>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white md:text-5xl">
            {site.heroTitle ?? t("home.heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
            {site.heroSubtitle ?? t("home.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/activites"
              className="inline-flex items-center gap-2 rounded-sm bg-[color:var(--color-gt-coral)] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
            >
              {t("home.discoverServices")}
              <FaArrowRight />
            </Link>
            <a
              href="https://wa.me/25377696130"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[color:var(--color-gt-whatsapp)] px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
            >
              <FaWhatsapp className="text-lg" />
              {t("home.whatsapp")}
            </a>
          </div>
          <div className="mt-12">
            <HeroSliderDots active={heroSlide} onSelect={setHeroSlide} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)] md:text-4xl">
          {site.aboutTitle ?? t("home.aboutTitle")}
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="leading-relaxed text-slate-600">
              {site.aboutText ?? t("home.aboutText")}
            </p>
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start gap-3">
                <FaCheck className="mt-1 text-[color:var(--color-gt-accent-green)]" />
                <div>
                  <div className="font-semibold text-[color:var(--color-gt-navy)]">
                    {site.missionTitle ?? t("home.missionTitle")}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {site.missionText ?? t("home.missionText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="font-semibold text-[color:var(--color-gt-blue)]">{t("home.hubDjiboutiTitle")}</div>
              <p className="mt-2 text-sm text-slate-600">{t("home.hubDjiboutiDesc")}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="font-semibold text-[color:var(--color-gt-accent-green)]">{t("home.ethiopiaTitle")}</div>
              <p className="mt-2 text-sm text-slate-600">{t("home.ethiopiaDesc")}</p>
            </div>
            <div className="text-center">
              <span className="font-[family-name:var(--font-display)] text-6xl font-bold text-[color:var(--color-gt-coral)]">
                {site.yearsExperience ?? "15+"}
              </span>
              <p className="text-sm font-medium text-slate-500">{t("home.yearsExperience")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/90 via-white to-slate-50 py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[color:var(--color-gt-blue)]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-emerald-600/[0.07] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-[color:var(--color-gt-gold)] to-transparent md:w-16" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                {t("home.coverageKicker")}
              </span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent via-[color:var(--color-gt-gold)] to-transparent md:w-16" />
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--color-gt-navy)] md:text-4xl">
              {t("home.coverageTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              {t("home.coverageSubtitle")}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {coverageCards.map((x) => {
              const Icon = x.icon === "ship" ? FaShip : x.icon === "truck" ? FaTruck : FaGlobe;
              return (
                <article
                  key={x.t}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)] ${x.ring} ring-1`}
                >
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-slate-900/10 ring-1 ring-white/20 transition duration-300 group-hover:scale-105 ${x.grad}`}
                  >
                    <Icon className="h-7 w-7 opacity-95" aria-hidden />
                  </div>
                  <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[color:var(--color-gt-navy)] md:text-[1.35rem]">
                    {x.t}
                  </h3>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{x.s}</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-[15px]">{x.d}</p>
                  <div className="pointer-events-none absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-br from-slate-100/80 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                </article>
              );
            })}
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl">
            <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              {t("home.coverageFlowLabel")}
            </p>

            <div className="mx-auto flex max-w-sm flex-col gap-1 md:hidden">
              {flowLabels.map((label, i, arr) => (
                <Fragment key={`flow-m-${label}`}>
                  <div className="relative flex flex-col items-center">
                    <div className="relative z-10 flex min-h-[3.25rem] w-full items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 px-4 py-3.5 text-sm font-semibold text-[color:var(--color-gt-navy)] shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
                      <span className="absolute -top-2.5 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-[color:var(--color-gt-navy)] text-[10px] font-bold text-white shadow-md">
                        {i + 1}
                      </span>
                      {label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex justify-center py-2">
                      <FaArrowRight className="h-4 w-4 rotate-90 text-[color:var(--color-gt-gold)]" aria-hidden />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>

            <div className="relative hidden md:block">
              <div className="absolute top-9 right-[10%] left-[10%] h-[2px]">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-slate-300/90 to-transparent" />
              </div>
              <div className="flex flex-row items-start justify-between gap-2">
                {flowLabels.map((label, i, arr) => (
                  <Fragment key={`flow-d-${label}`}>
                    <div className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                      <div className="relative z-10 flex min-h-[3.5rem] w-full max-w-[180px] items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 px-3 py-3 text-sm font-semibold text-[color:var(--color-gt-navy)] shadow-[0_4px_14px_rgba(15,23,42,0.08)] lg:max-w-none">
                        <span className="absolute -top-2.5 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-[color:var(--color-gt-navy)] text-[10px] font-bold text-white shadow-md">
                          {i + 1}
                        </span>
                        {label}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex shrink-0 items-center justify-center pt-7">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[color:var(--color-gt-gold)] shadow-sm">
                          <FaArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </span>
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--color-gt-navy)]">
          {t("home.servicesTitle")}
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <article
              key={s._id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] bg-slate-200">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    {t("home.imagePlaceholder")}
                  </div>
                )}
                <span className="absolute bottom-3 right-3 rounded bg-[color:var(--color-gt-whatsapp)] px-2 py-1 text-xs font-bold text-white">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-[color:var(--color-gt-navy)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{s.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-700">{t("home.partnersKicker")}</span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[color:var(--color-gt-navy)]">
            {t("home.partnersTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t("home.partnersSubtitle")}</p>
          <div className="mx-auto mt-10 space-y-12 rounded-xl border border-slate-200/80 bg-slate-50/50 p-6 md:p-10">
            {partners.length === 0 ? (
              <p className="text-center text-slate-500">{t("home.partnersEmpty")}</p>
            ) : (
              PARTNER_SECTION_ORDER.map((typeKey) => {
                const list = partnersByType[typeKey] ?? [];
                if (list.length === 0) return null;
                return (
                  <div key={typeKey}>
                    <h3 className="text-start font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                      {t(`partnerType.${partnerTypeI18nKey(typeKey)}`)}
                    </h3>
                    <div className="mt-4">
                      <LogoMarquee
                        items={list}
                        durationSec={32}
                        renderItem={(p) => {
                          return (
                            <div className="mx-2 flex min-h-[86px] min-w-[170px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              {p.logoUrl ? (
                                <img src={p.logoUrl} alt={p.name} className="max-h-14 max-w-[160px] object-contain" />
                              ) : (
                                <span className="text-center text-sm font-medium text-slate-700">{p.name}</span>
                              )}
                              {p.url && (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 text-xs text-sky-700 hover:underline"
                                >
                                  {t("home.siteLink")}
                                </a>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-700">{t("home.clientsKicker")}</span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[color:var(--color-gt-navy)]">
            {t("home.clientsTitle")}
          </h2>
          <div className="mx-auto mt-10 min-h-[120px] rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 md:p-6">
            {clients.length === 0 ? (
              <p className="text-slate-500">{t("home.clientsEmpty")}</p>
            ) : (
              <LogoMarquee
                items={clients}
                durationSec={28}
                renderItem={(c) => {
                  return (
                    <div className="mx-3 flex min-h-[82px] min-w-[160px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt={c.name} className="max-h-12 max-w-[130px] object-contain" />
                      ) : (
                        <span className="text-sm font-medium text-slate-700">{c.name}</span>
                      )}
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-[#040a14] via-[color:var(--color-gt-navy)] to-[#040a14] py-20 text-white md:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(201,162,39,0.45) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(12,42,92,0.5) 0%, transparent 50%)",
          }}
        />
        <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[280px] w-[280px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-amber-400/90 to-transparent md:w-14" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/95">
                  {t("home.projectsKicker")}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.35rem]">
                {t("home.projectsTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
                {t("home.projectsSubtitle")}
              </p>
            </div>
            <Link
              to="/projets"
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:border-amber-400/35 hover:bg-white/10"
            >
              {t("home.seeAllProjects")}
              <FaArrowRight className="text-xs transition group-hover:translate-x-1" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="relative mt-14 flex flex-col items-center gap-5 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-14 text-center md:items-start md:text-left">
              <p className="max-w-lg text-slate-400">{t("home.projectsFeaturedEmpty")}</p>
              <Link
                to="/projets"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-sm font-semibold text-amber-200/95 transition hover:bg-amber-400/15"
              >
                {t("home.seeAllProjects")}
                <FaArrowRight className="text-xs" />
              </Link>
            </div>
          ) : (
            <div className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p, idx) => (
                <Link
                  key={p._id}
                  to={`/projets/${p.slug}`}
                  className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-7 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] transition duration-300 hover:-translate-y-1 hover:border-amber-400/25 hover:shadow-[0_28px_56px_-12px_rgba(0,0,0,0.65)]"
                  style={
                    p.imageUrl
                      ? {
                          backgroundImage: `linear-gradient(to top, rgba(4,10,20,0.92) 0%, rgba(4,10,20,0.45) 42%, rgba(4,10,20,0.15) 100%), url(${p.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          backgroundImage:
                            "linear-gradient(145deg, rgba(12,42,92,0.35) 0%, rgba(4,10,20,0.9) 100%)",
                        }
                  }
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-amber-500/[0.06] opacity-90 transition group-hover:opacity-100" />
                  <div className="relative z-10">
                    <span className="mb-3 inline-flex text-[10px] font-bold tabular-nums tracking-[0.25em] text-amber-400/85">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-white md:text-xl">{p.title}</h3>
                    {p.summary && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">{p.summary}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/95 transition group-hover:gap-3">
                      {t("home.projectExplore")}
                      <FaArrowRight className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-700">{t("home.contactKicker")}</span>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[color:var(--color-gt-navy)]">
          {t("home.contactTitle")}
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-[color:var(--color-gt-navy)] p-8 text-white">
            <h3 className="font-[family-name:var(--font-display)] text-xl">{t("home.hqBlockTitle")}</h3>
            <ul className="mt-6 space-y-4 text-sm text-white/90">
              <li className="flex gap-3">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[color:var(--color-gt-whatsapp)]" />
                {t("footer.address")}
              </li>
              <li className="flex gap-3">
                <FaPhone className="shrink-0 text-[color:var(--color-gt-whatsapp)]" />
                +253 21 34 17 16
              </li>
              <li className="flex gap-3">
                <FaPhone className="shrink-0 text-[color:var(--color-gt-whatsapp)]" />
                +253 77 82 18 32
              </li>
              <li className="flex gap-3">
                <FaEnvelope className="shrink-0 text-[color:var(--color-gt-whatsapp)]" />
                info@gttsgroup.com
              </li>
            </ul>
            <a
              href="https://wa.me/25377696130"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--color-gt-whatsapp)] py-3 font-semibold text-white hover:brightness-110"
            >
              <FaWhatsapp />
              {t("home.whatsappLine")}
            </a>
          </div>
          <form
            onSubmit={onSubmitContact}
            className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-8"
          >
            {contactMut.isSuccess && (
              <p className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-900">{t("home.formSuccess")}</p>
            )}
            {contactMut.isError && (
              <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-900">
                {(contactMut.error as Error).message}
              </p>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">{t("home.fullName")}</label>
              <input
                name="fullName"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t("home.email")}</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t("home.service")}</label>
              <select name="service" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">{t("home.servicePlaceholder")}</option>
                <option value="Clearance">{t("home.serviceClearance")}</option>
                <option value="Logistics">{t("home.serviceLogistics")}</option>
                <option value="Transit">{t("home.serviceTransit")}</option>
                <option value="Autre">{t("home.serviceOther")}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t("home.message")}</label>
              <textarea name="message" rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <button
              type="submit"
              disabled={contactMut.isPending}
              className="w-full rounded-lg bg-[color:var(--color-gt-coral)] py-3 font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {t("home.quoteCta")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
