"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTour = exports.updateTour = exports.getTourById = exports.getTours = exports.createTour = void 0;
const tour_1 = __importDefault(require("../models/tour"));
/**
 * Create a new tour (Admin only)
 */
const createTour = async (req, res) => {
    try {
        const { name, description, longDescription, location, duration, startingPrice, currency, images, features, meetingPoint, included, excluded, maxGuests, minGuests, isActive, } = req.body;
        // Get user ID from request (set by authenticate middleware)
        const createdBy = req.userId;
        if (!createdBy) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const newTour = new tour_1.default({
            name,
            description,
            longDescription,
            location,
            duration,
            startingPrice,
            currency: currency || "USD",
            images,
            features,
            meetingPoint,
            included: included || [],
            excluded: excluded || [],
            maxGuests,
            minGuests: minGuests || 1,
            isActive: isActive !== undefined ? isActive : true,
            createdBy,
        });
        const savedTour = await newTour.save();
        await savedTour.populate("createdBy", "firstName lastName email");
        res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: { tour: savedTour },
        });
    }
    catch (error) {
        console.log("Error creating tour:", error);
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
            message: "Something went wrong during tour creation",
            error: error.message,
        });
    }
};
exports.createTour = createTour;
/**
 * Get list of tours
 * Public endpoint - returns only active tours for non-admin users
 * Admin can see all tours (active and inactive)
 */
const getTours = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, location, minPrice, maxPrice, } = req.query;
        // Check if user is admin
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Build filter object
        const filter = {};
        // Non-admin users only see active tours
        // Admin can filter by isActive or see all
        if (!isAdmin) {
            filter.isActive = true;
        }
        else if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }
        // Location filter
        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }
        // Price filters
        if (minPrice) {
            filter.startingPrice = { ...filter.startingPrice, $gte: parseFloat(minPrice) };
        }
        if (maxPrice) {
            filter.startingPrice = { ...filter.startingPrice, $lte: parseFloat(maxPrice) };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const tours = await tour_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = await tour_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: {
                tours,
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
        console.log("Error fetching tours:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getTours = getTours;
/**
 * Get single tour by ID
 */
const getTourById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.roles?.includes("admin") || false;
        const tour = await tour_1.default.findById(id).populate("createdBy", "firstName lastName email");
        if (!tour) {
            res.status(404).json({
                success: false,
                message: "Tour not found",
            });
            return;
        }
        // Non-admin users cannot see inactive tours
        if (!isAdmin && !tour.isActive) {
            res.status(404).json({
                success: false,
                message: "Tour not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { tour },
        });
    }
    catch (error) {
        console.log("Error fetching tour:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getTourById = getTourById;
/**
 * Update tour (Admin only)
 */
const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Remove fields that shouldn't be updated directly
        delete updateData.createdBy;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        const tour = await tour_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "firstName lastName email");
        if (!tour) {
            res.status(404).json({
                success: false,
                message: "Tour not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Tour updated successfully",
            data: { tour },
        });
    }
    catch (error) {
        console.log("Error updating tour:", error);
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
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.updateTour = updateTour;
/**
 * Delete tour (Admin only)
 */
const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        const tour = await tour_1.default.findByIdAndDelete(id);
        if (!tour) {
            res.status(404).json({
                success: false,
                message: "Tour not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Tour deleted successfully",
        });
    }
    catch (error) {
        console.log("Error deleting tour:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteTour = deleteTour;
