import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables explicitly (in case they weren't loaded yet)
dotenv.config();

// Check if email credentials are configured
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

if (!emailUser || !emailPass) {
  console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS not found in environment variables!");
  console.warn("⚠️  Email functionality will not work. Add these to your .env file:");
  console.warn("⚠️  EMAIL_USER=your-email@gmail.com");
  console.warn("⚠️  EMAIL_PASS=your-gmail-app-password");
  console.warn("⚠️  Current values:");
  console.warn("⚠️  EMAIL_USER:", emailUser ? `"${emailUser.substring(0, 3)}***"` : "NOT SET (empty or undefined)");
  console.warn("⚠️  EMAIL_PASS:", emailPass ? "SET (hidden)" : "NOT SET (empty or undefined)");
} else {
  console.log("✅ Email credentials found:");
  console.log("✅ EMAIL_USER:", `${emailUser.substring(0, 3)}***@***`);
  console.log("✅ EMAIL_PASS:", emailPass ? "SET (hidden)" : "NOT SET");
}

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 587,
  secure: false,
  auth: {
    user: emailUser || undefined, // Your email address
    pass: emailPass || undefined, // Your email password (must be App Password for Gmail)
  },
});

// Verify email configuration on startup
if (emailUser && emailPass) {
  console.log("🔍 Verifying email configuration...");
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
      } else if (error.message?.includes("Missing credentials")) {
        console.error("❌ Missing credentials - EMAIL_USER or EMAIL_PASS is empty in .env file");
        console.error("❌ Check your .env file - make sure values are not empty");
      }
    });
} else {
  console.warn("⚠️  Skipping email verification - credentials not configured");
}

