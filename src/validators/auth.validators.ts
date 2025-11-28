// eslint-disable-next-line @typescript-eslint/no-var-requires
const { body } = require("express-validator");

export const signUpValidationRules = [
  body("email").isEmail().withMessage("A valid email is required."),
  body("firstName").notEmpty().withMessage("First name is required."),
  body("lastName").notEmpty().withMessage("Last name is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
export const loginValidationRules = [
  body("email").isEmail().withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

export const verifyEmailValidationRules = [
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
export const forgotPasswordValidationRules = [
  body("email").isEmail().withMessage("A valid email is required."),
];

export const resetPasswordValidationRules = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

// Resend verification doesn't need body validation - uses authenticated user
export const resendVerificationValidationRules = []; // Empty - relies on authentication middleware

// Profile update validation rules
export const updateProfileValidationRules = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty.")
    .trim(),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty.")
    .trim(),
  body("phoneNumber")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty.")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
];

// Email change verification validation rules (used for both new email verification and old email approval)
export const verifyEmailChangeValidationRules = [
  body("verificationToken")
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification token must be exactly 6 digits long.")
    .isNumeric()
    .withMessage("Verification token must be a numeric value."),
  body("approvalToken")
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage("Approval token must be exactly 6 digits long.")
    .isNumeric()
    .withMessage("Approval token must be a numeric value."),
  body().custom((value: any) => {
    if (!value.verificationToken && !value.approvalToken) {
      throw new Error("Either verificationToken or approvalToken is required.");
    }
    return true;
  }),
];

// Admin update user validation rules
export const adminUpdateUserValidationRules = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty.")
    .trim(),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty.")
    .trim(),
  body("phoneNumber")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty.")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
  body("roles")
    .optional()
    .isArray()
    .withMessage("Roles must be an array."),
  body("roles.*")
    .optional()
    .isIn(["user", "admin", "moderator"])
    .withMessage("Invalid role. Must be one of: user, admin, moderator."),
  body("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean value."),
];