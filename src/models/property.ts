import mongoose, { Document } from "mongoose";

// Property purpose enum
export type PropertyPurpose = "sale" | "rental" | "investment" | "tour";

// Property type definition
export type PropertyType = {
  // Common fields (shared by all property types)
  name: string;
  location: string;
  description: string;
  longDescription: string;
  price: string;
  priceNumeric?: number;
  currency?: string; // Currency code: "NGN" (Naira), "USD" (Dollar), "AED" (Dirham)
  size: string;
  amenities: Record<string, string>; // Flexible amenities object: { "Bedrooms": "3", "Bathrooms": "2", "AC": "Yes", etc. }
  mainImage: string; // Primary/featured image (used for listings, thumbnails, etc.)
  gallery?: string[]; // Additional images (optional gallery)
  features: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  nearbyAttractions?: string[];
  
  // Purpose classification
  propertyPurpose: PropertyPurpose;
  
  // Purpose-specific optional fields
  saleDetails?: {
    paymentPlans?: string[];
    financingAvailable?: boolean;
    downPayment?: string;
    completionDate?: Date;
  };
  
  rentalDetails?: {
    minStay?: number; // minimum nights/days
    maxStay?: number; // maximum nights/days
    cancellationPolicy?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  
  investmentDetails?: {
    roi?: string;
    expectedReturn?: string;
    completionDate?: Date;
    paymentMilestones?: string[];
    location?: string;
    propertyType?: string; // e.g., "Apartment", "Villa"
  };
  
  // Visibility flags
  isActive: boolean; // true = available for booking, false = completely hidden
  isListed: boolean; // true = appears in property listings, false = booking-only (not in listings)
  createdBy: mongoose.Types.ObjectId;
};

// Extend with Document for Mongoose
export interface PropertyDocument extends PropertyType, Document {}

// Property schema
const propertySchema = new mongoose.Schema<PropertyDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    location: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    longDescription: { 
      type: String, 
      required: true, 
      // Don't trim HTML content as it may contain meaningful whitespace
      // Validation for text-only character count is handled in controller
      minlength: 10, // Minimum HTML length (actual text validation in controller)
    },
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
    mainImage: { 
      type: String, 
      required: true, 
      trim: true 
    },
    gallery: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(this: PropertyDocument, gallery: string[]) {
          // Gallery is optional, but if provided, must be array of strings
          return Array.isArray(gallery);
        },
        message: "Gallery must be an array of image URLs"
      }
    },
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Virtual field: Get all images (mainImage + gallery) for backward compatibility
propertySchema.virtual('images').get(function(this: PropertyDocument) {
  return [this.mainImage, ...(this.gallery || [])].filter(Boolean);
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

// Enable virtual fields in JSON output
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

const Property = mongoose.model<PropertyDocument>("Property", propertySchema);

export default Property;

