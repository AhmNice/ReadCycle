import { pool } from "../database/db_setup.js";

export class Conversation {
  constructor({ created_by, is_group = false, group_name = null }) {
    this.created_by = created_by;
    this.is_group = is_group;
    this.group_name = group_name;
  }

  // Create a new conversation
  async create() {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1️⃣ Insert the conversation
      const query = `
        INSERT INTO conversations (created_by, is_group, group_name)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const result = await client.query(query, [
        this.created_by,
        this.is_group,
        this.group_name,
      ]);

      const conversation = result.rows[0];

      // 2️⃣ Add the creator as a participant
      const participantQuery = `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `;
      await client.query(participantQuery, [
        conversation.conversation_id,
        this.created_by,
      ]);

      await client.query("COMMIT");

      return {
        success: true,
        conversation,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error creating conversation:", error.message);
      return { success: false, message: "Failed to create conversation" };
    } finally {
      client.release();
    }
  }

  // fetching your conversation
  static async fetchUserConversations(user_id) {
    try {
      // 1️⃣ Get all conversations the user belongs to
      const { rows: userConversations } = await pool.query(
        `SELECT c.conversation_id, c.is_group,  c.updated_at
       FROM conversations c
       JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
       WHERE cp.user_id = $1
       ORDER BY c.updated_at DESC`,
        [user_id]
      );

      // 2️⃣ Fetch each conversation details
      const conversations = await Promise.all(
        userConversations.map(async (conv) => {
          // Participants
          const { rows: participantRows } = await pool.query(
            `SELECT u.user_id, u.full_name, u.avatar, u.is_online
           FROM users u
           JOIN conversation_participants cp ON u.user_id = cp.user_id
           WHERE cp.conversation_id = $1`,
            [conv.conversation_id]
          );

          // Last message (no attachments)
          const { rows: lastMessageRows } = await pool.query(
            `SELECT m.message_id, m.sender_id, u.full_name AS sender_name, 
                  m.body, m.status, m.created_at
           FROM messages m
           JOIN users u ON m.sender_id = u.user_id
           WHERE m.conversation_id = $1
           ORDER BY m.created_at DESC
           LIMIT 1`,
            [conv.conversation_id]
          );

          const last_message = lastMessageRows[0] || null;

          // Unread count
          const { rows: unreadCountRows } = await pool.query(
            `SELECT COUNT(*) 
           FROM messages 
           WHERE conversation_id = $1 
           AND status = 'delivered' 
           AND sender_id != $2`,
            [conv.conversation_id, user_id]
          );

          const unread_count = parseInt(unreadCountRows[0].count, 10) || 0;

          return {
            conversation_id: conv.conversation_id,
            is_group: conv.is_group,
            title: conv.title || null,
            participants: participantRows,
            last_message,
            unread_count,
            updated_at: conv.updated_at,
          };
        })
      );

      // Final formatted output
      return {
        user_id,
        conversations,
        pagination: {
          has_more: false,
          next_cursor: null,
        },
      };
    } catch (error) {
      console.error("Error fetching user conversations:", error);
      throw error;
    }
  }

  // Find existing private conversation between two users
  static async findPrivateConversation(user1Id, user2Id) {
    try {
      const query = `
        SELECT c.*
        FROM conversations c
        JOIN conversation_participants cp1 ON c.conversation_id = cp1.conversation_id
        JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id
        WHERE c.is_group = FALSE
        AND cp1.user_id = $1
        AND cp2.user_id = $2
        LIMIT 1;
      `;
      const result = await pool.query(query, [user1Id, user2Id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("❌ Error finding private conversation:", error.message);
      return null;
    }
  }
  static async fetchFullPrivateConversation(conversationId, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1️⃣ Fetch the conversation
      const conversationQuery = `
      SELECT conversation_id, is_group, updated_at
      FROM conversations
      WHERE conversation_id = $1
      AND is_group = FALSE
      LIMIT 1;
    `;
      const { rows: convRows } = await client.query(conversationQuery, [
        conversationId,
      ]);
      if (!convRows.length) return null;

      const conversation = convRows[0];

      // 2️⃣ Get participants and their last read message
      const { rows: participants } = await client.query(
        `SELECT u.user_id, u.full_name, u.avatar, u.is_online
       FROM conversation_participants cp
       JOIN users u ON cp.user_id = u.user_id
       WHERE cp.conversation_id = $1`,
        [conversation.conversation_id]
      );

      // 3️⃣ Get messages (no attachments)
      const { rows: messages } = await client.query(
        `SELECT m.message_id, m.sender_id, u.full_name AS sender_name, m.body, m.status, m.created_at
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
        [conversation.conversation_id]
      );

      // 4️⃣ Count unread messages for current user
      const { rows: unreadRows } = await client.query(
        `SELECT COUNT(*) 
       FROM messages 
       WHERE conversation_id = $1 
       AND sender_id != $2 
       AND status IN ('delivered', 'sent')`,
        [conversation.conversation_id, userId]
      );

      const unread_count = parseInt(unreadRows[0].count, 10);

      // 5️⃣ Build structured response
      const response = {
        conversation_id: conversation.conversation_id,
        is_group: conversation.is_group,
        participants,
        messages,
        unread_count,
        updated_at: conversation.updated_at,
        pagination: {
          has_more: false,
          next_cursor: null,
        },
      };

      await client.query("COMMIT");
      return response;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        "❌ Error fetching full private conversation:",
        error.message
      );
      throw error;
    } finally {
      client.release();
    }
  }

  // Create a new private conversation between two users
  static async createPrivateConversation(user1Id, user2Id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1️⃣ Create the conversation
      const insertConversation = `
        INSERT INTO conversations (is_group, created_by)
        VALUES (FALSE, $1)
        RETURNING *;
      `;
      const conversationResult = await client.query(insertConversation, [
        user1Id,
      ]);
      const conversation = conversationResult.rows[0];

      // 2️⃣ Add both participants
      const insertParticipants = `
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3);
      `;
      await client.query(insertParticipants, [
        conversation.conversation_id,
        user1Id,
        user2Id,
      ]);

      await client.query("COMMIT");
      return conversation;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error creating private conversation:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }
  // Update conversation after a new message
  static async updateLastMessage(conversation_id, message_id) {
    try {
      await pool.query(
        `
        UPDATE conversations
        SET last_message_id = $1, updated_at = NOW()
        WHERE conversation_id = $2;
        `,
        [message_id, conversation_id]
      );
    } catch (error) {
      console.error("❌ Error updating last message:", error.message);
    }
  }
}
