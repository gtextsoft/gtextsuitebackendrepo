"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.updateBookingStatus = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const booking_1 = __importDefault(require("../models/booking"));
const property_1 = __importDefault(require("../models/property"));
/**
 * Create a new booking
 * Users can create bookings for properties
 */
const createBooking = async (req, res) => {
    try {
        const { propertyId, propertyDetails, // For booking-only properties (agent properties)
        checkIn, checkOut, guests, guestInfo, specialRequests, bookingType, } = req.body;
        // Validate booking type (only date-based types allowed)
        const validBookingTypes = ["shortlet", "long-term", "tour"];
        if (bookingType && !validBookingTypes.includes(bookingType)) {
            res.status(400).json({
                success: false,
                message: `Invalid booking type. Must be one of: ${validBookingTypes.join(", ")}. For investments or sales, use the inquiry endpoint.`,
            });
            return;
        }
        // Validate required fields (propertyId OR propertyDetails must be provided)
        const requiredFields = {
            checkIn,
            checkOut,
            guests,
            guestInfo,
            bookingType,
        };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: "Missing required fields",
                missingFields,
            });
            return;
        }
        // Validate that either propertyId OR propertyDetails is provided
        if (!propertyId && !propertyDetails) {
            res.status(400).json({
                success: false,
                message: "Either propertyId or propertyDetails must be provided",
            });
            return;
        }
        if (propertyId && propertyDetails) {
            res.status(400).json({
                success: false,
                message: "Cannot provide both propertyId and propertyDetails",
            });
            return;
        }
        // Validate guestInfo structure
        if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
            res.status(400).json({
                success: false,
                message: "Guest information is incomplete",
            });
            return;
        }
        // Get user ID from request (set by authenticate middleware)
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        // Ensure userId is properly formatted (Mongoose will convert string to ObjectId automatically)
        // Determine property name and prepare for price calculation
        let propertyName;
        let priceForCalculation;
        // Case 1: Property exists in listing (has propertyId)
        if (propertyId) {
            const property = await property_1.default.findById(propertyId);
            if (!property) {
                res.status(404).json({
                    success: false,
                    message: "Property not found",
                });
                return;
            }
            propertyName = property.name;
            priceForCalculation = property.price;
        }
        // Case 2: Booking-only property (agent property, not in listing)
        else {
            // We already validated that propertyDetails exists above
            if (!propertyDetails.name || !propertyDetails.location || !propertyDetails.price) {
                res.status(400).json({
                    success: false,
                    message: "Property details must include name, location, and price",
                });
                return;
            }
            propertyName = propertyDetails.name;
            priceForCalculation = propertyDetails.price;
        }
        // Parse dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        // Validate dates
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            res.status(400).json({
                success: false,
                message: "Invalid date format",
            });
            return;
        }
        if (checkOutDate <= checkInDate) {
            res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date",
            });
            return;
        }
        // Check if check-in is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkInDate < today) {
            res.status(400).json({
                success: false,
                message: "Check-in date cannot be in the past",
            });
            return;
        }
        // Calculate nights
        const diffTime = checkOutDate.getTime() - checkInDate.getTime();
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Calculate total amount based on property price
        const priceValue = parseFloat(priceForCalculation.replace(/[^0-9.]/g, "")) || 0;
        const dailyRate = priceValue / 365; // Simplified daily rate
        const totalAmount = nights * dailyRate;
        // Create booking object
        const bookingData = {
            userId,
            propertyName,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            guests,
            totalAmount,
            guestInfo,
            specialRequests,
            bookingType,
            status: "pending",
            paymentStatus: "pending",
        };
        // Add propertyId if provided, otherwise add propertyDetails
        if (propertyId) {
            bookingData.propertyId = propertyId;
        }
        else if (propertyDetails) {
            bookingData.propertyDetails = propertyDetails;
        }
        const newBooking = new booking_1.default(bookingData);
        const savedBooking = await newBooking.save();
        // Populate references for response (only if propertyId exists)
        if (savedBooking.propertyId) {
            await savedBooking.populate([
                { path: "propertyId", select: "name location images" },
                { path: "userId", select: "firstName lastName email" },
            ]);
        }
        else {
            // Just populate user if no propertyId
            await savedBooking.populate([
                { path: "userId", select: "firstName lastName email" },
            ]);
        }
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: { booking: savedBooking },
        });
    }
    catch (error) {
        console.log("Error creating booking:", error);
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const validationErrors = {};
            if (error.errors) {
                Object.keys(error.errors).forEach((key) => {
                    const fieldError = error.errors[key];
                    validationErrors[key] = fieldError.message;
                });
            }
            res.status(400).json({
                success: false,
                message: "Validation failed. Please check your input.",
                errors: validationErrors,
                error: error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Something went wrong during booking creation",
            error: error.message,
        });
    }
};
exports.createBooking = createBooking;
/**
 * Get list of bookings with optional filters
 * Users see their own bookings, admins see all bookings
 */
const getBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, bookingType, } = req.query;
        // Check if user is admin
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Build filter object
        // Users see only their bookings, admins see all
        // Ensure userId is properly converted for MongoDB query
        const filter = isAdmin ? {} : { userId: req.userId };
        if (status) {
            filter.status = status;
        }
        if (bookingType) {
            filter.bookingType = bookingType;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const bookings = await booking_1.default.find(filter)
            .populate("propertyId", "name location images")
            .populate("userId", "firstName lastName email")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = await booking_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: {
                bookings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    }
    catch (error) {
        console.log("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getBookings = getBookings;
/**
 * Get single booking by ID
 * Users can only see their own bookings, admins can see all
 */
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Validate that user is authenticated
        if (!req.userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - Please log in to view bookings",
            });
            return;
        }
        const booking = await booking_1.default.findById(id)
            .populate("propertyId", "name location images")
            .populate("userId", "firstName lastName email");
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found",
            });
            return;
        }
        // Check if user has permission to view this booking
        // Handle both populated (object) and non-populated (ObjectId) userId
        let bookingUserId;
        const userIdValue = booking.userId;
        if (userIdValue && typeof userIdValue === 'object' && '_id' in userIdValue) {
            // userId is populated (object with _id)
            bookingUserId = userIdValue._id.toString();
        }
        else {
            // userId is ObjectId
            bookingUserId = userIdValue?.toString() || "";
        }
        const requestUserId = req.userId.toString();
        if (!isAdmin && bookingUserId !== requestUserId) {
            res.status(403).json({
                success: false,
                message: "Forbidden - You can only view your own bookings",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { booking },
        });
    }
    catch (error) {
        console.log("Error fetching booking:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getBookingById = getBookingById;
/**
 * Update booking status (Admin only)
 * Allows admins to update booking status and add notes
 */
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required",
            });
            return;
        }
        // Validate status value
        const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rejected"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
            return;
        }
        const updateData = { status };
        if (notes) {
            updateData.notes = notes;
        }
        // If cancelling, set cancelledAt timestamp
        if (status === "cancelled") {
            updateData.cancelledAt = new Date();
        }
        const booking = await booking_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("propertyId", "name location images")
            .populate("userId", "firstName lastName email");
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: { booking },
        });
    }
    catch (error) {
        console.log("Error updating booking status:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.updateBookingStatus = updateBookingStatus;
/**
 * Cancel booking
 * Users can cancel their own bookings, admins can cancel any booking
 */
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Validate that user is authenticated
        if (!req.userId) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - Please log in to cancel bookings",
            });
            return;
        }
        const booking = await booking_1.default.findById(id);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: "Booking not found",
            });
            return;
        }
        // Check if user has permission to cancel this booking
        // Handle both populated (object) and non-populated (ObjectId) userId
        let bookingUserId;
        const userIdValue = booking.userId;
        if (userIdValue && typeof userIdValue === 'object' && '_id' in userIdValue) {
            // userId is populated (object with _id)
            bookingUserId = userIdValue._id.toString();
        }
        else {
            // userId is ObjectId
            bookingUserId = userIdValue?.toString() || "";
        }
        const requestUserId = req.userId.toString();
        if (!isAdmin && bookingUserId !== requestUserId) {
            res.status(403).json({
                success: false,
                message: "Forbidden - You can only cancel your own bookings",
            });
            return;
        }
        // Check if booking is already cancelled
        if (booking.status === "cancelled") {
            res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
            return;
        }
        // Update booking status
        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        if (cancellationReason) {
            booking.cancellationReason = cancellationReason;
        }
        const cancelledBooking = await booking.save();
        await cancelledBooking.populate([
            { path: "propertyId", select: "name location images" },
            { path: "userId", select: "firstName lastName email" },
        ]);
        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: { booking: cancelledBooking },
        });
    }
    catch (error) {
        console.log("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.cancelBooking = cancelBooking;
