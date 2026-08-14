import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  label: { type: String },
  lines: [{ type: String }],
});

const HighlightSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const NavLinkSchema = new mongoose.Schema({
  href: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const SiteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shortName: { type: String },
    tagline: { type: String },
    logoUrl: { type: String, default: "" },
    logoDarkUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    email: { type: String },
    phoneWork: { type: String },
    phoneRegd: { type: String },
    phoneFax: { type: String },
    mobile: { type: String },
    whatsapp: { type: String, default: "" },
    workOffice: AddressSchema,
    regdOffice: AddressSchema,
    highlights: [HighlightSchema],
    navLinks: [NavLinkSchema],
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

export const SiteSetting = mongoose.models.SiteSetting || mongoose.model("SiteSetting", SiteSettingSchema);
