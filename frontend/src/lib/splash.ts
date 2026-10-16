/** Durée minimale de l'intro animée, même sur une connexion rapide (mesurée depuis le début de la navigation). */
const MIN_VISIBLE_MS = 2100;
/** Sur un réseau lent, on n'attend pas le chargement complet au-delà de ce délai. */
const MAX_WAIT_MS = 6000;
const READY_TO_EXIT_MS = 120;
const EXIT_MS = 560;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitFor(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
}

function pageLoaded() {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
}

/**
 * Ferme l'écran d'introduction défini dans index.html (#gt-splash) :
 * attend la durée minimale ET le chargement de la page (plafonné), puis ouvre les « portes ».
 */
export function dismissSplash() {
  const el = document.getElementById("gt-splash");
  if (!el) return;

  const reduced = prefersReducedMotion();
  const minMs = reduced ? 900 : MIN_VISIBLE_MS;
  const fontsReady = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();

  void Promise.race([
    Promise.all([pageLoaded(), fontsReady, waitFor(minMs - performance.now())]),
    waitFor(MAX_WAIT_MS - performance.now()),
  ]).then(async () => {
    el.classList.add("is-ready");
    await waitFor(READY_TO_EXIT_MS);
    el.classList.add("is-leaving");
    document.documentElement.classList.remove("gt-splash-active");
    await waitFor(reduced ? 350 : EXIT_MS);
    el.remove();
  });
}

export function isSplashVisible() {
  return !!document.getElementById("gt-splash");
}
