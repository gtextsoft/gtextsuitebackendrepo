"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupImagesByPublicIdsController = exports.cleanupImagesByUrlsController = void 0;
const cloudinaryCleanup_1 = require("../utils/cloudinaryCleanup");
/**
 * Cleanup orphaned images by URLs
 * POST /api/cleanup/images
 *
 * Body: { imageUrls: string[] }
 */
const cleanupImagesByUrlsController = async (req, res) => {
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
        const result = await (0, cloudinaryCleanup_1.cleanupImagesByUrls)(imageUrls);
        res.status(200).json({
            success: result.success,
            message: `${result.deleted} image(s) deleted successfully.`,
            data: {
                deleted: result.deleted,
                total: imageUrls.length,
                errors: result.errors,
            },
        });
    }
    catch (error) {
        console.error('Error cleaning up images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while cleaning up images.',
        });
    }
};
exports.cleanupImagesByUrlsController = cleanupImagesByUrlsController;
/**
 * Cleanup orphaned images by public IDs
 * POST /api/cleanup/images/public-ids
 *
 * Body: { publicIds: string[] }
 */
const cleanupImagesByPublicIdsController = async (req, res) => {
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
        const result = await (0, cloudinaryCleanup_1.cleanupImagesByPublicIds)(publicIds);
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
        console.error('Error cleaning up images:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while cleaning up images.',
        });
    }
};
exports.cleanupImagesByPublicIdsController = cleanupImagesByPublicIdsController;
