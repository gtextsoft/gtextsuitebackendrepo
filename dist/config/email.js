"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const resend_1 = require("resend");
// Load environment variables explicitly (in case they weren't loaded yet)
dotenv_1.default.config();
const rawProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
const emailProvider = rawProvider === "resend" ? "resend" : "smtp";
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const defaultFromEmail = process.env.EMAIL_FROM?.trim() || '"GTextSuite Support" <noreply@landlordnoagent.com>';
let transporter = null;
let resendClient = null;
if (emailProvider === "resend") {
    if (!resendApiKey) {
        console.warn("⚠️  WARNING: RESEND_API_KEY is not configured. Emails will fail until it is set.");
    }
    else {
        resendClient = new resend_1.Resend(resendApiKey);
        console.log("✅ Resend email provider configured");
    }
}
else {
    if (!emailUser || !emailPass) {
        console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS not found in environment variables!");
        console.warn("⚠️  Email functionality will not work. Add these to your .env file:");
        console.warn("⚠️  EMAIL_USER=your-email@gmail.com");
        console.warn("⚠️  EMAIL_PASS=your-gmail-app-password");
        console.warn("⚠️  Current values:");
        console.warn("⚠️  EMAIL_USER:", emailUser ? `"${emailUser.substring(0, 3)}***"` : "NOT SET (empty or undefined)");
        console.warn("⚠️  EMAIL_PASS:", emailPass ? "SET (hidden)" : "NOT SET (empty or undefined)");
    }
    else {
        transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            port: 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
        console.log("🔍 Verifying SMTP email configuration...");
        transporter.verify()
            .then(() => {
            console.log("✅ Email service configured and ready");
        })
            .catch((error) => {
            console.error("❌ Email service configuration error:", error.message);
            console.error("❌ Error code:", error.code);
            if (error.code === "EAUTH" || error.responseCode === 535) {
                console.error("❌ Authentication failed - Make sure you're using Gmail App Password (not regular password)");
                console.error("❌ Get App Password: https://myaccount.google.com/apppasswords");
            }
            else if (error.message?.includes("Missing credentials")) {
                console.error("❌ Missing credentials - EMAIL_USER or EMAIL_PASS is empty in .env file");
                console.error("❌ Check your .env file - make sure values are not empty");
            }
        });
    }
}
const sendEmail = async ({ from, to, subject, html }) => {
    const resolvedFrom = from || defaultFromEmail;
    if (emailProvider === "resend") {
        if (!resendClient) {
            throw new Error("Resend email provider is not configured. Set RESEND_API_KEY.");
        }
        await resendClient.emails.send({
            from: resolvedFrom,
            to,
            subject,
            html,
        });
        return;
    }
    if (!transporter) {
        throw new Error("SMTP transporter is not configured. Ensure EMAIL_USER and EMAIL_PASS are set.");
    }
    await transporter.sendMail({
        from: resolvedFrom,
        to,
        subject,
        html,
    });
};
exports.sendEmail = sendEmail;
