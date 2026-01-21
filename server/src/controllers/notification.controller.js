import { Notification } from "../models/Notification.js";

export const fetchNotification = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const notifications = await Notification.findByUser(user_id);

    if (!notifications || notifications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No notifications found",
        notifications: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const markNotificationAsRead = async (req, res) => {
  const { notification_id } = req.body;

  if (!notification_id) {
    return res.status(400).json({
      success: false,
      message: "Notification ID is required",
    });
  }

  try {
    const updated = await Notification.markAsRead(notification_id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    await Notification.markAllAsRead(user_id);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
