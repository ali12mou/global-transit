import { useEffect, useRef, useState } from "react";
import type { Location } from "react-router-dom";
import { isSplashVisible } from "@/lib/splash";

/** Le volet bleu recouvre l'ancienne page… */
const CLOSE_MS = 240;
/** …le camion traverse pendant que la nouvelle page s'affiche derrière… */
const HOLD_MS = 520;
/** …puis le volet sort vers la droite. */
const OPEN_MS = 380;

type Phase = "idle" | "closing" | "leaving";

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Retarde l'affichage de la nouvelle route le temps que l'animation recouvre l'écran.
 * Ne s'applique qu'au site public (pas à l'admin) et uniquement quand le chemin change (pas les #ancres).
 */
export function useRouteTransition(location: Location) {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef(location);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    pending.current = location;
    if (location.key === displayLocation.key) return;

    const samePage = location.pathname === displayLocation.pathname;
    const skip =
      samePage ||
      isAdminPath(location.pathname) ||
      isAdminPath(displayLocation.pathname) ||
      isSplashVisible() ||
      prefersReducedMotion();

    if (skip) {
      if (phase === "idle") setDisplayLocation(location);
      return;
    }
    // Une transition est déjà en cours : la dernière destination sera affichée au moment du changement.
    if (phase !== "idle") return;

    setPhase("closing");
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    at(CLOSE_MS, () => setDisplayLocation(pending.current));
    at(CLOSE_MS + HOLD_MS, () => setPhase("leaving"));
    at(CLOSE_MS + HOLD_MS + OPEN_MS, () => setPhase("idle"));
    // Piloté uniquement par la clé de navigation.
  }, [location.key]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  // Si une autre navigation a eu lieu pendant l'animation, on rattrape la dernière destination.
  useEffect(() => {
    if (phase === "idle" && pending.current.key !== displayLocation.key) {
      setDisplayLocation(pending.current);
    }
  }, [phase, displayLocation.key]);

  return { displayLocation, phase };
}

/** Volet de transition : logo + camion sur la route (mêmes classes que l'intro, styles dans index.html). */
export function RouteTransitionOverlay({ phase }: { phase: Phase }) {
  if (phase === "idle") return null;
  return (
    <div className={`gt-loader gt-loader--route ${phase === "leaving" ? "is-leaving" : ""}`} aria-hidden>
      <div className="gt-loader__panel">
        <div className="gt-loader__badge">
          <img src="/brand/gt-logo.webp" alt="" width={640} height={602} />
        </div>
        <div className="gt-route">
          <div className="gt-route__track">
            <span className="gt-route__fill" />
          </div>
          {[0, 50, 100].map((x, i) => (
            <span key={x} className="gt-route__stop" style={{ ["--x" as string]: `${x}%`, ["--d" as string]: `${0.18 + i * 0.27}s` }}>
              <i />
            </span>
          ))}
          <div className="gt-route__mover">
            <svg viewBox="0 0 40 22">
              <rect x="1" y="3" width="25" height="12.5" rx="1.5" fill="#e3bf34" />
              <path d="M5.5 5v8.5M10 5v8.5M14.5 5v8.5M19 5v8.5M23 5v8.5" stroke="#b8860b" strokeWidth="1" />
              <path d="M27 6.5h6.5l4.8 5.2v3.8H27z" fill="#fff" />
              <path d="M29 8h4l2.8 3.2H29z" fill="#0a4fc4" />
              <rect x="1" y="15.5" width="37.3" height="2" rx="1" fill="#fff" />
              <circle cx="7" cy="19" r="2.6" fill="#010f3a" stroke="#fff" strokeWidth="1.3" />
              <circle cx="19" cy="19" r="2.6" fill="#010f3a" stroke="#fff" strokeWidth="1.3" />
              <circle cx="33" cy="19" r="2.6" fill="#010f3a" stroke="#fff" strokeWidth="1.3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
