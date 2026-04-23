import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/api/client";

type ConfigRow = { _id: string; key: string; value: unknown };

export function AdminConfigurationPage() {
  const qc = useQueryClient();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-configurations"],
    queryFn: () => apiFetch<ConfigRow[]>("/api/admin/configurations"),
  });

  const putMut = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiFetch(`/api/admin/configurations/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-configurations"] });
      setEditKey(null);
    },
  });

  if (isLoading) return <p className="text-slate-600">Chargement…</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-gt-navy)]">
        Configuration
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Clés/valeurs stockées en base. La clé <code className="rounded bg-slate-100 px-1">site</code> alimente le
        texte de la page d&apos;accueil.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Clé</th>
              <th className="px-4 py-3 text-left">Aperçu</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-mono text-xs">{r.key}</td>
                <td className="max-w-md truncate px-4 py-2 text-slate-600">
                  {typeof r.value === "object" ? JSON.stringify(r.value).slice(0, 80) + "…" : String(r.value)}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    className="text-[color:var(--color-gt-blue)] underline"
                    onClick={() => {
                      setEditKey(r.key);
                      setJsonText(JSON.stringify(r.value, null, 2));
                    }}
                  >
                    Éditer (JSON)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Éditer — {editKey}</h2>
            <textarea
              className="mt-4 min-h-[320px] flex-1 rounded-lg border border-slate-300 p-3 font-mono text-sm"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            {putMut.isError && (
              <p className="mt-2 text-sm text-red-700">{(putMut.error as Error).message}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-[color:var(--color-gt-blue)] px-4 py-2 text-white"
                onClick={() => {
                  try {
                    const value = JSON.parse(jsonText) as unknown;
                    putMut.mutate({ key: editKey, value });
                  } catch {
                    alert("JSON invalide");
                  }
                }}
              >
                Enregistrer
              </button>
              <button type="button" className="rounded-lg border px-4 py-2" onClick={() => setEditKey(null)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
