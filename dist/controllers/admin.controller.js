"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminSettings = exports.getAdminSettings = exports.getBookingAnalytics = exports.getRevenueReport = exports.getAdminActivity = exports.getAdminStats = void 0;
const booking_1 = __importDefault(require("../models/booking"));
const tourBooking_1 = __importDefault(require("../models/tourBooking"));
const property_1 = __importDefault(require("../models/property"));
const user_1 = __importDefault(require("../models/user"));
const inquiry_1 = __importDefault(require("../models/inquiry"));
const contact_1 = __importDefault(require("../models/contact"));
const siteSettings_1 = __importDefault(require("../models/siteSettings"));
const parseDateRange = (startDate, endDate) => {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    return { start, end };
};
const getAdminStats = async (_req, res) => {
    try {
        const [totalBookings, pendingBookings, totalProperties, activeProperties, totalUsers, verifiedUsers, totalInquiries, pendingInquiries, totalContactForms, newContactForms, totalTourBookings, revenueBookings, revenueTours,] = await Promise.all([
            booking_1.default.countDocuments(),
            booking_1.default.countDocuments({ status: "pending" }),
            property_1.default.countDocuments(),
            property_1.default.countDocuments({ isActive: true }),
            user_1.default.countDocuments(),
            user_1.default.countDocuments({ isVerified: true }),
            inquiry_1.default.countDocuments(),
            inquiry_1.default.countDocuments({ status: "pending" }),
            contact_1.default.countDocuments(),
            contact_1.default.countDocuments({ status: "new" }),
            tourBooking_1.default.countDocuments(),
            booking_1.default.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            tourBooking_1.default.aggregate([
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
                confirmedBookings: await booking_1.default.countDocuments({ status: "confirmed" }),
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch stats",
        });
    }
};
exports.getAdminStats = getAdminStats;
const getAdminActivity = async (req, res) => {
    try {
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const [bookings, inquiries, contacts] = await Promise.all([
            booking_1.default.find().sort({ createdAt: -1 }).limit(limit).lean(),
            inquiry_1.default.find().sort({ createdAt: -1 }).limit(limit).lean(),
            contact_1.default.find().sort({ createdAt: -1 }).limit(limit).lean(),
        ]);
        const activities = [
            ...bookings.map((b) => ({
                id: b._id.toString(),
                type: "booking",
                title: `Booking: ${b.propertyName}`,
                description: `${b.status} — ${b.guestInfo?.fullName || "Guest"}`,
                date: b.createdAt,
            })),
            ...inquiries.map((i) => ({
                id: i._id.toString(),
                type: "inquiry",
                title: `Inquiry from ${i.contactInfo?.fullName || i.propertyName}`,
                description: i.status,
                date: i.createdAt,
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch activity",
        });
    }
};
exports.getAdminActivity = getAdminActivity;
const getRevenueReport = async (req, res) => {
    try {
        const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);
        const [bookings, tourBookings] = await Promise.all([
            booking_1.default.find({
                createdAt: { $gte: start, $lte: end },
                paymentStatus: "paid",
            }).lean(),
            tourBooking_1.default.find({
                createdAt: { $gte: start, $lte: end },
                paymentStatus: "paid",
            }).lean(),
        ]);
        const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0) +
            tourBookings.reduce((s, b) => s + b.totalAmount, 0);
        const byDay = {};
        [...bookings, ...tourBookings].forEach((b) => {
            const day = new Date(b.createdAt).toISOString().split("T")[0];
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch revenue report",
        });
    }
};
exports.getRevenueReport = getRevenueReport;
const getBookingAnalytics = async (req, res) => {
    try {
        const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);
        const [bookings, tourBookings] = await Promise.all([
            booking_1.default.find({ createdAt: { $gte: start, $lte: end } }).lean(),
            tourBooking_1.default.find({ createdAt: { $gte: start, $lte: end } }).lean(),
        ]);
        const statusCounts = {};
        const typeCounts = {};
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch booking analytics",
        });
    }
};
exports.getBookingAnalytics = getBookingAnalytics;
const getAdminSettings = async (_req, res) => {
    try {
        let settings = await siteSettings_1.default.findOne({ key: "global" });
        if (!settings) {
            settings = await siteSettings_1.default.create({ key: "global" });
        }
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch settings",
        });
    }
};
exports.getAdminSettings = getAdminSettings;
const updateAdminSettings = async (req, res) => {
    try {
        const settings = await siteSettings_1.default.findOneAndUpdate({ key: "global" }, { $set: req.body }, { new: true, upsert: true });
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update settings",
        });
    }
};
exports.updateAdminSettings = updateAdminSettings;
