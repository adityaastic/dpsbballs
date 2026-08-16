import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String },
    url: { type: String, required: true },
    path: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    folder: { type: String, default: "general" },
    alt: { type: String },
    data: { type: Buffer, select: false },
  },
  { timestamps: true }
);

export const Media = mongoose.models.Media || mongoose.model("Media", MediaSchema);
