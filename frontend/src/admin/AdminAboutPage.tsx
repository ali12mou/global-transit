import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";

type AboutConfig = {
  kicker?: string;
  title?: string;
  intro?: string;
  cardTitle?: string;
  cardText?: string;
  cardCheck?: string;
  missionH2?: string;
  missionP1?: string;
  missionP2?: string;
  strengthsTitle?: string;
  standardsBadge?: string;
  servicesH2?: string;
  expertsH2?: string;
  expertsBadge?: string;
  experienceKicker?: string;
  experienceYears?: string;
  experienceText?: string;
  asideMissionH3?: string;
  asideMissionText?: string;
  contactCta?: string;
  teamEmptyText?: string;
  teamFallbackTitle?: string;
  teamFallbackDescription?: string;
  strengths?: string[];
  services?: Array<{ title?: string; text?: string }>;
};

type AboutForm = {
  kicker: string;
  title: string;
  intro: string;
  cardTitle: string;
  cardText: string;
  cardCheck: string;
  missionH2: string;
  missionP1: string;
  missionP2: string;
  strengthsTitle: string;
  standardsBadge: string;
  servicesH2: string;
  expertsH2: string;
  expertsBadge: string;
  experienceKicker: string;
  experienceYears: string;
  experienceText: string;
  asideMissionH3: string;
  asideMissionText: string;
  contactCta: string;
  teamEmptyText: string;
  teamFallbackTitle: string;
  teamFallbackDescription: string;
  strengthsText: string;
  servicesText: string;
};

function normalizeToForm(raw: AboutConfig): AboutForm {
  const strengths = Array.isArray(raw.strengths) ? raw.strengths : [];
  const services = Array.isArray(raw.services) ? raw.services : [];
  return {
    kicker: raw.kicker ?? "",
    title: raw.title ?? "",
    intro: raw.intro ?? "",
    cardTitle: raw.cardTitle ?? "",
    cardText: raw.cardText ?? "",
    cardCheck: raw.cardCheck ?? "",
    missionH2: raw.missionH2 ?? "",
    missionP1: raw.missionP1 ?? "",
    missionP2: raw.missionP2 ?? "",
    strengthsTitle: raw.strengthsTitle ?? "",
    standardsBadge: raw.standardsBadge ?? "",
    servicesH2: raw.servicesH2 ?? "",
    expertsH2: raw.expertsH2 ?? "",
    expertsBadge: raw.expertsBadge ?? "",
    experienceKicker: raw.experienceKicker ?? "",
    experienceYears: raw.experienceYears ?? "",
    experienceText: raw.experienceText ?? "",
    asideMissionH3: raw.asideMissionH3 ?? "",
    asideMissionText: raw.asideMissionText ?? "",
    contactCta: raw.contactCta ?? "",
    teamEmptyText: raw.teamEmptyText ?? "",
    teamFallbackTitle: raw.teamFallbackTitle ?? "",
    teamFallbackDescription: raw.teamFallbackDescription ?? "",
    strengthsText: strengths.join("\n"),
    servicesText: services
      .map((s) => `${String(s.title ?? "").trim()}|${String(s.text ?? "").trim()}`)
      .filter(Boolean)
      .join("\n"),
  };
}

