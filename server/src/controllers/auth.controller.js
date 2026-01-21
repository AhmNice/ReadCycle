import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import { User } from "../models/User.js";
import { createSession } from "../util/createSession.js";
import bcrypt from "bcryptjs";
import handleInputValidation from "../util/handleInputValidation.js";
import {
  generateAndHashResetToken,
  generateOTP,
} from "../util/grenerateToken.js";
import { pool } from "../database/db_setup.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.config.js";
import {
  sendEmailResetSuccess,
  sendForgotPasswordEmail,
  sendOTPEmail,
  sendWelcomeEmail,
} from "../email/emails.js";
import crypto from "crypto";
import { Notification } from "../models/Notification.js";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });

  const { full_name, email, password, university, major } = req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const verification_token = generateOTP();
    await sendOTPEmail(full_name, verification_token, email);

    const now = new Date();
    const verification_token_expires_at = new Date(
      now.getTime() + 5 * 60 * 1000
    );

    const newUser = new User({
      full_name,
      email,
      password,
      university,
      major,
      verification_token,
      verification_token_expires_at,
    });
    const savedUser = await newUser.save();

    // 🔔 Add notification
    const notification = new Notification({
      user_id: savedUser.user_id,
      type: "AUTH",
      title: "Welcome to ReadCycle",
      priority: "low",
      action_performed: "User registration",
      body: "You have successfully registered an account. Verify your email to continue.",
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully, OTP sent to your email",
      user: savedUser,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const validPassword = await bcryptjs.compare(password, user.password_hash);
    if (!validPassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    delete user.password_hash;
    const onlineUser = await User.markUserOnline(user.email);

    // 🔔 Add login notification
    const notification = new Notification({
      user_id: user.user_id,
      type: "LOGIN",
      title: "Login Successful",
      priority: "low",
      action_performed: "User login",
      body: `You logged into your account on ${new Date().toLocaleString()}`,
    });
    await notification.save();

    createSession(res, { id: user.user_id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: onlineUser,
    });
  } catch (error) {
    console.error("❌ Error logging in:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const updateUser = async (req, res) => {
  if (!handleInputValidation(req, res)) return;
  try {
    const {
      user_id,
      email,
      password,
      university,
      major,
      phone_number,
      bio,
      current_password,
    } = req.body;

    const existingUser = await User.findById(user_id);
    if (!existingUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let passwordValid;
    if (current_password && password) {
      passwordValid = await bcrypt.compare(
        current_password,
        existingUser.password_hash
      );
    }

    let hashedPassword = null;
    if (password && passwordValid) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const updatedUser = await User.updateUserById({
      user_id,
      email,
      password: hashedPassword,
      university,
      major,
      phone_number,
      bio,
    });

    // 🔔 Add notification
    const notification = new Notification({
      user_id,
      type: "ACCOUNT",
      title: "Profile Updated",
      priority: "low",
      action_performed: "User updated profile",
      body: "Your profile information has been successfully updated.",
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "User account updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
export const sendAuthenticated_User = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "No authenticated user found",
    });
  }

  const { email } = req.user;

  try {
    const user = await User.findByEmail(email);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "User session is valid/authenticated",
      user,
    });
  } catch (error) {
    console.error("❌ Error authenticating user:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const verifyUser = async (req, res) => {
  if (!handleInputValidation(req, res)) return;

  const { email, otp } = req.body;

  try {
    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1 AND verification_token = $2`,
      [email, String(otp)]
    );

    if (user.rows.length === 0)
      return res.status(400).json({
        success: false,
        message: "Invalid email address or OTP",
      });

    const userData = user.rows[0];
    if (Date.now() > new Date(userData.verification_token_expires_at))
      return res.status(400).json({ success: false, message: "OTP expired" });

    const updatedUser = await User.verifyUser({ email, otp });
    const onlineUser = await User.markUserOnline(updatedUser.email);
    createSession(res, { id: updatedUser.user_id, email: updatedUser.email });

    // 🔔 Add notification
    const notification = new Notification({
      user_id: updatedUser.user_id,
      type: "AUTH",
      title: "Account Verified",
      priority: "medium",
      action_performed: "User verified account",
      body: "Your account has been successfully verified.",
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: onlineUser,
    });
  } catch (error) {
    console.log("Error verifying user:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!handleInputValidation(req, res)) return;

  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = generateOTP();
    const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

    // Update user record
    await pool.query(
      `UPDATE users SET verification_token = $1, verification_token_expires_at = $2 WHERE email = $3`,
      [otp, otp_expires_at, email]
    );
    await sendOTPEmail(user.full_name, otp, email);
    // Send OTP via email
    // await sendEmail({
    //   to: email,
    //   subject: "Your OTP Code",
    //   text: `Your new verification code is ${otp}. It expires in 5 minutes.`,
    // });

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Error resending OTP:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requestPasswordChange = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const token = generateAndHashResetToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token.token}`;

    await sendForgotPasswordEmail(user.full_name, resetLink, user.email);

    await pool.query(
      `UPDATE users
       SET forget_password_token = $1, forget_password_token_expires_at = $2
       WHERE user_id = $3`,
      [token.hashedToken, expiresAt, user.user_id]
    );

    res.status(200).json({
      success: true,
      message: "Reset link has been sent to your email",
    });
  } catch (error) {
    console.log("Error sending reset link:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const verifyTokenAndChangePassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const result = await pool.query(
      `SELECT * FROM users WHERE forget_password_token = $1`,
      [hashedToken]
    );

    const user = result.rows[0];
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const tokenExpiry = new Date(user.forget_password_token_expires_at);
    if (tokenExpiry < new Date())
      return res
        .status(400)
        .json({ success: false, message: "Token has expired" });

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await pool.query(
      `UPDATE users
       SET password_hash = $1, forget_password_token = NULL, forget_password_token_expires_at = NULL
       WHERE user_id = $2`,
      [hashedPassword, user.user_id]
    );

    const appURL = `${process.env.CLIENT_URL}/dashboard`;
    await sendEmailResetSuccess(user.full_name, user.email, appURL);

    // 🔔 Add notification
    const notification = new Notification({
      user_id: user.user_id,
      type: "SECURITY",
      title: "Password Changed Successfully",
      priority: "high",
      action_performed: "Password reset via token",
      body: "Your password was changed successfully. If you didn’t perform this action, reset your password immediately.",
    });
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Password has been successfully changed",
    });
  } catch (error) {
    console.log("Error verifying token:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, email, newPassword } = req.body;

  try {
    // ✅ 1. Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user with this email address",
      });
    }

    // ✅ 2. Validate current password
    const passwordIsValid = await bcryptjs.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid current password",
      });
    }

    // ✅ 3. Hash and update new password
    const newPassword_hash = await bcryptjs.hash(newPassword, 10);

    const updatedUser = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING *`,
      [newPassword_hash, email]
    );
    const { password_hash, ...rest } = updatedUser.rows[0];
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user: rest,
    });
  } catch (error) {
    console.log("Error changing password:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const logOut = async (req, res) => {
  try {
    const sessionName = "readCycle_userSession";

   
    if (req.user?.email) {
      await User.markUserOffline(req.user.email); // you can define this similar to markUserOnline
    }

    res.clearCookie(sessionName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("Error trying to log out user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteAccount = async (req, res) => {
  const { user_id } = req.body;

  try {
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await pool.query(`DELETE FROM books WHERE book_owner = $1`, [user_id]);
    await pool.query(`DELETE FROM messages WHERE sender_id = $1`, [user_id]);
    await pool.query(`DELETE FROM conversations WHERE created_by = $1`, [
      user_id,
    ]);
    // delete account
    await pool.query(`DELETE FROM users WHERE user_id = $1`, [user_id]);
    const sessionName = "readCycle_userSession";

    res.clearCookie(sessionName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting account:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const uploadProfilePicture = async (req, res) => {
  const { user_id } = req.body;
  console.log(req);

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // ✅ Find user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "HASSY/readcycle/profile_pic",
      public_id: `${user.full_name}_profile_picture-${Date.now()}`,
    });

    const updatedUser = await pool.query(
      `UPDATE users SET avatar = $1 WHERE user_id = $2 RETURNING *`,
      [result.secure_url, user_id]
    );
    const { password_hash, ...rest } = updatedUser.rows[0];
    // ✅ Remove local file
    fs.unlinkSync(req.file.path);

    // ✅ Send response
    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      user: rest,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};
