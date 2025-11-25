import TourBooking from "../models/tourBooking";
import Tour from "../models/tour";
import { Request, Response } from "express";
import {
  sendTourBookingConfirmationEmail,
  sendTourBookingConfirmedEmail,
  sendTourBookingCancelledEmail,
  sendTourBookingRejectedEmail,
  sendTourBookingCompletedEmail,
} from "../services/emailService";

/**
 * Create a new tour booking
 * Users can create bookings for tours
 */
export const createTourBooking = async (req: Request, res: Response) => {
  try {
    const { tourId } = req.params;
    const { tourDate, guests, guestInfo, specialRequests } = req.body;

    // Validate tourId is provided
    if (!tourId) {
      res.status(400).json({
        success: false,
        message: "Tour ID is required in the URL path. Use: POST /api/tours/:tourId/bookings",
      });
      return;
    }

    // Get user ID from request (set by authenticate middleware)
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Find the tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      res.status(404).json({
        success: false,
        message: `Tour not found with ID: ${tourId}. Please check the tour ID in the URL.`,
      });
      return;
    }

    // Check if tour is active
    if (!tour.isActive) {
      res.status(400).json({
        success: false,
        message: "This tour is not currently available for booking",
      });
      return;
    }

    // Validate guests constraints
    if (tour.minGuests && guests < tour.minGuests) {
      res.status(400).json({
        success: false,
        message: `Minimum ${tour.minGuests} guest(s) required for this tour`,
      });
      return;
    }

    if (tour.maxGuests && guests > tour.maxGuests) {
      res.status(400).json({
        success: false,
        message: `Maximum ${tour.maxGuests} guest(s) allowed for this tour`,
      });
      return;
    }

    // Parse tour date
    const tourDateObj = new Date(tourDate);
    if (isNaN(tourDateObj.getTime())) {
      res.status(400).json({
        success: false,
        message: "Invalid tour date format",
      });
      return;
    }

    // Check if tour date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tourDateObj < today) {
      res.status(400).json({
        success: false,
        message: "Tour date cannot be in the past",
      });
      return;
    }

    // Calculate total amount
    const totalAmount = guests * tour.startingPrice;

    // Create booking object
    const bookingData = {
      tourId: tour._id,
      userId,
      tourDate: tourDateObj,
      guests,
      guestInfo,
      totalAmount,
      specialRequests,
      status: "pending" as const,
      paymentStatus: "pending" as const,
    };

    const newBooking = new TourBooking(bookingData);
    const savedBooking = await newBooking.save();

    // Populate references for response
    await savedBooking.populate([
      { path: "tourId", select: "name location duration startingPrice currency images meetingPoint" },
      { path: "userId", select: "firstName lastName email" },
    ]);

    // Send confirmation email (non-blocking)
    try {
      const populatedTour = savedBooking.tourId as any;
      const formattedDate = new Date(tourDateObj).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const totalAmountFormatted = `${tour.currency} ${totalAmount.toFixed(2)}`;

      await sendTourBookingConfirmationEmail(
        guestInfo.email,
        guestInfo.fullName,
        populatedTour.name,
        populatedTour.location,
        populatedTour.duration,
        formattedDate,
        guests,
        totalAmountFormatted,
        populatedTour.meetingPoint
      );
    } catch (emailError) {
      console.error("Error sending tour booking confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Tour booking created successfully",
      data: { booking: savedBooking },
    });
  } catch (error: any) {
    console.log("Error creating tour booking:", error);

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
      message: "Something went wrong during tour booking creation",
      error: error.message,
    });
  }
};

/**
 * Get list of tour bookings
 * Users see their own bookings, admins see all bookings
 */
