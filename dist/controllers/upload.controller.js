"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleImages = exports.deleteSingleImage = exports.uploadMultipleImages = exports.uploadSingleImage = void 0;
const cloudinaryService_1 = require("../services/cloudinaryService");
/**
 * Upload a single image
 * Used for: Profile pictures, single property/tour images
 */
const uploadSingleImage = async (req, res) => {
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
        const folder = req.query.folder || 'profiles';
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
        const result = await (0, cloudinaryService_1.uploadImage)(req.file, folder);
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
    }
    catch (error) {
        console.error('Error uploading single image:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while uploading image.',
        });
    }
};
exports.uploadSingleImage = uploadSingleImage;
/**
 * Upload multiple images
 * Used for: Property images, tour images, booking/inquiry property images
 */
const uploadMultipleImages = async (req, res) => {
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
        let files = [];
        if (Array.isArray(req.files)) {
            // When using upload.array()
            files = req.files;
        }
        else if (typeof req.files === 'object') {
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
        const folder = req.query.folder || 'properties';
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
        const result = await (0, cloudinaryService_1.uploadMultipleImages)(files, folder);
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
    }
    catch (error) {
        console.error('Error uploading multiple images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while uploading images.',
        });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
/**
 * Delete a single image from Cloudinary
 */
const deleteSingleImage = async (req, res) => {
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
        const result = await (0, cloudinaryService_1.deleteImage)(publicId);
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
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while deleting image.',
        });
    }
};
exports.deleteSingleImage = deleteSingleImage;
/**
 * Delete multiple images from Cloudinary
 */
const deleteMultipleImages = async (req, res) => {
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
        const result = await (0, cloudinaryService_1.deleteMultipleImages)(publicIds);
        res.status(200).json({
            success: result.success,
            message: `${result.deleted} image(s) deleted successfully.`,
            data: {
                deleted: result.deleted,
                total: publicIds.length,
                errors: result.errors,
            },
        });
    }
    catch (error) {
        console.error('Error deleting multiple images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while deleting images.',
        });
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
