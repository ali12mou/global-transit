import mongoose, { Schema, type InferSchemaType } from "mongoose";

const careerSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    publishedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type CareerDoc = InferSchemaType<typeof careerSchema> & { _id: mongoose.Types.ObjectId };
export const Career = mongoose.model("Career", careerSchema);
