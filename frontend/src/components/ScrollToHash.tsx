import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function scrollToId(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Fait défiler vers l’élément ciblé par le hash (#equipe, etc.) après navigation React Router. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.replace(/^#/, "");
    if (!id) return;

    let attempts = 0;
    let timer = 0;

    const tryScroll = () => {
      if (scrollToId(id)) return;
      attempts += 1;
      if (attempts < 15) {
        timer = window.setTimeout(tryScroll, 120);
      }
    };

    timer = window.setTimeout(tryScroll, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
