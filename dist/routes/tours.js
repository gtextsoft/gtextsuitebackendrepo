"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tour_1 = require("../controllers/tour");
const tourBooking_1 = require("../controllers/tourBooking");
const auth_middleware_1 = require("../middleware/auth.middleware");
const tour_validators_1 = require("../validators/tour.validators");
const router = express_1.default.Router();
// ==================== TOUR ROUTES ====================
// Get all tours - Public (optional auth to show admin-only info)
router.get("/", auth_middleware_1.optionalAuthenticate, tour_1.getTours);
// ==================== TOUR BOOKING ROUTES ====================
// Note: Booking routes must come before /:id route to avoid route conflicts
// Get list of tour bookings - Users see their own, admins see all
router.get("/bookings", auth_middleware_1.authenticate, tourBooking_1.getTourBookings);
// Get single tour booking by ID - Users see their own, admins see all
router.get("/bookings/:id", auth_middleware_1.authenticate, tourBooking_1.getTourBookingById);
// Update tour booking status - Admin only
router.patch("/bookings/:id/status", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tour_validators_1.validateUpdateTourBookingStatus, tourBooking_1.updateTourBookingStatus);
// Cancel tour booking - Users can cancel their own, admins can cancel any
router.delete("/bookings/:id", auth_middleware_1.authenticate, tour_validators_1.validateCancelTourBooking, tourBooking_1.cancelTourBooking);
// Create tour booking - Authenticated users only (MUST come before /:id route!)
router.post("/:tourId/bookings", auth_middleware_1.authenticate, tour_validators_1.validateCreateTourBooking, tourBooking_1.createTourBooking);
// ==================== TOUR ROUTES (continued) ====================
// Get single tour by ID - Public (optional auth to show admin-only info)
// MUST come after /:tourId/bookings route to avoid conflicts
router.get("/:id", auth_middleware_1.optionalAuthenticate, tour_1.getTourById);
// Create tour - Admin only
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tour_validators_1.validateCreateTour, tour_1.createTour);
// Update tour - Admin only
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tour_validators_1.validateUpdateTour, tour_1.updateTour);
// Delete tour - Admin only
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, tour_1.deleteTour);
exports.default = router;
