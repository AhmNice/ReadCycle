import { pool } from "../database/db_setup.js";

export class Message {
  constructor({
    sender_id,
    receiver_id,
    conversation_id,
    body,
    status = "sent",
  }) {
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.conversation_id = conversation_id;
    this.body = body;
    this.status = status;
  }

  async save() {
    try {
      const query = `
        INSERT INTO messages (conversation_id, body, sender_id, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const values = [
        this.conversation_id,
        this.body,
        this.sender_id,
        this.status,
      ];
      const result = await pool.query(query, values);

      return {
        success: true,
        message: "Message added successfully ✅",
        data: result.rows[0],
      };
    } catch (error) {
      console.error("❌ Error saving message:", error.message);
      return { success: false, message: "Error saving message", error };
    }
  }

  static async getMessagesByConversation(conversation_id) {
    try {
      const query = `
        SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC;
      `;
      const result = await pool.query(query, [conversation_id]);
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching messages:", error.message);
      return [];
    }
  }

  static async updateLastMessageStatus(conversation_id, message_id, status) {
    try {
      await pool.query(
        `UPDATE messages SET status =$1 WHERE conversation_id =$2 AND message_id =$3`,
        [status, conversation_id, message_id]
      );
    } catch (error) {
      console.log("Error updating  message status: ", error.message);
    }
  }
}
