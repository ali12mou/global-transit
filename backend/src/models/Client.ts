import mongoose, { Schema, type InferSchemaType } from "mongoose";

const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    url: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type ClientDoc = InferSchemaType<typeof clientSchema> & { _id: mongoose.Types.ObjectId };
export const Client = mongoose.model("Client", clientSchema);
