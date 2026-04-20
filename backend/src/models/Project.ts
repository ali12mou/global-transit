import mongoose, { Schema, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    body: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ProjectDoc = InferSchemaType<typeof projectSchema> & { _id: mongoose.Types.ObjectId };
export const Project = mongoose.model("Project", projectSchema);
