"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookmarkSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    propertyId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
        index: true,
    },
}, { timestamps: true });
bookmarkSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
const Bookmark = mongoose_1.default.model("Bookmark", bookmarkSchema);
exports.default = Bookmark;
