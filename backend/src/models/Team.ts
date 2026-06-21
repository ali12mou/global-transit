import mongoose, { Schema, type InferSchemaType } from "mongoose";

const teamSchema = new Schema(
  {
    order: { type: Number, default: 0 },
    title: { type: String, default: "", trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    fax: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    website: { type: String, default: "", trim: true },
    layout: { type: String, enum: ["standard", "compact"], default: "standard" },
    formation: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export type TeamDoc = InferSchemaType<typeof teamSchema> & { _id: mongoose.Types.ObjectId };
export const Team = mongoose.model("Team", teamSchema);
