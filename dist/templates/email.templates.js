"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_CHANGE_NOTIFICATION_TEMPLATE = exports.EMAIL_CHANGE_OLD_APPROVAL_TEMPLATE = exports.EMAIL_CHANGE_REQUEST_TEMPLATE = exports.TOUR_BOOKING_COMPLETED_TEMPLATE = exports.TOUR_BOOKING_REJECTED_TEMPLATE = exports.TOUR_BOOKING_CANCELLED_TEMPLATE = exports.TOUR_BOOKING_CONFIRMED_TEMPLATE = exports.TOUR_BOOKING_CONFIRMATION_TEMPLATE = exports.INQUIRY_CLOSED_TEMPLATE = exports.INQUIRY_REJECTED_TEMPLATE = exports.INQUIRY_QUALIFIED_TEMPLATE = exports.INQUIRY_CONTACTED_TEMPLATE = exports.INQUIRY_RECEIVED_TEMPLATE = exports.BOOKING_COMPLETED_TEMPLATE = exports.BOOKING_REJECTED_TEMPLATE = exports.BOOKING_CANCELLED_TEMPLATE = exports.BOOKING_CONFIRMED_TEMPLATE = exports.BOOKING_CONFIRMATION_TEMPLATE = exports.PASSWORD_RESET_REQUEST_TEMPLATE = exports.PASSWORD_RESET_SUCCESS_TEMPLATE = exports.EMAIL_VERIFICATION_SUCCESS_TEMPLATE = exports.VERIFICATION_EMAIL_TEMPLATE = void 0;
exports.VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Verify Your Email</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello,</p>
    <p style="color: #171717;">Thank you for signing up for GTextSuite! We're thrilled to have you on board.</p>
    <p style="color: #171717;">To secure your account, please verify your email address using the code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B4513;">{verificationCode}</span>
    </div>
     <p style="color: #171717;">This code will expire in 24 hours for security reasons. Please complete your verification soon!</p>
      <p style="color: #171717;">If you didn't sign up for GTextSuite, you can safely ignore this email.</p>
   
    
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
      <p style="color: #6B7280; font-size: 0.9em;">Need help? Visit our <a href="" style="color: #8B4513; text-decoration: none;">Support Center</a>.</p>
      <p style="color: #6B7280; font-size: 0.85em; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
    </div>
