import { Request, Response } from 'express';
import { cleanupImagesByUrls, cleanupImagesByPublicIds } from '../utils/cloudinaryCleanup';

/**
 * Cleanup orphaned images by URLs
 * POST /api/cleanup/images
 * 
 * Body: { imageUrls: string[] }
 */
export const cleanupImagesByUrlsController = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.userId || !req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.',
      });
      return;
    }

    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(400).json({
        success: false,
        message: 'imageUrls array is required and must not be empty.',
      });
      return;
    }

    const result = await cleanupImagesByUrls(imageUrls);

    res.status(200).json({
      success: result.success,
      message: `${result.deleted} image(s) deleted successfully.`,
      data: {
        deleted: result.deleted,
        total: imageUrls.length,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    console.error('Error cleaning up images:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while cleaning up images.',
    });
  }
};

/**
 * Cleanup orphaned images by public IDs
 * POST /api/cleanup/images/public-ids
 * 
 * Body: { publicIds: string[] }
 */
export const cleanupImagesByPublicIdsController = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.userId || !req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.',
      });
      return;
    }

    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'publicIds array is required and must not be empty.',
      });
      return;
    }

    const result = await cleanupImagesByPublicIds(publicIds);

    res.status(200).json({
      success: result.success,
      message: `${result.deleted} image(s) deleted successfully.`,
      data: {
        deleted: result.deleted,
        total: publicIds.length,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    console.error('Error cleaning up images:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while cleaning up images.',
    });
  }
};

