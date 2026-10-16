import mongoose, { Schema, type InferSchemaType } from "mongoose";

const contactSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    jobTitle: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    /** Objet de la demande (devis, information, partenariat…) */
    subject: { type: String, default: "", trim: true },
    /** Origine → destination de la marchandise */
    route: { type: String, default: "", trim: true },
    preferredContact: { type: String, default: "", trim: true },
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
