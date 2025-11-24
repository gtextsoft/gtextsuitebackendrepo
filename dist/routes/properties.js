"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_1 = require("../controllers/property");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes - anyone can view properties
// Authentication is optional - if admin is logged in, they see all properties (including inactive)
// If not logged in or regular user, they only see active properties
router.get("/", auth_middleware_1.optionalAuthenticate, property_1.getProperties);
router.get("/:id/related", auth_middleware_1.optionalAuthenticate, property_1.getRelatedProperties); // Must be before /:id route
router.get("/:id", auth_middleware_1.optionalAuthenticate, property_1.getPropertyById);
// Admin-only routes - require authentication + admin role
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, property_1.createProperty);
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, property_1.updateProperty);
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, property_1.deleteProperty);
exports.default = router;
