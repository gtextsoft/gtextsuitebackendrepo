"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInquiry = exports.updateInquiryStatus = exports.getInquiryById = exports.getInquiries = exports.createInquiry = exports.createSimpleInquiry = void 0;
const inquiry_1 = __importDefault(require("../models/inquiry"));
const property_1 = __importDefault(require("../models/property"));
/**
 * Create a new inquiry (simplified version for frontend form)
 * Accepts simple form data: fullName, email, phone, propertyId, message
 */
const createSimpleInquiry = async (req, res) => {
    try {
        const { fullName, email, phone, propertyId, message } = req.body;
        // Validate required fields
        if (!fullName || !email || !phone || !propertyId) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: fullName, email, phone, propertyId",
            });
            return;
        }
        // Get user ID from request (set by authenticate middleware) - optional for inquiries
        const userId = req.userId;
        // Validate property exists
        const property = await property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({
                success: false,
                message: "Property not found",
            });
            return;
        }
        // Determine inquiry type based on property purpose
        let inquiryType;
        if (property.propertyPurpose === "sale" || property.propertyPurpose === "investment") {
            inquiryType = property.propertyPurpose;
        }
        else {
            // Default to "sale" for rental properties or unknown types
            inquiryType = "sale";
        }
        // Create inquiry object
        const inquiryData = {
            userId: userId || undefined, // Optional - allow unauthenticated inquiries
            propertyId,
            propertyName: property.name,
            inquiryType,
            contactInfo: {
                fullName,
                email,
                phone,
            },
            status: "pending",
            priority: "medium",
        };
        // Store message in appropriate field based on inquiry type
        if (inquiryType === "sale") {
            inquiryData.saleInquiryDetails = {
                additionalRequirements: message || "",
            };
        }
        else if (inquiryType === "investment") {
            inquiryData.investmentInquiryDetails = {
                additionalQuestions: message || "",
            };
        }
        else {
            // Fallback: store in notes
            inquiryData.notes = message || "";
        }
        const newInquiry = new inquiry_1.default(inquiryData);
        const savedInquiry = await newInquiry.save();
        // Populate references for response
        await savedInquiry.populate([
            { path: "propertyId", select: "name location images propertyPurpose" },
            { path: "userId", select: "firstName lastName email" },
        ]);
        res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully",
            data: { inquiry: savedInquiry },
        });
    }
    catch (error) {
        console.log("Error creating inquiry:", error);
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
            message: "Something went wrong during inquiry creation",
            error: error.message,
        });
    }
};
exports.createSimpleInquiry = createSimpleInquiry;
/**
 * Create a new inquiry
 * Users can create inquiries for sale/investment properties
 */
