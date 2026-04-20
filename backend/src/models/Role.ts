import mongoose, { Schema, type InferSchemaType } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type RoleDoc = InferSchemaType<typeof roleSchema> & { _id: mongoose.Types.ObjectId };
export const Role = mongoose.model("Role", roleSchema);
