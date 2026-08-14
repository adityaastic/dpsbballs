import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["contact", "buyer-new", "buyer-exp", "career"],
      default: "contact",
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    country: { type: String },
    subject: { type: String },
    message: { type: String },
    productInterest: { type: String },
    quantity: { type: String },
    size: { type: String },
    grade: { type: String },
    application: { type: String },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
