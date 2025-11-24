"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Create a signed JWT using the provided data, secret, and lifetime.
 * `expiresIn` follows jsonwebtoken's `SignOptions["expiresIn"]` typing (e.g. "1h").
 */
const generateToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateToken = generateToken;
/**
 * Validate a JWT and return the decoded payload.
 * Throws if the token is missing, expired, or malformed.
 */
const verifyToken = (token, secret) => {
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (typeof decoded === "string") {
        throw new Error("Invalid token payload");
    }
    return decoded;
};
exports.verifyToken = verifyToken;
