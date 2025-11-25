"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCancelTourBooking = exports.validateUpdateTourBookingStatus = exports.validateCreateTourBooking = exports.validateUpdateTour = exports.validateCreateTour = void 0;
/**
 * Tour validation middleware
 * Validates tour creation, update, and booking requests
 */
/**
 * Validate create tour request (Admin only)
 */
const validateCreateTour = (req, res, next) => {
    const { name, description, longDescription, location, duration, startingPrice, currency, images, features, } = req.body;
    // Required fields
    if (!name || typeof name !== "string" || name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Tour name is required and must be at least 3 characters",
        });
    }
    if (!description || typeof description !== "string" || description.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: "Tour description is required and must be at least 10 characters",
        });
    }
    if (!longDescription || typeof longDescription !== "string" || longDescription.trim().length < 50) {
        return res.status(400).json({
            success: false,
            message: "Long description is required and must be at least 50 characters",
        });
    }
    if (!location || typeof location !== "string" || location.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Location is required",
        });
    }
    if (!duration || typeof duration !== "string" || duration.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Duration is required",
        });
    }
    if (!startingPrice || typeof startingPrice !== "number" || startingPrice < 0) {
        return res.status(400).json({
            success: false,
            message: "Starting price is required and must be a positive number",
        });
    }
    if (currency && !["NGN", "USD", "AED"].includes(currency)) {
        return res.status(400).json({
            success: false,
            message: "Currency must be one of: NGN, USD, AED",
        });
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one image is required",
        });
    }
    if (!features || !Array.isArray(features) || features.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one feature is required",
        });
    }
    // Validate guests constraints
    if (req.body.maxGuests && (typeof req.body.maxGuests !== "number" || req.body.maxGuests < 1)) {
        return res.status(400).json({
            success: false,
            message: "Max guests must be a positive number",
        });
    }
    if (req.body.minGuests && (typeof req.body.minGuests !== "number" || req.body.minGuests < 1)) {
        return res.status(400).json({
            success: false,
            message: "Min guests must be a positive number",
        });
    }
    if (req.body.maxGuests && req.body.minGuests && req.body.maxGuests < req.body.minGuests) {
        return res.status(400).json({
            success: false,
            message: "Max guests cannot be less than min guests",
        });
    }
    return next();
};
exports.validateCreateTour = validateCreateTour;
/**
 * Validate update tour request (Admin only)
 */
const validateUpdateTour = (req, res, next) => {
    const { name, description, longDescription, startingPrice, images, features } = req.body;
    // Validate only provided fields
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 3)) {
        return res.status(400).json({
            success: false,
            message: "Tour name must be at least 3 characters",
        });
    }
    if (description !== undefined && (typeof description !== "string" || description.trim().length < 10)) {
        return res.status(400).json({
            success: false,
            message: "Tour description must be at least 10 characters",
        });
    }
    if (longDescription !== undefined && (typeof longDescription !== "string" || longDescription.trim().length < 50)) {
        return res.status(400).json({
            success: false,
            message: "Long description must be at least 50 characters",
        });
    }
    if (startingPrice !== undefined && (typeof startingPrice !== "number" || startingPrice < 0)) {
        return res.status(400).json({
            success: false,
            message: "Starting price must be a positive number",
        });
    }
    if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
        return res.status(400).json({
            success: false,
            message: "At least one image is required",
        });
    }
    if (features !== undefined && (!Array.isArray(features) || features.length === 0)) {
        return res.status(400).json({
            success: false,
            message: "At least one feature is required",
        });
    }
    if (req.body.currency && !["NGN", "USD", "AED"].includes(req.body.currency)) {
        return res.status(400).json({
            success: false,
            message: "Currency must be one of: NGN, USD, AED",
        });
    }
    return next();
};
exports.validateUpdateTour = validateUpdateTour;
/**
 * Validate create tour booking request
 */
const validateCreateTourBooking = (req, res, next) => {
    const { tourDate, guests, guestInfo } = req.body;
    if (!tourDate) {
        return res.status(400).json({
            success: false,
            message: "Tour date is required",
        });
    }
    // Validate tour date
    const tourDateObj = new Date(tourDate);
    if (isNaN(tourDateObj.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid tour date format",
        });
    }
    // Check if tour date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tourDateObj < today) {
        return res.status(400).json({
            success: false,
            message: "Tour date cannot be in the past",
        });
    }
    if (!guests || typeof guests !== "number" || guests < 1) {
        return res.status(400).json({
            success: false,
            message: "Number of guests must be at least 1",
        });
    }
    // Validate guest info
    if (!guestInfo || typeof guestInfo !== "object") {
        return res.status(400).json({
            success: false,
            message: "Guest information is required",
        });
    }
    if (!guestInfo.fullName || typeof guestInfo.fullName !== "string" || guestInfo.fullName.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Full name is required",
        });
    }
    if (!guestInfo.email || typeof guestInfo.email !== "string") {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestInfo.email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format",
        });
    }
    if (!guestInfo.phone || typeof guestInfo.phone !== "string" || guestInfo.phone.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required",
        });
    }
    // Validate special requests length if provided
    if (req.body.specialRequests && req.body.specialRequests.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Special requests cannot exceed 1000 characters",
        });
    }
    return next();
};
exports.validateCreateTourBooking = validateCreateTourBooking;
/**
 * Validate update tour booking status request (Admin only)
 */
const validateUpdateTourBookingStatus = (req, res, next) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required",
        });
    }
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
    }
    // Validate notes length if provided
    if (req.body.notes && req.body.notes.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "Notes cannot exceed 1000 characters",
        });
    }
    return next();
};
exports.validateUpdateTourBookingStatus = validateUpdateTourBookingStatus;
/**
 * Validate cancel tour booking request
 */
const validateCancelTourBooking = (req, res, next) => {
    // Validate cancellation reason length if provided
    if (req.body.cancellationReason && req.body.cancellationReason.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Cancellation reason cannot exceed 500 characters",
        });
    }
    return next();
};
exports.validateCancelTourBooking = validateCancelTourBooking;
