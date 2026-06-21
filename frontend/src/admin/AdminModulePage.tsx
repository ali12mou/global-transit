import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";
import { IoPencil, IoTrashOutline } from "react-icons/io5";
import { apiFetch, apiUploadImage } from "@/api/client";
import { buildWhatsAppUrl, digitsFromPhoneDisplay, normalizeWebsiteHref } from "@/lib/contactReply";
import { slugify } from "@/lib/slugify";
import type { EntityModule, FieldDef } from "./entityModules";
import type { UploadCategory } from "@/uploadCategory";

const PARTNER_TYPE_LABELS = ["Ports", "FREE ZONE", "AGENCE"] as const;

type Row = Record<string, unknown> & { _id: string };

export function AdminModulePage({ module }: { module: EntityModule }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", module.api],
    queryFn: () => apiFetch<Row[]>(module.api),
  });

  const saveMut = useMutation({
    mutationFn: async (payload: { id?: string; body: Record<string, unknown> }) => {
      if (payload.id) {
        return apiFetch<Row>(`${module.api}/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload.body),
        });
      }
      return apiFetch<Row>(module.api, {
        method: "POST",
        body: JSON.stringify(payload.body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", module.api] });
      if (module.route === "news") {
        qc.invalidateQueries({ queryKey: ["news-page"] });
        qc.invalidateQueries({ queryKey: ["news"] });
      }
      if (module.route === "team") {
        qc.invalidateQueries({ queryKey: ["team"] });
      }
      if (module.route === "activity-services") {
        qc.invalidateQueries({ queryKey: ["activity-services-page"] });
        qc.invalidateQueries({ queryKey: ["activity-services"] });
      }
      setEditing(null);
      setCreating(false);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => apiFetch<undefined>(`${module.api}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", module.api] });
      if (module.route === "news") {
        qc.invalidateQueries({ queryKey: ["news-page"] });
        qc.invalidateQueries({ queryKey: ["news"] });
      }
      if (module.route === "team") {
        qc.invalidateQueries({ queryKey: ["team"] });
      }
      if (module.route === "activity-services") {
        qc.invalidateQueries({ queryKey: ["activity-services-page"] });
        qc.invalidateQueries({ queryKey: ["activity-services"] });
      }
    },
  });

  const columns = useMemo(() => {
    const keys = module.fields.slice(0, 4).map((f) => f.key);
    return keys;
  }, [module.fields]);

  const isServices = module.route === "activity-services";
  const isPartners = module.route === "partners";
  const isNews = module.route === "news";
  const isInfrastructure = module.route === "infrastructures";
  const isTeam = module.route === "team";

  if (isLoading) return <p className="text-slate-600">Chargement…</p>;
  if (error) return <p className="text-red-700">{(error as Error).message}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-gt-navy)]">
            {module.title}
          </h1>
          {isNews && (
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Les entrées <strong className="text-slate-800">publiées</strong> sont listées sur la page publique{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">/actualites</code> (API{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">GET /api/news</code>).
            </p>
          )}
          {isServices && (
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Les services <strong className="text-slate-800">publiés</strong> s&apos;affichent sur{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">/activites</code> (menu
              Services → Our Activities). Format description : paragraphe d&apos;intro, puis lignes{" "}
              <code className="rounded bg-slate-100 px-1">**Titre:** texte</code>.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="rounded-lg bg-[color:var(--color-gt-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Ajouter
        </button>
      </div>

      {isServices ? (
        <ServicesTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            if (confirm("Supprimer ce service ?")) delMut.mutate(id);
          }}
        />
      ) : isPartners ? (
        <PartnersTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            if (confirm("Supprimer ce partenaire ?")) delMut.mutate(id);
          }}
        />
      ) : isNews ? (
        <NewsTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            if (confirm("Supprimer cette actualité ?")) delMut.mutate(id);
          }}
        />
      ) : isInfrastructure ? (
        <InfrastructureTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            if (confirm("Supprimer cette infrastructure ?")) delMut.mutate(id);
          }}
        />
      ) : isTeam ? (
        <TeamTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            if (confirm("Supprimer ce membre ?")) delMut.mutate(id);
          }}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-medium capitalize">
                    {c}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row._id} className="border-t border-slate-100">
                  {columns.map((c) => (
                    <td key={c} className="max-w-[220px] truncate px-4 py-2">
                      {formatCell(row[c])}
                    </td>
                  ))}
                  <td className="space-x-2 px-4 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-[color:var(--color-gt-blue)] underline"
                      onClick={() => {
                        setEditing(row);
                        setCreating(false);
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="text-red-700 underline"
                      onClick={() => {
                        if (confirm("Supprimer cet élément ?")) delMut.mutate(row._id);
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <EntityForm
          module={module}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(body) => {
            const isRoles = module.route === "roles";
            const parsed = isRoles ? parseRoleBody(body) : parseBody(module, body);
            if (editing) saveMut.mutate({ id: editing._id, body: parsed });
            else saveMut.mutate({ body: parsed });
          }}
          loading={saveMut.isPending}
          error={saveMut.error as Error | null}
        />
      )}
    </div>
  );
}

function ServicesTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aperçu
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Service
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description
              </th>
              <th className="w-20 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ordre
              </th>
              <th className="w-28 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statut
              </th>
              <th className="w-40 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const img = String(row.imageUrl ?? "").trim();
              const title = String(row.title ?? "");
              const desc = String(row.description ?? "");
              const order = row.order ?? 0;
              const published = Boolean(row.published);
              return (
                <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                  <td className="px-4 py-3 align-middle">
                    <div className="relative h-16 w-20 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                          Pas d&apos;image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 align-middle">
                    <span className="font-semibold text-[color:var(--color-gt-navy)]">{title}</span>
                  </td>
                  <td className="max-w-md px-4 py-3 align-middle text-slate-600">
                    <p className="line-clamp-2 leading-snug">{desc || "—"}</p>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700">
                      {String(order)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        published
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] shadow-sm hover:bg-slate-50"
                      >
                        <IoPencil className="h-4 w-4" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <IoTrashOutline className="h-4 w-4" aria-hidden />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
          Aucun service. Cliquez sur « Ajouter » et importez une image (fichier depuis votre ordinateur).
        </p>
      )}
    </div>
  );
}

function PartnersTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  function typeBadge(t: unknown) {
    const s = String(t ?? "Ports");
    const styles: Record<string, string> = {
      Ports: "bg-sky-100 text-sky-900 ring-sky-200",
      "FREE ZONE": "bg-amber-100 text-amber-950 ring-amber-200",
      AGENCE: "bg-violet-100 text-violet-900 ring-violet-200",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[s] ?? "bg-slate-100 text-slate-800 ring-slate-200"}`}
      >
        {PARTNER_TYPE_LABELS.includes(s as (typeof PARTNER_TYPE_LABELS)[number]) ? s : "Ports"}
      </span>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Logo</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Site web</th>
              <th className="w-20 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ordre
              </th>
              <th className="w-44 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const logo = String(row.logoUrl ?? "").trim();
              return (
                <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                  <td className="px-4 py-3 align-middle">
                    <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                      {logo ? (
                        <img src={logo} alt="" className="max-h-12 max-w-full object-contain" loading="lazy" />
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 align-middle font-semibold text-[color:var(--color-gt-navy)]">
                    {String(row.name ?? "")}
                  </td>
                  <td className="px-4 py-3 align-middle">{typeBadge(row.type)}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 align-middle text-slate-600">
                    {row.url ? (
                      <a href={String(row.url)} target="_blank" rel="noopener noreferrer" className="text-sky-800 hover:underline">
                        {String(row.url)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700">
                      {String(row.order ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:bg-slate-50"
                      >
                        <IoPencil className="h-4 w-4" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <IoTrashOutline className="h-4 w-4" aria-hidden />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
          Aucun partenaire. Ajoutez un logo (fichier image) et choisissez un type.
        </p>
      )}
    </div>
  );
}

function TeamPhoneCell({ phone }: { phone: string }) {
  const trimmed = phone.trim();
  if (!trimmed) return <span className="text-slate-400">—</span>;
  const digits = digitsFromPhoneDisplay(trimmed);
  if (!digits) return <span dir="ltr" className="text-slate-600">{trimmed}</span>;
  return (
    <a
      href={buildWhatsAppUrl(digits)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-medium text-[#128C7E] hover:underline"
      title="Ouvrir WhatsApp"
    >
      <FaWhatsapp className="h-4 w-4 shrink-0 text-[#25D366]" aria-hidden />
      <span dir="ltr">{trimmed}</span>
    </a>
  );
}

function TeamEmailCell({ email }: { email: string }) {
  const trimmed = email.trim();
  if (!trimmed) return <span className="text-slate-400">—</span>;
  return (
    <a href={`mailto:${trimmed}`} className="break-all text-[color:var(--color-gt-blue)] hover:underline">
      <FaEnvelope className="mr-1 inline h-3.5 w-3.5 text-[color:var(--color-gt-accent-green)]" aria-hidden />
      {trimmed}
    </a>
  );
}

function TeamWebsiteCell({ website }: { website: string }) {
  const trimmed = website.trim();
  if (!trimmed) return <span className="text-slate-400">—</span>;
  const href = normalizeWebsiteHref(trimmed);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 break-all text-[color:var(--color-gt-blue)] hover:underline"
    >
      <FaGlobe className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-gt-accent-green)]" aria-hidden />
      {trimmed.replace(/^https?:\/\//i, "")}
    </a>
  );
}

function TeamTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Photo</th>
              <th className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Ordre</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Titre</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Description</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Formation pro</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Profil web</th>
              <th className="w-44 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                <td className="px-4 py-3 align-middle">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
                    {String(row.imageUrl ?? "").trim() ? (
                      <img src={String(row.imageUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-[10px] text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700">
                    {String(row.order ?? 0)}
                  </span>
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 align-middle text-slate-700">{String(row.title ?? "") || "—"}</td>
                <td className="max-w-[180px] truncate px-4 py-3 align-middle font-semibold text-[color:var(--color-gt-navy)]">
                  {String(row.name ?? "")}
                </td>
                <td className="max-w-[140px] px-4 py-3 align-middle">
                  <TeamPhoneCell phone={String(row.phone ?? "")} />
                </td>
                <td className="max-w-[180px] px-4 py-3 align-middle">
                  <TeamEmailCell email={String(row.email ?? "")} />
                </td>
                <td className="max-w-[240px] px-4 py-3 align-middle text-slate-600">
                  <p className="line-clamp-2 leading-snug">{String(row.description ?? "") || "—"}</p>
                </td>
                <td className="max-w-[200px] px-4 py-3 align-middle text-slate-600">
                  <p className="line-clamp-2 leading-snug">{String(row.formation ?? "") || "—"}</p>
                </td>
                <td className="max-w-[160px] px-4 py-3 align-middle">
                  <TeamWebsiteCell website={String(row.website ?? "")} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:bg-slate-50"
                    >
                      <IoPencil className="h-4 w-4" aria-hidden />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <IoTrashOutline className="h-4 w-4" aria-hidden />
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
          Aucun membre pour le moment.
        </p>
      )}
    </div>
  );
}

function InfrastructureTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Image</th>
              <th className="w-44 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const imageUrl = String(row.imageUrl ?? "").trim();
              return (
                <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                  <td className="max-w-[170px] px-4 py-3 align-middle">
                    <code className="break-all text-xs text-slate-600">{row._id}</code>
                  </td>
                  <td className="max-w-[220px] px-4 py-3 align-middle font-semibold text-[color:var(--color-gt-navy)]">
                    {String(row.name ?? "")}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="max-h-12 max-w-full object-contain" loading="lazy" />
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:bg-slate-50"
                      >
                        <IoPencil className="h-4 w-4" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <IoTrashOutline className="h-4 w-4" aria-hidden />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
          Aucune infrastructure. Ajoutez un nom et une image.
        </p>
      )}
    </div>
  );
}
function NewsTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  function formatNewsDate(v: unknown) {
    if (v == null || v === "") return "—";
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Image</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Titre & chapô</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Site public
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Publié le</th>
              <th className="w-36 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aperçu
              </th>
              <th className="w-44 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const img = String(row.imageUrl ?? "").trim();
              const published = Boolean(row.published);
              const slug = String(row.slug ?? "").trim();
              const publicUrl = slug ? `/actualites/${encodeURIComponent(slug)}` : "";
              return (
                <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                  <td className="px-4 py-3 align-middle">
                    <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">—</div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3 align-middle">
                    <span className="font-semibold text-[color:var(--color-gt-navy)]">{String(row.title ?? "")}</span>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{String(row.excerpt ?? "") || "—"}</p>
                  </td>
                  <td className="max-w-[180px] px-4 py-3 align-middle">
                    <code className="break-all text-xs text-slate-700">{slug || "—"}</code>
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        published
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {published ? "En ligne" : "Brouillon"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-slate-600">{formatNewsDate(row.publishedAt)}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    {published && publicUrl ? (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-sky-800 underline-offset-2 hover:underline"
                      >
                        Ouvrir
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:bg-slate-50"
                      >
                        <IoPencil className="h-4 w-4" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <IoTrashOutline className="h-4 w-4" aria-hidden />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
          Aucune actualité. Créez une entrée et cochez « Visible sur le site » pour l’afficher sur{" "}
          <code className="rounded bg-slate-100 px-1">/actualites</code>.
        </p>
      )}
    </div>
  );
}

function formatCell(v: unknown) {
  if (typeof v === "boolean") return v ? "oui" : "non";
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function parseBody(module: EntityModule, body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of module.fields) {
    const v = body[f.key];
    if (f.type === "number") out[f.key] = v === "" ? 0 : Number(v);
    else if (f.type === "checkbox") out[f.key] = Boolean(v);
    else if (f.type === "datetime-local") {
      if (!v) continue;
      out[f.key] = new Date(String(v)).toISOString();
    } else if (f.type === "file-image" || f.type === "select") {
      out[f.key] = String(v ?? "").trim();
    } else out[f.key] = v;
  }
  if (module.route === "partners") {
    const t = out.type as string;
    if (!t || !PARTNER_TYPE_LABELS.includes(t as (typeof PARTNER_TYPE_LABELS)[number])) {
      out.type = "Ports";
    }
  }
  if (module.route === "news") {
    const rawSlug = String(out.slug ?? "").trim();
    if (rawSlug) out.slug = slugify(rawSlug);
    if (out.published === true && (out.publishedAt == null || out.publishedAt === undefined)) {
      out.publishedAt = new Date().toISOString();
    }
  }
  return out;
}

function parseRoleBody(body: Record<string, unknown>) {
  const name = String(body.name ?? "");
  const raw = String(body.permissions ?? "");
  const permissions = raw
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { name, permissions };
}

function EntityForm({
  module,
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  module: EntityModule;
  initial: Row | null;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
  loading: boolean;
  error: Error | null;
}) {
  const defaults = useMemo(() => {
    const o: Record<string, unknown> = {};
    for (const f of module.fields) {
      if (f.type === "checkbox") o[f.key] = false;
      else if (f.type === "number") o[f.key] = 0;
      else if (f.type === "select") o[f.key] = f.options?.[0] ?? "";
      else o[f.key] = "";
    }
    if (!initial && module.route === "news") {
      o.published = true;
    }
    if (!initial) return o;
    const merged = { ...o, ...initial };
    if (module.route === "roles" && Array.isArray(initial.permissions)) {
      merged.permissions = (initial.permissions as string[]).join("\n");
    }
    for (const f of module.fields) {
      if (f.type === "datetime-local" && initial[f.key]) {
        const d = new Date(String(initial[f.key]));
        if (!Number.isNaN(d.getTime())) {
          merged[f.key] = d.toISOString().slice(0, 16);
        }
      }
    }
    return merged;
  }, [initial, module.fields, module.route]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    for (const f of module.fields) {
      if (f.type === "checkbox") {
        body[f.key] = fd.get(f.key) === "on";
      } else {
        body[f.key] = fd.get(f.key) ?? "";
      }
    }
    onSave(body);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-slate-900/10 ${module.route === "news" ? "max-w-2xl" : "max-w-lg"}`}
      >
        <h2 className="text-lg font-semibold text-[color:var(--color-gt-navy)]">
          {initial ? "Modifier" : "Créer"}
        </h2>
        {module.route === "news" && (
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            Décochez « Visible sur le site » pour garder un brouillon. Le slug alimente l’URL{" "}
            <code className="rounded bg-slate-100 px-1">/actualites/votre-slug</code>.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error.message}</p>}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {module.fields.map((f) => (
            <FieldControl key={f.key} field={f} defaults={defaults} />
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[color:var(--color-gt-blue)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldControl({ field, defaults }: { field: FieldDef; defaults: Record<string, unknown> }) {
  const dv = defaults[field.key] != null ? String(defaults[field.key]) : "";

  if (field.type === "file-image") {
    const cat = field.uploadCategory;
    if (!cat) {
      return (
        <p className="text-sm text-red-600">
          Champ « {field.label} » : définir uploadCategory dans entityModules.
        </p>
      );
    }
    return <ImageUploadField name={field.key} label={field.label} defaultValue={dv} category={cat} />;
  }

  if (field.type === "select") {
    const opts = field.options ?? [];
    return (
      <div>
        <label className="text-sm font-medium text-slate-700">{field.label}</label>
        <select
          name={field.key}
          aria-label={field.label}
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          defaultValue={dv || opts[0] || ""}
        >
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="pt-1">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-800">
          <input
            name={field.key}
            type="checkbox"
            aria-label={field.label}
            className="size-4 rounded border-slate-300 text-teal-600 focus:ring-[color:var(--color-gt-blue)]"
            defaultChecked={Boolean(defaults[field.key])}
          />
          {field.label}
        </label>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          name={field.key}
          aria-label={field.label}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-inner"
          rows={4}
          defaultValue={dv}
        />
      ) : (
        <input
          name={field.key}
          aria-label={field.label}
          type={field.type === "number" ? "number" : field.type === "datetime-local" ? "datetime-local" : "text"}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-inner"
          defaultValue={dv || undefined}
        />
      )}
    </div>
  );
}

function ImageUploadField({
  name,
  label,
  defaultValue,
  category,
}: {
  name: string;
  label: string;
  defaultValue: string;
  category: UploadCategory;
}) {
  const [storedUrl, setStoredUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);

  useEffect(() => {
    setStoredUrl(defaultValue);
    setUpErr(null);
  }, [defaultValue]);

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <p className="mt-0.5 text-xs text-slate-500">
        Importez une image depuis votre ordinateur (JPEG, PNG, GIF, WebP, SVG — max 5&nbsp;Mo). Elle sera stockée sur le
        serveur.
      </p>
      <input type="hidden" name={name} value={storedUrl} readOnly />
      <input
        type="file"
        accept="image/*"
        aria-label={`Importer une image — ${label}`}
        className="mt-2 block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--color-gt-blue)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-95"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUpErr(null);
          setUploading(true);
          try {
            const r = await apiUploadImage(file, category);
            setStoredUrl(r.url);
          } catch (ex) {
            setUpErr((ex as Error).message);
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading && <p className="mt-2 text-xs text-slate-500">Téléversement en cours…</p>}
      {upErr && <p className="mt-2 text-xs text-red-600">{upErr}</p>}
      {storedUrl ? (
        <div className="mt-3 flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
          <img src={storedUrl} alt="Aperçu" className="max-h-48 max-w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
