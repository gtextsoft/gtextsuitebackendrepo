import { Request, Response } from 'express';
import { 
  uploadImage, 
  uploadMultipleImages as uploadMultipleToCloudinary, 
  deleteImage, 
  deleteMultipleImages as deleteMultipleFromCloudinary 
} from '../services/cloudinaryService';

/**
 * Upload a single image
 * Used for: Profile pictures, single property/tour images
 */
export const uploadSingleImage = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.userId || !req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.',
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
      return;
    }

    // Get folder from query parameter or default to 'profiles'
    const folder = (req.query.folder as string) || 'profiles';
    
    // Allowed folders
    const allowedFolders = ['profiles', 'properties', 'tours', 'bookings', 'inquiries'];
    
    if (!allowedFolders.includes(folder)) {
      res.status(400).json({
        success: false,
        message: `Invalid folder. Allowed folders: ${allowedFolders.join(', ')}`,
      });
      return;
    }

    // Upload image
    const result = await uploadImage(req.file, folder);

    if (!result.success || !result.url) {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to upload image.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        imageUrl: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error: any) {
    console.error('Error uploading single image:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while uploading image.',
    });
  }
};

/**
 * Upload multiple images
 * Used for: Property images, tour images, booking/inquiry property images
 */
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.userId || !req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.',
      });
      return;
    }

    // Check if files were uploaded
    if (!req.files) {
      res.status(400).json({
        success: false,
        message: 'No image files provided.',
      });
      return;
    }

    // Handle different multer file types
    let files: Express.Multer.File[] = [];
    
    if (Array.isArray(req.files)) {
      // When using upload.array()
      files = req.files;
    } else if (typeof req.files === 'object') {
      // When using upload.fields() - extract all files from all fields
      const fileArrays = Object.values(req.files);
      files = fileArrays.flat();
    }

    if (files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No image files provided.',
      });
      return;
    }

    // Get folder from query parameter or default to 'properties'
    const folder = (req.query.folder as string) || 'properties';
    
    // Allowed folders
    const allowedFolders = ['properties', 'tours', 'bookings', 'inquiries'];
    
    if (!allowedFolders.includes(folder)) {
      res.status(400).json({
        success: false,
        message: `Invalid folder. Allowed folders: ${allowedFolders.join(', ')}`,
      });
      return;
    }

    // Upload images
    const result = await uploadMultipleToCloudinary(files, folder);

    if (!result.success || !result.urls || result.urls.length === 0) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload images.',
        errors: result.errors,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `${result.urls.length} image(s) uploaded successfully.`,
      data: {
        imageUrls: result.urls,
        publicIds: result.publicIds,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while uploading images.',
    });
  }
};

/**
 * Delete a single image from Cloudinary
 */
export const deleteSingleImage = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.userId || !req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.',
      });
      return;
    }

    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({
        success: false,
        message: 'Public ID is required.',
      });
      return;
    }

    // Delete image
    const result = await deleteImage(publicId);

    if (!result.success) {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to delete image.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting image.',
    });
  }
};

/**
 * Delete multiple images from Cloudinary
 */
export const deleteMultipleImages = async (req: Request, res: Response) => {
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
        message: 'Public IDs array is required.',
      });
      return;
    }

    // Delete images
    const result = await deleteMultipleFromCloudinary(publicIds);

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
    console.error('Error deleting multiple images:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting images.',
    });
  }
};

