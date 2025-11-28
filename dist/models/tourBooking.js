"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Tour booking schema
const tourBookingSchema = new mongoose_1.default.Schema({
    tourId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Tour",
        required: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false, // Optional - allows guest bookings without registration
    },
    tourDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                // Tour date cannot be in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: "Tour date cannot be in the past",
        },
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
    },
    guestInfo: {
        type: {
            fullName: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true, lowercase: true },
            phone: { type: String, required: true, trim: true },
        },
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    specialRequests: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
        default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "partial", "paid", "refunded"],
        default: "pending",
    },
    paymentMethod: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    cancelledAt: {
        type: Date,
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: 500,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt
});
// Indexes for better query performance
tourBookingSchema.index({ userId: 1 });
tourBookingSchema.index({ tourId: 1 });
tourBookingSchema.index({ status: 1 });
tourBookingSchema.index({ tourDate: 1 });
tourBookingSchema.index({ createdAt: -1 });
tourBookingSchema.index({ userId: 1, status: 1 });
tourBookingSchema.index({ tourId: 1, tourDate: 1 });
const TourBooking = mongoose_1.default.model("TourBooking", tourBookingSchema);
exports.default = TourBooking;
