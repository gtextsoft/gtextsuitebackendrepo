"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// ====== SCHEMA ======
const bookingSchema = new mongoose_1.default.Schema({
    propertyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Property",
        required: false,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    propertyName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    checkIn: { type: Date, required: true },
    checkOut: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.checkIn;
            },
            message: "Check-out date must be after check-in date",
        },
    },
    nights: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    guestInfo: {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
    },
    specialRequests: { type: String, trim: true },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
        default: "pending",
    },
    bookingType: {
        type: String,
        enum: ["shortlet", "long-term", "tour"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "partial", "paid", "refunded"],
        default: "pending",
    },
    paymentMethod: { type: String, trim: true },
    notes: { type: String, trim: true },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true },
    // AGENT PROPERTY DETAILS (off-platform)
    propertyDetails: {
        name: { type: String, trim: true },
        location: { type: String, trim: true },
        description: { type: String, trim: true },
        price: { type: String, trim: true },
        bedrooms: { type: Number, min: 0 },
        bathrooms: { type: Number, min: 0 },
        images: [String],
        landlordName: { type: String, trim: true },
        landlordContact: { type: String, trim: true },
    },
}, { timestamps: true });
// ====== VALIDATION: MUST PROVIDE EITHER listing propertyId OR agent propertyDetails ======
bookingSchema.pre("validate", async function () {
    const hasPropertyId = !!this.propertyId;
    const hasPropertyDetails = this.propertyDetails &&
        (this.propertyDetails.name || this.propertyDetails.location || this.propertyDetails.price);
    if (!hasPropertyId && !hasPropertyDetails) {
        throw new Error("Either propertyId or propertyDetails must be provided");
    }
    if (hasPropertyId && hasPropertyDetails) {
        throw new Error("Cannot provide both propertyId and propertyDetails");
    }
});
// ====== AUTO CALCULATE NIGHTS ======
bookingSchema.pre("save", async function () {
    if (this.checkIn && this.checkOut && !this.nights) {
        const diffTime = this.checkOut.getTime() - this.checkIn.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.nights = diffDays > 0 ? diffDays : 1;
    }
});
// ====== INDEXES ======
bookingSchema.index({ userId: 1 });
bookingSchema.index({ propertyId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ checkIn: 1 });
bookingSchema.index({ checkOut: 1 });
bookingSchema.index({ createdAt: -1 });
const Booking = mongoose_1.default.model("Booking", bookingSchema);
exports.default = Booking;
