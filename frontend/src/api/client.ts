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
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(data?.error ?? res.statusText);
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
  const text = await res.text();
  let data: { error?: string; details?: string } | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as { error?: string; details?: string };
    } catch {
      throw new Error(text.slice(0, 200) || res.statusText);
    }
  }
  if (!res.ok) {
    const msg = data?.error ?? res.statusText;
    const hint = data?.details ? ` (${data.details})` : "";
    throw new ApiError(`${msg}${hint}`, res.status);
  }
  return data as T;
}
