"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProperties = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const property_1 = __importDefault(require("../models/property"));
const htmlSanitizer_1 = require("../utils/htmlSanitizer");
// Create a new property (Admin only)
const createProperty = async (req, res) => {
    try {
        // Debug: Log what we're receiving
        // console.log("Request body received:", JSON.stringify(req.body, null, 2));
        // console.log("Request body type:", typeof req.body);
        // console.log("Request body keys:", Object.keys(req.body || {}));
        // Check if body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                success: false,
                message: "Request body is empty. Please send JSON data.",
            });
            return;
        }
        const { name, location, description, longDescription, price, priceNumeric, currency, size, amenities, mainImage, gallery, propertyPurpose, saleDetails, rentalDetails, investmentDetails, features, coordinates, nearbyAttractions, isActive, isListed, } = req.body;
        // Validate required fields before creating property
        const requiredFields = {
            name,
            location,
            description,
            longDescription,
            price,
            size,
            amenities,
            mainImage,
            features,
        };
        // Only require investmentDetails if propertyPurpose is "investment"
        if (propertyPurpose === "investment") {
            requiredFields.investmentDetails = investmentDetails;
        }
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
        // Get user ID from request (set by authenticate middleware)
        // This ensures we know who created the property for tracking
        const createdBy = req.userId;
        if (!createdBy) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        // Convert amenities object to Map if it's a plain object
        const amenitiesMap = amenities && typeof amenities === 'object' && !Array.isArray(amenities)
            ? new Map(Object.entries(amenities))
            : new Map();
        // Sanitize HTML content to prevent XSS attacks
        const sanitizedLongDescription = longDescription ? (0, htmlSanitizer_1.sanitizeHtml)(longDescription) : "";
        // Validate text-only character count (minimum 50 characters of actual text)
        const textOnlyCount = (0, htmlSanitizer_1.countTextOnly)(sanitizedLongDescription);
        if (textOnlyCount < 50) {
            res.status(400).json({
                success: false,
                message: "Long description must contain at least 50 characters of text (excluding HTML tags)",
                textCharacterCount: textOnlyCount,
            });
            return;
        }
        const newProperty = new property_1.default({
            name,
            location,
            description,
            longDescription: sanitizedLongDescription,
            price,
            priceNumeric,
            currency: currency || "USD", // Default to USD if not provided
            size,
            amenities: amenitiesMap,
            mainImage,
            gallery: gallery || [], // Gallery is optional, default to empty array
            propertyPurpose: propertyPurpose || "rental", // Default to rental
            saleDetails,
            rentalDetails,
            investmentDetails,
            features,
            coordinates,
            nearbyAttractions,
            isActive: isActive !== undefined ? isActive : true,
            isListed: isListed !== undefined ? isListed : true,
            createdBy,
        });
        const savedProperty = await newProperty.save();
        res.status(201).json({
            success: true,
            message: "Property created successfully",
            data: { property: savedProperty },
        });
    }
    catch (error) {
        console.log("Error creating property:", error);
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const validationErrors = {};
            // Extract validation errors from Mongoose
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
        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Something went wrong during property creation",
            error: error.message,
        });
    }
};
exports.createProperty = createProperty;
// Get all properties with optional filters
// Public route - clients see only active properties, admins see all
const getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, location, search, minPrice, maxPrice, isActive, propertyPurpose, bedrooms, bathrooms, } = req.query;
        // Check if user is admin (from authenticate middleware if logged in)
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Build filter object
        // Property listings page: show all listed properties (isListed: true) - regardless of isActive
        // Booking page: show all active properties (isActive: true) - regardless of isListed
        // This allows flexibility:
        // - Listed but NOT bookable (isActive: false, isListed: true) - appears in listings only
        // - Bookable but NOT listed (isActive: true, isListed: false) - appears in booking only
        // - Both listed AND bookable (isActive: true, isListed: true) - appears in both
        // Admins can see all properties when logged in
        const { isListed: isListedParam } = req.query;
        let filter = {};
        if (isAdmin) {
            // Admin can filter by isActive if provided, otherwise see all
            if (isActive !== undefined) {
                const isActiveStr = String(isActive);
                filter.isActive = isActiveStr === "true" || isActiveStr === "1";
            }
            // Admin can also filter by isListed
            if (isListedParam !== undefined) {
                const isListedStr = String(isListedParam);
                filter.isListed = isListedStr === "true" || isListedStr === "1";
            }
            // If filters not provided, filter is empty (shows all)
        }
        else {
            // Non-admin users: check what they're requesting
            if (isListedParam !== undefined) {
                // Property listings page: show all listed properties (regardless of isActive)
                const isListedStr = String(isListedParam);
                if (isListedStr === "true" || isListedStr === "1") {
                    filter.isListed = true; // Show all listed (can include inactive for showcase)
                }
            }
            else {
                // Booking page: show all active properties (regardless of isListed)
                filter.isActive = true; // Show all active (can include unlisted for booking-only)
            }
        }
        if (location)
            filter.location = { $regex: location, $options: "i" };
        if (minPrice || maxPrice) {
            filter.priceNumeric = {};
            if (minPrice)
                filter.priceNumeric.$gte = parseFloat(minPrice);
            if (maxPrice)
                filter.priceNumeric.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (propertyPurpose) {
            filter.propertyPurpose = propertyPurpose;
        }
        // Build $and array for multiple filter conditions
        const andConditions = [];
        // If we have search or other $or conditions, add them to $and
        if (filter.$or) {
            andConditions.push({ $or: filter.$or });
            delete filter.$or;
        }
        // Bedrooms filter - check in amenities.beds or amenities.Bedrooms
        if (bedrooms) {
            const bedroomsNum = parseInt(bedrooms);
            if (!isNaN(bedroomsNum)) {
                const bedroomsConditions = [];
                if (bedroomsNum === 3) {
                    // 3+ bedrooms - try numeric comparison
                    bedroomsConditions.push({ $expr: { $gte: [{ $toInt: { $ifNull: ["$amenities.beds", "0"] } }, 3] } }, { $expr: { $gte: [{ $toInt: { $ifNull: ["$amenities.Bedrooms", "0"] } }, 3] } }, { $expr: { $gte: [{ $toInt: { $ifNull: ["$amenities.bedrooms", "0"] } }, 3] } }, { "amenities.beds": { $gte: 3 } }, { "amenities.Bedrooms": { $gte: 3 } }, { "amenities.bedrooms": { $gte: 3 } });
                }
                else {
                    // Exact match - try both string and number
                    bedroomsConditions.push({ "amenities.beds": bedroomsNum }, { "amenities.beds": String(bedroomsNum) }, { "amenities.Bedrooms": bedroomsNum }, { "amenities.Bedrooms": String(bedroomsNum) }, { "amenities.bedrooms": bedroomsNum }, { "amenities.bedrooms": String(bedroomsNum) });
                }
                if (bedroomsConditions.length > 0) {
                    andConditions.push({ $or: bedroomsConditions });
                }
            }
        }
        // Bathrooms filter - check in amenities.bathrooms or amenities.Bathrooms
        if (bathrooms) {
            const bathroomsNum = parseInt(bathrooms);
            if (!isNaN(bathroomsNum)) {
                const bathroomsConditions = [];
                if (bathroomsNum === 3) {
                    // 3+ bathrooms
                    bathroomsConditions.push({ $expr: { $gte: [{ $toInt: { $ifNull: ["$amenities.bathrooms", "0"] } }, 3] } }, { $expr: { $gte: [{ $toInt: { $ifNull: ["$amenities.Bathrooms", "0"] } }, 3] } }, { "amenities.bathrooms": { $gte: 3 } }, { "amenities.Bathrooms": { $gte: 3 } }, { "amenities.bathroom": { $gte: 3 } }, { "amenities.Bathroom": { $gte: 3 } });
                }
                else {
                    // Exact match
                    bathroomsConditions.push({ "amenities.bathrooms": bathroomsNum }, { "amenities.bathrooms": String(bathroomsNum) }, { "amenities.Bathrooms": bathroomsNum }, { "amenities.Bathrooms": String(bathroomsNum) }, { "amenities.bathroom": bathroomsNum }, { "amenities.bathroom": String(bathroomsNum) }, { "amenities.Bathroom": bathroomsNum }, { "amenities.Bathroom": String(bathroomsNum) });
                }
                if (bathroomsConditions.length > 0) {
                    andConditions.push({ $or: bathroomsConditions });
                }
            }
        }
        // Apply $and conditions if we have any
        if (andConditions.length > 0) {
            filter.$and = andConditions;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const properties = await property_1.default.find(filter)
            .populate("createdBy", "firstName lastName email")
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });
        const total = await property_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: {
                properties,
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
        console.log("Error fetching properties:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.getProperties = getProperties;
// Get single property by ID
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await property_1.default.findById(id).populate("createdBy", "firstName lastName email");
        if (!property) {
            res.status(404).json({
                success: false,
                message: "Property not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: { property },
        });
    }
    catch (error) {
        console.log("Error fetching property:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.getPropertyById = getPropertyById;
// Update property (Admin only)
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        // Sanitize HTML content if longDescription is being updated
        if (updateData.longDescription && typeof updateData.longDescription === "string") {
            updateData.longDescription = (0, htmlSanitizer_1.sanitizeHtml)(updateData.longDescription);
            // Validate text-only character count (minimum 50 characters of actual text)
            const textOnlyCount = (0, htmlSanitizer_1.countTextOnly)(updateData.longDescription);
            if (textOnlyCount < 50) {
                res.status(400).json({
                    success: false,
                    message: "Long description must contain at least 50 characters of text (excluding HTML tags)",
                    textCharacterCount: textOnlyCount,
                });
                return;
            }
        }
        // Convert amenities object to Map if it's a plain object
        if (updateData.amenities && typeof updateData.amenities === 'object' && !Array.isArray(updateData.amenities)) {
            updateData.amenities = new Map(Object.entries(updateData.amenities));
        }
        const property = await property_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!property) {
            res.status(404).json({
                success: false,
                message: "Property not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            data: { property },
        });
    }
    catch (error) {
        console.log("Error updating property:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.updateProperty = updateProperty;
// Delete property (Admin only)
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await property_1.default.findByIdAndDelete(id);
        if (!property) {
            res.status(404).json({
                success: false,
                message: "Property not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Property deleted successfully",
        });
    }
    catch (error) {
        console.log("Error deleting property:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.deleteProperty = deleteProperty;
// Get related properties for a specific property
// Public route - anyone can view related properties
const getRelatedProperties = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 3 } = req.query;
        // Find the current property
        const currentProperty = await property_1.default.findById(id);
        if (!currentProperty) {
            res.status(404).json({
                success: false,
                message: "Property not found",
            });
            return;
        }
        // Check if user is admin
        const isAdmin = req.user?.roles?.includes("admin") || false;
        // Build filter for related properties
        // Non-admin users: only see active, listed properties
        // Admins: see all properties when logged in
        let filter = {
            _id: { $ne: currentProperty._id }, // Exclude current property
        };
        if (!isAdmin) {
            filter.isActive = true;
            filter.isListed = true;
        }
        // Get all potential related properties
        const allProperties = await property_1.default.find(filter).lean();
        // Score properties based on relevance
        const scoredProperties = [];
        // Extract current property values for comparison
        const currentLocation = currentProperty.investmentDetails?.location || currentProperty.location;
        const currentPropertyType = currentProperty.investmentDetails?.propertyType;
        const currentPropertyPurpose = currentProperty.propertyPurpose;
        const currentPrice = currentProperty.priceNumeric || parseFloat(String(currentProperty.price).replace(/[^0-9.]/g, "")) || 0;
        const currentSize = parseFloat(String(currentProperty.size).replace(/[^0-9.]/g, "")) || 0;
        for (const property of allProperties) {
            let score = 0;
            // Priority 1: Same location (highest priority) - 100 points
            const propertyLocation = property.investmentDetails?.location || property.location;
            if (propertyLocation && currentLocation && propertyLocation === currentLocation) {
                score += 100;
            }
            // Priority 2: Same property type (investment) - 50 points
            if (currentPropertyType &&
                property.investmentDetails?.propertyType &&
                property.investmentDetails.propertyType === currentPropertyType) {
                score += 50;
            }
            // Priority 3: Same property purpose - 30 points
            if (property.propertyPurpose === currentPropertyPurpose) {
                score += 30;
            }
            // Priority 4: Similar price range (within 30% difference) - 25 points
            const propertyPrice = property.priceNumeric || parseFloat(String(property.price).replace(/[^0-9.]/g, "")) || 0;
            if (currentPrice > 0 && propertyPrice > 0) {
                const priceDiff = Math.abs(currentPrice - propertyPrice) / currentPrice;
                if (priceDiff <= 0.3) {
                    score += 25;
                }
            }
            // Priority 5: Similar size (within 20% difference) - 10 points
            const propertySize = parseFloat(String(property.size).replace(/[^0-9.]/g, "")) || 0;
            if (currentSize > 0 && propertySize > 0) {
                const sizeDiff = Math.abs(currentSize - propertySize) / currentSize;
                if (sizeDiff <= 0.2) {
                    score += 10;
                }
            }
            // Only add properties with some relevance (score > 0)
            if (score > 0) {
                scoredProperties.push({ property, score });
            }
        }
        // Sort by score (highest first) and take top N
        const limitNum = parseInt(limit) || 3;
        const relatedProperties = scoredProperties
            .sort((a, b) => b.score - a.score)
            .slice(0, limitNum)
            .map((item) => item.property);
        res.status(200).json({
            success: true,
            data: { properties: relatedProperties },
        });
    }
    catch (error) {
        console.log("Error fetching related properties:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};
exports.getRelatedProperties = getRelatedProperties;