</body>
</html>
`;
exports.EMAIL_VERIFICATION_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Email Verified Successfully</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello, {firstName} {lastName}</p>
    <p style="color: #171717;">Congratulations! Your email address has been successfully verified. You can now enjoy all the features of our platform.</p>
    <p style="color: #171717;">Thank you for choosing GTextSuite. We're excited to have you on board!</p>
    <p style="color: #171717;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello,</p>
    <p style="color: #171717;">We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #8B4513; color: #FFFFFF; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p style="color: #171717;">If you did not initiate this password reset, please contact our support team immediately.</p>
    <p style="color: #171717;">For security reasons, we recommend that you:</p>
    <ul style="color: #171717;">
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p style="color: #171717;">Thank you for helping us keep your account secure.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Password Reset</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello,</p>
    <p style="color: #171717;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p style="color: #171717;">To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #8B4513; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #171717;">This link will expire in 1 hour for security reasons.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
    <p>&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.BOOKING_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Booking Received</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Thank you for your booking request! We've received your booking and our team is reviewing it.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-in:</strong> {checkIn}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-out:</strong> {checkOut}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Guests:</strong> {guests}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Booking Type:</strong> {bookingType}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Total Amount:</strong> {totalAmount}</p>
    </div>

    <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> Pending Review</p>
    <p style="color: #171717;">We'll review your booking and send you a confirmation email shortly. If you have any questions, please don't hesitate to contact us.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.BOOKING_CONFIRMED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">✓ Booking Confirmed!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Great news! Your booking has been confirmed. We're excited to host you!</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-in:</strong> {checkIn}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-out:</strong> {checkOut}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Guests:</strong> {guests}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Booking Type:</strong> {bookingType}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Total Amount:</strong> {totalAmount}</p>
    </div>

    <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> <span style="color: #8B4513; font-weight: bold;">Confirmed</span></p>
    
    {adminNotes}
    
    <p style="color: #171717;">Please prepare for your stay. If you have any questions or need to make changes, please contact us as soon as possible.</p>
    
    <p style="color: #171717;">We look forward to hosting you!</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.BOOKING_CANCELLED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Booking Cancelled</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Your booking has been cancelled.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Cancelled Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-in:</strong> {checkIn}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-out:</strong> {checkOut}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Cancelled Date:</strong> {cancelledDate}</p>
    </div>

    {cancellationReason}
    
    <p style="color: #171717;">If you have any questions about this cancellation or would like to book again, please contact us.</p>
    
    <p style="color: #171717;">We hope to serve you in the future.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.BOOKING_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Not Available</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Booking Not Available</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">We're sorry to inform you that your booking request could not be confirmed at this time.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-in:</strong> {checkIn}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-out:</strong> {checkOut}</p>
    </div>

    {rejectionReason}
    
    <p style="color: #171717;">We encourage you to browse our other available properties or try different dates. If you have any questions, please don't hesitate to contact us.</p>
    
    <p style="color: #171717;">Thank you for your understanding.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.BOOKING_COMPLETED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You For Your Stay</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Thank You For Your Stay!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Thank you for staying with us! We hope you had a wonderful experience.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Stay Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-in:</strong> {checkIn}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Check-out:</strong> {checkOut}</p>
    </div>

    <p style="color: #171717;">We'd love to hear about your experience! Your feedback helps us improve and helps other guests make informed decisions.</p>
    <p style="color: #171717;">If you enjoyed your stay, we'd be delighted to host you again in the future.</p>
    
    <p style="color: #171717;">Thank you for choosing GTextSuite!</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
    <p>&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
// ==================== INQUIRY EMAIL TEMPLATES ====================
exports.INQUIRY_RECEIVED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Inquiry Received</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {contactName},</p>
    <p style="color: #171717;">Thank you for your interest! We've received your {inquiryType} inquiry and our team will review it shortly.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Inquiry Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Inquiry Type:</strong> {inquiryType}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Contact Email:</strong> {contactEmail}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Contact Phone:</strong> {contactPhone}</p>
    </div>

    <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> Pending Review</p>
    <p style="color: #171717;">One of our team members will contact you within 24-48 hours to discuss your requirements in detail.</p>
    <p style="color: #171717;">If you have any urgent questions, please feel free to contact us directly.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.INQUIRY_CONTACTED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've Received Your Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">We're Looking Into It!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {contactName},</p>
    <p style="color: #171717;">Thank you for your {inquiryType} inquiry regarding <strong>{propertyName}</strong>.</p>
    <p style="color: #171717;">Our team has reviewed your inquiry and we're actively working on finding the best solution for you. You can expect to hear from us soon with more details.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Inquiry Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Inquiry Type:</strong> {inquiryType}</p>
    </div>

    {adminNotes}
    
    <p style="color: #171717;">If you have any questions in the meantime, please don't hesitate to reach out to us.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.INQUIRY_QUALIFIED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Inquiry Progress</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Great News!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {contactName},</p>
    <p style="color: #171717;">Excellent news! Your {inquiryType} inquiry for <strong>{propertyName}</strong> has been qualified and is moving forward.</p>
    <p style="color: #171717;">Our team is preparing the best options for you and will be in touch shortly with detailed information and next steps.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Inquiry Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Inquiry Type:</strong> {inquiryType}</p>
      <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> <span style="color: #8B4513; font-weight: bold;">Qualified</span></p>
    </div>

    {adminNotes}
    
    <p style="color: #171717;">We're excited to work with you on this opportunity. Please watch for our next communication with detailed information.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.INQUIRY_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Inquiry Update</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {contactName},</p>
    <p style="color: #171717;">Thank you for your interest in <strong>{propertyName}</strong>. Unfortunately, we're unable to proceed with your {inquiryType} inquiry at this time.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Inquiry Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Inquiry Type:</strong> {inquiryType}</p>
    </div>

    {rejectionReason}
    
    <p style="color: #171717;">We encourage you to explore our other available properties or contact us if your requirements change. Our team is always here to help find the perfect solution for you.</p>
    
    <p style="color: #171717;">Thank you for considering GTextSuite.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.INQUIRY_CLOSED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiry Closed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Thank You!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {contactName},</p>
    <p style="color: #171717;">Your {inquiryType} inquiry for <strong>{propertyName}</strong> has been successfully closed.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Inquiry Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Property:</strong> {propertyName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Inquiry Type:</strong> {inquiryType}</p>
      <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> <span style="color: #8B4513; font-weight: bold;">Closed</span></p>
    </div>

    <p style="color: #171717;">Thank you for working with us! We hope we were able to assist you with your needs.</p>
    <p style="color: #171717;">If you have any future inquiries or need assistance, please don't hesitate to reach out. We're always here to help.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
    <p>&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
// ==================== TOUR BOOKING EMAIL TEMPLATES ====================
exports.TOUR_BOOKING_CONFIRMATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tour Booking Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Tour Booking Received</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Thank you for your tour booking request! We've received your booking and our team is reviewing it.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Tour Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour:</strong> {tourName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Duration:</strong> {duration}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour Date:</strong> {tourDate}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Number of Guests:</strong> {guests}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Total Amount:</strong> {totalAmount}</p>
      {meetingPoint}
    </div>

    <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> Pending Review</p>
    <p style="color: #171717;">We'll review your booking and send you a confirmation email shortly. If you have any questions, please don't hesitate to contact us.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.TOUR_BOOKING_CONFIRMED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tour Booking Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">✓ Tour Booking Confirmed!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Great news! Your tour booking has been confirmed. We're excited to have you join us!</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Tour Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour:</strong> {tourName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Duration:</strong> {duration}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour Date:</strong> {tourDate}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Number of Guests:</strong> {guests}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Total Amount:</strong> {totalAmount}</p>
      {meetingPoint}
    </div>

    <p style="color: #171717;"><strong style="color: rgb(34, 17, 3);">Status:</strong> <span style="color: #8B4513; font-weight: bold;">Confirmed</span></p>
    
    {adminNotes}
    
    <p style="color: #171717;">Please prepare for your tour. If you have any questions or need to make changes, please contact us as soon as possible.</p>
    
    <p style="color: #171717;">We look forward to seeing you!</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.TOUR_BOOKING_CANCELLED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tour Booking Cancelled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Tour Booking Cancelled</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Your tour booking has been cancelled.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Cancelled Tour Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour:</strong> {tourName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour Date:</strong> {tourDate}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Cancelled Date:</strong> {cancelledDate}</p>
    </div>

    {cancellationReason}
    
    <p style="color: #171717;">If you have any questions about this cancellation or would like to book again, please contact us.</p>
    
    <p style="color: #171717;">We hope to serve you in the future.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.TOUR_BOOKING_REJECTED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tour Booking Not Available</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Tour Booking Not Available</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">We're sorry to inform you that your tour booking request could not be confirmed at this time.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Tour Booking Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour:</strong> {tourName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour Date:</strong> {tourDate}</p>
    </div>

    {rejectionReason}
    
    <p style="color: #171717;">We encourage you to browse our other available tours or try different dates. If you have any questions, please don't hesitate to contact us.</p>
    
    <p style="color: #171717;">Thank you for your understanding.</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
exports.TOUR_BOOKING_COMPLETED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You For Your Tour</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Thank You For Your Tour!</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {guestName},</p>
    <p style="color: #171717;">Thank you for joining us on the tour! We hope you had a wonderful experience.</p>
    
    <div style="background-color: #FFFFFF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; border-left: 4px solid #8B4513;">
      <h3 style="margin-top: 0; color: rgb(34, 17, 3); font-size: 18px;">Tour Details</h3>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour:</strong> {tourName}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Location:</strong> {location}</p>
      <p style="color: #171717; margin: 8px 0;"><strong style="color: rgb(34, 17, 3);">Tour Date:</strong> {tourDate}</p>
    </div>

    <p style="color: #171717;">We'd love to hear about your experience! Your feedback helps us improve and helps other guests make informed decisions.</p>
    <p style="color: #171717;">If you enjoyed your tour, we'd be delighted to have you join us again in the future.</p>
    
    <p style="color: #171717;">Thank you for choosing GTextSuite!</p>
    <p style="color: #171717;">Best regards,<br>GTextSuite Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
// ==================== EMAIL CHANGE REQUEST TEMPLATE ====================
exports.EMAIL_CHANGE_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your New Email Address</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">Verify Your New Email</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello,</p>
    <p style="color: #171717;">You've requested to change your GTextSuite account email address from <strong>{oldEmail}</strong> to <strong>{newEmail}</strong>.</p>
    <p style="color: #171717;">To complete this change, please verify your new email address using the code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B4513;">{verificationCode}</span>
    </div>
    <p style="color: #171717;">This code will expire in 24 hours for security reasons.</p>
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
      <p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">⚠️ Important:</strong></p>
      <ul style="color: #171717; margin: 8px 0 0 0; padding-left: 20px;">
        <li>If you did not request this change, please ignore this email</li>
        <li>Your email will only change after you verify this code</li>
        <li>Your old email ({oldEmail}) will receive a notification when the change is complete</li>
      </ul>
    </div>
    <p style="color: #171717;">If you didn't request this email change, you can safely ignore this email and your account will remain unchanged.</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; font-size: 0.9em;">Need help? Visit our <a href="" style="color: #8B4513; text-decoration: none;">Support Center</a>.</p>
    <p style="color: #6B7280; font-size: 0.85em; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
// ==================== OLD EMAIL APPROVAL TEMPLATE ====================
exports.EMAIL_CHANGE_OLD_APPROVAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Approve Email Change Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">⚠️ Email Change Request</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {firstName} {lastName},</p>
    <p style="color: #171717;">A request has been made to change your GTextSuite account email address.</p>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Current Email:</strong> {oldEmail}</p>
      <p style="color: #171717; margin: 8px 0 0 0;"><strong style="color: rgb(34, 17, 3);">New Email:</strong> {newEmail}</p>
    </div>

    <p style="color: #171717;">To approve this email change, please use the approval code below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B4513;">{approvalCode}</span>
    </div>

    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
      <p style="color: #171717; margin: 0;"><strong style="color: #DC2626;">⚠️ Security Notice:</strong></p>
      <p style="color: #171717; margin: 8px 0 0 0;">If you did NOT request this email change, please:</p>
      <ul style="color: #171717; margin: 8px 0 0 0; padding-left: 20px;">
        <li>DO NOT use the approval code</li>
        <li>Contact our support team immediately</li>
        <li>Change your password immediately</li>
      </ul>
    </div>

    <p style="color: #171717;">This approval code will expire in 24 hours. The email change will only complete after both the new email is verified AND you approve it from this email.</p>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Security Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated security notification. If you have concerns, please contact support immediately.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
// ==================== EMAIL CHANGE NOTIFICATION TEMPLATE ====================
exports.EMAIL_CHANGE_NOTIFICATION_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Address Changed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F3F4F6;">
  <div style="background: rgb(34, 17, 3); padding: 20px; text-align: center;">
    <h1 style="color: #EDEDED; margin: 0; font-size: 24px;">⚠️ Email Address Changed</h1>
  </div>
  <div style="background-color: #FFFFFF; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p style="color: #171717;">Hello {firstName} {lastName},</p>
    <p style="color: #171717;">We're writing to inform you that the email address associated with your GTextSuite account has been changed.</p>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="color: #171717; margin: 0;"><strong style="color: rgb(34, 17, 3);">Old Email:</strong> {oldEmail}</p>
      <p style="color: #171717; margin: 8px 0 0 0;"><strong style="color: rgb(34, 17, 3);">New Email:</strong> {newEmail}</p>
    </div>

    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
      <p style="color: #171717; margin: 0;"><strong style="color: #DC2626;">⚠️ Security Notice:</strong></p>
      <p style="color: #171717; margin: 8px 0 0 0;">If you did not make this change, please contact our support team immediately. Your account security may be compromised.</p>
    </div>

    <p style="color: #171717;">If you made this change, you can safely ignore this email. Please note that:</p>
    <ul style="color: #171717;">
      <li>Your account email has been updated to: <strong>{newEmail}</strong></li>
      <li>You will need to verify your new email address to continue using all features</li>
      <li>This email address ({oldEmail}) is no longer associated with your account</li>
      <li>If someone else registers with this email in the future, they will have a separate account</li>
    </ul>

    <p style="color: #171717;">For security reasons, if you did not authorize this change, please:</p>
    <ol style="color: #171717;">
      <li>Contact our support team immediately</li>
      <li>Change your password if you suspect unauthorized access</li>
      <li>Review your account activity</li>
    </ol>
    
    <p style="color: #171717;">Best regards,<br>GTextSuite Security Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
    <p style="color: #6B7280; margin: 5px 0;">This is an automated security notification. If you have concerns, please contact support immediately.</p>
    <p style="color: #6B7280; margin: 5px 0;">&copy; ${new Date().getFullYear()} GTextSuite. All rights reserved.</p>
  </div>
</body>
</html>
`;
