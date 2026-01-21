import { pool } from "../database/db_setup.js";

export class Notification {
  constructor({ user_id, type, title, priority, action_performed, body }) {
    this.user_id = user_id;
    this.type = type;
    this.title = title;
    this.priority = priority;
    this.action_performed = action_performed;
    this.body = body;
  }

  // ✅ Save notification to DB
  async save() {
    try {
      const query = `
        INSERT INTO notifications 
          (user_id, type, title, priority, action_performed, body, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
        RETURNING *;
      `;

      const values = [
        this.user_id,
        this.type,
        this.title,
        this.priority,
        this.action_performed,
        this.body,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error saving notification:", error.message);
      throw error;
    }
  }

  // ✅ Mark a single notification as read
  static async markAsRead(notification_id) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE notification_id = $1 
        RETURNING *;
      `;
      const result = await pool.query(query, [notification_id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
      throw error;
    }
  }

  // ✅ Mark all notifications as read for a user
  static async markAllAsRead(user_id) {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE user_id = $1 
        RETURNING *;
      `;
      const result = await pool.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      console.error("Error marking all notifications as read:", error.message);
      throw error;
    }
  }

  // ✅ Get all notifications for a user
  static async findByUser(user_id) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC;
      `;
      const result = await pool.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      throw error;
    }
  }
}
