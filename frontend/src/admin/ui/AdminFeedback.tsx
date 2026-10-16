import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoClose,
  IoInformationCircle,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; title: string; message?: string };

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Action destructive (suppression) : bouton rouge */
  danger?: boolean;
};

type FeedbackApi = {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  confirm: (o: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackApi | null>(null);

const TOAST_MS = 4500;

/** Notifications (toasts) et boîte de confirmation du back-office. */
export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismiss(id), t.tone === "error" ? TOAST_MS * 1.6 : TOAST_MS);
    },
    [dismiss]
  );

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })),
    []
  );

  const api = useMemo<FeedbackApi>(
    () => ({
      toast,
      success: (title, message) => toast({ tone: "success", title, message }),
      error: (title, message) => toast({ tone: "error", title, message }),
      info: (title, message) => toast({ tone: "info", title, message }),
      confirm,
    }),
    [toast, confirm]
  );

  function closeDialog(ok: boolean) {
    dialog?.resolve(ok);
    setDialog(null);
  }

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
      {dialog && <ConfirmDialog options={dialog} onClose={closeDialog} />}
    </FeedbackContext.Provider>
  );
}

export function useAdminFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useAdminFeedback doit être utilisé dans <AdminFeedbackProvider>");
  return ctx;
}

const TONES: Record<ToastTone, { Icon: typeof IoCheckmarkCircle; bar: string; icon: string }> = {
  success: { Icon: IoCheckmarkCircle, bar: "bg-emerald-500", icon: "text-emerald-600" },
  error: { Icon: IoAlertCircle, bar: "bg-red-500", icon: "text-red-600" },
  info: { Icon: IoInformationCircle, bar: "bg-[color:var(--color-gt-brand-blue-light)]", icon: "text-[color:var(--color-gt-brand-blue)]" },
};

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const tone = TONES[toast.tone];
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="gt-toast-in pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white py-3.5 pl-5 pr-3 shadow-[0_18px_40px_-12px_rgba(7,26,69,0.35)]"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} aria-hidden />
      <tone.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.icon}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[color:var(--color-gt-navy)]">{toast.title}</p>
        {toast.message ? <p className="mt-0.5 text-sm leading-snug text-slate-600">{toast.message}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Fermer la notification"
      >
        <IoClose className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Icon = options.danger ? IoTrashOutline : IoWarningOutline;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#010f3a]/55 p-4 backdrop-blur-[3px]" onClick={() => onClose(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="gt-confirm-title"
        className="gt-toast-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              options.danger ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="gt-confirm-title" className="text-base font-semibold text-[color:var(--color-gt-navy)]">
              {options.title}
            </h2>
            {options.message ? <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{options.message}</p> : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {options.cancelLabel ?? "Annuler"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
              options.danger ? "bg-red-600 hover:bg-red-700" : "gt-brand-blue-bg hover:brightness-110"
            }`}
          >
            {options.confirmLabel ?? "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
