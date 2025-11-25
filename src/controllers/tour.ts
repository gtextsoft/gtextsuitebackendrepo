import Tour from "../models/tour";
import { Request, Response } from "express";

/**
 * Create a new tour (Admin only)
 */
export const createTour = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      longDescription,
      location,
      duration,
      startingPrice,
      currency,
      images,
      features,
      meetingPoint,
      included,
      excluded,
      maxGuests,
      minGuests,
      isActive,
    } = req.body;

    // Get user ID from request (set by authenticate middleware)
    const createdBy = req.userId;
    if (!createdBy) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const newTour = new Tour({
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
  } catch (error: any) {
    console.log("Error creating tour:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors: Record<string, string> = {};
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

/**
 * Get list of tours
 * Public endpoint - returns only active tours for non-admin users
 * Admin can see all tours (active and inactive)
 */
export const getTours = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      location,
      minPrice,
      maxPrice,
    } = req.query;

    // Check if user is admin
    const isAdmin = req.user?.roles?.includes("admin") || false;

    // Build filter object
    const filter: any = {};

    // Non-admin users only see active tours
    // Admin can filter by isActive or see all
    if (!isAdmin) {
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location as string, $options: "i" };
    }

    // Price filters
    if (minPrice) {
      filter.startingPrice = { ...filter.startingPrice, $gte: parseFloat(minPrice as string) };
    }
    if (maxPrice) {
      filter.startingPrice = { ...filter.startingPrice, $lte: parseFloat(maxPrice as string) };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const tours = await Tour.find(filter)
      .populate("createdBy", "firstName lastName email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Tour.countDocuments(filter);

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
  } catch (error: any) {
    console.log("Error fetching tours:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Get single tour by ID
 */
export const getTourById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.roles?.includes("admin") || false;

    const tour = await Tour.findById(id).populate("createdBy", "firstName lastName email");

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
  } catch (error: any) {
    console.log("Error fetching tour:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Update tour (Admin only)
 */
export const updateTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const tour = await Tour.findByIdAndUpdate(id, updateData, {
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
  } catch (error: any) {
    console.log("Error updating tour:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors: Record<string, string> = {};
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

/**
 * Delete tour (Admin only)
 */
export const deleteTour = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findByIdAndDelete(id);

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
  } catch (error: any) {
    console.log("Error deleting tour:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

