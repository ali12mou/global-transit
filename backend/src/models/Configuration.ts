import mongoose, { Schema, type InferSchemaType } from "mongoose";

const configurationSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export type ConfigurationDoc = InferSchemaType<typeof configurationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Configuration = mongoose.model("Configuration", configurationSchema);
