import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserType = {
  email: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  password: string;
  isVerified: boolean;
  lastLoginDate?: Date; 
  roles: string[];
  resetPasswordToken?: string;
  resetPasswordExpireAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  lastVerificationResendAt?: Date;
  // Pending email change fields
  pendingEmail?: string;
  pendingEmailToken?: string; // Token for NEW email verification
  pendingEmailTokenExpiresAt?: Date;
  pendingEmailOldToken?: string; // Token for OLD email approval
  pendingEmailOldTokenExpiresAt?: Date;
  newEmailVerified?: boolean; // Whether new email has been verified
  oldEmailApproved?: boolean; // Whether old email has approved
  profilePicture?: string; // Profile picture URL from Cloudinary
};

// Extend the base user properties with model instance helpers
export interface UserDocument extends UserType, Document {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

// Define the schema
const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    lastLoginDate: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    roles: { type: [String], enum: ["user", "admin", "moderator"], default: ["user"] }, // default added
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpireAt: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpiresAt: { type: Date, default: null },
    lastVerificationResendAt: { type: Date, default: null },
    // Pending email change fields
    pendingEmail: { type: String, default: null, trim: true, lowercase: true },
    pendingEmailToken: { type: String, default: null }, // Token for NEW email verification
    pendingEmailTokenExpiresAt: { type: Date, default: null },
    pendingEmailOldToken: { type: String, default: null }, // Token for OLD email approval
    pendingEmailOldTokenExpiresAt: { type: Date, default: null },
    newEmailVerified: { type: Boolean, default: false }, // Whether new email has been verified
    oldEmailApproved: { type: Boolean, default: false }, // Whether old email has approved
    profilePicture: { type: String, default: null, trim: true }, // Profile picture URL from Cloudinary
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Hash password before saving
// (userSchema.pre as any)("save", async function (this: UserDocument, next: () => void) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

(userSchema.pre as any)('save', async function(this: any) {
  if (!this.isModified("password")) {
    return;
  }
  
  this.password = await bcrypt.hash(this.password, 10);
});


// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// Create TTL index for resetPasswordExpiresAt field
userSchema.index({ resetPasswordExpireAt: 1 }, { expireAfterSeconds: 0 });

// userSchema.methods.comparePassword = async function (enteredPassword: string) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
