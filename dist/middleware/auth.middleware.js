"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = exports.requireAdmin = exports.optionalAuthenticate = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const user_1 = __importDefault(require("../models/user"));
// Authentication middleware - verifies JWT token and attaches user info
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies?.auth_token;
        // Debug logging to help troubleshoot cookie issues
        console.log("🔐 Auth Middleware Debug:", {
            hasCookies: !!req.cookies,
            cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
            hasAuthToken: !!token,
            origin: req.headers.origin,
            userAgent: req.headers["user-agent"]?.substring(0, 50),
        });
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
            });
            return;
        }
        // Verify token
        const jwtSecret = process.env.JWT_SECRET_KEY;
        if (!jwtSecret) {
            res.status(500).json({
                success: false,
                message: "Server configuration error",
            });
            return;
        }
        const decoded = (0, jwt_util_1.verifyToken)(token, jwtSecret);
        // Attach userId to request object
        req.userId = decoded.userId;
        // Optionally fetch and attach full user object
        const user = await user_1.default.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        req.user = user;
        return next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid or expired token",
        });
        return;
    }
};
exports.authenticate = authenticate;
// Optional authentication middleware - doesn't fail if no token
// Used for routes that work for both authenticated and non-authenticated users
const optionalAuthenticate = async (req, _res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies?.auth_token;
        // If no token, just continue (user is not authenticated)
        if (!token) {
            return next();
        }
        // Verify token if it exists
        const jwtSecret = process.env.JWT_SECRET_KEY;
        if (!jwtSecret) {
            return next(); // Continue without auth if secret not configured
        }
        try {
            const decoded = (0, jwt_util_1.verifyToken)(token, jwtSecret);
            // Attach userId to request object
            req.userId = decoded.userId;
            // Fetch and attach full user object
            const user = await user_1.default.findById(decoded.userId).select("-password");
            if (user) {
                req.user = user;
            }
        }
        catch (error) {
            // Token invalid or expired, but continue without auth
            // Don't throw error, just proceed without user info
        }
        return next();
    }
    catch (error) {
        // On any error, continue without authentication
        return next();
    }
};
exports.optionalAuthenticate = optionalAuthenticate;
// Admin-only middleware - must be used after authenticate
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    // Check if user has admin role
    if (!req.user.roles || !req.user.roles.includes("admin")) {
        res.status(403).json({
            success: false,
            message: "Forbidden - Admin access required",
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Require verified email middleware - must be used after authenticate
// Blocks access to routes that require verified email
const requireVerified = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
        return;
    }
    // Check if user email is verified
    if (!req.user.isVerified) {
        res.status(403).json({
            success: false,
            message: "Email verification required. Please verify your email to access this feature.",
            requiresVerification: true,
        });
        return;
    }
    next();
};
exports.requireVerified = requireVerified;
