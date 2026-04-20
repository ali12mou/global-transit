import mongoose, { Schema, type InferSchemaType } from "mongoose";

const contactSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    service: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

export type ContactDoc = InferSchemaType<typeof contactSchema> & { _id: mongoose.Types.ObjectId };
export const Contact = mongoose.model("Contact", contactSchema);
