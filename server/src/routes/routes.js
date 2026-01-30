// userRoutes.js
import express from "express";
import { body, param } from "express-validator";
import { User } from "../models/User.js";
import {
  changePassword,
  deleteAccount,
  loginUser,
  logOut,
  registerUser,
  requestPasswordChange,
  resendOTP,
  sendAuthenticated_User,
  updateUser,
  uploadProfilePicture,
  verifyTokenAndChangePassword,
  verifyUser,
} from "../controllers/auth.controller.js";
import { verifySession } from "../util/createSession.js";
import {
  createBook,
  fetchBooks,
  updateBookStatus,
  userBooks,
} from "../controllers/book.controller.js";
import {
  fetchFullPrivateConversation,
  fetchUserConversations,
  startConversation,
} from "../controllers/conversation.controller.js";
import { uploadBook, uploadSingle } from "../middleWare/fileUploader.js";
import {
  fetchNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    body("university").notEmpty().withMessage("University is required"),
    body("major").notEmpty().withMessage("Major is required"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

router.post(
  "/update-user",
  [
    body("user_id").notEmpty().withMessage("User ID is required"),

    // Optional fields — only validated if present
    body("email").optional().isEmail().withMessage("Invalid email format"),

    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("current_password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("university")
      .optional()
      .isLength({ min: 2 })
      .withMessage("University name too short"),

    body("major")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Major name too short"),

    body("phone_number")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number format"),

    body("bio")
      .optional()
      .isLength({ max: 225 })
      .withMessage("Bio cannot exceed 225 characters"),
  ],
  verifySession,
  updateUser
);
router.post(
  "/verify-account",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .normalizeEmail()
      .withMessage("Invalid email"),
    body("otp").notEmpty().withMessage("OTP is required").trim(),
  ],
  verifyUser
);
router.post(
  "/resend-otp",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .normalizeEmail()
      .withMessage("Invalid email"),
  ],
  resendOTP
);

router.get("/check-auth", verifySession, sendAuthenticated_User);
router.post(
  "/change-password",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  verifySession,
  changePassword
);
router.post(
  "/delete-account",
  [body("user_id").notEmpty().withMessage("User id is required")],
  verifySession,
  deleteAccount
);
router.post(
  "/upload-profile-picture",
  verifySession,
  uploadSingle,
  [body("user_id").notEmpty().withMessage("User id is required")],
  uploadProfilePicture
);
router.post(
  "/request-password-change",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .normalizeEmail()
      .withMessage("Invalid email"),
  ],
  requestPasswordChange
);
router.post(
  "/change-password-with-token",
  [
    body("newPassword").notEmpty().withMessage("password is required"),
    body("token").notEmpty().withMessage("token is required").trim(),
  ],
  verifyTokenAndChangePassword
);
router.get("/logout", verifySession, logOut);
// book routes
export const book_router = express.Router();
book_router.post(
  "/create-book",
  verifySession,
  uploadBook,
  [
    body("book_title")
      .trim()
      .notEmpty()
      .withMessage("Book title is required")
      .isLength({ min: 2 })
      .withMessage("Book title must be at least 2 characters long"),

    body("book_author")
      .trim()
      .notEmpty()
      .withMessage("Book author is required"),

    body("book_owner").notEmpty().withMessage("Book owner ID is required"),

    body("book_price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Book price must be a positive number"),

    body("book_location")
      .trim()
      .notEmpty()
      .withMessage("Book location is required"),

    body("book_for")
      .trim()
      .notEmpty()
      .withMessage("Book listing type (e.g. sale or rent) is required")
      .isIn(["sale", "rent", "swap"])
      .withMessage("Book listing type must be 'sale' , 'swap' or 'rent'"),
  ],
  createBook
);
book_router.get("/fetch-books", verifySession, fetchBooks);
book_router.get(
  "/fetch-user-books/:id",
  [verifySession, param("id").notEmpty().withMessage("User ID is required")],
  userBooks
);

book_router.post(
  "/update-book",
  [
    body("book_id")
      .notEmpty()
      .withMessage("Book ID is required")
      .isInt()
      .withMessage("Book ID must be a number"),

    body("newStatus")
      .notEmpty()
      .withMessage("New status is required")
      .isIn(["active", "inactive", "deleted", "swapped", "rented"])
      .withMessage("Invalid status value"),
  ],
  updateBookStatus
);
export const chatsRouter = express.Router();
chatsRouter.post(
  "/start",
  [
    body("user1_id").notEmpty().withMessage("creator id is required"),
    body("user2_id").notEmpty().withMessage("user id is required"),
  ],
  startConversation
);

chatsRouter.get("/conversationList/:user_id", fetchUserConversations);
chatsRouter.get(
  "/conversations/messages/private/:conversation_id",
  fetchFullPrivateConversation
);
export default router;

// notification route

export const notification_route = express.Router();
notification_route.get(
  "/all-user-notification/:user_id",
  verifySession,
  fetchNotification
);
notification_route.post(
  "/mark-notification-read",
  verifySession,
  markNotificationAsRead
);
notification_route.post(
  "/mark-all-notification-read",
  verifySession,
  markAllNotificationsAsRead
);
