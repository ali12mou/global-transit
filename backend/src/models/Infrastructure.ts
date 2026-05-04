import mongoose, { Schema, type InferSchemaType } from "mongoose";

const infrastructureSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type InfrastructureDoc = InferSchemaType<typeof infrastructureSchema> & { _id: mongoose.Types.ObjectId };
export const Infrastructure = mongoose.model("Infrastructure", infrastructureSchema);
