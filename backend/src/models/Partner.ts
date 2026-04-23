import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const PARTNER_TYPES = ["Ports", "FREE ZONE", "AGENCE"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: PARTNER_TYPES,
      required: true,
      default: "Ports",
    },
    logoUrl: { type: String, default: "" },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type PartnerDoc = InferSchemaType<typeof partnerSchema> & { _id: mongoose.Types.ObjectId };
export const Partner = mongoose.model("Partner", partnerSchema);