export const getTourBookings = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      tourId,
    } = req.query;

    // Check if user is admin
    const isAdmin = req.user?.roles?.includes("admin") || false;

    // Build filter object
    // Users see only their bookings, admins see all
    const filter: any = isAdmin ? {} : { userId: req.userId };

    if (status) {
      filter.status = status;
    }
    if (tourId) {
      filter.tourId = tourId;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await TourBooking.find(filter)
      .populate("tourId", "name location duration startingPrice currency images")
      .populate("userId", "firstName lastName email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await TourBooking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.log("Error fetching tour bookings:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Get single tour booking by ID
 * Users can only see their own bookings, admins can see all
 */
export const getTourBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.roles?.includes("admin") || false;

    // Validate that user is authenticated
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Please log in to view bookings",
      });
      return;
    }

    const booking = await TourBooking.findById(id)
      .populate("tourId", "name location duration startingPrice currency images features")
      .populate("userId", "firstName lastName email");

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Tour booking not found",
      });
      return;
    }

    // Check if user has permission to view this booking
    // Handle both populated (object) and non-populated (ObjectId) userId
    let bookingUserId: string;
    const userIdValue = booking.userId as any;
    if (userIdValue && typeof userIdValue === "object" && "_id" in userIdValue) {
      // userId is populated (object with _id)
      bookingUserId = userIdValue._id.toString();
    } else {
      // userId is ObjectId
      bookingUserId = userIdValue?.toString() || "";
    }
    const requestUserId = req.userId.toString();

    if (!isAdmin && bookingUserId !== requestUserId) {
      res.status(403).json({
        success: false,
        message: "Forbidden - You can only view your own bookings",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error: any) {
    console.log("Error fetching tour booking:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Update tour booking status (Admin only)
 * Allows admins to update booking status and add notes
 */
export const updateTourBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    // Validate status value
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
      return;
    }

    const updateData: any = { status };
    if (notes) {
      updateData.notes = notes;
    }

    // If cancelling, set cancelledAt timestamp
    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    const booking = await TourBooking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("tourId", "name location duration startingPrice currency images meetingPoint")
      .populate("userId", "firstName lastName email");

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Tour booking not found",
      });
      return;
    }

    // Send appropriate email based on status (non-blocking)
    try {
      const populatedTour = booking.tourId as any;
      const populatedUser = booking.userId as any;
      const formattedDate = new Date(booking.tourDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const totalAmountFormatted = `${populatedTour.currency} ${booking.totalAmount.toFixed(2)}`;

      if (status === "confirmed") {
        await sendTourBookingConfirmedEmail(
          booking.guestInfo.email,
          booking.guestInfo.fullName,
          populatedTour.name,
          populatedTour.location,
          populatedTour.duration,
          formattedDate,
          booking.guests,
          totalAmountFormatted,
          notes,
          populatedTour.meetingPoint
        );
      } else if (status === "rejected") {
        await sendTourBookingRejectedEmail(
          booking.guestInfo.email,
          booking.guestInfo.fullName,
          populatedTour.name,
          populatedTour.location,
          formattedDate,
          notes
        );
      } else if (status === "completed") {
        await sendTourBookingCompletedEmail(
          booking.guestInfo.email,
          booking.guestInfo.fullName,
          populatedTour.name,
          populatedTour.location,
          formattedDate
        );
      }
    } catch (emailError) {
      console.error("Error sending tour booking status email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Tour booking status updated successfully",
      data: { booking },
    });
  } catch (error: any) {
    console.log("Error updating tour booking status:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/**
 * Cancel tour booking
 * Users can cancel their own bookings, admins can cancel any booking
 */
export const cancelTourBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const isAdmin = req.user?.roles?.includes("admin") || false;

    // Validate that user is authenticated
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Please log in to cancel bookings",
      });
      return;
    }

    const booking = await TourBooking.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Tour booking not found",
      });
      return;
    }

    // Check if user has permission to cancel this booking
    // Handle both populated (object) and non-populated (ObjectId) userId
    let bookingUserId: string;
    const userIdValue = booking.userId as any;
    if (userIdValue && typeof userIdValue === "object" && "_id" in userIdValue) {
      // userId is populated (object with _id)
      bookingUserId = userIdValue._id.toString();
    } else {
      // userId is ObjectId
      bookingUserId = userIdValue?.toString() || "";
    }
    const requestUserId = req.userId.toString();

    if (!isAdmin && bookingUserId !== requestUserId) {
      res.status(403).json({
        success: false,
        message: "Forbidden - You can only cancel your own bookings",
      });
      return;
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      res.status(400).json({
        success: false,
        message: "Tour booking is already cancelled",
      });
      return;
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    const cancelledBooking = await booking.save();

    await cancelledBooking.populate([
      { path: "tourId", select: "name location duration startingPrice currency images meetingPoint" },
      { path: "userId", select: "firstName lastName email" },
    ]);

    // Send cancellation email (non-blocking)
    try {
      const populatedTour = cancelledBooking.tourId as any;
      const formattedDate = new Date(cancelledBooking.tourDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const cancelledDateFormatted = cancelledBooking.cancelledAt
        ? new Date(cancelledBooking.cancelledAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

      await sendTourBookingCancelledEmail(
        cancelledBooking.guestInfo.email,
        cancelledBooking.guestInfo.fullName,
        populatedTour.name,
        populatedTour.location,
        formattedDate,
        cancelledDateFormatted,
        cancelledBooking.cancellationReason
      );
    } catch (emailError) {
      console.error("Error sending tour booking cancellation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Tour booking cancelled successfully",
      data: { booking: cancelledBooking },
    });
  } catch (error: any) {
    console.log("Error cancelling tour booking:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

