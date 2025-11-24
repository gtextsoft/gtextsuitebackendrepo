"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = void 0;
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
