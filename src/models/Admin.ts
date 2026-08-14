import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
    name: { type: String },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