function formToPayload(form: AboutForm): AboutConfig {
  const strengths = form.strengthsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const services = form.servicesText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [title, ...rest] = row.split("|");
      return { title: (title ?? "").trim(), text: rest.join("|").trim() };
    })
    .filter((x) => x.title || x.text);
  return {
    kicker: form.kicker.trim(),
    title: form.title.trim(),
    intro: form.intro.trim(),
    cardTitle: form.cardTitle.trim(),
    cardText: form.cardText.trim(),
    cardCheck: form.cardCheck.trim(),
    missionH2: form.missionH2.trim(),
    missionP1: form.missionP1.trim(),
    missionP2: form.missionP2.trim(),
    strengthsTitle: form.strengthsTitle.trim(),
    standardsBadge: form.standardsBadge.trim(),
    servicesH2: form.servicesH2.trim(),
    expertsH2: form.expertsH2.trim(),
    expertsBadge: form.expertsBadge.trim(),
    experienceKicker: form.experienceKicker.trim(),
    experienceYears: form.experienceYears.trim(),
    experienceText: form.experienceText.trim(),
    asideMissionH3: form.asideMissionH3.trim(),
    asideMissionText: form.asideMissionText.trim(),
    contactCta: form.contactCta.trim(),
    teamEmptyText: form.teamEmptyText.trim(),
    teamFallbackTitle: form.teamFallbackTitle.trim(),
    teamFallbackDescription: form.teamFallbackDescription.trim(),
    strengths,
    services,
  };
}

