import express from "express";
import {
  getAdminStats,
  getAdminActivity,
  getRevenueReport,
  getBookingAnalytics,
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/activity", getAdminActivity);
router.get("/reports/revenue", getRevenueReport);
router.get("/reports/bookings", getBookingAnalytics);
router.get("/settings", getAdminSettings);
router.patch("/settings", updateAdminSettings);

export default router;
