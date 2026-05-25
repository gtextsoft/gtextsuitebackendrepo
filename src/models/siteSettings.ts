import mongoose, { Document } from "mongoose";

export interface SiteSettingsDocument extends Document {
  key: string;
  hotelName: string;
  email: string;
  phone: string;
  notifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

const siteSettingsSchema = new mongoose.Schema<SiteSettingsDocument>(
  {
    key: { type: String, default: "global", unique: true },
    hotelName: { type: String, default: "GText Suite" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model<SiteSettingsDocument>(
  "SiteSettings",
  siteSettingsSchema
);
export default SiteSettings;
