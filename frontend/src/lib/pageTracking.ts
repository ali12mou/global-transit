/** Session considérée terminée après 30 min sans nouvelle page vue (convention des outils d'audience). */
const SESSION_IDLE_MS = 30 * 60 * 1000;

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStorage(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    /* navigation privée / stockage bloqué : identifiant non persisté */
  }
}

/** Identifiant anonyme du navigateur (aucune donnée personnelle). */
function visitorId() {
  let id = readStorage(localStorage, "gt_vid");
  if (!id) {
    id = randomId();
    writeStorage(localStorage, "gt_vid", id);
  }
  return id;
}

function sessionInfo(): { id: string; isNew: boolean } {
  const now = Date.now();
  const last = Number(readStorage(sessionStorage, "gt_sid_at") ?? 0);
  let id = readStorage(sessionStorage, "gt_sid");
  const isNew = !id || now - last > SESSION_IDLE_MS;
  if (isNew) {
    id = randomId();
    writeStorage(sessionStorage, "gt_sid", id);
  }
  writeStorage(sessionStorage, "gt_sid_at", String(now));
  return { id: id!, isNew };
}

let lastTracked = { path: "", at: 0 };

/** Envoie une page vue au backend (statistiques du tableau de bord admin). */
export function trackPageView(path: string, lang: string) {
  if (path.startsWith("/admin")) return;
  const now = Date.now();
  // Évite les doublons (StrictMode en dev, double rendu)
  if (lastTracked.path === path && now - lastTracked.at < 1500) return;
  lastTracked = { path, at: now };

  const session = sessionInfo();
  const ref = document.referrer;
  const externalReferrer = session.isNew && ref && !ref.startsWith(window.location.origin) ? ref : "";

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path,
      visitorId: visitorId(),
      sessionId: session.id,
      referrer: externalReferrer,
      lang,
    }),
    keepalive: true,
  }).catch(() => {
    /* statistiques non critiques */
  });
}