export function AdminAboutPage() {
  const qc = useQueryClient();
  const { data: current = {}, isLoading, error } = useQuery({
    queryKey: ["admin-about"],
    queryFn: () => apiFetch<AboutConfig>("/api/admin/about"),
  });

  const [form, setForm] = useState<AboutForm>(normalizeToForm({}));

  const saveMut = useMutation({
    mutationFn: (value: AboutConfig) =>
      apiFetch("/api/admin/about", {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-about"] });
      qc.invalidateQueries({ queryKey: ["public-config"] });
    },
  });

  const saveBlockMut = useMutation({
    mutationFn: ({ block, value }: { block: AboutBlockKey; value: Partial<AboutConfig> }) =>
      apiFetch(`/api/admin/about/${block}`, {
        method: "PATCH",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-about"] });
      qc.invalidateQueries({ queryKey: ["public-config"] });
    },
  });

  useEffect(() => {
    setForm(normalizeToForm(current));
  }, [current]);

  function setField<K extends keyof AboutForm>(key: K, value: AboutForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function saveBlock(block: AboutBlockKey) {
    const payload = formToPayload(form);
    const partial = Object.fromEntries(
      ABOUT_BLOCK_FIELDS[block].map((field) => [field, payload[field as keyof AboutConfig]])
    ) as Partial<AboutConfig>;
    saveBlockMut.mutate({ block, value: partial });
  }

  if (isLoading) return <p className="text-slate-600">Chargement…</p>;
  if (error) return <p className="text-red-700">{(error as Error).message}</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-gt-navy)]">
        Page A propos
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Cette page est reliee directement au contenu public <code className="rounded bg-slate-100 px-1">/a-propos</code>.
      </p>

      <form
        className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate(formToPayload(form));
        }}
      >
        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Hero</h2>
          <TextField label="Kicker" value={form.kicker} onChange={(v) => setField("kicker", v)} />
          <TextField label="Titre principal" value={form.title} onChange={(v) => setField("title", v)} />
          <TextAreaField label="Introduction" value={form.intro} onChange={(v) => setField("intro", v)} />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("hero")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Présentation</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Carte - titre" value={form.cardTitle} onChange={(v) => setField("cardTitle", v)} />
            <TextAreaField label="Carte - texte" value={form.cardText} onChange={(v) => setField("cardText", v)} rows={3} />
          </div>
          <TextField label="Carte - ligne validation" value={form.cardCheck} onChange={(v) => setField("cardCheck", v)} />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("presentation")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Mission & Services</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Mission - titre" value={form.missionH2} onChange={(v) => setField("missionH2", v)} />
            <TextField label="Services - titre" value={form.servicesH2} onChange={(v) => setField("servicesH2", v)} />
          </div>
          <TextAreaField label="Mission - paragraphe 1" value={form.missionP1} onChange={(v) => setField("missionP1", v)} />
          <TextAreaField label="Mission - paragraphe 2" value={form.missionP2} onChange={(v) => setField("missionP2", v)} />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("missionServices")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Points forts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Points forts - titre" value={form.strengthsTitle} onChange={(v) => setField("strengthsTitle", v)} />
            <TextField label="Badge standards" value={form.standardsBadge} onChange={(v) => setField("standardsBadge", v)} />
          </div>
          <TextAreaField
            label="Points forts (1 ligne = 1 item)"
            value={form.strengthsText}
            onChange={(v) => setField("strengthsText", v)}
            rows={6}
          />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("strengths")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Cartes services</h2>
          <TextAreaField
            label="Services (1 ligne = Titre|Texte)"
            value={form.servicesText}
            onChange={(v) => setField("servicesText", v)}
            rows={6}
          />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("servicesCards")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Équipe (public)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Equipe - titre" value={form.expertsH2} onChange={(v) => setField("expertsH2", v)} />
            <TextField label="Equipe - badge" value={form.expertsBadge} onChange={(v) => setField("expertsBadge", v)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Equipe vide - message"
              value={form.teamEmptyText}
              onChange={(v) => setField("teamEmptyText", v)}
            />
            <TextField
              label="Equipe - role par defaut"
              value={form.teamFallbackTitle}
              onChange={(v) => setField("teamFallbackTitle", v)}
            />
          </div>
          <TextField
            label="Equipe - description par defaut"
            value={form.teamFallbackDescription}
            onChange={(v) => setField("teamFallbackDescription", v)}
          />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("teamPublic")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Expérience</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              label="Experience - kicker"
              value={form.experienceKicker}
              onChange={(v) => setField("experienceKicker", v)}
            />
            <TextField
              label="Experience - annees"
              value={form.experienceYears}
              onChange={(v) => setField("experienceYears", v)}
            />
            <TextAreaField
              label="Experience - texte"
              value={form.experienceText}
              onChange={(v) => setField("experienceText", v)}
              rows={3}
            />
          </div>
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("experience")} />
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Bloc Aside & Contact</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Aside - titre mission" value={form.asideMissionH3} onChange={(v) => setField("asideMissionH3", v)} />
            <TextField label="CTA contact" value={form.contactCta} onChange={(v) => setField("contactCta", v)} />
          </div>
          <TextAreaField label="Aside - texte mission" value={form.asideMissionText} onChange={(v) => setField("asideMissionText", v)} />
          <BlockSaveButton loading={saveBlockMut.isPending} onClick={() => saveBlock("asideContact")} />
        </section>

        {saveMut.isError && <p className="text-sm text-red-700">{(saveMut.error as Error).message}</p>}
        {saveBlockMut.isError && <p className="text-sm text-red-700">{(saveBlockMut.error as Error).message}</p>}
        {(saveMut.isSuccess || saveBlockMut.isSuccess) && (
          <p className="text-sm text-emerald-700">Contenu About enregistre avec succes.</p>
        )}

        <button
          type="submit"
          disabled={saveMut.isPending}
          className="rounded-lg bg-[color:var(--color-gt-blue)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saveMut.isPending ? "Enregistrement..." : "Enregistrer About"}
        </button>
      </form>
    </div>
  );
}

type AboutBlockKey =
  | "hero"
  | "presentation"
  | "missionServices"
  | "strengths"
  | "servicesCards"
  | "teamPublic"
  | "experience"
  | "asideContact";

const ABOUT_BLOCK_FIELDS: Record<AboutBlockKey, Array<keyof AboutConfig>> = {
  hero: ["kicker", "title", "intro"],
  presentation: ["cardTitle", "cardText", "cardCheck"],
  missionServices: ["missionH2", "missionP1", "missionP2", "servicesH2"],
  strengths: ["strengthsTitle", "standardsBadge", "strengths"],
  servicesCards: ["services"],
  teamPublic: ["expertsH2", "expertsBadge", "teamEmptyText", "teamFallbackTitle", "teamFallbackDescription"],
  experience: ["experienceKicker", "experienceYears", "experienceText"],
  asideContact: ["asideMissionH3", "asideMissionText", "contactCta"],
};

function BlockSaveButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {loading ? "Enregistrement..." : "Enregistrer ce bloc"}
    </button>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        aria-label={label}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
