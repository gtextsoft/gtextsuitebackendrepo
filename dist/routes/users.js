"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_validators_1 = require("../validators/auth.validators");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// User registration and authentication
router.post("/register", auth_validators_1.signUpValidationRules, auth_1.registerUser);
router.post("/register-admin", auth_validators_1.signUpValidationRules, auth_1.registerAdmin); // Admin registration with secret key
router.post("/login", auth_validators_1.loginValidationRules, auth_1.loginUser);
router.post("/logout", auth_1.logOut); // Logout user (clears auth cookie)
// Email verification
router.post("/verify-email", auth_validators_1.verifyEmailValidationRules, auth_1.verifyEmail);
router.post("/resend-verification", auth_middleware_1.authenticate, auth_validators_1.resendVerificationValidationRules, auth_1.resendVerification);
// Password reset flow
router.post("/forgot-password", auth_validators_1.forgotPasswordValidationRules, auth_1.forgotPassword);
router.post("/reset-password/:token", auth_validators_1.resetPasswordValidationRules, auth_1.resetPassword);
// Test email endpoint (for testing email configuration - doesn't touch database)
router.post("/test-email", auth_1.testEmail);
// User profile management (authenticated users only)
router.get("/profile", auth_middleware_1.authenticate, auth_1.getProfile); // Get current user profile
router.put("/profile", auth_middleware_1.authenticate, auth_validators_1.updateProfileValidationRules, auth_1.updateProfile); // Update current user profile
router.patch("/profile/password", auth_middleware_1.authenticate, auth_validators_1.resetPasswordValidationRules, auth_1.changePassword); // Change password
// Email change management (two-step verification - requires BOTH new and old email approval)
router.post("/verify-email-change", auth_middleware_1.authenticate, auth_validators_1.verifyEmailChangeValidationRules, auth_1.verifyEmailChange); // Verify NEW email
router.post("/approve-email-change", auth_middleware_1.authenticate, auth_validators_1.verifyEmailChangeValidationRules, auth_1.approveEmailChange); // Approve from OLD email
router.post("/cancel-email-change", auth_middleware_1.authenticate, auth_1.cancelEmailChange); // Cancel pending email change
// Admin-only routes
// Get all users with filtering and pagination (Admin only)
router.get("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_1.getAllUsers);
// Get audit trail for a user (Admin only)
router.get("/:userId/audit-trail", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_1.adminGetUserAuditTrail);
// Get single user by ID (Admin only)
router.get("/:userId", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_1.adminGetUser);
// Update any user (Admin only)
router.put("/:userId", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_validators_1.adminUpdateUserValidationRules, auth_1.adminUpdateUser);
exports.default = router;