const createInquiry = async (req, res) => {
    try {
        const { propertyId, propertyDetails, // For inquiry-only properties (agent properties)
        propertyName, inquiryType, contactInfo, saleInquiryDetails, investmentInquiryDetails, } = req.body;
        // Validate required fields
        const requiredFields = {
            propertyName,
            inquiryType,
            contactInfo,
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
        // Validate inquiry type
        if (!["sale", "investment"].includes(inquiryType)) {
            res.status(400).json({
                success: false,
                message: "Invalid inquiry type. Must be 'sale' or 'investment'",
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
        // Validate contactInfo structure
        if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
            res.status(400).json({
                success: false,
                message: "Contact information is incomplete",
            });
            return;
        }
        // Get user ID from request (set by authenticate middleware)
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        // If propertyId is provided, validate property exists and matches inquiry type
        if (propertyId) {
            const property = await property_1.default.findById(propertyId);
            if (!property) {
                res.status(404).json({
                    success: false,
                    message: "Property not found",
                });
                return;
            }
            // Validate property purpose matches inquiry type
            if ((inquiryType === "sale" && property.propertyPurpose !== "sale") ||
                (inquiryType === "investment" && property.propertyPurpose !== "investment")) {
                res.status(400).json({
                    success: false,
                    message: `Property purpose (${property.propertyPurpose}) does not match inquiry type (${inquiryType})`,
                });
                return;
            }
        }
        // Validate inquiry-specific details match inquiry type
        if (inquiryType === "sale" && investmentInquiryDetails) {
            res.status(400).json({
                success: false,
                message: "saleInquiryDetails should be provided for sale inquiries, not investmentInquiryDetails",
            });
            return;
        }
        if (inquiryType === "investment" && saleInquiryDetails) {
            res.status(400).json({
                success: false,
                message: "investmentInquiryDetails should be provided for investment inquiries, not saleInquiryDetails",
            });
            return;
        }
        // Create inquiry object
        const inquiryData = {
            userId,
            propertyName: propertyName || (propertyId ? (await property_1.default.findById(propertyId))?.name : propertyDetails?.name),
            inquiryType,
            contactInfo,
            status: "pending",
            priority: "medium",
        };
        // Add propertyId if provided, otherwise add propertyDetails
        if (propertyId) {
            inquiryData.propertyId = propertyId;
        }
        else if (propertyDetails) {
            inquiryData.propertyDetails = propertyDetails;
        }
        // Add inquiry-specific details
        if (inquiryType === "sale" && saleInquiryDetails) {
            inquiryData.saleInquiryDetails = saleInquiryDetails;
        }
        if (inquiryType === "investment" && investmentInquiryDetails) {
            inquiryData.investmentInquiryDetails = investmentInquiryDetails;
        }
        const newInquiry = new inquiry_1.default(inquiryData);
        const savedInquiry = await newInquiry.save();
        // Populate references for response
        if (savedInquiry.propertyId) {
            await savedInquiry.populate([
                { path: "propertyId", select: "name location images propertyPurpose" },
                { path: "userId", select: "firstName lastName email" },
            ]);
        }
        else {
            await savedInquiry.populate([
                { path: "userId", select: "firstName lastName email" },
            ]);
        }
        res.status(201).json({
            success: true,
            message: "Inquiry created successfully",
            data: { inquiry: savedInquiry },
        });
    }
    catch (error) {
        console.log("Error creating inquiry:", error);
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
            message: "Something went wrong during inquiry creation",
            error: error.message,
        });
    }
};
exports.createInquiry = createInquiry;
/**
 * Get list of inquiries with optional filters
 * Users see their own inquiries, admins see all inquiries
 */
const getInquiries = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, inquiryType, priority, } = req.query;
        // Check if user is admin
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Build filter object
        // Users see only their inquiries, admins see all
        // If user is not authenticated, they can't see any inquiries (return empty)
        const filter = isAdmin ? {} : (req.userId ? { userId: req.userId } : { userId: null });
        if (status) {
            filter.status = status;
        }
        if (inquiryType) {
            filter.inquiryType = inquiryType;
        }
        if (priority) {
            filter.priority = priority;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const inquiries = await inquiry_1.default.find(filter)
            .populate("propertyId", "name location images propertyPurpose")
            .populate("userId", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = await inquiry_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: {
                inquiries,
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
        console.log("Error fetching inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getInquiries = getInquiries;
/**
 * Get single inquiry by ID
 * Users can only see their own inquiries, admins can see all
 */
const getInquiryById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.roles?.includes("admin") || false;
        const inquiry = await inquiry_1.default.findById(id)
            .populate("propertyId", "name location images propertyPurpose")
            .populate("userId", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");
        if (!inquiry) {
            res.status(404).json({
                success: false,
                message: "Inquiry not found",
            });
            return;
        }
        // Check if user has permission to view this inquiry
        // Public inquiries (no userId) can only be viewed by admins
        if (!isAdmin) {
            if (!inquiry.userId || inquiry.userId.toString() !== req.userId?.toString()) {
                res.status(403).json({
                    success: false,
                    message: "Forbidden - You can only view your own inquiries",
                });
                return;
            }
        }
        res.status(200).json({
            success: true,
            data: { inquiry },
        });
    }
    catch (error) {
        console.log("Error fetching inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getInquiryById = getInquiryById;
/**
 * Update inquiry status (Admin only)
 * Allows admins to update inquiry status, priority, assign to manager, and add notes
 */
const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority, assignedTo, notes, rejectionReason } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required",
            });
            return;
        }
        // Validate status value
        const validStatuses = ["pending", "contacted", "qualified", "closed", "rejected"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
            return;
        }
        const updateData = { status };
        if (priority) {
            const validPriorities = ["low", "medium", "high"];
            if (!validPriorities.includes(priority)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid priority value",
                });
                return;
            }
            updateData.priority = priority;
        }
        if (assignedTo !== undefined) {
            updateData.assignedTo = assignedTo || null;
        }
        if (notes !== undefined) {
            updateData.notes = notes;
        }
        // If rejecting, set rejectionReason and rejectedAt
        if (status === "rejected") {
            updateData.rejectedAt = new Date();
            if (rejectionReason) {
                updateData.rejectionReason = rejectionReason;
            }
        }
        // If closing, set closedAt
        if (status === "closed") {
            updateData.closedAt = new Date();
        }
        // If contacting, set respondedAt
        if (status === "contacted" || status === "qualified") {
            updateData.respondedAt = new Date();
        }
        const inquiry = await inquiry_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("propertyId", "name location images propertyPurpose")
            .populate("userId", "firstName lastName email")
            .populate("assignedTo", "firstName lastName email");
        if (!inquiry) {
            res.status(404).json({
                success: false,
                message: "Inquiry not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Inquiry status updated successfully",
            data: { inquiry },
        });
    }
    catch (error) {
        console.log("Error updating inquiry status:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
/**
 * Delete inquiry
 * Users can delete their own inquiries, admins can delete any inquiry
 */
const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.roles?.includes("admin") || false;
        const inquiry = await inquiry_1.default.findById(id);
        if (!inquiry) {
            res.status(404).json({
                success: false,
                message: "Inquiry not found",
            });
            return;
        }
        // Check if user has permission to delete this inquiry
        // Public inquiries (no userId) can only be deleted by admins
        if (!isAdmin) {
            if (!inquiry.userId || inquiry.userId.toString() !== req.userId?.toString()) {
                res.status(403).json({
                    success: false,
                    message: "Forbidden - You can only delete your own inquiries",
                });
                return;
            }
        }
        await inquiry_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Inquiry deleted successfully",
        });
    }
    catch (error) {
        console.log("Error deleting inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.deleteInquiry = deleteInquiry;
