"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inquiry_1 = require("../controllers/inquiry");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// All inquiry routes require authentication
// Users can create inquiries and view their own inquiries
// Admins can view all inquiries and update status
// Create simple inquiry - public (no auth required) or authenticated
// This matches the frontend form: fullName, email, phone, propertyId, message
router.post("/simple", auth_middleware_1.optionalAuthenticate, inquiry_1.createSimpleInquiry);
// Create inquiry - authenticated users only (full version with all fields)
router.post("/", auth_middleware_1.authenticate, inquiry_1.createInquiry);
// Get list of inquiries - users see their own, admins see all
router.get("/", auth_middleware_1.authenticate, inquiry_1.getInquiries);
// Get single inquiry by ID - users see their own, admins see all
router.get("/:id", auth_middleware_1.authenticate, inquiry_1.getInquiryById);
// Update inquiry status - Admin only
router.patch("/:id/status", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, inquiry_1.updateInquiryStatus);
// Delete inquiry - users can delete their own, admins can delete any
router.delete("/:id", auth_middleware_1.authenticate, inquiry_1.deleteInquiry);
exports.default = router;
