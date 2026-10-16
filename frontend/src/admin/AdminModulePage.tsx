import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEnvelope, FaGlobe, FaWhatsapp } from "react-icons/fa";
import {
  IoAdd,
  IoAlertCircleOutline,
  IoCheckmark,
  IoClose,
  IoCloudUploadOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoPencil,
  IoTrashOutline,
} from "react-icons/io5";
import { apiFetch, apiUploadImage } from "@/api/client";
import { buildWhatsAppUrl, digitsFromPhoneDisplay, normalizeWebsiteHref } from "@/lib/contactReply";
import { slugify } from "@/lib/slugify";
import type { EntityModule, FieldDef } from "./entityModules";
import type { UploadCategory } from "@/uploadCategory";
import { useAdminFeedback } from "./ui/AdminFeedback";

const PARTNER_TYPE_LABELS = ["Ports", "FREE ZONE", "AGENCE"] as const;

type Row = Record<string, unknown> & { _id: string };

function rowName(row: Record<string, unknown> | null | undefined) {
  return String(row?.title ?? row?.name ?? "").trim();
}

export function AdminModulePage({ module }: { module: EntityModule }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [teamFormMode, setTeamFormMode] = useState<"compact" | "standard">("standard");
  const feedback = useAdminFeedback();

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
    onSuccess: (saved, payload) => {
      qc.invalidateQueries({ queryKey: ["admin", module.api] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
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
      const name = rowName(saved) || rowName(payload.body);
      feedback.success(payload.id ? "Modifications enregistrées" : "Élément ajouté", name ? `« ${name} » — ${module.title}` : module.title);
      setEditing(null);
      setCreating(false);
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => apiFetch<undefined>(`${module.api}/${id}`, { method: "DELETE" }),
    onError: (e) => feedback.error("Suppression impossible", (e as Error).message),
    onSuccess: (_r, id) => {
      const name = rowName(data.find((row) => row._id === id));
      feedback.success("Élément supprimé", name ? `« ${name} » a été retiré de « ${module.title} ».` : undefined);
      qc.invalidateQueries({ queryKey: ["admin", module.api] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
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

  const columns = useMemo(() => module.fields.slice(0, 4), [module.fields]);

  async function askDelete(id: string, question: string) {
    const name = rowName(data.find((row) => row._id === id));
    const ok = await feedback.confirm({
      title: question,
      message: `${name ? `« ${name} » sera` : "L'élément sera"} définitivement supprimé. Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (ok) delMut.mutate(id);
  }

  const isServices = module.route === "activity-services";
  const isPartners = module.route === "partners";
  const isNews = module.route === "news";
  const isInfrastructure = module.route === "infrastructures";
  const isTeam = module.route === "team";

  const compactTeamRows = useMemo(
    () => (isTeam ? data.filter((row) => String(row.layout ?? "standard") === "compact") : []),
    [data, isTeam]
  );
  const standardTeamRows = useMemo(
    () => (isTeam ? data.filter((row) => String(row.layout ?? "standard") !== "compact") : []),
    [data, isTeam]
  );
  const activeTeamFields =
    teamFormMode === "compact"
      ? module.teamCompactFields ?? module.fields
      : module.teamStandardFields ?? module.fields;

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-14 w-1/2 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
        <p className="sr-only">Chargement…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
        <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>
          <span className="block font-semibold">Impossible de charger « {module.title} »</span>
          {(error as Error).message}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-[1.75rem] font-bold text-[color:var(--color-gt-navy)]">
              {module.title}
            </h1>
            <span className="rounded-full bg-[#eef3fc] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[color:var(--color-gt-brand-blue)]">
              {data.length}
            </span>
          </div>
          {module.description && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600">{module.description}</p>}
          {isTeam && (
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Gérez l&apos;organigramme direction (cartes sur{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/equipe</code> — nom, titre, WhatsApp,
              email) et les membres avec photo (cartes détaillées).
            </p>
          )}
        </div>
        {!isTeam ? (
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
            className="gt-brand-blue-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/15 transition hover:brightness-110"
          >
            <IoAdd className="h-5 w-5" aria-hidden />
            Ajouter
          </button>
        ) : null}
      </div>

      {isServices ? (
        <ServicesTable
          rows={data}
          onEdit={(row) => {
            setEditing(row);
            setCreating(false);
          }}
          onDelete={(id) => {
            void askDelete(id, "Supprimer ce service ?");
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
            void askDelete(id, "Supprimer ce partenaire ?");
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
            void askDelete(id, "Supprimer cette actualité ?");
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
            void askDelete(id, "Supprimer cette infrastructure ?");
          }}
        />
      ) : isTeam ? (
        <div className="mt-8 space-y-10">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                  Organigramme direction
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Bloc hiérarchique en bas de <code className="rounded bg-slate-100 px-1">/equipe</code> — ordre 100 =
                  carte PDG en haut.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTeamFormMode("compact");
                  setCreating(true);
                  setEditing(null);
                }}
                className="rounded-lg bg-[color:var(--color-gt-blue)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Ajouter un contact direction
              </button>
            </div>
            <TeamLeadershipTable
              rows={compactTeamRows}
              onEdit={(row) => {
                setTeamFormMode("compact");
                setEditing(row);
                setCreating(false);
              }}
              onDelete={(id) => {
                void askDelete(id, "Supprimer ce contact direction ?");
              }}
            />
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-gt-navy)]">
                  Équipe avec photo
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Cartes membres avec photo, description et coordonnées complètes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTeamFormMode("standard");
                  setCreating(true);
                  setEditing(null);
                }}
                className="rounded-lg border border-[color:var(--color-gt-blue)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-gt-blue)] shadow-sm hover:bg-slate-50"
              >
                Ajouter un membre avec photo
              </button>
            </div>
            <TeamPhotoTable
              rows={standardTeamRows}
              onEdit={(row) => {
                setTeamFormMode("standard");
                setEditing(row);
                setCreating(false);
              }}
              onDelete={(id) => {
                void askDelete(id, "Supprimer ce membre ?");
              }}
            />
          </section>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row._id} className="border-t border-slate-100">
                  {columns.map((c) => (
                    <td key={c.key} className="max-w-[260px] truncate px-4 py-3 align-middle">
                      {c.type === "file-image" && row[c.key] ? (
                        <img src={String(row[c.key])} alt="" className="h-10 max-w-[96px] rounded object-contain" loading="lazy" />
                      ) : (
                        formatCell(row[c.key])
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-blue)] hover:bg-slate-50"
                        onClick={() => {
                          setEditing(row);
                          setCreating(false);
                        }}
                      >
                        <IoPencil className="h-4 w-4" aria-hidden />
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50/80 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        onClick={() => {
                          void askDelete(row._id, "Supprimer cet élément ?");
                        }}
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
      )}

      {(creating || editing) && (
        <EntityForm
          module={module}
          fields={isTeam ? activeTeamFields : module.fields}
          formTitle={
            isTeam
              ? editing
                ? teamFormMode === "compact"
                  ? "Modifier — organigramme direction"
                  : "Modifier — membre avec photo"
                : teamFormMode === "compact"
                  ? "Ajouter — organigramme direction"
                  : "Ajouter — membre avec photo"
              : undefined
          }
          hiddenValues={isTeam ? { layout: teamFormMode } : undefined}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
            saveMut.reset();
          }}
          onSave={(body) => {
            if (module.route === "roles") {
              const parsed = parseRoleBody(body);
              if (editing) saveMut.mutate({ id: editing._id, body: parsed });
              else saveMut.mutate({ body: parsed });
              return;
            }
            const parsed = parseBody(module, body, isTeam ? activeTeamFields : module.fields);
            if (isTeam) parsed.layout = teamFormMode;
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

function TeamLeadershipTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Row[];
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="w-20 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ordre
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Nom</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Titre</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
              <th className="w-44 px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id} className="transition-colors hover:bg-slate-50/90">
                <td className="px-3 py-3 text-center align-middle">
                  <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700">
                    {String(row.order ?? 0)}
                  </span>
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 align-middle font-semibold text-[color:var(--color-gt-navy)]">
                  {String(row.name ?? "")}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 align-middle text-slate-700">
                  {String(row.title ?? "") || "—"}
                </td>
                <td className="max-w-[160px] px-4 py-3 align-middle">
                  <TeamPhoneCell phone={String(row.phone ?? "")} />
                </td>
                <td className="max-w-[220px] px-4 py-3 align-middle">
                  <TeamEmailCell email={String(row.email ?? "")} />
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
          Aucun contact direction. Ajoutez les cartes de l&apos;organigramme (nom, titre, WhatsApp, email).
        </p>
      )}
    </div>
  );
}

function TeamPhotoTable({
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
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">WhatsApp</th>
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
        <table className="min-w-[1060px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90">
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Image</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Titre & chapô</th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Slug</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Site public
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Publié le</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Vues</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">J&apos;aime</th>
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
                  <td className="px-4 py-3 text-center align-middle font-semibold tabular-nums text-slate-700">{Number(row.views ?? 0)}</td>
                  <td className="px-4 py-3 text-center align-middle font-semibold tabular-nums text-[color:var(--color-gt-brand-blue)]">{Number(row.likes ?? 0)}</td>
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

function parseBody(module: EntityModule, body: Record<string, unknown>, fields = module.fields) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
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

/** Champs courts affichés sur une demi-largeur (deux par ligne sur écran large). */
const HALF_WIDTH_KEYS = new Set(["phone", "email", "website", "url", "fax", "type", "order", "layout", "publishedAt"]);

function isHalfWidth(f: FieldDef) {
  if (f.type === "number" || f.type === "select" || f.type === "datetime-local") return true;
  return f.type === "text" && HALF_WIDTH_KEYS.has(f.key);
}

function EntityForm({
  module,
  fields,
  formTitle,
  hiddenValues,
  initial,
  onClose,
  onSave,
  loading,
  error,
}: {
  module: EntityModule;
  fields?: FieldDef[];
  formTitle?: string;
  hiddenValues?: Record<string, string>;
  initial: Row | null;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void;
  loading: boolean;
  error: Error | null;
}) {
  const formFields = fields ?? module.fields;
  const [invalid, setInvalid] = useState<string[]>([]);
  const formId = `entity-form-${module.route}`;

  const defaults = useMemo(() => {
    const o: Record<string, unknown> = {};
    for (const f of formFields) {
      if (f.type === "checkbox") o[f.key] = false;
      else if (f.type === "number") o[f.key] = 0;
      else if (f.type === "select") o[f.key] = f.options?.[0] ?? "";
      else o[f.key] = "";
    }
    if (!initial && module.route === "news") {
      o.published = true;
    }
    if (!initial && hiddenValues?.layout === "compact") {
      o.order = 100;
    }
    if (!initial) return o;
    const merged = { ...o, ...initial };
    if (module.route === "roles" && Array.isArray(initial.permissions)) {
      merged.permissions = (initial.permissions as string[]).join("\n");
    }
    for (const f of formFields) {
      if (f.type === "datetime-local" && initial[f.key]) {
        const d = new Date(String(initial[f.key]));
        if (!Number.isNaN(d.getTime())) {
          merged[f.key] = d.toISOString().slice(0, 16);
        }
      }
    }
    return merged;
  }, [initial, formFields, module.route, hiddenValues?.layout]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [loading, onClose]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {};
    for (const f of formFields) {
      if (f.type === "checkbox") {
        body[f.key] = fd.get(f.key) === "on";
      } else {
        body[f.key] = fd.get(f.key) ?? "";
      }
    }
    const missing = formFields.filter((f) => f.required && !String(body[f.key] ?? "").trim()).map((f) => f.key);
    setInvalid(missing);
    if (missing.length > 0) {
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    onSave(body);
  }

  const itemName = initial ? String(initial.title ?? initial.name ?? "").trim() : "";
  const heading = formTitle ?? (initial ? "Modifier l'élément" : "Ajouter un élément");

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#010f3a]/50 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="gt-drawer-in flex h-full w-full max-w-2xl flex-col bg-white shadow-[-24px_0_60px_-20px_rgba(1,15,58,0.45)]"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--color-gt-gold)]">{module.title}</p>
            <h2 id={`${formId}-title`} className="mt-1 text-xl font-semibold text-[color:var(--color-gt-navy)]">
              {heading}
            </h2>
            {itemName ? <p className="mt-0.5 truncate text-sm text-slate-500">« {itemName} »</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Fermer le formulaire"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {module.route === "news" && (
            <p className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
              <IoInformationCircleOutline className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-gt-brand-blue)]" aria-hidden />
              <span>
                Décochez « Visible sur le site » pour garder un brouillon. Le slug alimente l&apos;adresse{" "}
                <code className="rounded bg-white px-1 text-xs">/actualites/votre-slug</code>.
              </span>
            </p>
          )}
          {error && (
            <p role="alert" className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>
                <span className="block font-semibold">L&apos;enregistrement a échoué</span>
                {error.message}
              </span>
            </p>
          )}
          {invalid.length > 0 && (
            <p role="alert" className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <IoAlertCircleOutline className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              Merci de compléter les champs obligatoires signalés en rouge.
            </p>
          )}
          <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
            {hiddenValues
              ? Object.entries(hiddenValues).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)
              : null}
            {formFields.map((f) => (
              <div key={f.key} className={isHalfWidth(f) ? "" : "sm:col-span-2"}>
                <FieldControl field={f} defaults={defaults} invalid={invalid.includes(f.key)} formId={formId} />
              </div>
            ))}
          </form>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            <span className="text-red-600">*</span> Champ obligatoire · <kbd className="rounded border border-slate-300 bg-white px-1">Échap</kbd> pour fermer
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:flex-none"
            >
              Annuler
            </button>
            <button
              type="submit"
              form={formId}
              disabled={loading}
              className="gt-brand-blue-bg inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 disabled:opacity-70 sm:flex-none"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              ) : (
                <IoCheckmark className="h-4 w-4" aria-hidden />
              )}
              {loading ? "Enregistrement…" : initial ? "Enregistrer les modifications" : "Ajouter"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

const inputBase =
  "mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4";

function inputClass(invalid: boolean) {
  return `${inputBase} ${
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-[color:var(--color-gt-brand-blue-light)] focus:ring-[color:var(--color-gt-brand-blue-light)]/12"
  }`;
}

function FieldLabel({ field, htmlFor }: { field: FieldDef; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
      {field.label}
      {field.required ? <span className="ml-0.5 text-red-600">*</span> : null}
    </label>
  );
}

function FieldHelp({ field, invalid, id }: { field: FieldDef; invalid: boolean; id: string }) {
  if (invalid) {
    return (
      <p id={id} className="mt-1.5 text-xs font-medium text-red-600">
        Ce champ est obligatoire.
      </p>
    );
  }
  return field.hint ? (
    <p id={id} className="mt-1.5 text-xs leading-relaxed text-slate-500">
      {field.hint}
    </p>
  ) : null;
}

function FieldControl({
  field,
  defaults,
  invalid,
  formId,
}: {
  field: FieldDef;
  defaults: Record<string, unknown>;
  invalid: boolean;
  formId: string;
}) {
  const dv = defaults[field.key] != null ? String(defaults[field.key]) : "";
  const id = `${formId}-${field.key}`;
  const helpId = `${id}-help`;
  const describedBy = invalid || field.hint ? helpId : undefined;

  if (field.type === "file-image") {
    const cat = field.uploadCategory;
    if (!cat) {
      return <p className="text-sm text-red-600">Champ « {field.label} » : définir uploadCategory dans entityModules.</p>;
    }
    return <ImageUploadField name={field.key} label={field.label} defaultValue={dv} category={cat} hint={field.hint} />;
  }

  if (field.type === "select") {
    const opts = field.options ?? [];
    return (
      <div>
        <FieldLabel field={field} htmlFor={id} />
        <select
          id={id}
          name={field.key}
          aria-describedby={describedBy}
          className={inputClass(invalid)}
          defaultValue={dv || opts[0] || ""}
        >
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <FieldHelp field={field} invalid={invalid} id={helpId} />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 transition hover:border-slate-300"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-800">{field.label}</span>
          {field.hint ? <span className="mt-0.5 block text-xs text-slate-500">{field.hint}</span> : null}
        </span>
        <span className="relative inline-flex shrink-0">
          <input id={id} name={field.key} type="checkbox" className="peer sr-only" defaultChecked={Boolean(defaults[field.key])} />
          <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[color:var(--color-gt-brand-blue-light)] peer-focus-visible:ring-4 peer-focus-visible:ring-[color:var(--color-gt-brand-blue-light)]/20" />
          <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </span>
      </label>
    );
  }

  return (
    <div>
      <FieldLabel field={field} htmlFor={id} />
      {field.type === "textarea" ? (
        <textarea
          id={id}
          name={field.key}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`${inputClass(invalid)} min-h-[110px] resize-y leading-relaxed`}
          rows={field.key === "body" || field.key === "description" ? 7 : 4}
          placeholder={field.placeholder}
          defaultValue={dv}
        />
      ) : (
        <input
          id={id}
          name={field.key}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          type={field.type === "number" ? "number" : field.type === "datetime-local" ? "datetime-local" : "text"}
          className={inputClass(invalid)}
          placeholder={field.placeholder}
          defaultValue={dv || undefined}
        />
      )}
      <FieldHelp field={field} invalid={invalid} id={helpId} />
    </div>
  );
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function ImageUploadField({
  name,
  label,
  defaultValue,
  category,
  hint,
}: {
  name: string;
  label: string;
  defaultValue: string;
  category: UploadCategory;
  hint?: string;
}) {
  const [storedUrl, setStoredUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStoredUrl(defaultValue);
    setUpErr(null);
  }, [defaultValue]);

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUpErr("Ce fichier n'est pas une image (JPEG, PNG, GIF, WebP ou SVG).");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUpErr("Image trop lourde : 5 Mo maximum.");
      return;
    }
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
  }

  return (
    <div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input type="hidden" name={name} value={storedUrl} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Importer une image — ${label}`}
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void upload(file);
        }}
      />
      {storedUrl ? (
        <div className="mt-1.5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center">
          <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px] ring-1 ring-slate-200 sm:w-40">
            <img src={storedUrl} alt="Aperçu" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500" title={storedUrl}>
              {storedUrl.split("/").pop()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--color-gt-brand-blue)] transition hover:bg-slate-50 disabled:opacity-60"
              >
                <IoCloudUploadOutline className="h-4 w-4" aria-hidden />
                {uploading ? "Téléversement…" : "Remplacer"}
              </button>
              <button
                type="button"
                onClick={() => setStoredUrl("")}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                <IoTrashOutline className="h-4 w-4" aria-hidden />
                Retirer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void upload(e.dataTransfer.files?.[0]);
          }}
          disabled={uploading}
          className={`mt-1.5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
            dragOver
              ? "border-[color:var(--color-gt-brand-blue-light)] bg-blue-50"
              : "border-slate-300 bg-slate-50/60 hover:border-[color:var(--color-gt-brand-blue-light)]/60 hover:bg-blue-50/40"
          }`}
        >
          {uploading ? (
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-[color:var(--color-gt-brand-blue)]" aria-hidden />
          ) : (
            <IoImageOutline className="h-8 w-8 text-slate-400" aria-hidden />
          )}
          <span className="text-sm font-semibold text-[color:var(--color-gt-brand-blue)]">
            {uploading ? "Téléversement en cours…" : "Cliquez ou glissez une image ici"}
          </span>
          <span className="text-xs text-slate-500">JPEG, PNG, GIF, WebP ou SVG — 5 Mo maximum</span>
        </button>
      )}
      {upErr && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600" role="alert">
          <IoAlertCircleOutline className="h-4 w-4" aria-hidden />
          {upErr}
        </p>
      )}
      {hint && !upErr ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
