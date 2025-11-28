"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * Upload a single image
 * POST /api/uploads/single?folder=profiles|properties|tours|bookings|inquiries
 *
 * Body: FormData with 'image' field
 * Authentication: Required
 *
 * Folders:
 * - profiles: User profile pictures (any authenticated user)
 * - properties: Property images (admin only)
 * - tours: Tour images (admin only)
 * - bookings: Booking property images (admin/client)
 * - inquiries: Inquiry property images (admin/client)
 */
router.post('/single', auth_middleware_1.authenticate, upload_middleware_1.uploadSingle, upload_middleware_1.handleUploadError, upload_controller_1.uploadSingleImage);
/**
 * Upload multiple images
 * POST /api/uploads/multiple?folder=properties|tours|bookings|inquiries
 *
 * Body: FormData with 'images' field (array)
 * Authentication: Required
 * Admin only for: properties, tours
 */
router.post('/multiple', auth_middleware_1.authenticate, upload_middleware_1.uploadMultiple, upload_middleware_1.handleUploadError, upload_controller_1.uploadMultipleImages);
/**
 * Delete a single image
 * DELETE /api/uploads/:publicId
 *
 * Authentication: Required
 */
router.delete('/:publicId', auth_middleware_1.authenticate, upload_controller_1.deleteSingleImage);
/**
 * Delete multiple images
 * DELETE /api/uploads/multiple
 *
 * Body: { publicIds: string[] }
 * Authentication: Required
 */
router.delete('/multiple', auth_middleware_1.authenticate, upload_controller_1.deleteMultipleImages);
exports.default = router;
