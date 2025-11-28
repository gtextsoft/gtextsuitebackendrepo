"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cleanup_controller_1 = require("../controllers/cleanup.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * Cleanup orphaned images by URLs
 * POST /api/cleanup/images
 *
 * Body: { imageUrls: string[] }
 * Authentication: Required
 */
router.post('/images', auth_middleware_1.authenticate, cleanup_controller_1.cleanupImagesByUrlsController);
/**
 * Cleanup orphaned images by public IDs
 * POST /api/cleanup/images/public-ids
 *
 * Body: { publicIds: string[] }
 * Authentication: Required
 */
router.post('/images/public-ids', auth_middleware_1.authenticate, cleanup_controller_1.cleanupImagesByPublicIdsController);
exports.default = router;
