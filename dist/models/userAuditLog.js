"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userAuditLogSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        enum: ["update", "email_change", "role_change", "verification_change", "profile_update"],
        index: true,
    },
    changedBy: {
        adminId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        adminEmail: {
            type: String,
            required: true,
        },
        adminName: {
            type: String,
            default: null,
        },
    },
    changes: [
        {
            field: { type: String, required: true },
            oldValue: { type: mongoose_1.default.Schema.Types.Mixed, default: null },
            newValue: { type: mongoose_1.default.Schema.Types.Mixed, default: null },
        },
    ],
    metadata: {
        ipAddress: { type: String, default: null },
        userAgent: { type: String, default: null },
        reason: { type: String, default: null },
    },
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Index for efficient queries
userAuditLogSchema.index({ userId: 1, createdAt: -1 });
userAuditLogSchema.index({ "changedBy.adminId": 1, createdAt: -1 });
userAuditLogSchema.index({ action: 1, createdAt: -1 });
const UserAuditLog = mongoose_1.default.model("UserAuditLog", userAuditLogSchema);
exports.default = UserAuditLog;
