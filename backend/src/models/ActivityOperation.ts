import mongoose, { Schema, type InferSchemaType } from "mongoose";

const activityOperationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ActivityOperationDoc = InferSchemaType<typeof activityOperationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const ActivityOperation = mongoose.model("ActivityOperation", activityOperationSchema);
