// pages/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MoreVertical, ChevronLeft, Search } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import ConversationCard from "../components/cards/ConversationCard";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { socket } from "../util/socket";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messageAreaRef = useRef(null);
  const { user } = useAuthStore();

  // State management
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openedConversation, setOpenedConversation] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [fetchedConversationWithMsg, setFetchedConversationWithMsg] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationsList, setConversationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch conversations
  const fetchConversationList = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chats/conversationList/${user.user_id}`
      );
      const conversations = data.conversationsList?.conversations || [];
      setConversationList(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error.message);
      setConversationList([]);
    } finally {
      setLoading(false);
    }
  }, [user.user_id]);

  // Fetch full conversation details
  const fetchFullConversation = useCallback(async (conversationId) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/chats/conversations/messages/private/${conversationId}`
      );
      setFetchedConversationWithMsg(data.conversation);
      setMessages(data.conversation.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  }, []);

  // Handle conversation routing - FIXED: Removed infinite loop
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
    } else if (!conversationId) {
      // Clear opened conversation when no conversationId in route
      setOpenedConversation(null);
      setActiveConversation(null);
    }
  }, [conversationId, conversationsList, navigate, fetchFullConversation]);
  const handleTypingStop = useCallback(() => {
    if (!openedConversation || !user) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    socket.emit("typing_stop", {
      conversation_id: openedConversation.conversation_id,
      user_id: user.user_id,
    });
  }, [openedConversation, user, typingTimeout]);

  const updateConversationListWithNewMessage = useCallback((message) => {
    if (!openedConversation || !message) return;

    // Only update if the message was sent by the current user
    if (message.sender_id === user.user_id) {
      setConversationList((prev) =>
        prev.map((conv) => {
          if (conv.conversation_id === openedConversation.conversation_id) {
            return {
              ...conv,
              last_message: {
                body: message.body,
                created_at: message.created_at,
                status: message.status || "sent",
              },
              updated_at: new Date().toISOString(),
            };
          }
          return conv;
        })
      );
    }
  }, [openedConversation, user.user_id]);

  // Typing handlers
  const handleTypingStart = useCallback(() => {
    if (!openedConversation || !user) return;

    if (typingTimeout) clearTimeout(typingTimeout);

    socket.emit("typing_start", {
      conversation_id: openedConversation.conversation_id,
      user_id: user.user_id,
    });

    const timeout = setTimeout(() => {
      handleTypingStop();
    }, 2000);

    setTypingTimeout(timeout);
  }, [openedConversation, user, typingTimeout, handleTypingStop]);



  // Socket event handlers
  useEffect(() => {
    const handleMessageReceived = (newMessage) => {
      console.log("📨 New message received:", newMessage);
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) =>
            msg.message_id === newMessage.message_id ||
            (msg.tempId && msg.tempId === newMessage.tempId)
        );

        if (messageExists) {
          return prev.map((msg) =>
            msg.message_id === newMessage.message_id ||
            (msg.tempId && msg.tempId === newMessage.tempId)
              ? { ...newMessage, status: "delivered" }
              : msg
          );
        } else {
          return [...prev, { ...newMessage, status: "delivered" }];
        }
      });

      // Update conversation list for received messages
      if (newMessage.sender_id !== user.user_id) {
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
                unread_count: (conv.unread_count || 0) + 1,
              };
            }
            return conv;
          })
        );
      }
    };

    const handleMessageDelivered = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === data.message_id || msg.tempId === data.tempId
            ? { ...msg, status: "delivered", message_id: data.message_id }
            : msg
        )
      );
    };

    const handleMessageError = (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.tempId === data.tempId ? { ...msg, status: "failed" } : msg
        )
      );
    };

    const handleUserTyping = (data) => {
      if (data.conversation_id === openedConversation?.conversation_id) {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== data.user_id),
          data.user_id,
        ]);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.conversation_id === openedConversation?.conversation_id) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
      }
    };

    // Socket event listeners
    socket.on("connect", () => console.log("✅ Connected to Socket.IO server:", socket.id));
    socket.on("disconnect", () => console.log("❌ Disconnected from server"));
    socket.on("message_received", handleMessageReceived);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_error", handleMessageError);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    // Join conversation room
    if (openedConversation?.conversation_id) {
      socket.emit("join_conversation", openedConversation.conversation_id);
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message_received", handleMessageReceived);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_error", handleMessageError);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [openedConversation, user?.user_id]);

  // Send message handler - FIXED: Call update function directly
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

      // Update conversation list optimistically - DIRECT CALL instead of useEffect
      updateConversationListWithNewMessage(optimisticMessage);

      // Emit message
      socket.emit("send_message", messageData);

      // Refresh conversation list after a delay
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
      handleTypingStop();
      handleSendMessage();
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConversationList();
  }, [fetchConversationList]);

  // Back to conversations list (mobile)
  const handleBackToConversations = () => {
    navigate("/chat");
  };

  // Filter conversations based on search
  const filteredConversations = conversationsList
    ?.map((conv) => {
      const otherUser = conv.participants?.find(
        (p) => p.user_id !== user.user_id
      );
      const displayName = conv.is_group ? conv?.title : otherUser?.full_name;

      return {
        conversation_id: conv.conversation_id,
        sender_name: displayName,
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
    .filter(conv =>
      conv.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.body.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleOpenConversation = (conversation_id) => {
    navigate(`/chat/${conversation_id}`);
  };

  // Get other user details for display
  const getOtherUser = (conversation) => {
    return conversation?.participants?.find((p) => p.user_id !== user.user_id);
  };

  const otherUser = getOtherUser(openedConversation);

  // FIXED: Simplified rendering logic - always show based on route
  const showConversationsList = !isMobile || !conversationId;
  const showChatArea = !isMobile || conversationId;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex flex-1 relative overflow-hidden">
          {/* Conversations Sidebar */}
          {showConversationsList && (
            <div className={`bg-white border-r border-gray-200 flex flex-col ${
              isMobile && conversationId ? "hidden" : isMobile ? "w-full h-full absolute inset-0 z-10" : "w-80"
            }`}>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-xl text-gray-900">Messages</h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex flex-1 justify-center items-center">
                  <div className="animate-pulse text-gray-500">Loading conversations...</div>
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((chat, index) => (
                    <ConversationCard
                      conversation={chat}
                      key={chat.conversation_id || index}
                      isActive={activeConversation === chat.conversation_id}
                      onClick={() => handleOpenConversation(chat.conversation_id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-center items-center text-gray-500 p-4">
                  <div className="text-center">
                    <p className="mb-2">No conversations found</p>
                    {searchQuery && (
                      <p className="text-sm">Try adjusting your search</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Area */}
          {showChatArea && (
            <div className={`flex-1 flex flex-col bg-white ${
              isMobile && !conversationId ? "hidden" : isMobile ? "w-full h-full absolute inset-0 z-20" : ""
            }`}>
              {openedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      {isMobile && (
                        <button
                          onClick={handleBackToConversations}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                      <div className="relative">
                        <img
                          src={
                            openedConversation.is_group
                              ? openedConversation.participants?.[0]?.avatar || "/defaultAvatar.png"
                              : otherUser?.avatar || "/defaultAvatar.png"
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                          onError={(e) => {
                            e.target.src = "/defaultAvatar.png";
                          }}
                        />
                        {otherUser?.is_online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900">
                          {openedConversation.is_group
                            ? openedConversation.title
                            : otherUser?.full_name}
                        </p>
                        <p className={`text-sm font-medium ${
                          otherUser?.is_online ? "text-green-600" : "text-gray-500"
                        }`}>
                          {otherUser?.is_online ? "Online" : "Offline"}
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
                    className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
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
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                msg.sender_id === user.user_id
                                  ? "bg-green-500 text-white rounded-br-none"
                                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                              } ${msg.status === "sending" ? "opacity-70" : ""} ${
                                msg.status === "failed" ? "opacity-50 bg-red-100 border-red-200" : ""
                              } shadow-sm`}
                            >
                              <p className="text-sm break-words">{msg.body}</p>
                              <div className="flex items-center justify-end mt-1 space-x-1">
                                {msg.status === "sending" && (
                                  <span className="text-xs opacity-70">Sending...</span>
                                )}
                                {msg.status === "failed" && (
                                  <span className="text-xs text-red-500">Failed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-center items-center h-32">
                          <p className="text-gray-500 text-center">
                            No messages yet.<br />
                            <span className="text-sm">Start the conversation!</span>
                          </p>
                        </div>
                      )}

                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                          <div className="max-w-xs px-4 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-none shadow-sm">
                            <div className="flex items-center space-x-2">
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
                              <p className="text-sm text-gray-500">
                                {typingUsers.length > 1 ? "Several people are typing..." : "Typing..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTypingStart();
                        }}
                        onBlur={handleTypingStop}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        value={newMessage}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Empty state when no conversation is selected (desktop)
                !isMobile && (
                  <div className="flex-1 flex items-center justify-center bg-white">
                    <div className="text-center text-gray-500 p-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Conversation Selected</h3>
                      <p>Choose a conversation from the list to start messaging</p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;