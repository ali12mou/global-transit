import { useEffect, useState } from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Une vague répétée sur deux largeurs pour un défilement continu (translateX -50 %). */
function wavePath(y: number, amp: number) {
  let d = `M0 ${y}`;
  for (let x = 0; x < 1600; x += 100) d += ` q 25 ${-amp} 50 0 t 50 0`;
  return `${d} V 260 H 0 Z`;
}

/**
 * Scène animée multimodale (mer, air, route) : porte-conteneurs, avion cargo et camion.
 * Décorative — masquée aux lecteurs d'écran.
 */
export function LogisticsScene({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <svg className={className} viewBox="0 0 800 260" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="gt-sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0a4fc4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#010b2c" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gt-hull" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f5d66b" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
      </defs>

      {/* Route aérienne + avion cargo */}
      <path id="gt-air-route" d="M -60 120 C 180 20, 520 0, 860 70" fill="none" stroke="#ffffff" strokeOpacity=".25" strokeDasharray="3 9" />
      <g fill="#ffffff" opacity=".9">
        <path d="M-14 -2 L10 -2 L16 -6 L19 -6 L15 -1 L19 0 L15 1 L19 6 L16 6 L10 2 L-14 2 Q-17 0 -14 -2 Z M-4 -2 L2 -12 L6 -12 L3 -2 Z M-4 2 L2 12 L6 12 L3 2 Z M-14 -2 L-17 -7 L-14 -7 L-10 -2 Z" />
        {!reduced && <animateMotion dur="16s" repeatCount="indefinite" rotate="auto">
          <mpath href="#gt-air-route" />
        </animateMotion>}
      </g>

      {/* Grue portuaire (statique) */}
      <g stroke="#e3bf34" strokeOpacity=".55" strokeWidth="3" fill="none" transform="translate(690 92)">
        <path d="M0 108 V 0 M28 108 V 0 M0 0 H 28 M-50 10 H 70 M0 30 L 28 60 M28 30 L0 60" />
        <path d="M-40 10 V 40" strokeWidth="1.5" />
      </g>

      {/* Mer : deux vagues en défilement */}
      <g className={reduced ? "" : "gt-waves-slow"}>
        <path d={wavePath(178, 6)} fill="url(#gt-sea)" opacity=".7" />
      </g>

      {/* Porte-conteneurs */}
      <g className={reduced ? "" : "gt-ship-sail"}>
        <g className={reduced ? "" : "gt-ship-bob"}>
          <g transform="translate(0 128)">
            <rect x="30" y="0" width="16" height="12" fill="#e3bf34" />
            <rect x="48" y="0" width="16" height="12" fill="#ffffff" />
            <rect x="66" y="0" width="16" height="12" fill="#5b8def" />
            <rect x="84" y="0" width="16" height="12" fill="#e3bf34" />
            <rect x="39" y="-12" width="16" height="12" fill="#5b8def" />
            <rect x="57" y="-12" width="16" height="12" fill="#e3bf34" />
            <rect x="75" y="-12" width="16" height="12" fill="#ffffff" />
            <rect x="8" y="-16" width="16" height="28" rx="2" fill="#ffffff" />
            <rect x="11" y="-12" width="10" height="4" fill="#0a4fc4" />
            <path d="M0 12 H 132 L 118 34 H 12 Z" fill="url(#gt-hull)" />
            <path d="M8 22 H 124" stroke="#021a55" strokeOpacity=".5" strokeWidth="2" />
          </g>
        </g>
      </g>

      <g className={reduced ? "" : "gt-waves-fast"}>
        <path d={wavePath(192, 5)} fill="#021a55" opacity=".85" />
      </g>

      {/* Quai + camion */}
      <rect x="0" y="232" width="800" height="28" fill="#010b2c" />
      <path d="M0 246 H 800" stroke="#e3bf34" strokeOpacity=".45" strokeWidth="2" strokeDasharray="18 14" />
      <g className={reduced ? "" : "gt-truck-drive"}>
        <g transform="translate(0 210)">
          <rect x="0" y="0" width="62" height="22" rx="2" fill="#ffffff" />
          <rect x="4" y="4" width="54" height="2" fill="#0a4fc4" opacity=".5" />
          <path d="M64 6 H 78 L 86 14 V 22 H 64 Z" fill="#e3bf34" />
          <rect x="70" y="9" width="8" height="5" fill="#021a55" />
          <circle cx="14" cy="24" r="4.5" fill="#021a55" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="48" cy="24" r="4.5" fill="#021a55" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="76" cy="24" r="4.5" fill="#021a55" stroke="#ffffff" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}
