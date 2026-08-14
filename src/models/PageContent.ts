import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    heroEyebrow: { type: String },
    heroTitle: { type: String },
    heroDescription: { type: String },
    sections: [
      {
        key: { type: String, required: true },
        heading: { type: String },
        subheading: { type: String },
        body: { type: String },
        order: { type: Number, default: 0 },
      }
    ],
    bodyHtml: { type: String },
  },
  { timestamps: true }
);

export const PageContent = mongoose.models.PageContent || mongoose.model("PageContent", PageContentSchema);
