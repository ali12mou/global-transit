import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaEnvelope, FaWhatsapp, FaCopy, FaPhone } from "react-icons/fa";
import { apiFetch } from "@/api/client";
import {
  buildMailtoReply,
  buildWhatsAppUrl,
  extractPhoneDigitsFromMessage,
} from "@/lib/contactReply";

type ContactRow = {
  _id: string;
  fullName: string;
  email: string;
  service: string;
  message: string;
  status: string;
  createdAt: string;
};

const COMPANY_WHATSAPP_DIGITS = "25377696130";

export function AdminContactsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => apiFetch<ContactRow[]>("/api/admin/contacts"),
  });

  const patchMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  async function copyMessage(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((x) => (x === id ? null : x)), 2000);
    } catch {
      /* ignore */
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-slate-600">{t("publicPages.loading")}</p>
    );
  }
  if (error) {
    return <p className="text-sm text-red-700">{(error as Error).message}</p>;
  }

  return (
    <div>
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--color-gt-navy)] md:text-3xl">
          {t("adminContacts.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("adminContacts.subtitle")}</p>
      </div>

      <div className="mt-8 space-y-6">
        {data.map((c) => {
          const phone = extractPhoneDigitsFromMessage(c.message);
          const mailto = buildMailtoReply(c.email, c.fullName);
          const waClient = phone ? buildWhatsAppUrl(phone, `Bonjour ${c.fullName}, concernant votre demande Global Transit : `) : null;
          const waCompany = buildWhatsAppUrl(
            COMPANY_WHATSAPP_DIGITS,
            `À propos du message de ${c.fullName} (${c.email})`
          );

          const statusLabel =
            c.status === "read"
              ? t("adminContacts.statusRead")
              : c.status === "archived"
                ? t("adminContacts.statusArchived")
                : t("adminContacts.statusNew");

          return (
            <article
              key={c._id}
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4 md:px-6">
                <div>
                  <h2 className="font-semibold text-[color:var(--color-gt-navy)]">{c.fullName}</h2>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-sm font-medium text-sky-800 hover:underline"
                  >
                    {c.email}
                  </a>
                  {c.service ? (
                    <p className="mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">{t("adminContacts.serviceLabel")} :</span>{" "}
                      {c.service}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                    {statusLabel}
                  </span>
                  <select
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
                    value={c.status}
                    onChange={(e) => patchMut.mutate({ id: c._id, status: e.target.value })}
                  >
                    <option value="new">{t("adminContacts.statusNew")}</option>
                    <option value="read">{t("adminContacts.statusRead")}</option>
                    <option value="archived">{t("adminContacts.statusArchived")}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-start md:gap-6 md:px-6 md:py-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
                  <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 ring-1 ring-slate-100">
                    {c.message || "—"}
                  </pre>
                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:min-w-[220px]">
                  <a
                    href={mailto}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-gt-navy)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    <FaEnvelope className="h-4 w-4 shrink-0 opacity-90" />
                    {t("adminContacts.replyEmail")}
                  </a>
                  {waClient ? (
                    <a
                      href={waClient}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                    >
                      <FaWhatsapp className="h-5 w-5 shrink-0" />
                      {t("adminContacts.openWhatsApp")}
                    </a>
                  ) : (
                    <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                      {t("adminContacts.noPhoneHint")}
                    </p>
                  )}
                  {phone ? (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <FaPhone className="shrink-0 text-emerald-600" />
                      {t("adminContacts.whatsappHint")}: +{phone}
                    </p>
                  ) : null}
                  <a
                    href={waCompany}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    <FaWhatsapp className="h-4 w-4 text-[#25d366]" />
                    {t("adminContacts.companyWhatsApp")}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyMessage(c.message, c._id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FaCopy className="h-4 w-4" />
                    {copiedId === c._id ? t("adminContacts.copied") : t("adminContacts.copyAll")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {data.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center text-slate-500">
            Aucun message.
          </p>
        )}
      </div>
    </div>
  );
}
