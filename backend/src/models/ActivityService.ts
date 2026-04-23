import mongoose, { Schema, type InferSchemaType } from "mongoose";

const activityServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type ActivityServiceDoc = InferSchemaType<typeof activityServiceSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const ActivityService = mongoose.model("ActivityService", activityServiceSchema);
