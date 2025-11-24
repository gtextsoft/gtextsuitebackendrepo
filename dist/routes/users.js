"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const auth_validators_1 = require("../validators/auth.validators");
const router = express_1.default.Router();
router.post("/register", auth_validators_1.signUpValidationRules, auth_1.registerUser);
router.post("/register-admin", auth_validators_1.signUpValidationRules, auth_1.registerAdmin); // Admin registration with secret key
router.post("/login", auth_validators_1.loginValidationRules, auth_1.loginUser);
exports.default = router;
