import express from 'express';
import {
  registerUser,
  registerAdmin,
  loginUser,
  logOut,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  testEmail,
  getAllUsers,
  getProfile,
  updateProfile,
  verifyEmailChange,
  approveEmailChange,
  cancelEmailChange,
  adminUpdateUser,
  adminGetUser,
  adminGetUserAuditTrail,
} from '../controllers/auth';
import {
  loginValidationRules,
  signUpValidationRules,
  verifyEmailValidationRules,
  resendVerificationValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  updateProfileValidationRules,
  verifyEmailChangeValidationRules,
  adminUpdateUserValidationRules,
} from '../validators/auth.validators';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// User registration and authentication
router.post("/register", signUpValidationRules, registerUser);
router.post("/register-admin", signUpValidationRules, registerAdmin); // Admin registration with secret key
router.post("/login", loginValidationRules, loginUser);
router.post("/logout", logOut); // Logout user (clears auth cookie)

// Email verification
router.post("/verify-email", verifyEmailValidationRules, verifyEmail);
router.post("/resend-verification", authenticate, resendVerificationValidationRules, resendVerification);

// Password reset flow
router.post("/forgot-password", forgotPasswordValidationRules, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidationRules, resetPassword);

// Test email endpoint (for testing email configuration - doesn't touch database)
router.post("/test-email", testEmail);

// User profile management (authenticated users only)
router.get("/profile", authenticate, getProfile); // Get current user profile
router.put("/profile", authenticate, updateProfileValidationRules, updateProfile); // Update current user profile

// Email change management (two-step verification - requires BOTH new and old email approval)
router.post("/verify-email-change", authenticate, verifyEmailChangeValidationRules, verifyEmailChange); // Verify NEW email
router.post("/approve-email-change", authenticate, verifyEmailChangeValidationRules, approveEmailChange); // Approve from OLD email
router.post("/cancel-email-change", authenticate, cancelEmailChange); // Cancel pending email change

// Admin-only routes
// Get all users with filtering and pagination (Admin only)
router.get("/", authenticate, requireAdmin, getAllUsers);
// Get audit trail for a user (Admin only)
router.get("/:userId/audit-trail", authenticate, requireAdmin, adminGetUserAuditTrail);
// Get single user by ID (Admin only)
router.get("/:userId", authenticate, requireAdmin, adminGetUser);
// Update any user (Admin only)
router.put("/:userId", authenticate, requireAdmin, adminUpdateUserValidationRules, adminUpdateUser);

export default router;