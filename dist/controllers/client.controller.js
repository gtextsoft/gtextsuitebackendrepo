"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientPreferences = exports.getClientSettings = exports.getClientInvoiceById = exports.getClientInvoices = exports.getClientPayments = exports.getClientProperties = exports.removeBookmark = exports.addBookmark = exports.getBookmarks = exports.getClientDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bookmark_1 = __importDefault(require("../models/bookmark"));
const property_1 = __importDefault(require("../models/property"));
const booking_1 = __importDefault(require("../models/booking"));
const tourBooking_1 = __importDefault(require("../models/tourBooking"));
const inquiry_1 = __importDefault(require("../models/inquiry"));
const user_1 = __importDefault(require("../models/user"));
const mapProperty = (p) => {
    const obj = p.toObject ? p.toObject({ virtuals: true }) : p;
    const amenities = obj.amenities instanceof Map
        ? Object.fromEntries(obj.amenities)
        : obj.amenities || {};
    return {
        ...obj,
        id: obj._id?.toString(),
        amenities,
        images: [obj.mainImage, ...(obj.gallery || [])].filter(Boolean),
    };
};
const mapBooking = (b) => {
    const obj = b.toObject ? b.toObject() : b;
    return {
        ...obj,
        id: obj._id?.toString(),
        propertyId: typeof obj.propertyId === "object" && obj.propertyId?._id
            ? obj.propertyId._id.toString()
            : obj.propertyId?.toString(),
        userId: typeof obj.userId === "object" && obj.userId?._id
            ? obj.userId._id.toString()
            : obj.userId?.toString(),
    };
};
const getClientDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const [bookings, tourBookings, bookmarks, inquiries] = await Promise.all([
            booking_1.default.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
            tourBooking_1.default.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
            bookmark_1.default.countDocuments({ userId }),
            inquiry_1.default.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        ]);
        const upcomingBookings = bookings.filter((b) => b.status !== "cancelled" &&
            b.status !== "rejected" &&
            new Date(b.checkIn) >= now).length;
        const upcomingTours = tourBookings.filter((b) => b.status !== "cancelled" &&
            b.status !== "rejected" &&
            new Date(b.tourDate) >= now).length;
        const totalSpent = [...bookings, ...tourBookings]
            .filter((b) => b.paymentStatus === "paid")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const investmentInquiries = await inquiry_1.default.countDocuments({
            userId,
            inquiryType: "investment",
        });
        const activities = [];
        bookings.slice(0, 5).forEach((b) => {
            activities.push({
                id: b._id.toString(),
                type: "booking",
                title: `${b.propertyName} — ${b.status}`,
                date: new Date(b.createdAt).toISOString().split("T")[0],
                status: b.status,
            });
        });
        tourBookings.slice(0, 3).forEach((b) => {
            activities.push({
                id: b._id.toString(),
                type: "booking",
                title: `Tour booking — ${b.status}`,
                date: new Date(b.createdAt).toISOString().split("T")[0],
                status: b.status,
            });
        });
        inquiries.slice(0, 3).forEach((i) => {
            activities.push({
                id: i._id.toString(),
                type: "property",
                title: `Property inquiry — ${i.status || "pending"}`,
                date: new Date(i.createdAt).toISOString().split("T")[0],
                status: i.status,
            });
        });
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.json({
            success: true,
            data: {
                totalBookings: bookings.length + tourBookings.length,
                upcomingBookings: upcomingBookings + upcomingTours,
                activeBookings: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
                savedProperties: bookmarks,
                totalSpent,
                totalInvestments: investmentInquiries,
                recentActivity: activities.slice(0, 10),
                recentBookings: bookings.slice(0, 5).map(mapBooking),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to load dashboard",
        });
    }
};
exports.getClientDashboard = getClientDashboard;
const getBookmarks = async (req, res) => {
    try {
        const userId = req.userId;
        const bookmarks = await bookmark_1.default.find({ userId })
            .populate("propertyId")
            .sort({ createdAt: -1 });
        const mapped = bookmarks
            .filter((b) => b.propertyId)
            .map((b) => ({
            id: b._id.toString(),
            propertyId: b.propertyId._id?.toString(),
            property: mapProperty(b.propertyId),
            createdAt: b.createdAt,
        }));
        res.json({ success: true, data: { bookmarks: mapped } });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch bookmarks",
        });
    }
};
exports.getBookmarks = getBookmarks;
const addBookmark = async (req, res) => {
    try {
        const userId = req.userId;
        const { propertyId } = req.body;
        if (!propertyId || !mongoose_1.default.Types.ObjectId.isValid(propertyId)) {
            res.status(400).json({ success: false, message: "Valid propertyId is required" });
            return;
        }
        const property = await property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: "Property not found" });
            return;
        }
        const existing = await bookmark_1.default.findOne({ userId, propertyId });
        if (existing) {
            const populated = await existing.populate("propertyId");
            res.json({
                success: true,
                data: {
                    bookmark: {
                        id: existing._id.toString(),
                        propertyId: propertyId.toString(),
                        property: mapProperty(populated.propertyId),
                        createdAt: existing.createdAt,
                    },
                },
            });
            return;
        }
        const bookmark = await bookmark_1.default.create({ userId, propertyId });
        const populated = await bookmark.populate("propertyId");
        res.status(201).json({
            success: true,
            data: {
                bookmark: {
                    id: bookmark._id.toString(),
                    propertyId: propertyId.toString(),
                    property: mapProperty(populated.propertyId),
                    createdAt: bookmark.createdAt,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add bookmark",
        });
    }
};
exports.addBookmark = addBookmark;
const removeBookmark = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const bookmark = await bookmark_1.default.findOneAndDelete({ _id: id, userId });
        if (!bookmark) {
            res.status(404).json({ success: false, message: "Bookmark not found" });
            return;
        }
        res.json({ success: true, message: "Bookmark removed" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to remove bookmark",
        });
    }
};
exports.removeBookmark = removeBookmark;
const getClientProperties = async (req, res) => {
    try {
        const userId = req.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;
        const bookings = await booking_1.default.find({
            userId,
            propertyId: { $exists: true, $ne: null },
        })
            .populate("propertyId")
            .sort({ createdAt: -1 });
        const propertyMap = new Map();
        bookings.forEach((b) => {
            if (b.propertyId && typeof b.propertyId === "object") {
                const id = b.propertyId._id.toString();
                if (!propertyMap.has(id)) {
                    propertyMap.set(id, mapProperty(b.propertyId));
                }
            }
        });
        const bookmarkDocs = await bookmark_1.default.find({ userId }).populate("propertyId");
        bookmarkDocs.forEach((b) => {
            if (b.propertyId) {
                const id = b.propertyId._id.toString();
                if (!propertyMap.has(id)) {
                    propertyMap.set(id, mapProperty(b.propertyId));
                }
            }
        });
        const allProperties = Array.from(propertyMap.values());
        const total = allProperties.length;
        const properties = allProperties.slice(skip, skip + limit);
        res.json({
            success: true,
            data: {
                properties,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch properties",
        });
    }
};
exports.getClientProperties = getClientProperties;
const getClientPayments = async (req, res) => {
    try {
        const userId = req.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const [bookings, tourBookings] = await Promise.all([
            booking_1.default.find({ userId }).sort({ createdAt: -1 }).lean(),
            tourBooking_1.default.find({ userId }).sort({ createdAt: -1 }).lean(),
        ]);
        const payments = [
            ...bookings.map((b) => ({
                id: b._id.toString(),
                bookingId: b._id.toString(),
                amount: b.totalAmount,
                status: b.paymentStatus === "paid"
                    ? "completed"
                    : b.paymentStatus === "refunded"
                        ? "refunded"
                        : "pending",
                method: b.paymentMethod || "booking",
                paidAt: b.paymentStatus === "paid" ? b.updatedAt : undefined,
                createdAt: b.createdAt,
            })),
            ...tourBookings.map((b) => ({
                id: `tour-${b._id}`,
                bookingId: b._id.toString(),
                amount: b.totalAmount,
                status: b.paymentStatus === "paid"
                    ? "completed"
                    : b.paymentStatus === "refunded"
                        ? "refunded"
                        : "pending",
                method: "tour",
                paidAt: b.paymentStatus === "paid" ? b.updatedAt : undefined,
                createdAt: b.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const total = payments.length;
        const skip = (page - 1) * limit;
        const paged = payments.slice(skip, skip + limit);
        res.json({
            success: true,
            data: {
                payments: paged,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payments",
        });
    }
};
exports.getClientPayments = getClientPayments;
const getClientInvoices = async (req, res) => {
    try {
        const userId = req.userId;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const bookings = await booking_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
        const tourBookings = await tourBooking_1.default.find({ userId })
            .populate("tourId")
            .sort({ createdAt: -1 })
            .lean();
        const invoices = [
            ...bookings.map((b) => ({
                id: `inv-${b._id}`,
                bookingId: b._id.toString(),
                booking: mapBooking(b),
                amount: b.totalAmount,
                status: b.paymentStatus === "paid"
                    ? "paid"
                    : b.status === "cancelled"
                        ? "cancelled"
                        : "pending",
                dueDate: b.checkIn,
                paidAt: b.paymentStatus === "paid" ? b.updatedAt : undefined,
                createdAt: b.createdAt,
            })),
            ...tourBookings.map((b) => ({
                id: `inv-tour-${b._id}`,
                bookingId: b._id.toString(),
                booking: {
                    id: b._id.toString(),
                    propertyName: b.tourId?.name || "Tour",
                    checkIn: b.tourDate,
                    checkOut: b.tourDate,
                    nights: 0,
                    guests: b.guests,
                    totalAmount: b.totalAmount,
                    guestInfo: b.guestInfo,
                    status: b.status,
                    bookingType: "tour",
                    paymentStatus: b.paymentStatus,
                    createdAt: b.createdAt,
                    updatedAt: b.updatedAt,
                },
                amount: b.totalAmount,
                status: b.paymentStatus === "paid" ? "paid" : "pending",
                dueDate: b.tourDate,
                paidAt: b.paymentStatus === "paid" ? b.updatedAt : undefined,
                createdAt: b.createdAt,
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const total = invoices.length;
        const skip = (page - 1) * limit;
        res.json({
            success: true,
            data: {
                invoices: invoices.slice(skip, skip + limit),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch invoices",
        });
    }
};
exports.getClientInvoices = getClientInvoices;
const getClientInvoiceById = async (req, res) => {
    try {
        const userId = req.userId;
        const rawId = req.params.id.replace(/^inv-tour-|^inv-/, "");
        const isTour = req.params.id.startsWith("inv-tour-");
        if (isTour) {
            const b = await tourBooking_1.default.findOne({ _id: rawId, userId }).populate("tourId");
            if (!b) {
                res.status(404).json({ success: false, message: "Invoice not found" });
                return;
            }
            res.json({
                success: true,
                data: {
                    invoice: {
                        id: req.params.id,
                        bookingId: b._id.toString(),
                        booking: {
                            id: b._id.toString(),
                            propertyName: b.tourId?.name || "Tour",
                            totalAmount: b.totalAmount,
                            status: b.status,
                            paymentStatus: b.paymentStatus,
                            createdAt: b.createdAt,
                        },
                        amount: b.totalAmount,
                        status: b.paymentStatus === "paid" ? "paid" : "pending",
                        dueDate: b.tourDate,
                        createdAt: b.createdAt,
                    },
                },
            });
            return;
        }
        const b = await booking_1.default.findOne({ _id: rawId, userId }).lean();
        if (!b) {
            res.status(404).json({ success: false, message: "Invoice not found" });
            return;
        }
        res.json({
            success: true,
            data: {
                invoice: {
                    id: `inv-${b._id}`,
                    bookingId: b._id.toString(),
                    booking: mapBooking(b),
                    amount: b.totalAmount,
                    status: b.paymentStatus === "paid" ? "paid" : "pending",
                    dueDate: b.checkIn,
                    createdAt: b.createdAt,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch invoice",
        });
    }
};
exports.getClientInvoiceById = getClientInvoiceById;
const getClientSettings = async (req, res) => {
    try {
        const user = await user_1.default.findById(req.userId).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({
            success: true,
            data: {
                profile: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phoneNumber,
                },
                preferences: {
                    emailNotifications: user.preferences?.emailNotifications ?? true,
                    smsNotifications: user.preferences?.smsNotifications ?? false,
                    marketingEmails: user.preferences?.marketingEmails ?? false,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch settings",
        });
    }
};
exports.getClientSettings = getClientSettings;
const updateClientPreferences = async (req, res) => {
    try {
        const { emailNotifications, smsNotifications, marketingEmails } = req.body;
        const user = await user_1.default.findByIdAndUpdate(req.userId, {
            $set: {
                "preferences.emailNotifications": emailNotifications,
                "preferences.smsNotifications": smsNotifications,
                "preferences.marketingEmails": marketingEmails,
            },
        }, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.json({
            success: true,
            data: {
                profile: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phoneNumber,
                },
                preferences: {
                    emailNotifications: user.preferences?.emailNotifications ?? true,
                    smsNotifications: user.preferences?.smsNotifications ?? false,
                    marketingEmails: user.preferences?.marketingEmails ?? false,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update preferences",
        });
    }
};
exports.updateClientPreferences = updateClientPreferences;
