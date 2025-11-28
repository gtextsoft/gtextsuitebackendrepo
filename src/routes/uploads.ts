import express from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteSingleImage,
  deleteMultipleImages,
} from '../controllers/upload.controller';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.middleware';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

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
router.post(
  '/single',
  authenticate,
  uploadSingle,
  handleUploadError,
  uploadSingleImage
);

/**
 * Upload multiple images
 * POST /api/uploads/multiple?folder=properties|tours|bookings|inquiries
 * 
 * Body: FormData with 'images' field (array)
 * Authentication: Required
 * Admin only for: properties, tours
 */
router.post(
  '/multiple',
  authenticate,
  uploadMultiple,
  handleUploadError,
  uploadMultipleImages
);

/**
 * Delete a single image
 * DELETE /api/uploads/:publicId
 * 
 * Authentication: Required
 */
router.delete(
  '/:publicId',
  authenticate,
  deleteSingleImage
);

/**
 * Delete multiple images
 * DELETE /api/uploads/multiple
 * 
 * Body: { publicIds: string[] }
 * Authentication: Required
 */
router.delete(
  '/multiple',
  authenticate,
  deleteMultipleImages
);

export default router;

