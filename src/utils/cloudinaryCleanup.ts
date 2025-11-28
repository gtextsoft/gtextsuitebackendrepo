/**
 * Cloudinary Cleanup Utility
 * 
 * Helper functions to clean up orphaned images from Cloudinary
 * when database operations fail
 */

import { deleteMultipleImages } from '../services/cloudinaryService';

/**
 * Extract public IDs from Cloudinary URLs
 * @param urls - Array of Cloudinary image URLs
 * @returns Array of public IDs
 */
export const extractPublicIdsFromUrls = (urls: string[]): string[] => {
  return urls
    .map((url) => {
      try {
        // Cloudinary URL format examples:
        // https://res.cloudinary.com/{cloud_name}/image/upload/v1234567890/gtextsuite/properties/xyz123.jpg
        // https://res.cloudinary.com/{cloud_name}/image/upload/gtextsuite/properties/xyz123.jpg
        
        // Match everything after /upload/ (including version and folder)
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (match && match[1]) {
          // Return full path including folder (e.g., "gtextsuite/properties/xyz123")
          // This is the public_id format Cloudinary expects
          return match[1];
        }
        return null;
      } catch (error) {
        console.error('Error extracting public ID from URL:', url, error);
        return null;
      }
    })
    .filter((id): id is string => id !== null);
};

/**
 * Clean up images from Cloudinary using URLs
 * @param imageUrls - Array of Cloudinary image URLs
 * @returns Cleanup result
 */
export const cleanupImagesByUrls = async (imageUrls: string[]): Promise<{ success: boolean; deleted: number; errors?: string[] }> => {
  if (!imageUrls || imageUrls.length === 0) {
    return { success: true, deleted: 0 };
  }

  const publicIds = extractPublicIdsFromUrls(imageUrls);
  
  if (publicIds.length === 0) {
    console.warn('No valid public IDs extracted from URLs');
    return { success: false, deleted: 0, errors: ['No valid public IDs found'] };
  }

  return await deleteMultipleImages(publicIds);
};

/**
 * Clean up images from Cloudinary using public IDs
 * @param publicIds - Array of Cloudinary public IDs
 * @returns Cleanup result
 */
export const cleanupImagesByPublicIds = async (publicIds: string[]): Promise<{ success: boolean; deleted: number; errors?: string[] }> => {
  if (!publicIds || publicIds.length === 0) {
    return { success: true, deleted: 0 };
  }

  return await deleteMultipleImages(publicIds);
};

