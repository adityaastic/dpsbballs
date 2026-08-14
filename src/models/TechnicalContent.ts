import mongoose from "mongoose";

const ProcessStepSchema = new mongoose.Schema({
  step: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const MaterialRowSchema = new mongoose.Schema({
  material: { type: String, required: true },
  bestFor: { type: String },
  strengths: { type: String },
  notes: { type: String },
});

const TestimonialSchema = new mongoose.Schema({
  type: { type: String },
  author: { type: String, required: true },
  role: { type: String },
  quote: { type: String, required: true },
  detail: { type: String },
});

const CeramicCompareSchema = new mongoose.Schema({
  headers: [{ type: String }],
  rows: [[{ type: String }]],
});

const TechnicalContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    manufacturingProcess: [ProcessStepSchema],
    materialComparison: {
      intro: { type: String },
      rows: [MaterialRowSchema],
    },
    clientTestimonials: [TestimonialSchema],
    ceramicCompare: CeramicCompareSchema,
  },
  { timestamps: true }
);

export const TechnicalContent =
  mongoose.models.TechnicalContent || mongoose.model("TechnicalContent", TechnicalContentSchema);
