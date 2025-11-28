import express from 'express';
import {
  cleanupImagesByUrlsController,
  cleanupImagesByPublicIdsController,
} from '../controllers/cleanup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * Cleanup orphaned images by URLs
 * POST /api/cleanup/images
 * 
 * Body: { imageUrls: string[] }
 * Authentication: Required
 */
router.post(
  '/images',
  authenticate,
  cleanupImagesByUrlsController
);

/**
 * Cleanup orphaned images by public IDs
 * POST /api/cleanup/images/public-ids
 * 
 * Body: { publicIds: string[] }
 * Authentication: Required
 */
router.post(
  '/images/public-ids',
  authenticate,
  cleanupImagesByPublicIdsController
);

export default router;

