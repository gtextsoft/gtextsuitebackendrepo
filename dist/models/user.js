"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Define the schema
const userSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Hash password before saving
// (userSchema.pre as any)("save", async function (this: UserDocument, next: () => void) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });
userSchema.pre('save', async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
});
// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcryptjs_1.default.compare(enteredPassword, this.password);
};
// Create TTL index for resetPasswordExpiresAt field
userSchema.index({ resetPasswordExpireAt: 1 }, { expireAfterSeconds: 0 });
// userSchema.methods.comparePassword = async function (enteredPassword: string) {
//   return bcrypt.compare(enteredPassword, this.password);
// };
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
