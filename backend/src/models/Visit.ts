import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const VISIT_DEVICES = ["desktop", "mobile", "tablet"] as const;

/** Durée de conservation des pages vues (index TTL MongoDB). */
const RETENTION_SECONDS = 60 * 60 * 24 * 400;

/**
 * Une page vue sur le site public. Identifiants anonymes générés côté navigateur
 * (aucune IP ni donnée personnelle stockée).
 */
const visitSchema = new Schema(
  {
    path: { type: String, required: true, trim: true, maxlength: 300 },
    visitorId: { type: String, required: true, trim: true, maxlength: 64 },
    sessionId: { type: String, required: true, trim: true, maxlength: 64 },
    /** Nom d'hôte du site d'origine (vide = accès direct ou navigation interne). */
    referrer: { type: String, default: "", trim: true, maxlength: 200 },
    device: { type: String, enum: VISIT_DEVICES, default: "desktop" },
    lang: { type: String, default: "", trim: true, maxlength: 12 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });
visitSchema.index({ visitorId: 1, createdAt: -1 });

export type VisitDoc = InferSchemaType<typeof visitSchema> & { _id: mongoose.Types.ObjectId };
export const Visit = mongoose.model("Visit", visitSchema);
