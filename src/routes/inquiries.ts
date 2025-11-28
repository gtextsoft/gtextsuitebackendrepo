import express from "express";
import {
  createInquiry,
  createSimpleInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiry";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middleware/auth.middleware";

const router = express.Router();

// All inquiry routes require authentication
// Users can create inquiries and view their own inquiries
// Admins can view all inquiries and update status

// Create simple inquiry - public (no auth required) or authenticated
// This matches the frontend form: fullName, email, phone, propertyId, message
router.post("/simple", optionalAuthenticate, createSimpleInquiry);

// Create inquiry - authenticated users only (full version with all fields)
router.post("/", authenticate, createInquiry);

// Get list of inquiries - users see their own, admins see all
router.get("/", authenticate, getInquiries);

// Get single inquiry by ID - users see their own, admins see all
router.get("/:id", authenticate, getInquiryById);

// Update inquiry status - Admin only
router.patch("/:id/status", authenticate, requireAdmin, updateInquiryStatus);

// Delete inquiry - users can delete their own, admins can delete any
router.delete("/:id", authenticate, deleteInquiry);

export default router;

