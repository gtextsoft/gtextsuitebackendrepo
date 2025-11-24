"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Property schema
const propertySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    longDescription: { type: String, required: true, trim: true, minlength: 50 },
    price: { type: String, required: true },
    priceNumeric: { type: Number, default: null },
    currency: {
        type: String,
        enum: ["NGN", "USD", "AED"],
        default: "USD"
    },
    size: { type: String, required: true },
    amenities: {
        type: Map,
        of: String,
        required: true,
        default: {},
    },
    images: { type: [String], required: true, minlength: 1 },
    propertyPurpose: {
        type: String,
        enum: ["sale", "rental", "investment", "tour"],
        required: true,
        default: "rental",
    },
    // Purpose-specific optional fields
    saleDetails: {
        type: {
            paymentPlans: [String],
            financingAvailable: Boolean,
            downPayment: String,
            completionDate: Date,
        },
        required: false,
    },
    rentalDetails: {
        type: {
            minStay: Number,
            maxStay: Number,
            cancellationPolicy: String,
            checkInTime: String,
            checkOutTime: String,
        },
        required: false,
    },
    investmentDetails: {
        type: {
            roi: String,
            expectedReturn: String,
            completionDate: Date,
            paymentMilestones: [String],
            location: String,
            propertyType: String,
        },
        required: false,
    },
    features: { type: [String], required: true, minlength: 1 },
    coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
    },
    nearbyAttractions: [String],
    isActive: { type: Boolean, default: true }, // true = available for booking, false = completely hidden
    isListed: { type: Boolean, default: true }, // true = appears in listings, false = booking-only
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Indexes for better query performance
propertySchema.index({ location: 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ isListed: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ priceNumeric: 1 });
propertySchema.index({ propertyPurpose: 1 });
// Compound indexes for listing queries
propertySchema.index({ isActive: 1, isListed: 1 });
propertySchema.index({ propertyPurpose: 1, isActive: 1 });
propertySchema.index({ propertyPurpose: 1, isListed: 1 });
propertySchema.index({ propertyPurpose: 1, location: 1 });
propertySchema.index({ propertyPurpose: 1, priceNumeric: 1 });
const Property = mongoose_1.default.model("Property", propertySchema);
exports.default = Property;
