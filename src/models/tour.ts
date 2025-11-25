import mongoose, { Document } from "mongoose";

// Tour type definition
export type TourType = {
  name: string;
  description: string;
  longDescription: string;
  location: string;
  duration: string; // e.g., "4-6 Hours", "Full Day", "5-7 Hours"
  startingPrice: number; // Base price per person
  currency: string; // Currency code: "NGN", "USD", "AED"
  images: string[];
  features: string[]; // List of features with checkmarks (e.g., "Expert Local Guides", "Private Transportation")
  meetingPoint?: string;
  included?: string[]; // What's included in the tour
  excluded?: string[]; // What's not included
  maxGuests?: number;
  minGuests?: number;
  isActive: boolean; // true = available for booking, false = hidden
  createdBy: mongoose.Types.ObjectId;
};

// Extend with Document for Mongoose
export interface TourDocument extends TourType, Document {}

// Tour schema
const tourSchema = new mongoose.Schema<TourDocument>(
  {
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
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one image is required",
      },
    },
    features: {
      type: [String],
      required: true,
      minlength: 1,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for better query performance
tourSchema.index({ isActive: 1 });
tourSchema.index({ location: 1 });
tourSchema.index({ startingPrice: 1 });
tourSchema.index({ createdAt: -1 });
tourSchema.index({ isActive: 1, location: 1 });
tourSchema.index({ isActive: 1, startingPrice: 1 });

const Tour = mongoose.model<TourDocument>("Tour", tourSchema);

export default Tour;

