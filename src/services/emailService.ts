import { sendEmail } from "../config/email";
import {
  EMAIL_VERIFICATION_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  EMAIL_CHANGE_REQUEST_TEMPLATE,
  EMAIL_CHANGE_OLD_APPROVAL_TEMPLATE,
  EMAIL_CHANGE_NOTIFICATION_TEMPLATE,
  BOOKING_CONFIRMATION_TEMPLATE,
  BOOKING_CONFIRMED_TEMPLATE,
  BOOKING_CANCELLED_TEMPLATE,
  BOOKING_REJECTED_TEMPLATE,
  BOOKING_COMPLETED_TEMPLATE,
  TOUR_BOOKING_CONFIRMATION_TEMPLATE,
  TOUR_BOOKING_CONFIRMED_TEMPLATE,
  TOUR_BOOKING_CANCELLED_TEMPLATE,
  TOUR_BOOKING_REJECTED_TEMPLATE,
  TOUR_BOOKING_COMPLETED_TEMPLATE,
} from "../templates/email.templates";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  const emailHtml = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken
  );

  const mailOptions = {
    from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
    to: email,
    subject: "Verify Your Email - GTextSuite",
    html: emailHtml,
  };

  await sendEmail(mailOptions);
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  lastName: string
) => {
  const emailHtml = EMAIL_VERIFICATION_SUCCESS_TEMPLATE.replace(
    "{firstName}",
    firstName
  ).replace("{lastName}", lastName);
  try {
    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Welcome Email - GTextSuite",
      html: emailHtml,
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.error(`Error sending welcome email`, error);

    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  verificationLink: string
) => {
  const emailHtml = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    "{resetURL}",
    verificationLink
  );
  try {
    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Password Reset - GTextSuite",
      html: emailHtml,
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.error(`Error sending password reset email`, error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email: string) => {
  try {
    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Password Reset Successful - GTextSuite",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };
    await sendEmail(mailOptions);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

/**
 * Send email change request verification to new email address
 * User must verify the new email before the change is completed
 */
export const sendEmailChangeRequest = async (
  newEmail: string,
  oldEmail: string,
  verificationToken: string
) => {
  try {
    const emailHtml = EMAIL_CHANGE_REQUEST_TEMPLATE
      .replace(/{oldEmail}/g, oldEmail)
      .replace(/{newEmail}/g, newEmail)
      .replace(/{verificationCode}/g, verificationToken);

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: newEmail,
      subject: "Verify Your New Email Address - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
    console.log(`Email change verification sent to new email: ${newEmail}`);
  } catch (error) {
    console.error("Error sending email change request:", error);
    throw new Error(`Error sending email change request: ${error}`);
  }
};

/**
 * Send approval request to old email address
 * Old email must approve before the change can complete
 */
export const sendEmailChangeOldApproval = async (
  oldEmail: string,
  newEmail: string,
  firstName: string,
  lastName: string,
  approvalToken: string
) => {
  try {
    const emailHtml = EMAIL_CHANGE_OLD_APPROVAL_TEMPLATE
      .replace(/{firstName}/g, firstName)
      .replace(/{lastName}/g, lastName)
      .replace(/{oldEmail}/g, oldEmail)
      .replace(/{newEmail}/g, newEmail)
      .replace(/{approvalCode}/g, approvalToken);

    const mailOptions = {
      from: '"GTextSuite Security" <no-reply@gtextsuite.com>',
      to: oldEmail,
      subject: "⚠️ Approve Email Change Request - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
    console.log(`Email change approval request sent to old email: ${oldEmail}`);
  } catch (error) {
    console.error("Error sending email change approval request:", error);
    throw new Error(`Error sending email change approval request: ${error}`);
  }
};

/**
 * Send email change notification to old email address
 * This is sent AFTER the change is completed
 */
export const sendEmailChangeNotification = async (
  oldEmail: string,
  newEmail: string,
  firstName: string,
  lastName: string
) => {
  try {
    const emailHtml = EMAIL_CHANGE_NOTIFICATION_TEMPLATE
      .replace(/{firstName}/g, firstName)
      .replace(/{lastName}/g, lastName)
      .replace(/{oldEmail}/g, oldEmail)
      .replace(/{newEmail}/g, newEmail);

    const mailOptions = {
      from: '"GTextSuite Security" <no-reply@gtextsuite.com>',
      to: oldEmail,
      subject: "✅ Email Address Changed - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
    console.log(`Email change notification sent to old email: ${oldEmail}`);
  } catch (error) {
    console.error("Error sending email change notification:", error);
    // Don't throw - this is a notification, not critical for the update process
  }
};

// Test email function - for testing email configuration without touching database
export const sendTestEmail = async (email: string) => {
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

  await sendEmail(mailOptions);
};

// ==================== PROPERTY BOOKING EMAIL FUNCTIONS ====================

/**
 * Send booking confirmation email (when booking is created)
 */
export const sendBookingConfirmationEmail = async (
  email: string,
  guestName: string,
  propertyName: string,
  location: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  bookingType: string,
  totalAmount: string
) => {
  try {
    const emailHtml = BOOKING_CONFIRMATION_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{propertyName}/g, propertyName)
      .replace(/{location}/g, location)
      .replace(/{checkIn}/g, checkIn)
      .replace(/{checkOut}/g, checkOut)
      .replace(/{guests}/g, guests.toString())
      .replace(/{bookingType}/g, bookingType)
      .replace(/{totalAmount}/g, totalAmount);

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Booking Received - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw error;
  }
};

/**
 * Send booking confirmed email (when admin confirms booking)
 */
export const sendBookingConfirmedEmail = async (
  email: string,
  guestName: string,
  propertyName: string,
  location: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  bookingType: string,
  totalAmount: string,
  adminNotes?: string
) => {
  try {
    let emailHtml = BOOKING_CONFIRMED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{propertyName}/g, propertyName)
      .replace(/{location}/g, location)
      .replace(/{checkIn}/g, checkIn)
      .replace(/{checkOut}/g, checkOut)
      .replace(/{guests}/g, guests.toString())
      .replace(/{bookingType}/g, bookingType)
      .replace(/{totalAmount}/g, totalAmount);

    // Add admin notes if provided
    if (adminNotes) {
      emailHtml = emailHtml.replace(
        "{adminNotes}",
        `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Additional Notes:</strong></p><p style="color: #171717; margin-top: 8px;">${adminNotes}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{adminNotes}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Booking Confirmed - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending booking confirmed email:", error);
    throw error;
  }
};

/**
 * Send booking cancelled email
 */
export const sendBookingCancelledEmail = async (
  email: string,
  guestName: string,
  propertyName: string,
  location: string,
  checkIn: string,
  checkOut: string,
  cancelledDate: string,
  cancellationReason?: string
) => {
  try {
    let emailHtml = BOOKING_CANCELLED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{propertyName}/g, propertyName)
      .replace(/{location}/g, location)
      .replace(/{checkIn}/g, checkIn)
      .replace(/{checkOut}/g, checkOut)
      .replace(/{cancelledDate}/g, cancelledDate);

    // Add cancellation reason if provided
    if (cancellationReason) {
      emailHtml = emailHtml.replace(
        "{cancellationReason}",
        `<div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${cancellationReason}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{cancellationReason}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Booking Cancelled - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending booking cancelled email:", error);
    throw error;
  }
};

/**
 * Send booking rejected email
 */
export const sendBookingRejectedEmail = async (
  email: string,
  guestName: string,
  propertyName: string,
  location: string,
  checkIn: string,
  checkOut: string,
  rejectionReason?: string
) => {
  try {
    let emailHtml = BOOKING_REJECTED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{propertyName}/g, propertyName)
      .replace(/{location}/g, location)
      .replace(/{checkIn}/g, checkIn)
      .replace(/{checkOut}/g, checkOut);

    // Add rejection reason if provided
    if (rejectionReason) {
      emailHtml = emailHtml.replace(
        "{rejectionReason}",
        `<div style="background-color: #FEE2E2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${rejectionReason}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{rejectionReason}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Booking Not Available - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending booking rejected email:", error);
    throw error;
  }
};

/**
 * Send booking completed email
 */
export const sendBookingCompletedEmail = async (
  email: string,
  guestName: string,
  propertyName: string,
  location: string,
  checkIn: string,
  checkOut: string
) => {
  try {
    const emailHtml = BOOKING_COMPLETED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{propertyName}/g, propertyName)
      .replace(/{location}/g, location)
      .replace(/{checkIn}/g, checkIn)
      .replace(/{checkOut}/g, checkOut);

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Thank You For Your Stay - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending booking completed email:", error);
    throw error;
  }
};

// ==================== TOUR BOOKING EMAIL FUNCTIONS ====================

/**
 * Send tour booking confirmation email (when booking is created)
 */
export const sendTourBookingConfirmationEmail = async (
  email: string,
  guestName: string,
  tourName: string,
  location: string,
  duration: string,
  tourDate: string,
  guests: number,
  totalAmount: string,
  meetingPoint?: string
) => {
  try {
    let emailHtml = TOUR_BOOKING_CONFIRMATION_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{tourName}/g, tourName)
      .replace(/{location}/g, location)
      .replace(/{duration}/g, duration)
      .replace(/{tourDate}/g, tourDate)
      .replace(/{guests}/g, guests.toString())
      .replace(/{totalAmount}/g, totalAmount);

    // Add meeting point if provided
    if (meetingPoint) {
      emailHtml = emailHtml.replace(
        "{meetingPoint}",
        `<p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Meeting Point:</strong> ${meetingPoint}</p>`
      );
    } else {
      emailHtml = emailHtml.replace("{meetingPoint}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Tour Booking Received - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending tour booking confirmation email:", error);
    throw error;
  }
};

/**
 * Send tour booking confirmed email (when admin confirms booking)
 */
export const sendTourBookingConfirmedEmail = async (
  email: string,
  guestName: string,
  tourName: string,
  location: string,
  duration: string,
  tourDate: string,
  guests: number,
  totalAmount: string,
  adminNotes?: string,
  meetingPoint?: string
) => {
  try {
    let emailHtml = TOUR_BOOKING_CONFIRMED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{tourName}/g, tourName)
      .replace(/{location}/g, location)
      .replace(/{duration}/g, duration)
      .replace(/{tourDate}/g, tourDate)
      .replace(/{guests}/g, guests.toString())
      .replace(/{totalAmount}/g, totalAmount);

    // Add meeting point if provided
    if (meetingPoint) {
      emailHtml = emailHtml.replace(
        "{meetingPoint}",
        `<p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Meeting Point:</strong> ${meetingPoint}</p>`
      );
    } else {
      emailHtml = emailHtml.replace("{meetingPoint}", "");
    }

    // Add admin notes if provided
    if (adminNotes) {
      emailHtml = emailHtml.replace(
        "{adminNotes}",
        `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Additional Notes:</strong></p><p style="color: #171717; margin-top: 8px;">${adminNotes}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{adminNotes}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Tour Booking Confirmed - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending tour booking confirmed email:", error);
    throw error;
  }
};

/**
 * Send tour booking cancelled email
 */
export const sendTourBookingCancelledEmail = async (
  email: string,
  guestName: string,
  tourName: string,
  location: string,
  tourDate: string,
  cancelledDate: string,
  cancellationReason?: string,
  meetingPoint?: string
) => {
  try {
    let emailHtml = TOUR_BOOKING_CANCELLED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{tourName}/g, tourName)
      .replace(/{location}/g, location)
      .replace(/{tourDate}/g, tourDate)
      .replace(/{cancelledDate}/g, cancelledDate);

    // Add cancellation reason if provided
    if (cancellationReason) {
      emailHtml = emailHtml.replace(
        "{cancellationReason}",
        `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Cancellation Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${cancellationReason}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{cancellationReason}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Tour Booking Cancelled - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending tour booking cancelled email:", error);
    throw error;
  }
};

/**
 * Send tour booking rejected email
 */
export const sendTourBookingRejectedEmail = async (
  email: string,
  guestName: string,
  tourName: string,
  location: string,
  tourDate: string,
  rejectionReason?: string
) => {
  try {
    let emailHtml = TOUR_BOOKING_REJECTED_TEMPLATE
      .replace(/{guestName}/g, guestName)
      .replace(/{tourName}/g, tourName)
      .replace(/{location}/g, location)
      .replace(/{tourDate}/g, tourDate);

    // Add rejection reason if provided
    if (rejectionReason) {
      emailHtml = emailHtml.replace(
        "{rejectionReason}",
        `<div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Reason:</strong></p><p style="color: #171717; margin-top: 8px;">${rejectionReason}</p></div>`
      );
    } else {
      emailHtml = emailHtml.replace("{rejectionReason}", "");
    }

    const mailOptions = {
      from: '"GTextSuite Support" <no-reply@gtextsuite.com>',
      to: email,
      subject: "Tour Booking Not Available - GTextSuite",
      html: emailHtml,
    };

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending tour booking rejected email:", error);
    throw error;
  }
};

/**
 * Send tour booking completed email
 */
export const sendTourBookingCompletedEmail = async (
  email: string,
  guestName: string,
  tourName: string,
  location: string,
  tourDate: string
) => {
  try {
    const emailHtml = TOUR_BOOKING_COMPLETED_TEMPLATE
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

    await sendEmail(mailOptions);
  } catch (error) {
    console.error("Error sending tour booking completed email:", error);
    throw error;
  }
};
