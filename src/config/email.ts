import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";

// Load environment variables explicitly (in case they weren't loaded yet)
dotenv.config();

type EmailProvider = "smtp" | "resend";

const rawProvider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
const emailProvider: EmailProvider = rawProvider === "resend" ? "resend" : "smtp";
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const defaultFromEmail = process.env.EMAIL_FROM?.trim() || '"GTextSuite Support" <no-reply@gtextsuite.com>';

let transporter: nodemailer.Transporter | null = null;
let resendClient: Resend | null = null;

if (emailProvider === "resend") {
  if (!resendApiKey) {
    console.warn("⚠️  WARNING: RESEND_API_KEY is not configured. Emails will fail until it is set.");
  } else {
    resendClient = new Resend(resendApiKey);
    console.log("✅ Resend email provider configured");
  }
} else {
  if (!emailUser || !emailPass) {
    console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS not found in environment variables!");
    console.warn("⚠️  Email functionality will not work. Add these to your .env file:");
    console.warn("⚠️  EMAIL_USER=your-email@gmail.com");
    console.warn("⚠️  EMAIL_PASS=your-gmail-app-password");
    console.warn("⚠️  Current values:");
    console.warn("⚠️  EMAIL_USER:", emailUser ? `"${emailUser.substring(0, 3)}***"` : "NOT SET (empty or undefined)");
    console.warn("⚠️  EMAIL_PASS:", emailPass ? "SET (hidden)" : "NOT SET (empty or undefined)");
  } else {
    transporter = nodemailer.createTransport({
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
        } else if (error.message?.includes("Missing credentials")) {
          console.error("❌ Missing credentials - EMAIL_USER or EMAIL_PASS is empty in .env file");
          console.error("❌ Check your .env file - make sure values are not empty");
        }
      });
  }
}

type SendEmailOptions = {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
};

export const sendEmail = async ({ from, to, subject, html }: SendEmailOptions) => {
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

