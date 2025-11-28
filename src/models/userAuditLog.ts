import mongoose, { Document } from "mongoose";

export type UserAuditLogType = {
  userId: mongoose.Types.ObjectId;
  action: string; // "update", "email_change", "role_change", "verification_change"
  changedBy: {
    adminId: mongoose.Types.ObjectId;
    adminEmail: string;
    adminName?: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  };
};

export interface UserAuditLogDocument extends UserAuditLogType, Document {}

const userAuditLogSchema = new mongoose.Schema<UserAuditLogDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
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
        oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
        newValue: { type: mongoose.Schema.Types.Mixed, default: null },
      },
    ],
    metadata: {
      ipAddress: { type: String, default: null },
      userAgent: { type: String, default: null },
      reason: { type: String, default: null },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Index for efficient queries
userAuditLogSchema.index({ userId: 1, createdAt: -1 });
userAuditLogSchema.index({ "changedBy.adminId": 1, createdAt: -1 });
userAuditLogSchema.index({ action: 1, createdAt: -1 });

const UserAuditLog = mongoose.model<UserAuditLogDocument>("UserAuditLog", userAuditLogSchema);

export default UserAuditLog;

