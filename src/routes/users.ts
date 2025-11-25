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
} from '../controllers/auth';
import {
  loginValidationRules,
  signUpValidationRules,
  verifyEmailValidationRules,
  resendVerificationValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
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

// Admin-only routes
// Get all users with filtering and pagination (Admin only)
router.get("/", authenticate, requireAdmin, getAllUsers);

export default router;