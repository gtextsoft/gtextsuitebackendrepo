import mongoose, { Document, Schema } from "mongoose";

// Contact form submission type
export type ContactFormType = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  userId?: mongoose.Types.ObjectId; // Optional: if user is logged in
  status: "new" | "read" | "replied" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

// Contact form document interface
export interface ContactFormDocument extends ContactFormType, Document {}

// Contact form schema
const contactFormSchema = new Schema<ContactFormDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      default: "General Inquiry",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the model
const ContactForm = mongoose.model<ContactFormDocument>("ContactForm", contactFormSchema);

export default ContactForm;
