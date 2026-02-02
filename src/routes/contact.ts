import express from "express";
import {
  createContactForm,
  getContactForms,
  getContactFormById,
  updateContactFormStatus,
  deleteContactForm,
} from "../controllers/contact";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middleware/auth.middleware";

const router = express.Router();

// Contact form routes
// Public can submit contact forms, admins can view and manage them

// Create contact form submission - public (no auth required)
router.post("/", optionalAuthenticate, createContactForm);

// Get all contact forms - Admin only
router.get("/", authenticate, requireAdmin, getContactForms);

// Get single contact form by ID - Admin only
router.get("/:id", authenticate, requireAdmin, getContactFormById);

// Update contact form status - Admin only
router.patch("/:id/status", authenticate, requireAdmin, updateContactFormStatus);

// Delete contact form - Admin only
router.delete("/:id", authenticate, requireAdmin, deleteContactForm);

export default router;
