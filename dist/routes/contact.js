"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_1 = require("../controllers/contact");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Contact form routes
// Public can submit contact forms, admins can view and manage them
// Create contact form submission - public (no auth required)
router.post("/", auth_middleware_1.optionalAuthenticate, contact_1.createContactForm);
// Get all contact forms - Admin only
router.get("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_1.getContactForms);
// Get single contact form by ID - Admin only
router.get("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_1.getContactFormById);
// Update contact form status - Admin only
router.patch("/:id/status", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_1.updateContactFormStatus);
// Delete contact form - Admin only
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, contact_1.deleteContactForm);
exports.default = router;
