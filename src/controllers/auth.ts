import User from "../models/user";
import { Request, Response } from "express";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendTestEmail,
} from "../services/emailService";

const { validationResult } = require("express-validator");

const registerUser = async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User Credentials already exist',
            });
            return;
        }

        // Generate verification token using Node crypto for secure randomness
        const verificationToken = (
            (parseInt(randomBytes(3).toString("hex"), 16) % 900000) +
            100000
        ).toString();

        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const newUser = new User({ email, password, firstName, lastName, phoneNumber,  isVerified: false, roles: ["user"], verificationToken, verificationTokenExpiresAt });

        await newUser.save();

        // Send verification email
        try {
          await sendVerificationEmail(email, verificationToken);
          console.log(`Verification email sent to: ${email}`);
        } catch (emailError) {
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
    } catch (error: any) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong During Registration',
        });
    }
}


const loginUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
  
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
    generateTokenAndSetCookie(res, userId);
  
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
    } catch (error) {
      console.log("Error during Login", error);
      res.status(500).json({ success: false, message: "Something went wrong.", error: error });
      return;
    }
  };
  
// Logout user - clears authentication cookie
const logOut = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.log("Error during Logout:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during logout.",
    });
    return;
  }
};
  
// Verify user email with verification token
const verifyEmail = async (req: Request, res: Response) => {
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
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
      return;
    }

    // Find user by ID
    const user = await User.findOne({ _id: userId });

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
    if (
      !user.verificationToken ||
      user.verificationToken !== verificationToken
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid verification token.",
      });
      return;
    }

    // Check if token has expired
    if (
      user.verificationTokenExpiresAt &&
      new Date(user.verificationTokenExpiresAt).getTime() < Date.now()
    ) {
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
      await sendWelcomeEmail(user.email, user.firstName, user.lastName);
      console.log(`Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail verification if email fails
    }

    res.status(200).json({
      success: true,
      message: "Email successfully verified.",
    });
    return;
  } catch (error: any) {
    console.log("Error during email verification:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during email verification.",
    });
    return;
  }
};

// Resend verification email - for logged-in users
const resendVerification = async (req: Request, res: Response) => {
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
    const verificationToken = (
      (parseInt(randomBytes(3).toString("hex"), 16) % 900000) +
      100000
    ).toString();

    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Update user with new token (need to fetch fresh user from DB to update)
    const userDoc = await User.findById(req.userId);
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
      await sendVerificationEmail(userDoc.email, verificationToken);
      console.log(`✅ Verification email resent to: ${userDoc.email}`);
    } catch (emailError: any) {
      console.error("❌ Error sending verification email:", emailError?.message || emailError);
      // Still return success for security (don't reveal if email exists)
    }

    res.status(200).json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
    return;
  } catch (error: any) {
    console.log("Error during resend verification:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while sending verification email.",
    });
    return;
  }
};
  
// Request password reset - sends reset link to user's email
const forgotPassword = async (req: Request, res: Response) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
      return;
    }

    // Generate a secure random reset token
    const resetToken = randomBytes(20).toString("hex");
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
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Don't fail if email fails - still return success for security
    }

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      // In development, you might want to return the reset link for testing
      // Remove this in production
      ...(process.env.NODE_ENV === "development" && { resetLink }),
    });
    return;
  } catch (error: any) {
    console.log("Error during forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during password reset request.",
    });
    return;
  }
};
  
// Reset password using reset token
const resetPassword = async (req: Request, res: Response) => {
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
    const user = await User.findOne({
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
      await sendResetSuccessEmail(user.email);
      console.log(`Password reset success email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Error sending password reset success email:", emailError);
      // Don't fail if email fails - password was already reset
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
    });
    return;
  } catch (error: any) {
    console.log("Error during password reset:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during password reset.",
    });
    return;
  }
};

// Register admin user (requires secret key)
const registerAdmin = async (req: Request, res: Response) => {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Generate verification token
    const verificationToken = (
      (parseInt(randomBytes(3).toString("hex"), 16) % 900000) + 100000
    ).toString();

    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create admin user with admin role
    const newAdmin = new User({
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
  } catch (error: any) {
    console.log("Error during admin registration:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during admin registration",
    });
  }
};

// Test email endpoint - doesn't touch database, just tests email configuration
const testEmail = async (req: Request, res: Response) => {
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
    await sendTestEmail(email);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}. Please check your inbox (and spam folder).`,
    });
    return;
  } catch (error: any) {
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
    } else if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
      errorMessage = "Cannot connect to email server";
      errorDetails = error?.message || "Connection timeout";
      hint = "Check your internet connection and firewall settings";
    } else if (error?.command === "CONN" || error?.code === "ENOTFOUND") {
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

// Get all users (Admin only)
const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Query parameters for filtering and pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter: any = {};
    
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
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ];
    }

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    
    // Get users with pagination
    const users = await User.find(filter)
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
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export { registerUser, loginUser, registerAdmin, logOut, verifyEmail, resendVerification, forgotPassword, resetPassword, testEmail, getAllUsers };