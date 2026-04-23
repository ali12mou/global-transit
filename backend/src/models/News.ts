import mongoose, { Schema, type InferSchemaType } from "mongoose";

const newsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "" },
    body: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    publishedAt: { type: Date },
    /** Visible sur le site public `/api/news` uniquement si `true`. */
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type NewsDoc = InferSchemaType<typeof newsSchema> & { _id: mongoose.Types.ObjectId };
export const News = mongoose.model("News", newsSchema);
