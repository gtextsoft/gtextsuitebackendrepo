"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const siteSettingsSchema = new mongoose_1.default.Schema({
    key: { type: String, default: "global", unique: true },
    hotelName: { type: String, default: "GText Suite" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
}, { timestamps: true });
const SiteSettings = mongoose_1.default.model("SiteSettings", siteSettingsSchema);
exports.default = SiteSettings;
