import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaLinkedinIn, FaRegEye, FaRegThumbsUp, FaThumbsUp, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { IoCheckmark, IoLinkOutline, IoShareSocialOutline } from "react-icons/io5";
import { apiFetch } from "@/api/client";

const LIKED_KEY = "gt_liked_news";
const VIEWED_KEY = "gt_viewed_news";

type Counters = { views?: number; likes?: number };

function readSet(storage: Storage, key: string): Set<string> {
  try {
    return new Set(JSON.parse(storage.getItem(key) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function writeSet(storage: Storage, key: string, set: Set<string>) {
  try {
    storage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* stockage indisponible : l'état ne sera pas mémorisé */
  }
}

type Props = {
  slug: string;
  title: string;
  likes?: number;
  views?: number;
  /** Page article : compte la lecture (une fois par session) et affiche le bloc complet */
  detail?: boolean;
};

/** Barre d'engagement d'une actualité : J'aime (avec compteur), vues et partage. */
export function NewsEngagement({ slug, title, likes: initialLikes = 0, views: initialViews = 0, detail = false }: Props) {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [liked, setLiked] = useState(() => readSet(localStorage, LIKED_KEY).has(slug));
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(detail);

  useEffect(() => setLikes(initialLikes), [initialLikes]);
  useEffect(() => setViews(initialViews), [initialViews]);

  useEffect(() => {
    if (!detail) return;
    const viewed = readSet(sessionStorage, VIEWED_KEY);
    if (viewed.has(slug)) return;
    viewed.add(slug);
    writeSet(sessionStorage, VIEWED_KEY, viewed);
    apiFetch<Counters>(`/api/news/${encodeURIComponent(slug)}/view`, { method: "POST", auth: false })
      .then((c) => setViews(c.views ?? 0))
      .catch(() => undefined);
  }, [detail, slug]);

  async function toggleLike() {
    if (busy) return;
    const next = !liked;
    setBusy(true);
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    const set = readSet(localStorage, LIKED_KEY);
    if (next) set.add(slug);
    else set.delete(slug);
    writeSet(localStorage, LIKED_KEY, set);
    try {
      const c = await apiFetch<Counters>(`/api/news/${encodeURIComponent(slug)}/like`, {
        method: "POST",
        body: JSON.stringify({ liked: next }),
        auth: false,
      });
      setLikes(c.likes ?? 0);
    } catch {
      /* compteur optimiste conservé */
    } finally {
      setBusy(false);
    }
  }

  const url = `${window.location.origin}/actualites/${encodeURIComponent(slug)}`;
  const enc = encodeURIComponent;
  const networks = [
    { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, href: `https://wa.me/?text=${enc(`${title} — ${url}`)}`, cls: "hover:bg-[#25d366] hover:text-white" },
    { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, cls: "hover:bg-[#0a66c2] hover:text-white" },
    { key: "facebook", label: "Facebook", Icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, cls: "hover:bg-[#1877f2] hover:text-white" },
    { key: "x", label: "X", Icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, cls: "hover:bg-black hover:text-white" },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("engage.copyLink"), url);
    }
  }

  const likeButton = (
    <button
      type="button"
      onClick={() => void toggleLike()}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
        liked
          ? "bg-[color:var(--color-gt-brand-blue)] text-white shadow-md shadow-blue-900/20"
          : "border border-slate-200 bg-white text-slate-700 hover:border-[color:var(--color-gt-brand-blue-light)] hover:text-[color:var(--color-gt-brand-blue)]"
      }`}
    >
      {liked ? <FaThumbsUp className="h-4 w-4" aria-hidden /> : <FaRegThumbsUp className="h-4 w-4" aria-hidden />}
      {liked ? t("engage.liked") : t("engage.like")}
      <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${liked ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>{likes}</span>
    </button>
  );

  const shareRow = (
    <div className="flex flex-wrap items-center gap-2">
      {networks.map((n) => (
        <a
          key={n.key}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("engage.shareOn", { network: n.label })}
          title={t("engage.shareOn", { network: n.label })}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition ${n.cls}`}
        >
          <n.Icon className="h-4 w-4" aria-hidden />
        </a>
      ))}
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      >
        {copied ? <IoCheckmark className="h-4 w-4 text-emerald-600" aria-hidden /> : <IoLinkOutline className="h-4 w-4" aria-hidden />}
        {copied ? t("engage.linkCopied") : t("engage.copyLink")}
      </button>
    </div>
  );

  if (detail) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-[#f3f6fb] p-5 sm:p-6">
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">{t("engage.helpful")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {likeButton}
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <FaRegEye className="h-4 w-4" aria-hidden />
            {t("engage.views", { count: views })}
          </span>
        </div>
        <div className="mt-5 border-t border-slate-200/80 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("engage.share")}</p>
          {shareRow}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {likeButton}
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <FaRegEye className="h-3.5 w-3.5" aria-hidden />
            {t("engage.views", { count: views })}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          aria-expanded={shareOpen}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[color:var(--color-gt-brand-blue)]"
        >
          <IoShareSocialOutline className="h-4 w-4" aria-hidden />
          {t("engage.share")}
        </button>
      </div>
      {shareOpen && shareRow}
    </div>
  );
}
