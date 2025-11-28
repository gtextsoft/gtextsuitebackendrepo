"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetUserAuditTrail = exports.adminGetUser = exports.adminUpdateUser = exports.cancelEmailChange = exports.approveEmailChange = exports.verifyEmailChange = exports.updateProfile = exports.getProfile = exports.getAllUsers = exports.testEmail = exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.logOut = exports.registerAdmin = exports.loginUser = exports.registerUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const userAuditLog_1 = __importDefault(require("../models/userAuditLog"));
const generateTokenAndSetCookie_1 = require("../utils/generateTokenAndSetCookie");
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const emailService_1 = require("../services/emailService");
const { validationResult } = require("express-validator");
const registerUser = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User Credentials already exist',
            });
            return;
        }
        // Generate verification token using Node crypto for secure randomness
        const verificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
            100000).toString();
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        const newUser = new user_1.default({ email, password, firstName, lastName, phoneNumber, isVerified: false, roles: ["user"], verificationToken, verificationTokenExpiresAt });
        await newUser.save();
        // Send verification email
        try {
            await (0, emailService_1.sendVerificationEmail)(email, verificationToken);
            console.log(`Verification email sent to: ${email}`);
        }
        catch (emailError) {
            console.error("Error sending verification email:", emailError);
            // Don't fail registration if email fails - user can still verify later
        }
        // generateTokenAndSetCookie(res, savedUser._id);
        //update loginDate
        // savedUser.lastLoginDate = new Date();
        // await savedUser.save();
        // res.status(201).json({
        //     success: true,
        //     message: 'User registered successfully',
        //     user: savedUser,
        // });
        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            user: {
                _id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phoneNumber: newUser.phoneNumber,
                roles: newUser.roles,
                isVerified: newUser.isVerified,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong During Registration',
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    try {
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(400).json({ success: false, message: "Invalid credentials" });
            return;
        }
        // // generate token and setCookie
        // generateTokenAndSetCookie(res, user._id as string);
        // FIX HERE: Convert ObjectId to string properly
        const userId = user._id.toString();
        (0, generateTokenAndSetCookie_1.generateTokenAndSetCookie)(res, userId);
        //update loginDate
        user.lastLoginDate = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            message: "Login Successfully.",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
            },
        });
        return;
    }
    catch (error) {
        console.log("Error during Login", error);
        res.status(500).json({ success: false, message: "Something went wrong.", error: error });
        return;
    }
};
exports.loginUser = loginUser;
// Logout user - clears authentication cookie
const logOut = async (req, res) => {
    try {
        // Clear cookie with same settings as when it was set
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
        });
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
        return;
    }
    catch (error) {
        console.log("Error during Logout:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during logout.",
        });
        return;
    }
};
exports.logOut = logOut;
// Verify user email with verification token
const verifyEmail = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        const { userId, verificationToken } = req.body;
        if (!userId || !verificationToken) {
            res.status(400).json({
                success: false,
                message: "Please provide the required credentials for verification.",
            });
            return;
        }
        // Validate userId format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
            return;
        }
        // Find user by ID
        const user = await user_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if already verified
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: "Email is already verified.",
            });
            return;
        }
        // Verify the token
        if (!user.verificationToken ||
            user.verificationToken !== verificationToken) {
            res.status(400).json({
                success: false,
                message: "Invalid verification token.",
            });
            return;
        }
        // Check if token has expired
        if (user.verificationTokenExpiresAt &&
            new Date(user.verificationTokenExpiresAt).getTime() < Date.now()) {
            res.status(400).json({
                success: false,
                message: "Verification token has expired. Please request a new one.",
            });
            return;
        }
        // Update the user to mark as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        // Send welcome email
        try {
            await (0, emailService_1.sendWelcomeEmail)(user.email, user.firstName, user.lastName);
            console.log(`Welcome email sent to: ${user.email}`);
        }
        catch (emailError) {
            console.error("Error sending welcome email:", emailError);
            // Don't fail verification if email fails
        }
        res.status(200).json({
            success: true,
            message: "Email successfully verified.",
        });
        return;
    }
    catch (error) {
        console.log("Error during email verification:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during email verification.",
        });
        return;
    }
};
exports.verifyEmail = verifyEmail;
// Resend verification email - for logged-in users
const resendVerification = async (req, res) => {
    try {
        // User should be authenticated (via authenticate middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const user = req.user;
        // Check if already verified
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: "Email is already verified.",
            });
            return;
        }
        // Rate limiting: Check if user recently requested resend (within last 1 minute)
        // Simple implementation - can be improved with Redis or database tracking
        const now = Date.now();
        const lastResendTime = user.lastVerificationResendAt;
        if (lastResendTime && (now - new Date(lastResendTime).getTime()) < 60000) {
            res.status(429).json({
                success: false,
                message: "Please wait before requesting another verification email.",
                retryAfter: 60, // seconds
            });
            return;
        }
        // Generate new verification token
        const verificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
            100000).toString();
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        // Update user with new token (need to fetch fresh user from DB to update)
        const userDoc = await user_1.default.findById(req.userId);
        if (!userDoc) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        userDoc.verificationToken = verificationToken;
        userDoc.verificationTokenExpiresAt = new Date(verificationTokenExpiresAt);
        userDoc.lastVerificationResendAt = new Date();
        await userDoc.save();
        // Send verification email
        try {
            await (0, emailService_1.sendVerificationEmail)(userDoc.email, verificationToken);
            console.log(`✅ Verification email resent to: ${userDoc.email}`);
        }
        catch (emailError) {
            console.error("❌ Error sending verification email:", emailError?.message || emailError);
            // Still return success for security (don't reveal if email exists)
        }
        res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox.",
        });
        return;
    }
    catch (error) {
        console.log("Error during resend verification:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while sending verification email.",
        });
        return;
    }
};
exports.resendVerification = resendVerification;
// Request password reset - sends reset link to user's email
const forgotPassword = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        const { email } = req.body;
        const user = await user_1.default.findOne({ email: email.toLowerCase() });
        // Check if email exists and inform frontend
        if (!user) {
            res.status(200).json({
                success: false,
                emailExists: false,
                message: "No account found with this email address.",
            });
            return;
        }
        // Generate a secure random reset token
        const resetToken = (0, crypto_1.randomBytes)(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now
        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = new Date(resetTokenExpiresAt);
        await user.save();
        // Build reset link
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const resetLink = `${clientUrl}/reset-password/${resetToken}`;
        // Send password reset email
        try {
            await (0, emailService_1.sendPasswordResetEmail)(user.email, resetLink);
            console.log(`Password reset email sent to: ${user.email}`);
        }
        catch (emailError) {
            console.error("Error sending password reset email:", emailError);
            // Don't fail if email fails - still return success for security
        }
        res.status(200).json({
            success: true,
            emailExists: true,
            message: "Password reset link has been sent to your email.",
            // In development, you might want to return the reset link for testing
            // Remove this in production
            ...(process.env.NODE_ENV === "development" && { resetLink }),
        });
        return;
    }
    catch (error) {
        console.log("Error during forgot password:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during password reset request.",
        });
        return;
    }
};
exports.forgotPassword = forgotPassword;
// Reset password using reset token
const resetPassword = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                message: "Reset token is required.",
            });
            return;
        }
        // Find user with valid reset token that hasn't expired
        const user = await user_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpireAt: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid or expired reset token.",
            });
            return;
        }
        // Update the user's password (pre-save hook will hash it)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpireAt = undefined;
        await user.save();
        // Send password reset success email
        try {
            await (0, emailService_1.sendResetSuccessEmail)(user.email);
            console.log(`Password reset success email sent to: ${user.email}`);
        }
        catch (emailError) {
            console.error("Error sending password reset success email:", emailError);
            // Don't fail if email fails - password was already reset
        }
        res.status(200).json({
            success: true,
            message: "Password reset successful. You can now login with your new password.",
        });
        return;
    }
    catch (error) {
        console.log("Error during password reset:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during password reset.",
        });
        return;
    }
};
exports.resetPassword = resetPassword;
// Register admin user (requires secret key)
const registerAdmin = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password, firstName, lastName, phoneNumber, adminSecret } = req.body;
        // Check admin secret key (should be in .env file)
        const requiredSecret = process.env.ADMIN_SECRET_KEY;
        if (!requiredSecret) {
            res.status(500).json({
                success: false,
                message: "Admin registration not configured",
            });
            return;
        }
        if (adminSecret !== requiredSecret) {
            res.status(403).json({
                success: false,
                message: "Invalid admin secret key",
            });
            return;
        }
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
            return;
        }
        // Generate verification token
        const verificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) + 100000).toString();
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        // Create admin user with admin role
        const newAdmin = new user_1.default({
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            isVerified: true, // Admin can be auto-verified
            roles: ["admin"],
            verificationToken,
            verificationTokenExpiresAt,
        });
        await newAdmin.save();
        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            user: {
                _id: newAdmin._id,
                email: newAdmin.email,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                phoneNumber: newAdmin.phoneNumber,
                roles: newAdmin.roles,
                isVerified: newAdmin.isVerified,
            },
        });
    }
    catch (error) {
        console.log("Error during admin registration:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during admin registration",
        });
    }
};
exports.registerAdmin = registerAdmin;
// Test email endpoint - doesn't touch database, just tests email configuration
const testEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email address is required.",
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
            return;
        }
        // Send test email
        await (0, emailService_1.sendTestEmail)(email);
        res.status(200).json({
            success: true,
            message: `Test email sent successfully to ${email}. Please check your inbox (and spam folder).`,
        });
        return;
    }
    catch (error) {
        console.error("❌ Error sending test email:", error);
        console.error("❌ Error details:", {
            message: error?.message,
            code: error?.code,
            responseCode: error?.responseCode,
            command: error?.command,
        });
        // Check if email credentials are missing FIRST
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            res.status(500).json({
                success: false,
                message: "Email configuration missing",
                error: "EMAIL_USER or EMAIL_PASS not found in environment variables",
                hint: "Add EMAIL_USER and EMAIL_PASS to your .env file and restart the server",
                setup: {
                    step1: "Create/update .env file in project root",
                    step2: "Add: EMAIL_USER=your-email@gmail.com",
                    step3: "Add: EMAIL_PASS=your-gmail-app-password",
                    step4: "Get Gmail App Password: https://myaccount.google.com/apppasswords",
                    step5: "Restart your server"
                },
                configStatus: {
                    emailUserSet: !!process.env.EMAIL_USER,
                    emailPassSet: !!process.env.EMAIL_PASS,
                }
            });
            return;
        }
        // Provide more helpful error messages based on error type
        let errorMessage = "Failed to send test email";
        let errorDetails = error?.message || "Unknown error";
        let hint = "";
        if (error?.code === "EAUTH" || error?.responseCode === 535) {
            errorMessage = "Email authentication failed";
            errorDetails = "Invalid email credentials";
            hint = "Make sure you're using Gmail App Password (not regular password). Get it at: https://myaccount.google.com/apppasswords";
        }
        else if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
            errorMessage = "Cannot connect to email server";
            errorDetails = error?.message || "Connection timeout";
            hint = "Check your internet connection and firewall settings";
        }
        else if (error?.command === "CONN" || error?.code === "ENOTFOUND") {
            errorMessage = "Email server not found";
            errorDetails = "Could not connect to Gmail SMTP server";
            hint = "Check your internet connection";
        }
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: errorDetails,
            hint: hint || "Check backend console for detailed error message",
            configStatus: {
                emailUserSet: !!process.env.EMAIL_USER,
                emailPassSet: !!process.env.EMAIL_PASS,
                emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : "Not set",
            }
        });
        return;
    }
};
exports.testEmail = testEmail;
// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        // Query parameters for filtering and pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Filter options
        const filter = {};
        // Filter by verification status
        if (req.query.isVerified !== undefined) {
            filter.isVerified = req.query.isVerified === 'true';
        }
        // Filter by role
        if (req.query.role) {
            filter.roles = { $in: [req.query.role] };
        }
        // Search by email, firstName, or lastName
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { email: searchRegex },
                { firstName: searchRegex },
                { lastName: searchRegex },
            ];
        }
        // Get total count for pagination
        const totalUsers = await user_1.default.countDocuments(filter);
        // Get users with pagination
        const users = await user_1.default.find(filter)
            .select('-password -resetPasswordToken -verificationToken') // Exclude sensitive fields
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);
        // Calculate pagination info
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    limit,
                    hasNextPage,
                    hasPrevPage,
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
};
exports.getAllUsers = getAllUsers;
// Get current user profile
const getProfile = async (req, res) => {
    try {
        // User should be authenticated (via authenticate middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const user = req.user;
        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                pendingEmail: user.pendingEmail,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
        return;
    }
    catch (error) {
        console.log("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching profile.",
        });
        return;
    }
};
exports.getProfile = getProfile;
// Update user profile
const updateProfile = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        // User should be authenticated (via authenticate middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { firstName, lastName, phoneNumber, email } = req.body;
        // Fetch fresh user from database
        const user = await user_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Track if email is being changed
        const emailChanged = email && email.toLowerCase() !== user.email.toLowerCase();
        let needsReVerification = false;
        // Update fields if provided
        if (firstName !== undefined) {
            user.firstName = firstName.trim();
        }
        if (lastName !== undefined) {
            user.lastName = lastName.trim();
        }
        if (phoneNumber !== undefined) {
            user.phoneNumber = phoneNumber.trim();
        }
        // Handle email change - requires two-step verification
        if (emailChanged) {
            // Check if new email is already taken
            const existingUser = await user_1.default.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.userId } // Exclude current user
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "Email is already in use by another account.",
                });
                return;
            }
            // Check if there's already a pending email change
            if (user.pendingEmail && user.pendingEmailTokenExpiresAt &&
                new Date(user.pendingEmailTokenExpiresAt).getTime() > Date.now()) {
                res.status(400).json({
                    success: false,
                    message: "You already have a pending email change. Please verify or cancel it first.",
                    pendingEmail: user.pendingEmail,
                });
                return;
            }
            // Store new email as pending (not changed yet)
            const newEmailLower = email.toLowerCase();
            user.pendingEmail = newEmailLower;
            user.newEmailVerified = false;
            user.oldEmailApproved = false;
            // Generate verification token for NEW email
            const verificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
                100000).toString();
            const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            user.pendingEmailToken = verificationToken;
            user.pendingEmailTokenExpiresAt = new Date(verificationTokenExpiresAt);
            // Generate approval token for OLD email
            const oldApprovalToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
                100000).toString();
            const oldApprovalTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            user.pendingEmailOldToken = oldApprovalToken;
            user.pendingEmailOldTokenExpiresAt = new Date(oldApprovalTokenExpiresAt);
            // Send verification email to NEW address
            try {
                await (0, emailService_1.sendEmailChangeRequest)(newEmailLower, user.email, verificationToken);
                console.log(`Email change verification sent to new email: ${newEmailLower}`);
            }
            catch (emailError) {
                console.error("Error sending email change request:", emailError);
                // Clear pending email if sending fails
                user.pendingEmail = undefined;
                user.pendingEmailToken = undefined;
                user.pendingEmailTokenExpiresAt = undefined;
                user.pendingEmailOldToken = undefined;
                user.pendingEmailOldTokenExpiresAt = undefined;
                res.status(500).json({
                    success: false,
                    message: "Failed to send verification email. Please try again.",
                });
                return;
            }
            // Send approval request to OLD email address
            try {
                await (0, emailService_1.sendEmailChangeOldApproval)(user.email, newEmailLower, user.firstName, user.lastName, oldApprovalToken);
                console.log(`Email change approval request sent to old email: ${user.email}`);
            }
            catch (emailError) {
                console.error("Error sending email change approval request:", emailError);
                // Clear pending email if sending fails
                user.pendingEmail = undefined;
                user.pendingEmailToken = undefined;
                user.pendingEmailTokenExpiresAt = undefined;
                user.pendingEmailOldToken = undefined;
                user.pendingEmailOldTokenExpiresAt = undefined;
                res.status(500).json({
                    success: false,
                    message: "Failed to send approval email. Please try again.",
                });
                return;
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: emailChanged
                ? "Profile updated. Verification codes have been sent to both your new and old email addresses. Both must be verified to complete the email change."
                : "Profile updated successfully.",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                pendingEmail: user.pendingEmail,
                updatedAt: user.updatedAt,
            },
            needsReVerification: emailChanged,
            pendingEmailChange: emailChanged,
        });
        return;
    }
    catch (error) {
        console.log("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile.",
        });
        return;
    }
};
exports.updateProfile = updateProfile;
// Verify and complete email change
const verifyEmailChange = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        // User should be authenticated
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { verificationToken } = req.body;
        // Fetch fresh user from database
        const user = await user_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if there's a pending email change
        if (!user.pendingEmail || !user.pendingEmailToken) {
            res.status(400).json({
                success: false,
                message: "No pending email change found.",
            });
            return;
        }
        // Check if old email has approved FIRST (required step)
        if (!user.oldEmailApproved) {
            res.status(400).json({
                success: false,
                message: "Please approve the email change from your old email address first. Check your old email inbox for the approval code, then verify your new email address.",
                requiresOldEmailApproval: true,
                instructions: {
                    step1: "Check your OLD email inbox (" + user.email + ") for the approval code",
                    step2: "Enter the approval code using the 'Approve Email Change' option",
                    step3: "After approval, you can verify your new email address",
                },
                currentEmail: user.email,
                pendingEmail: user.pendingEmail,
            });
            return;
        }
        // Verify the token (this is for NEW email verification)
        if (user.pendingEmailToken !== verificationToken) {
            res.status(400).json({
                success: false,
                message: "Invalid verification token.",
            });
            return;
        }
        // Check if token has expired
        if (user.pendingEmailTokenExpiresAt &&
            new Date(user.pendingEmailTokenExpiresAt).getTime() < Date.now()) {
            res.status(400).json({
                success: false,
                message: "Verification token has expired. Please request a new email change.",
            });
            // Clear expired pending email
            user.pendingEmail = undefined;
            user.pendingEmailToken = undefined;
            user.pendingEmailTokenExpiresAt = undefined;
            user.pendingEmailOldToken = undefined;
            user.pendingEmailOldTokenExpiresAt = undefined;
            user.newEmailVerified = false;
            user.oldEmailApproved = false;
            await user.save();
            return;
        }
        // Mark new email as verified
        user.newEmailVerified = true;
        user.pendingEmailToken = undefined; // Clear token after verification
        user.pendingEmailTokenExpiresAt = undefined;
        // Check if old email has also approved
        const bothVerified = user.newEmailVerified && user.oldEmailApproved;
        if (bothVerified) {
            // Both verifications complete - finalize the email change
            const oldEmail = user.email;
            user.email = user.pendingEmail;
            user.isVerified = false; // Require re-verification of new email
            user.pendingEmail = undefined;
            user.pendingEmailOldToken = undefined;
            user.pendingEmailOldTokenExpiresAt = undefined;
            user.newEmailVerified = false;
            user.oldEmailApproved = false;
            // Generate new verification token for the new email
            const newVerificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
                100000).toString();
            const newVerificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            user.verificationToken = newVerificationToken;
            user.verificationTokenExpiresAt = new Date(newVerificationTokenExpiresAt);
            // Send notification to OLD email address
            try {
                await (0, emailService_1.sendEmailChangeNotification)(oldEmail, user.email, user.firstName, user.lastName);
                console.log(`Email change notification sent to old email: ${oldEmail}`);
            }
            catch (emailError) {
                console.error("Error sending email change notification:", emailError);
            }
            // Send verification email to NEW address
            try {
                await (0, emailService_1.sendVerificationEmail)(user.email, newVerificationToken);
                console.log(`Verification email sent to new email: ${user.email}`);
            }
            catch (emailError) {
                console.error("Error sending verification email:", emailError);
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: bothVerified
                ? "Email address changed successfully. Please verify your new email address."
                : "New email verified successfully! The email change will complete once your old email approves the change.",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                pendingEmail: user.pendingEmail,
                updatedAt: user.updatedAt,
            },
            emailChangeStatus: {
                newEmailVerified: user.newEmailVerified,
                oldEmailApproved: user.oldEmailApproved,
                completed: bothVerified,
            },
            nextStep: bothVerified
                ? null
                : {
                    action: "approve_old_email",
                    message: "Please check your old email inbox and approve the change to complete the process.",
                    oldEmail: user.email,
                },
        });
        return;
    }
    catch (error) {
        console.log("Error verifying email change:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while verifying email change.",
        });
        return;
    }
};
exports.verifyEmailChange = verifyEmailChange;
// Cancel pending email change
const cancelEmailChange = async (req, res) => {
    try {
        // User should be authenticated
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        // Fetch fresh user from database
        const user = await user_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if there's a pending email change
        if (!user.pendingEmail) {
            res.status(400).json({
                success: false,
                message: "No pending email change to cancel.",
            });
            return;
        }
        // Clear pending email change
        user.pendingEmail = undefined;
        user.pendingEmailToken = undefined;
        user.pendingEmailTokenExpiresAt = undefined;
        user.pendingEmailOldToken = undefined;
        user.pendingEmailOldTokenExpiresAt = undefined;
        user.newEmailVerified = false;
        user.oldEmailApproved = false;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Pending email change has been cancelled.",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                updatedAt: user.updatedAt,
            },
        });
        return;
    }
    catch (error) {
        console.log("Error cancelling email change:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while cancelling email change.",
        });
        return;
    }
};
exports.cancelEmailChange = cancelEmailChange;
// Approve email change from old email
const approveEmailChange = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        // User should be authenticated
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { approvalToken } = req.body;
        // Fetch fresh user from database
        const user = await user_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Check if there's a pending email change
        if (!user.pendingEmail || !user.pendingEmailOldToken) {
            res.status(400).json({
                success: false,
                message: "No pending email change found.",
            });
            return;
        }
        // Verify the approval token
        if (user.pendingEmailOldToken !== approvalToken) {
            res.status(400).json({
                success: false,
                message: "Invalid approval token.",
            });
            return;
        }
        // Check if token has expired
        if (user.pendingEmailOldTokenExpiresAt &&
            new Date(user.pendingEmailOldTokenExpiresAt).getTime() < Date.now()) {
            res.status(400).json({
                success: false,
                message: "Approval token has expired. Please request a new email change.",
            });
            // Clear expired pending email
            user.pendingEmail = undefined;
            user.pendingEmailToken = undefined;
            user.pendingEmailTokenExpiresAt = undefined;
            user.pendingEmailOldToken = undefined;
            user.pendingEmailOldTokenExpiresAt = undefined;
            user.newEmailVerified = false;
            user.oldEmailApproved = false;
            await user.save();
            return;
        }
        // Mark old email as approved
        user.oldEmailApproved = true;
        user.pendingEmailOldToken = undefined; // Clear token after approval
        user.pendingEmailOldTokenExpiresAt = undefined;
        // After old email approves, check if new email has also been verified
        // If new email is already verified, complete the change immediately
        const bothVerified = user.newEmailVerified && user.oldEmailApproved;
        if (bothVerified) {
            // Both verifications complete - finalize the email change
            const oldEmail = user.email;
            user.email = user.pendingEmail;
            user.isVerified = false; // Require re-verification of new email
            user.pendingEmail = undefined;
            user.pendingEmailToken = undefined;
            user.pendingEmailTokenExpiresAt = undefined;
            user.newEmailVerified = false;
            user.oldEmailApproved = false;
            // Generate new verification token for the new email
            const newVerificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
                100000).toString();
            const newVerificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            user.verificationToken = newVerificationToken;
            user.verificationTokenExpiresAt = new Date(newVerificationTokenExpiresAt);
            // Send notification to OLD email address
            try {
                await (0, emailService_1.sendEmailChangeNotification)(oldEmail, user.email, user.firstName, user.lastName);
                console.log(`Email change notification sent to old email: ${oldEmail}`);
            }
            catch (emailError) {
                console.error("Error sending email change notification:", emailError);
            }
            // Send verification email to NEW address
            try {
                await (0, emailService_1.sendVerificationEmail)(user.email, newVerificationToken);
                console.log(`Verification email sent to new email: ${user.email}`);
            }
            catch (emailError) {
                console.error("Error sending verification email:", emailError);
            }
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: bothVerified
                ? "Email address changed successfully. Please verify your new email address."
                : "Old email approved successfully! Now please verify your new email address to complete the change.",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                pendingEmail: user.pendingEmail,
                updatedAt: user.updatedAt,
            },
            emailChangeStatus: {
                newEmailVerified: user.newEmailVerified,
                oldEmailApproved: user.oldEmailApproved,
                completed: bothVerified,
            },
            nextStep: bothVerified
                ? null
                : {
                    action: "verify_new_email",
                    message: "Please check your new email inbox and verify the change to complete the process.",
                    newEmail: user.pendingEmail,
                },
        });
        return;
    }
    catch (error) {
        console.log("Error approving email change:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while approving email change.",
        });
        return;
    }
};
exports.approveEmailChange = approveEmailChange;
// Admin: Update any user's profile
const adminUpdateUser = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        // Admin should be authenticated (via authenticate + requireAdmin middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { userId } = req.params;
        const { firstName, lastName, phoneNumber, email, roles, isVerified } = req.body;
        // Validate userId format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
            return;
        }
        // Fetch the user to update
        const userToUpdate = await user_1.default.findById(userId);
        if (!userToUpdate) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Prevent admin from editing their own role (security best practice)
        if (userId === req.userId && roles && JSON.stringify(roles) !== JSON.stringify(userToUpdate.roles)) {
            res.status(403).json({
                success: false,
                message: "You cannot change your own role.",
            });
            return;
        }
        // Track if email is being changed
        const emailChanged = email && email.toLowerCase() !== userToUpdate.email.toLowerCase();
        const oldEmail = emailChanged ? userToUpdate.email : undefined;
        // Track changes for audit log
        const changes = [];
        let action = "update";
        // Update fields if provided
        if (firstName !== undefined && firstName.trim() !== userToUpdate.firstName) {
            changes.push({
                field: "firstName",
                oldValue: userToUpdate.firstName,
                newValue: firstName.trim(),
            });
            userToUpdate.firstName = firstName.trim();
        }
        if (lastName !== undefined && lastName.trim() !== userToUpdate.lastName) {
            changes.push({
                field: "lastName",
                oldValue: userToUpdate.lastName,
                newValue: lastName.trim(),
            });
            userToUpdate.lastName = lastName.trim();
        }
        if (phoneNumber !== undefined && phoneNumber.trim() !== userToUpdate.phoneNumber) {
            changes.push({
                field: "phoneNumber",
                oldValue: userToUpdate.phoneNumber,
                newValue: phoneNumber.trim(),
            });
            userToUpdate.phoneNumber = phoneNumber.trim();
        }
        // Handle email change (admin can change directly, bypassing two-step verification)
        if (emailChanged) {
            // Check if new email is already taken
            const existingUser = await user_1.default.findOne({
                email: email.toLowerCase(),
                _id: { $ne: userId } // Exclude current user
            });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "Email is already in use by another account.",
                });
                return;
            }
            // Clear any pending email change
            userToUpdate.pendingEmail = undefined;
            userToUpdate.pendingEmailToken = undefined;
            userToUpdate.pendingEmailTokenExpiresAt = undefined;
            userToUpdate.pendingEmailOldToken = undefined;
            userToUpdate.pendingEmailOldTokenExpiresAt = undefined;
            userToUpdate.newEmailVerified = false;
            userToUpdate.oldEmailApproved = false;
            // Track email change for audit
            changes.push({
                field: "email",
                oldValue: userToUpdate.email,
                newValue: email.toLowerCase(),
            });
            action = "email_change";
            // Update email directly (admin privilege)
            userToUpdate.email = email.toLowerCase();
            // Mark as unverified if email changes (user needs to verify new email)
            userToUpdate.isVerified = false;
            // Track isVerified change
            if (userToUpdate.isVerified !== false) {
                changes.push({
                    field: "isVerified",
                    oldValue: userToUpdate.isVerified,
                    newValue: false,
                });
            }
            // Generate new verification token for the new email
            const verificationToken = ((parseInt((0, crypto_1.randomBytes)(3).toString("hex"), 16) % 900000) +
                100000).toString();
            const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
            userToUpdate.verificationToken = verificationToken;
            userToUpdate.verificationTokenExpiresAt = new Date(verificationTokenExpiresAt);
            // Send notification to OLD email address
            try {
                await (0, emailService_1.sendEmailChangeNotification)(oldEmail, userToUpdate.email, userToUpdate.firstName, userToUpdate.lastName);
                console.log(`Admin email change notification sent to old email: ${oldEmail}`);
            }
            catch (emailError) {
                console.error("Error sending email change notification:", emailError);
                // Continue even if notification fails
            }
            // Send verification email to NEW address
            try {
                await (0, emailService_1.sendVerificationEmail)(userToUpdate.email, verificationToken);
                console.log(`Verification email sent to new email: ${userToUpdate.email}`);
            }
            catch (emailError) {
                console.error("Error sending verification email:", emailError);
                // Continue even if email fails
            }
        }
        // Update roles if provided
        if (roles !== undefined) {
            // Validate roles array
            const validRoles = ["user", "admin", "moderator"];
            const invalidRoles = roles.filter((role) => !validRoles.includes(role));
            if (invalidRoles.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Invalid roles: ${invalidRoles.join(", ")}. Valid roles are: ${validRoles.join(", ")}`,
                });
                return;
            }
            const oldRoles = JSON.stringify(userToUpdate.roles.sort());
            const newRoles = JSON.stringify([...roles].sort());
            if (oldRoles !== newRoles) {
                changes.push({
                    field: "roles",
                    oldValue: userToUpdate.roles,
                    newValue: roles,
                });
                if (action === "update") {
                    action = "role_change";
                }
                userToUpdate.roles = roles;
            }
        }
        // Update verification status if provided
        if (isVerified !== undefined && isVerified !== userToUpdate.isVerified) {
            changes.push({
                field: "isVerified",
                oldValue: userToUpdate.isVerified,
                newValue: isVerified,
            });
            if (action === "update") {
                action = "verification_change";
            }
            userToUpdate.isVerified = isVerified;
            // If marking as verified, clear verification tokens
            if (isVerified) {
                userToUpdate.verificationToken = undefined;
                userToUpdate.verificationTokenExpiresAt = undefined;
            }
        }
        // Only save and log if there are actual changes
        if (changes.length === 0) {
            res.status(200).json({
                success: true,
                message: "No changes detected.",
                user: {
                    _id: userToUpdate._id,
                    email: userToUpdate.email,
                    firstName: userToUpdate.firstName,
                    lastName: userToUpdate.lastName,
                    phoneNumber: userToUpdate.phoneNumber,
                    roles: userToUpdate.roles,
                    isVerified: userToUpdate.isVerified,
                    lastLoginDate: userToUpdate.lastLoginDate,
                    createdAt: userToUpdate.createdAt,
                    updatedAt: userToUpdate.updatedAt,
                },
            });
            return;
        }
        await userToUpdate.save();
        // Create audit log entry
        try {
            const adminName = `${req.user.firstName} ${req.user.lastName}`;
            const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
            const userAgent = req.headers["user-agent"];
            const auditLog = new userAuditLog_1.default({
                userId: userToUpdate._id,
                action,
                changedBy: {
                    adminId: new mongoose_1.default.Types.ObjectId(req.userId),
                    adminEmail: req.user.email,
                    adminName,
                },
                changes,
                metadata: {
                    ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
                    userAgent,
                },
            });
            await auditLog.save();
            console.log(`Audit log created for user ${userToUpdate._id} by admin ${req.user.email}`);
        }
        catch (auditError) {
            console.error("Error creating audit log:", auditError);
            // Don't fail the request if audit log fails, but log the error
        }
        res.status(200).json({
            success: true,
            message: emailChanged
                ? "User updated successfully. Email changed - verification email sent to new address."
                : "User updated successfully.",
            user: {
                _id: userToUpdate._id,
                email: userToUpdate.email,
                firstName: userToUpdate.firstName,
                lastName: userToUpdate.lastName,
                phoneNumber: userToUpdate.phoneNumber,
                roles: userToUpdate.roles,
                isVerified: userToUpdate.isVerified,
                lastLoginDate: userToUpdate.lastLoginDate,
                createdAt: userToUpdate.createdAt,
                updatedAt: userToUpdate.updatedAt,
            },
            emailChanged,
            updatedBy: {
                adminId: req.userId,
                adminEmail: req.user.email,
            },
        });
        return;
    }
    catch (error) {
        console.log("Error updating user (admin):", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while updating user.",
        });
        return;
    }
};
exports.adminUpdateUser = adminUpdateUser;
// Admin: Get single user by ID
const adminGetUser = async (req, res) => {
    try {
        // Admin should be authenticated (via authenticate + requireAdmin middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { userId } = req.params;
        // Validate userId format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
            return;
        }
        // Fetch the user
        const user = await user_1.default.findById(userId).select("-password -resetPasswordToken -verificationToken -pendingEmailToken -pendingEmailOldToken");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                roles: user.roles,
                isVerified: user.isVerified,
                lastLoginDate: user.lastLoginDate,
                pendingEmail: user.pendingEmail,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
        return;
    }
    catch (error) {
        console.log("Error fetching user (admin):", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching user.",
        });
        return;
    }
};
exports.adminGetUser = adminGetUser;
// Admin: Get audit trail for a user
const adminGetUserAuditTrail = async (req, res) => {
    try {
        // Admin should be authenticated (via authenticate + requireAdmin middleware)
        if (!req.userId || !req.user) {
            res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first.",
            });
            return;
        }
        const { userId } = req.params;
        // Validate userId format
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID format.",
            });
            return;
        }
        // Check if user exists
        const user = await user_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Filter by action if provided
        const filter = { userId };
        if (req.query.action) {
            filter.action = req.query.action;
        }
        // Get total count for pagination
        const totalLogs = await userAuditLog_1.default.countDocuments(filter);
        // Get audit logs with pagination
        const auditLogs = await userAuditLog_1.default.find(filter)
            .populate("changedBy.adminId", "firstName lastName email")
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);
        // Calculate pagination info
        const totalPages = Math.ceil(totalLogs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        res.status(200).json({
            success: true,
            message: "Audit trail retrieved successfully",
            data: {
                userId: user._id,
                userEmail: user.email,
                userName: `${user.firstName} ${user.lastName}`,
                auditLogs,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalLogs,
                    limit,
                    hasNextPage,
                    hasPrevPage,
                },
            },
        });
        return;
    }
    catch (error) {
        console.log("Error fetching audit trail:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching audit trail.",
        });
        return;
    }
};
exports.adminGetUserAuditTrail = adminGetUserAuditTrail;
