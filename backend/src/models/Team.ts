import mongoose, { Schema, type InferSchemaType } from "mongoose";

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type TeamDoc = InferSchemaType<typeof teamSchema> & { _id: mongoose.Types.ObjectId };
export const Team = mongoose.model("Team", teamSchema);
