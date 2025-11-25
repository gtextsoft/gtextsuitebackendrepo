"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTourBookingCompletedEmail = exports.sendTourBookingRejectedEmail = exports.sendTourBookingCancelledEmail = exports.sendTourBookingConfirmedEmail = exports.sendTourBookingConfirmationEmail = exports.sendTestEmail = exports.sendResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = void 0;
const email_1 = require("../config/email");
const email_templates_1 = require("../templates/email.templates");
const sendVerificationEmail = async (email, verificationToken) => {
    const emailHtml = email_templates_1.VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);
    const mailOptions = {
        from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
        to: email,
        subject: "Verify Your Email - GTextSuite",
        html: emailHtml,
    };
    await email_1.transporter.sendMail(mailOptions);
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = async (email, firstName, lastName) => {
    const emailHtml = email_templates_1.EMAIL_VERIFICATION_SUCCESS_TEMPLATE.replace("{firstName}", firstName).replace("{lastName}", lastName);
    try {
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Welcome Email - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending welcome email`, error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (email, verificationLink) => {
    const emailHtml = email_templates_1.PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", verificationLink);
    try {
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Password Reset - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendResetSuccessEmail = async (email) => {
    try {
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Password Reset Successful - GTextSuite",
            html: email_templates_1.PASSWORD_RESET_SUCCESS_TEMPLATE,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error(`Error sending password reset success email`, error);
        throw new Error(`Error sending password reset success email: ${error}`);
    }
};
exports.sendResetSuccessEmail = sendResetSuccessEmail;
// Test email function - for testing email configuration without touching database
const sendTestEmail = async (email) => {
    const testEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6; }
        .container { background-color: #FFFFFF; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { background: rgb(34, 17, 3); padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        h1 { color: #EDEDED; margin: 0; font-size: 24px; }
        .success { background-color: #10B981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .info { background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513; }
        .footer { text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧪 Email Test - GTextSuite</h1>
      </div>
      <div class="container">
        <div class="success">
          ✅ <strong>Email Service is Working!</strong>
        </div>
        <div class="info">
          <p><strong>If you received this email, your email configuration is correct!</strong></p>
          <p>This is a test email sent from your GTextSuite backend application.</p>
        </div>
        <h2 style="color: #8B4513;">Email Configuration Status:</h2>
        <ul>
          <li>✅ SMTP connection successful</li>
          <li>✅ Email authentication working</li>
          <li>✅ Email sending functional</li>
        </ul>
        <p style="color: #6B7280; font-size: 0.9em; margin-top: 30px;">
          Time sent: ${new Date().toLocaleString()}
        </p>
      </div>
      <div class="footer">
        <p style="color: #6B7280; font-size: 0.9em;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
    const mailOptions = {
        from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
        to: email,
        subject: "🧪 Test Email - GTextSuite Email Service",
        html: testEmailHtml,
    };
    await email_1.transporter.sendMail(mailOptions);
};
exports.sendTestEmail = sendTestEmail;
// ==================== TOUR BOOKING EMAIL FUNCTIONS ====================
/**
 * Send tour booking confirmation email (when booking is created)
 */
const sendTourBookingConfirmationEmail = async (email, guestName, tourName, location, duration, tourDate, guests, totalAmount, meetingPoint) => {
    try {
        let emailHtml = email_templates_1.TOUR_BOOKING_CONFIRMATION_TEMPLATE
            .replace(/{guestName}/g, guestName)
            .replace(/{tourName}/g, tourName)
            .replace(/{location}/g, location)
            .replace(/{duration}/g, duration)
            .replace(/{tourDate}/g, tourDate)
            .replace(/{guests}/g, guests.toString())
            .replace(/{totalAmount}/g, totalAmount);
        // Add meeting point if provided
        if (meetingPoint) {
            emailHtml = emailHtml.replace("{meetingPoint}", `<p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Meeting Point:</strong> ${meetingPoint}</p>`);
        }
        else {
            emailHtml = emailHtml.replace("{meetingPoint}", "");
        }
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Tour Booking Received - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending tour booking confirmation email:", error);
        throw error;
    }
};
exports.sendTourBookingConfirmationEmail = sendTourBookingConfirmationEmail;
/**
 * Send tour booking confirmed email (when admin confirms booking)
 */
const sendTourBookingConfirmedEmail = async (email, guestName, tourName, location, duration, tourDate, guests, totalAmount, adminNotes, meetingPoint) => {
    try {
        let emailHtml = email_templates_1.TOUR_BOOKING_CONFIRMED_TEMPLATE
            .replace(/{guestName}/g, guestName)
            .replace(/{tourName}/g, tourName)
            .replace(/{location}/g, location)
            .replace(/{duration}/g, duration)
            .replace(/{tourDate}/g, tourDate)
            .replace(/{guests}/g, guests.toString())
            .replace(/{totalAmount}/g, totalAmount);
        // Add meeting point if provided
        if (meetingPoint) {
            emailHtml = emailHtml.replace("{meetingPoint}", `<p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Meeting Point:</strong> ${meetingPoint}</p>`);
        }
        else {
            emailHtml = emailHtml.replace("{meetingPoint}", "");
        }
        // Add admin notes if provided
        if (adminNotes) {
            emailHtml = emailHtml.replace("{adminNotes}", `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Additional Notes:</strong></p><p style="color: #171717; margin-top: 8px;">${adminNotes}</p></div>`);
        }
        else {
            emailHtml = emailHtml.replace("{adminNotes}", "");
        }
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Tour Booking Confirmed - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending tour booking confirmed email:", error);
        throw error;
    }
};
exports.sendTourBookingConfirmedEmail = sendTourBookingConfirmedEmail;
/**
 * Send tour booking cancelled email
 */
const sendTourBookingCancelledEmail = async (email, guestName, tourName, location, tourDate, cancelledDate, cancellationReason, meetingPoint) => {
    try {
        let emailHtml = email_templates_1.TOUR_BOOKING_CANCELLED_TEMPLATE
            .replace(/{guestName}/g, guestName)
            .replace(/{tourName}/g, tourName)
            .replace(/{location}/g, location)
            .replace(/{tourDate}/g, tourDate)
            .replace(/{cancelledDate}/g, cancelledDate);
        // Add cancellation reason if provided
        if (cancellationReason) {
            emailHtml = emailHtml.replace("{cancellationReason}", `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Cancellation Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${cancellationReason}</p></div>`);
        }
        else {
            emailHtml = emailHtml.replace("{cancellationReason}", "");
        }
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Tour Booking Cancelled - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending tour booking cancelled email:", error);
        throw error;
    }
};
exports.sendTourBookingCancelledEmail = sendTourBookingCancelledEmail;
/**
 * Send tour booking rejected email
 */
const sendTourBookingRejectedEmail = async (email, guestName, tourName, location, tourDate, rejectionReason) => {
    try {
        let emailHtml = email_templates_1.TOUR_BOOKING_REJECTED_TEMPLATE
            .replace(/{guestName}/g, guestName)
            .replace(/{tourName}/g, tourName)
            .replace(/{location}/g, location)
            .replace(/{tourDate}/g, tourDate);
        // Add rejection reason if provided
        if (rejectionReason) {
            emailHtml = emailHtml.replace("{rejectionReason}", `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${rejectionReason}</p></div>`);
        }
        else {
            emailHtml = emailHtml.replace("{rejectionReason}", "");
        }
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Tour Booking Not Available - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending tour booking rejected email:", error);
        throw error;
    }
};
exports.sendTourBookingRejectedEmail = sendTourBookingRejectedEmail;
/**
 * Send tour booking completed email
 */
const sendTourBookingCompletedEmail = async (email, guestName, tourName, location, tourDate) => {
    try {
        const emailHtml = email_templates_1.TOUR_BOOKING_COMPLETED_TEMPLATE
            .replace(/{guestName}/g, guestName)
            .replace(/{tourName}/g, tourName)
            .replace(/{location}/g, location)
            .replace(/{tourDate}/g, tourDate);
        const mailOptions = {
            from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
            to: email,
            subject: "Thank You For Your Tour - GTextSuite",
            html: emailHtml,
        };
        await email_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending tour booking completed email:", error);
        throw error;
    }
};
exports.sendTourBookingCompletedEmail = sendTourBookingCompletedEmail;
