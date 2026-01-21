// pages/Chat.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MoreVertical } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import ConversationCard from "../components/cards/ConversationCard";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { socket } from "../util/socket";
import { useRef } from "react";

const Chat = () => {
  const messageAreaRef = useRef(null);
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, []);
  // Auto-scroll to bottom when messages change

  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openedConversation, setOpenedConversation] = useState();
  const [activeConversation, setActiveConversation] = useState();
  const [fetchedConversation_With_Msg, setFetchedConversation_With_Msg] =
    useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuthStore();
  const [conversationsList, setConversationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchConversationList = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chats/conversationList/${
          user.user_id
        }`
      );
      const conversations = data.conversationsList?.conversations || [];
      setConversationList(conversations);
    } catch (error) {
      console.log("Error fetching conversations:", error.message);
      setConversationList([]);
    } finally {
      setLoading(false);
    }
  };

  // Update conversation list when new messages are received
  useEffect(() => {
    if (messages.length > 0) {
      updateConversationListWithNewMessage();
    }
  }, [messages]);

  const updateConversationListWithNewMessage = () => {
    if (!openedConversation || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    setConversationList((prev) =>
      prev.map((conv) => {
        if (conv.conversation_id === openedConversation.conversation_id) {
          return {
            ...conv,
            last_message: {
              body: lastMessage.body,
              created_at: lastMessage.created_at,
              status: lastMessage.status || "sent",
            },
            updated_at: new Date().toISOString(),
            unread_count: conv.unread_count || 0,
          };
        }
        return conv;
      })
    );
  };
  useEffect(() => {
    if (conversationId && conversationsList.length > 0) {
      const conversationFromRoute = conversationsList.find(
        (conv) => conv.conversation_id === conversationId
      );

      if (conversationFromRoute) {
        setOpenedConversation(conversationFromRoute);
        setActiveConversation(conversationId);
        fetchFullConversation(conversationId);
      } else {
        navigate("/chat", { replace: true });
      }
    }
  }, [conversationId, conversationsList, navigate]);

  const fetchFullConversation = async (conversationId) => {
    try {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_SERVER_URL
        }/chats/conversations/messages/private/${conversationId}`
      );
      setFetchedConversation_With_Msg(data.conversation);
      setMessages(data.conversation.messages || []);
    } catch (error) {
      console.log("Error fetching messages: ", error.message);
    }
  };

  useEffect(() => {
    console.log("Opened Conversation:", openedConversation);
    if (openedConversation) {
      const otherUser = openedConversation.participants?.find(
        (p) => p.user_id !== user.user_id
      );
      console.log("Other User:", otherUser);
      console.log("Avatar URL:", otherUser?.avatar);
    }
  }, [openedConversation]);

  // Typing handlers
  const handleTypingStart = () => {
    if (!openedConversation || !user) return;

    // Clear existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);

    socket.emit("typing_start", {
      conversation_id: openedConversation.conversation_id,
      user_id: user.user_id,
    });

    // Set timeout to automatically stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      handleTypingStop();
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleTypingStop = () => {
    if (!openedConversation || !user) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    socket.emit("typing_stop", {
      conversation_id: openedConversation.conversation_id,
      user_id: user.user_id,
    });
  };

  // Socket IO
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    // Join conversation room when a conversation is opened
    if (openedConversation?.conversation_id) {
      socket.emit("join_conversation", openedConversation.conversation_id);
    }

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
    });

    // Listen for message delivery confirmation
    socket.on("message_delivered", (data) => {
      console.log("✓ Message delivered:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === data.message_id || msg.tempId === data.tempId
            ? { ...msg, status: "delivered", message_id: data.message_id }
            : msg
        )
      );
    });

    // Listen for message errors
    socket.on("message_error", (data) => {
      console.error("❌ Message failed:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === data.tempId ? { ...msg, status: "failed" } : msg
        )
      );
    });

    // Listen for typing indicators
    socket.on("user_typing", (data) => {
      if (data.conversation_id === openedConversation?.conversation_id) {
        console.log("User is typing...", data);
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== data.user_id),
          data.user_id,
        ]);
      }
    });

    socket.on("user_stop_typing", (data) => {
      if (data.conversation_id === openedConversation?.conversation_id) {
        console.log("User stopped typing");
        setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
      }
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message_received");
      socket.off("message_delivered");
      socket.off("message_error");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [openedConversation, user?.user_id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !openedConversation || !user) return;

    const otherParticipant = openedConversation.participants?.find(
      (p) => p.user_id !== user.user_id
    );

    if (!otherParticipant) return;

    const tempMessageId = `temp-${Date.now()}`;
    const messageData = {
      sender_id: user.user_id,
      receiver_id: otherParticipant.user_id,
      conversation_id: openedConversation.conversation_id,
      body: newMessage.trim(),
      tempId: tempMessageId,
    };

    try {
      // Optimistic update
      const optimisticMessage = {
        ...messageData,
        message_id: tempMessageId,
        created_at: new Date().toISOString(),
        status: "sending",
        sender_name: user.full_name,
        avatar: user.avatar,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      handleTypingStop();

      // Update conversation list optimistically
      setConversationList((prev) =>
        prev.map((conv) => {
          if (conv.conversation_id === openedConversation.conversation_id) {
            return {
              ...conv,
              last_message: {
                body: newMessage.trim(),
                created_at: new Date().toISOString(),
                status: "sending",
              },
              updated_at: new Date().toISOString(),
            };
          }
          return conv;
        })
      );

      // Emit message
      socket.emit("send_message", messageData);

      // Refresh conversation list after a short delay to get updated data from server
      setTimeout(() => {
        fetchConversationList();
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === tempMessageId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTypingStop(); // Stop typing when sending
      handleSendMessage();
    }
  };

  useEffect(() => {
    fetchConversationList();
  }, [conversationId]);
  const messageRef = useRef(null);

  useEffect(() => {
    const chat = messageRef.current;
    if (!chat) return;

    const isNearBottom =
      chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100;

    if (isNearBottom) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [messages]);

  const chatPreviews = conversationsList
    ?.map((conv) => {
      const otherUser = conv.participants?.find(
        (p) => p.user_id !== user.user_id
      );

      return {
        conversation_id: conv.conversation_id,
        sender_name: conv.is_group ? conv?.title : otherUser?.full_name,
        body: conv.last_message?.body || "No messages yet",
        avatar: otherUser?.avatar || "/defaultAvatar.png",
        timestamp: new Date(
          conv.last_message?.created_at || conv.updated_at || Date.now()
        ),
        unread_count: conv.unread_count || 0,
        is_online: otherUser?.is_online || false,
        last_message_status: conv.last_message?.status || "sent",
        is_typing: conv.is_typing || false,
        _conversation: conv,
      };
    })
    // Sort by timestamp (most recent first)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleOpenConversation = (conversation_id) => {
    const selectedConv = conversationsList.find(
      (conv) => conv.conversation_id === conversation_id
    );
    if (selectedConv) {
      setOpenedConversation(selectedConv);
      setActiveConversation(conversation_id);
      navigate(`/chat/${conversation_id}`);
    }
  };

  // Effect to handle route changes when conversationId changes
  useEffect(() => {
    if (conversationId && conversationsList.length > 0) {
      const conversationFromRoute = conversationsList.find(
        (conv) => conv.conversation_id === conversationId
      );
      if (conversationFromRoute) {
        setOpenedConversation(conversationFromRoute);
        setActiveConversation(conversationId);
      } else {
        // If conversation doesn't exist, redirect to main chat
        navigate("/chat", { replace: true });
      }
    } else if (!conversationId) {
      // If no conversationId in route, clear the opened conversation
      setOpenedConversation(null);
      setActiveConversation(null);
    }
  }, [conversationId, conversationsList, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-xl text-gray-900">Messages</h2>
            </div>

            {loading ? (
              <div className="flex flex-1 justify-center items-center">
                <p>Loading conversations...</p>
              </div>
            ) : conversationsList && conversationsList.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                {chatPreviews?.map((chat, index) => (
                  <ConversationCard
                    conversation={chat}
                    key={index}
                    isActive={activeConversation === chat?.conversation_id}
                    onClick={() =>
                      handleOpenConversation(chat?.conversation_id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-1 justify-center items-center">
                <p>No conversations yet</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {openedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          openedConversation.is_group
                            ? openedConversation.participants?.[0]?.avatar ||
                              "/defaultAvatar.png"
                            : openedConversation.participants?.find(
                                (p) => p.user_id !== user.user_id
                              )?.avatar || "/defaultAvatar.png"
                        }
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                        onError={(e) => {
                          e.target.src = "/defaultAvatar.png";
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900">
                        {openedConversation.is_group
                          ? openedConversation.title
                          : openedConversation.participants?.find(
                              (p) => p.user_id !== user.user_id
                            )?.full_name}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        Online
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages Area */}
                <div
                  ref={messageAreaRef}
                  className="flex-1 overflow-y-auto p-4 bg-gray-50"
                >
                  <div className="space-y-3">
                    {messages?.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.message_id || msg.tempId}
                          className={`flex ${
                            msg.sender_id === user.user_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.sender_id === user.user_id
                                ? "bg-green-500 text-white"
                                : "bg-white text-gray-800 border border-gray-200"
                            } ${msg.status === "sending" ? "opacity-70" : ""} ${
                              msg.status === "failed"
                                ? "opacity-50 bg-red-100"
                                : ""
                            }`}
                          >
                            <p className="text-sm">{msg.body}</p>
                            {msg.status === "sending" && (
                              <p className="text-xs opacity-70 mt-1">
                                Sending...
                              </p>
                            )}
                            {msg.status === "failed" && (
                              <p className="text-xs opacity-70 mt-1">
                                Failed to send
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-gray-500">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    )}

                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-lg bg-white border border-gray-200">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-500 ml-2">
                              {typingUsers.length > 1
                                ? "Several people are typing..."
                                : "Typing..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Start typing indicator
                        handleTypingStart();
                      }}
                      onBlur={handleTypingStop}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      value={newMessage}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
