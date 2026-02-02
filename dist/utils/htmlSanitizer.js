"use strict";
/**
 * HTML Sanitization Utility
 * Sanitizes HTML content to prevent XSS attacks
 * Uses isomorphic-dompurify for Node.js compatibility
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = sanitizeHtml;
exports.countTextOnly = countTextOnly;
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
/**
 * Sanitize HTML content for safe storage and display
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
function sanitizeHtml(html) {
    if (!html || typeof html !== "string") {
        return "";
    }
    // Configure DOMPurify to allow safe HTML tags and attributes
    const config = {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
            "ul", "ol", "li", "a", "blockquote", "hr"
        ],
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOW_DATA_ATTR: false,
        // Preserve formatting
        KEEP_CONTENT: true,
    };
    return isomorphic_dompurify_1.default.sanitize(html, config);
}
/**
 * Count text characters only (excluding HTML tags)
 * Useful for validation to ensure meaningful content length
 * @param html - The HTML string to count
 * @returns Number of text characters (excluding HTML tags)
 */
function countTextOnly(html) {
    if (!html || typeof html !== "string") {
        return 0;
    }
    // Remove HTML tags and decode HTML entities
    const textOnly = html
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
        .replace(/&[a-z]+;/gi, "") // Remove other HTML entities (optional, can be expanded)
        .trim();
    return textOnly.length;
}
