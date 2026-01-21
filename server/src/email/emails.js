import { transporter } from "../config/email.config.js";
import {
  forgotPasswordTemplate,
  otpEmailTemplate,
  resetPasswordSuccessTemplate,
  welcomeEmailTemplate,
} from "./templates.js";

// How to use with replace
export const sendOTPEmail = async (name, otp, email) => {
  const mailOption = {
    from: `ReadCycle <${process.env.MAIL_USER}>`,
    to: email,
    subject: "OTP Request",
    html: otpEmailTemplate
      .replace(/{{name}}/g, name || "there")
      .replace(/{{otp}}/g, otp)
      .replace(/{{year}}/g, new Date().getFullYear()),
  };

  try {
    const info = await transporter.sendMail(mailOption);
    console.log("✅ Email sent:", info.response);
    return { success: true, message: "OTP email sent successfully" };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
};

export const sendForgotPasswordEmail = async (name, resetLink, email) => {
  const mailOption = {
    from: `ReadCycle <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: forgotPasswordTemplate
      .replace(/{{name}}/g, name || "there")
      .replace(/{{resetLink}}/g, resetLink)
      .replace(/{{year}}/g, new Date().getFullYear()),
  };
  try {
    const info = await transporter.sendMail(mailOption);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Failed to send Forgot password email" };
  }
};
export const sendEmailResetSuccess = async (name, email, appUrl) => {
  const mailOption = {
    from: `ReadCycle <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Successful",
    html: resetPasswordSuccessTemplate
      .replace(/{{name}}/g, name || "there")
      .replace(/{{appUrl}}/g, appUrl)
      .replace(/{{year}}/g, new Date().getFullYear()),
  };

  try {
    const info = await transporter.sendMail(mailOption);
    console.log("✅ Password reset success email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending password reset success email:", error);
    return { success: false, message: "Failed to send password reset email" };
  }
};

export const sendWelcomeEmail = async (name, email, appUrl) => {
  const mailOption = {
    from: `ReadCycle <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Welcome to ReadCycle 🎉",
    html: welcomeEmailTemplate
      .replace(/{{name}}/g, name || "there")
      .replace(/{{appUrl}}/g, appUrl)
      .replace(/{{year}}/g, new Date().getFullYear()),
  };

  try {
    const info = await transporter.sendMail(mailOption);
    console.log("✅ Welcome email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return { success: false, message: "Failed to send welcome email" };
  }
};
