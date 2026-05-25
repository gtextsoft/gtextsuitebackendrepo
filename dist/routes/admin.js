"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
router.get("/stats", admin_controller_1.getAdminStats);
router.get("/activity", admin_controller_1.getAdminActivity);
router.get("/reports/revenue", admin_controller_1.getRevenueReport);
router.get("/reports/bookings", admin_controller_1.getBookingAnalytics);
router.get("/settings", admin_controller_1.getAdminSettings);
router.patch("/settings", admin_controller_1.updateAdminSettings);
exports.default = router;
