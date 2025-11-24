"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_1 = require("../controllers/booking");
const auth_middleware_1 = require("../middleware/auth.middleware");
const booking_validators_1 = require("../validators/booking.validators");
const router = express_1.default.Router();
// All booking routes require authentication
// Users can create bookings and view their own bookings
// Admins can view all bookings and update status
// Create booking - authenticated users only
router.post("/", auth_middleware_1.authenticate, booking_validators_1.validateCreateBooking, booking_1.createBooking);
// Get list of bookings - users see their own, admins see all
router.get("/", auth_middleware_1.authenticate, booking_1.getBookings);
// Get single booking by ID - users see their own, admins see all
router.get("/:id", auth_middleware_1.authenticate, booking_1.getBookingById);
// Update booking status - Admin only
router.patch("/:id/status", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, booking_validators_1.validateUpdateBookingStatus, booking_1.updateBookingStatus);
// Cancel booking - users can cancel their own, admins can cancel any
router.delete("/:id", auth_middleware_1.authenticate, booking_validators_1.validateCancelBooking, booking_1.cancelBooking);
exports.default = router;
