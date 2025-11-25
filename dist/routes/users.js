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
// Admin-only routes
// Get all users with filtering and pagination (Admin only)
router.get("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, auth_1.getAllUsers);
exports.default = router;
