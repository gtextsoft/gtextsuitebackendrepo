import express from "express";
import {
  createTour,
  getTours,
  getTourById,
  updateTour,
  deleteTour,
} from "../controllers/tour";
import {
  createTourBooking,
  getTourBookings,
  getTourBookingById,
  updateTourBookingStatus,
  cancelTourBooking,
} from "../controllers/tourBooking";
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  validateCreateTour,
  validateUpdateTour,
  validateCreateTourBooking,
  validateUpdateTourBookingStatus,
  validateCancelTourBooking,
} from "../validators/tour.validators";

const router = express.Router();

// ==================== TOUR ROUTES ====================

// Get all tours - Public (optional auth to show admin-only info)
router.get("/", optionalAuthenticate, getTours);

// ==================== TOUR BOOKING ROUTES ====================
// Note: Booking routes must come before /:id route to avoid route conflicts

// Get list of tour bookings - Users see their own, admins see all
router.get("/bookings", authenticate, getTourBookings);

// Get single tour booking by ID - Users see their own, admins see all
router.get("/bookings/:id", authenticate, getTourBookingById);

// Update tour booking status - Admin only
router.patch(
  "/bookings/:id/status",
  authenticate,
  requireAdmin,
  validateUpdateTourBookingStatus,
  updateTourBookingStatus
);

// Cancel tour booking - Users can cancel their own, admins can cancel any
router.delete("/bookings/:id", authenticate, validateCancelTourBooking, cancelTourBooking);

// Create tour booking - Authenticated users only (MUST come before /:id route!)
router.post("/:tourId/bookings", authenticate, validateCreateTourBooking, createTourBooking);

// ==================== TOUR ROUTES (continued) ====================

// Get single tour by ID - Public (optional auth to show admin-only info)
// MUST come after /:tourId/bookings route to avoid conflicts
router.get("/:id", optionalAuthenticate, getTourById);

// Create tour - Admin only
router.post("/", authenticate, requireAdmin, validateCreateTour, createTour);

// Update tour - Admin only
router.put("/:id", authenticate, requireAdmin, validateUpdateTour, updateTour);

// Delete tour - Admin only
router.delete("/:id", authenticate, requireAdmin, deleteTour);

export default router;

