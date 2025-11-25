"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationValidationRules = exports.resetPasswordValidationRules = exports.forgotPasswordValidationRules = exports.verifyEmailValidationRules = exports.loginValidationRules = exports.signUpValidationRules = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { body } = require("express-validator");
exports.signUpValidationRules = [
    body("email").isEmail().withMessage("A valid email is required."),
    body("firstName").notEmpty().withMessage("First name is required."),
    body("lastName").notEmpty().withMessage("Last name is required."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
];
exports.loginValidationRules = [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
];
exports.verifyEmailValidationRules = [
    // Validate userId: Must be a 24-character hexadecimal string
    body("userId")
        .notEmpty()
        .withMessage("userId is required.")
        .isLength({ min: 24, max: 24 })
        .withMessage("User ID must be exactly 24 characters long.")
        .isHexadecimal()
        .withMessage("User ID must be a valid hexadecimal string."),
    // Validate verificationToken: Must be a 6-digit number
    body("verificationToken")
        .notEmpty()
        .withMessage("verificationToken is required.")
        .isLength({ min: 6, max: 6 })
        .withMessage("Verification token must be exactly 6 digits long.")
        .isNumeric()
        .withMessage("Verification token must be a numeric value."),
];
exports.forgotPasswordValidationRules = [
    body("email").isEmail().withMessage("A valid email is required."),
];
exports.resetPasswordValidationRules = [
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long."),
];
// Resend verification doesn't need body validation - uses authenticated user
exports.resendVerificationValidationRules = []; // Empty - relies on authentication middleware
