"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleImages = exports.deleteImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
/**
 * Upload a single image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Cloudinary folder path (e.g., 'properties', 'tours', 'profiles')
 * @param publicId - Optional custom public ID
 * @returns Upload result with URL and public ID
 */
const uploadImage = async (file, folder, publicId) => {
    try {
        // Convert buffer to base64 if needed, or use file path
        const uploadOptions = {
            folder: `gtextsuite/${folder}`,
            resource_type: 'image',
            transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
        };
        if (publicId) {
            uploadOptions.public_id = publicId;
        }
        // Upload from buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error)
                    reject(error);
                else if (result)
                    resolve(result);
                else
                    reject(new Error('Upload failed'));
            });
            uploadStream.end(file.buffer);
        });
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        };
    }
    catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return {
            success: false,
            error: error.message || 'Failed to upload image',
        };
    }
};
exports.uploadImage = uploadImage;
/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file buffers
 * @param folder - Cloudinary folder path
 * @returns Upload results with URLs and public IDs
 */
const uploadMultipleImages = async (files, folder) => {
    try {
        const uploadPromises = files.map((file) => (0, exports.uploadImage)(file, folder));
        const results = await Promise.all(uploadPromises);
        const urls = [];
        const publicIds = [];
        const errors = [];
        results.forEach((result, index) => {
            if (result.success && result.url && result.publicId) {
                urls.push(result.url);
                publicIds.push(result.publicId);
            }
            else {
                errors.push(`File ${index + 1}: ${result.error || 'Upload failed'}`);
            }
        });
        return {
            success: errors.length === 0,
            urls,
            publicIds,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    catch (error) {
        console.error('Error uploading multiple images:', error);
        return {
            success: false,
            errors: [error.message || 'Failed to upload images'],
        };
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Success status
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary_1.default.uploader.destroy(publicId);
        if (result.result === 'ok') {
            return { success: true };
        }
        else {
            return { success: false, error: 'Image not found or already deleted' };
        }
    }
    catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete image',
        };
    }
};
exports.deleteImage = deleteImage;
/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @returns Success status and results
 */
const deleteMultipleImages = async (publicIds) => {
    try {
        const deletePromises = publicIds.map((publicId) => (0, exports.deleteImage)(publicId));
        const results = await Promise.all(deletePromises);
        const deleted = results.filter((r) => r.success).length;
        const errors = results
            .map((r, index) => (!r.success ? `Image ${index + 1}: ${r.error}` : null))
            .filter((e) => e !== null);
        return {
            success: errors.length === 0,
            deleted,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    catch (error) {
        console.error('Error deleting multiple images:', error);
        return {
            success: false,
            deleted: 0,
            errors: [error.message || 'Failed to delete images'],
        };
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
