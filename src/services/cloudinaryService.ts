import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface MultipleUploadResult {
  success: boolean;
  urls?: string[];
  publicIds?: string[];
  errors?: string[];
}

/**
 * Upload a single image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Cloudinary folder path (e.g., 'properties', 'tours', 'profiles')
 * @param publicId - Optional custom public ID
 * @returns Upload result with URL and public ID
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
  publicId?: string
): Promise<UploadResult> => {
  try {
    // Convert buffer to base64 if needed, or use file path
    const uploadOptions: any = {
      folder: `gtextsuite/${folder}`,
      resource_type: 'image' as const,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Upload from buffer
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      );
      uploadStream.end(file.buffer);
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file buffers
 * @param folder - Cloudinary folder path
 * @returns Upload results with URLs and public IDs
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<MultipleUploadResult> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    const urls: string[] = [];
    const publicIds: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.success && result.url && result.publicId) {
        urls.push(result.url);
        publicIds.push(result.publicId);
      } else {
        errors.push(`File ${index + 1}: ${result.error || 'Upload failed'}`);
      }
    });

    return {
      success: errors.length === 0,
      urls,
      publicIds,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);
    return {
      success: false,
      errors: [error.message || 'Failed to upload images'],
    };
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Success status
 */
export const deleteImage = async (publicId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return { success: true };
    } else {
      return { success: false, error: 'Image not found or already deleted' };
    }
  } catch (error: any) {
    console.error('Error deleting image from Cloudinary:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete image',
    };
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Success status and results
 */
export const deleteMultipleImages = async (
  publicIds: string[]
): Promise<{ success: boolean; deleted: number; errors?: string[] }> => {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.all(deletePromises);

    const deleted = results.filter((r) => r.success).length;
    const errors = results
      .map((r, index) => (!r.success ? `Image ${index + 1}: ${r.error}` : null))
      .filter((e): e is string => e !== null);

    return {
      success: errors.length === 0,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error('Error deleting multiple images:', error);
    return {
      success: false,
      deleted: 0,
      errors: [error.message || 'Failed to delete images'],
    };
  }
};

