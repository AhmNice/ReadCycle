import { Server } from "socket.io";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import dotenv from "dotenv";
dotenv.config();

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  console.log("✅ Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log(`📡 User connected: ${socket.id}`);

    // ✅ User joins a conversation room
    socket.on("join_conversation", (conversation_id) => {
      socket.join(conversation_id);
      // console.log(
      //   `👥 User ${socket.id} joined conversation ${conversation_id}`
      // );
    });

    // ✅ Handle sending messages
    socket.on("send_message", async (data) => {
      const { sender_id, receiver_id, conversation_id, body } = data;

      // Validate input
      if (!sender_id || !receiver_id || !body?.trim()) {
        console.warn("⚠️ Invalid message payload:", data);
        return;
      }

      try {
        // 1️⃣ Find or create conversation
        let conversation;

        if (conversation_id) {
          conversation = { conversation_id };
        } else {
          conversation = await Conversation.findPrivateConversation(
            sender_id,
            receiver_id
          );

          if (!conversation || !conversation.conversation_id) {
            conversation = await Conversation.createPrivateConversation(
              sender_id,
              receiver_id
            );
          }
        }

        // 2️⃣ Save message in DB
        const newMessage = new Message({
          sender_id,
          receiver_id,
          conversation_id: conversation.conversation_id,
          body,
          status: "sent",
        });

        const savedMessage = await newMessage.save();

        // 3️⃣ Update conversation's last message
        await Conversation.updateLastMessage(
          conversation.conversation_id,
          savedMessage.data.message_id
        );

        // 4️⃣ Emit message with consistent event name
        io.to(conversation.conversation_id).emit("message_received", {
          ...savedMessage.data,
          conversation_id: conversation.conversation_id,
        });

        console.log("📩 Message sent and emitted:", savedMessage.data.body);

        // 5️⃣ Optional: Send acknowledgment back to sender
        socket.emit("message_delivered", {
          tempId: data.tempId, // Include tempId if provided
          message_id: savedMessage.data.message_id,
          status: "delivered",
        });
      } catch (error) {
        console.error("❌ Socket send_message error:", error.message);

        // Emit error back to sender
        socket.emit("message_error", {
          tempId: data.tempId,
          error: "Failed to send message",
        });
      }
    });

    // ✅ Handle typing indicators
    socket.on("typing_start", (data) => {
      const { conversation_id, user_id } = data;

      // Broadcast to everyone in the conversation except the sender
      socket.to(conversation_id).emit("user_typing", {
        conversation_id,
        user_id,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (data) => {
      const { conversation_id, user_id } = data;

      socket.to(conversation_id).emit("user_stop_typing", {
        conversation_id,
        user_id,
        isTyping: false,
      });
    });

    // Listen for new messages (matches server event name)
    socket.on("message_received", (newMessage) => {
      console.log("📨 New message received:", newMessage);

      setMessages((prev) => {
        // Check if message already exists to avoid duplicates
        const messageExists = prev.some(
          (msg) =>
            msg.message_id === newMessage.message_id ||
            (msg.tempId && msg.tempId === newMessage.tempId)
        );

        if (messageExists) {
          // Replace optimistic message with real message from server
          return prev.map((msg) =>
            msg.message_id === newMessage.message_id ||
            (msg.tempId && msg.tempId === newMessage.tempId)
              ? { ...newMessage, status: "delivered" }
              : msg
          );
        } else {
          // Add new message (for messages from other users)
          return [...prev, { ...newMessage, status: "delivered" }];
        }
      });

      // Update conversation list when receiving new messages
      setConversationList((prev) =>
        prev.map((conv) => {
          if (conv.conversation_id === newMessage.conversation_id) {
            return {
              ...conv,
              last_message: {
                body: newMessage.body,
                created_at: newMessage.created_at,
                status: "delivered",
              },
              updated_at: new Date().toISOString(),
              unread_count:
                (conv.unread_count || 0) +
                (newMessage.sender_id !== user.user_id ? 1 : 0),
            };
          }
          return conv;
        })
      );
    });

    // ✅ When a user disconnects
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("❌ Socket.IO not initialized");
  return io;
};
