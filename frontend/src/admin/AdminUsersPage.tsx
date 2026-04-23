import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/api/client";

type Role = { _id: string; name: string };
type UserRow = {
  _id: string;
  email: string;
  active: boolean;
  roleId: Role | string;
};

export function AdminUsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<UserRow[]>("/api/admin/users"),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => apiFetch<Role[]>("/api/admin/roles"),
  });

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
    },
  });

  if (isLoading) return <p className="text-slate-600">Chargement…</p>;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--color-gt-navy)]">
          Utilisateurs
        </h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[color:var(--color-gt-blue)] px-4 py-2 text-sm font-semibold text-white"
        >
          Nouvel utilisateur
        </button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Rôle</th>
              <th className="px-4 py-3 text-left">Actif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{typeof u.roleId === "object" ? u.roleId.name : u.roleId}</td>
                <td className="px-4 py-2">{u.active ? "oui" : "non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createMut.mutate({
                email: String(fd.get("email")),
                password: String(fd.get("password")),
                roleId: String(fd.get("roleId")),
                active: fd.get("active") === "on",
              });
            }}
          >
            <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
            <label className="mt-4 block text-sm font-medium">Email</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <label className="mt-3 block text-sm font-medium">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <label className="mt-3 block text-sm font-medium">Rôle</label>
            <select name="roleId" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input name="active" type="checkbox" defaultChecked /> Actif
            </label>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-lg bg-[color:var(--color-gt-blue)] px-4 py-2 text-white">
                Créer
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
