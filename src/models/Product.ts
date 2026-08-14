import mongoose from "mongoose";

const TableSchema = new mongoose.Schema({
  title: { type: String },
  headers: [{ type: String }],
  rows: [[{ type: String }]],
});

const SpecSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    short: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    highlights: [{ type: String }],
    grades: [{ type: String }],
    specs: [SpecSchema],
    tables: [TableSchema],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
