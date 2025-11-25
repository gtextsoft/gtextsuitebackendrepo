import mongoose, { Document } from "mongoose";

// Tour booking status enum
export type TourBookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "rejected";

// Payment status enum
export type TourPaymentStatus = "pending" | "partial" | "paid" | "refunded";

// Guest information type
export type TourGuestInfoType = {
  fullName: string;
  email: string;
  phone: string;
};

// Tour booking type definition
export type TourBookingType = {
  tourId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tourDate: Date; // Single date (not date range like property bookings)
  guests: number;
  guestInfo: TourGuestInfoType;
  totalAmount: number; // guests * pricePerPerson
  specialRequests?: string;
  status: TourBookingStatus;
  paymentStatus: TourPaymentStatus;
  paymentMethod?: string;
  notes?: string; // Admin notes
  cancelledAt?: Date;
  cancellationReason?: string;
};

// Extend with Document for Mongoose
export interface TourBookingDocument extends TourBookingType, Document {}

// Tour booking schema
const tourBookingSchema = new mongoose.Schema<TourBookingDocument>(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tourDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for better query performance
tourBookingSchema.index({ userId: 1 });
tourBookingSchema.index({ tourId: 1 });
tourBookingSchema.index({ status: 1 });
tourBookingSchema.index({ tourDate: 1 });
tourBookingSchema.index({ createdAt: -1 });
tourBookingSchema.index({ userId: 1, status: 1 });
tourBookingSchema.index({ tourId: 1, tourDate: 1 });

const TourBooking = mongoose.model<TourBookingDocument>("TourBooking", tourBookingSchema);

export default TourBooking;

