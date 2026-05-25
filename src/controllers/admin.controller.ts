import { Request, Response } from "express";
import Booking from "../models/booking";
import TourBooking from "../models/tourBooking";
import Property from "../models/property";
import User from "../models/user";
import Inquiry from "../models/inquiry";
import Contact from "../models/contact";
import SiteSettings from "../models/siteSettings";

const parseDateRange = (startDate?: string, endDate?: string) => {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      totalProperties,
      activeProperties,
      totalUsers,
      verifiedUsers,
      totalInquiries,
      pendingInquiries,
      totalContactForms,
      newContactForms,
      totalTourBookings,
      revenueBookings,
      revenueTours,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Property.countDocuments(),
      Property.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "pending" }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: "new" }),
      TourBooking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      TourBooking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const bookingRevenue = revenueBookings[0]?.total || 0;
    const tourRevenue = revenueTours[0]?.total || 0;

    const totalRevenue = bookingRevenue + tourRevenue;
    res.json({
      success: true,
      data: {
        totalBookings: totalBookings + totalTourBookings,
        pendingBookings,
        confirmedBookings: await Booking.countDocuments({ status: "confirmed" }),
        totalProperties,
        activeProperties,
        totalUsers,
        totalGuests: totalUsers,
        verifiedUsers,
        totalInquiries,
        pendingInquiries,
        totalContactForms,
        newContactForms,
        totalTourBookings,
        totalRevenue,
        bookingRevenue,
        tourRevenue,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stats",
    });
  }
};

export const getAdminActivity = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);

    const [bookings, inquiries, contacts] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Inquiry.find().sort({ createdAt: -1 }).limit(limit).lean(),
      Contact.find().sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    const activities = [
      ...bookings.map((b) => ({
        id: b._id.toString(),
        type: "booking",
        title: `Booking: ${b.propertyName}`,
        description: `${b.status} — ${b.guestInfo?.fullName || "Guest"}`,
        date: (b as any).createdAt,
      })),
      ...inquiries.map((i) => ({
        id: i._id.toString(),
        type: "inquiry",
        title: `Inquiry from ${(i as any).contactInfo?.fullName || (i as any).propertyName}`,
        description: i.status,
        date: (i as any).createdAt,
      })),
      ...contacts.map((c) => ({
        id: c._id.toString(),
        type: "contact",
        title: `Contact: ${c.name}`,
        description: c.subject || c.status,
        date: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    res.json({ success: true, data: { activities } });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch activity",
    });
  }
};

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const [bookings, tourBookings] = await Promise.all([
      Booking.find({
        createdAt: { $gte: start, $lte: end },
        paymentStatus: "paid",
      }).lean(),
      TourBooking.find({
        createdAt: { $gte: start, $lte: end },
        paymentStatus: "paid",
      }).lean(),
    ]);

    const totalRevenue =
      bookings.reduce((s, b) => s + b.totalAmount, 0) +
      tourBookings.reduce((s, b) => s + b.totalAmount, 0);

    const byDay: Record<string, number> = {};
    [...bookings, ...tourBookings].forEach((b) => {
      const day = new Date((b as any).createdAt).toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + b.totalAmount;
    });

    const chartData = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    const bookingCount = bookings.length + tourBookings.length;
    res.json({
      success: true,
      data: {
        totalRevenue,
        bookingCount,
        bookings: bookingCount,
        averageBookingValue: bookingCount > 0 ? totalRevenue / bookingCount : 0,
        chartData,
        breakdown: chartData,
        period: { start, end },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch revenue report",
    });
  }
};

export const getBookingAnalytics = async (req: Request, res: Response) => {
  try {
    const { start, end } = parseDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const [bookings, tourBookings] = await Promise.all([
      Booking.find({ createdAt: { $gte: start, $lte: end } }).lean(),
      TourBooking.find({ createdAt: { $gte: start, $lte: end } }).lean(),
    ]);

    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    bookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      typeCounts[b.bookingType || "other"] =
        (typeCounts[b.bookingType || "other"] || 0) + 1;
    });

    tourBookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      typeCounts["tour"] = (typeCounts["tour"] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: bookings.length + tourBookings.length,
        propertyBookings: bookings.length,
        tourBookings: tourBookings.length,
        byStatus: statusCounts,
        byType: typeCounts,
        topProperties: [],
        monthlyTrend: [],
        period: { start, end },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking analytics",
    });
  }
};

export const getAdminSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne({ key: "global" });
    if (!settings) {
      settings = await SiteSettings.create({ key: "global" });
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch settings",
    });
  }
};

export const updateAdminSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "global" },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update settings",
    });
  }
};
