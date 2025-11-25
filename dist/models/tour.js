"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Tour schema
const tourSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500,
    },
    longDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 50,
    },
    location: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200,
    },
    duration: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    startingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        enum: ["NGN", "USD", "AED"],
        default: "USD",
        required: true,
    },
    images: {
        type: [String],
        required: true,
        minlength: 1,
        validate: {
            validator: (arr) => arr.length > 0,
            message: "At least one image is required",
        },
    },
    features: {
        type: [String],
        required: true,
        minlength: 1,
        validate: {
            validator: (arr) => arr.length > 0,
            message: "At least one feature is required",
        },
    },
    meetingPoint: {
        type: String,
        trim: true,
        maxlength: 300,
    },
    included: {
        type: [String],
        default: [],
    },
    excluded: {
        type: [String],
        default: [],
    },
    maxGuests: {
        type: Number,
        min: 1,
    },
    minGuests: {
        type: Number,
        min: 1,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Indexes for better query performance
tourSchema.index({ isActive: 1 });
tourSchema.index({ location: 1 });
tourSchema.index({ startingPrice: 1 });
tourSchema.index({ createdAt: -1 });
tourSchema.index({ isActive: 1, location: 1 });
tourSchema.index({ isActive: 1, startingPrice: 1 });
const Tour = mongoose_1.default.model("Tour", tourSchema);
exports.default = Tour;
