const API_BASE = "";

/** Erreur HTTP de l'API (le statut permet par ex. de détecter une session expirée : 401). */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("gt_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("gt_token", token);
  else localStorage.removeItem("gt_token");
}

import type { UploadCategory } from "@/uploadCategory";

type ErrorBody = { error?: string; details?: string };

/** Corps JSON de la réponse ; une page HTML (ex. 502 nginx quand l'API est arrêtée) devient une ApiError lisible. */
function parseBody(text: string, res: Response): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const msg =
      res.status >= 500
        ? `Serveur indisponible (${res.status}), réessayez dans quelques instants`
        : res.ok
          ? "Réponse invalide du serveur"
          : res.statusText || `Erreur ${res.status}`;
    throw new ApiError(msg, res.status);
  }
}

/** Téléverse une image ; la réponse contient `url` (ex. `/uploads/services/…`) à enregistrer dans le champ cible. */
export async function apiUploadImage(file: File, category: UploadCategory): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const headers = new Headers();
  const t = getToken();
  if (!t) throw new Error("Non authentifié");
  headers.set("Authorization", `Bearer ${t}`);
  const q = new URLSearchParams({ category });
  const res = await fetch(`${API_BASE}/api/admin/upload/image?${q}`, {
    method: "POST",
    body: fd,
    headers,
  });
  const data = parseBody(await res.text(), res) as ({ url: string } & ErrorBody) | null;
  if (!res.ok) {
    throw new ApiError(data?.error ?? res.statusText, res.status);
  }
  return data as { url: string };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = parseBody(await res.text(), res) as ErrorBody | null;
  if (!res.ok) {
    const msg = data?.error ?? res.statusText;
    const hint = data?.details ? ` (${data.details})` : "";
    throw new ApiError(`${msg}${hint}`, res.status);
  }
  return data as T;
}
