// pages/Chat.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, Search, MoreVertical } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import ConversationCard from "../components/cards/ConversationCard";
import { socket } from "../util/socket";

const Chat = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openedConversation, setOpenedConversation] = useState();
  const [activeConversation, setActiveConversation] = useState();

  const fetchFullConversation = async (user_id) => {};

  useEffect(() => {
    // listen for connection
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    // cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const currentUser = {
    id: "1",
    name: "John Student",
    avatar: "hassy.jpg",
  };
  const conversationsList = {
    user_id: "u101",
    conversations: [
      {
        conversation_id: "c1a2b3",
        is_group: false,
        participants: [
          {
            user_id: "1",
            name: "Hassana",
            avatar: "hassy.jpg",
          },
          {
            user_id: "u202",
            name: "Tunde Okoro",
            avatar: "hassy.jpg",
          },
        ],
        last_message: {
          message_id: 104,
          sender_id: "u202",
          sender_name: "Tunde Okoro",
          body: "Sure thing. I'll prepare the API endpoint tonight ☁️.",
          attachments: [
            {
              url: "https://cdn.example.com/files/task-plan.pdf",
              filename: "task-plan.pdf",
              type: "application/pdf",
            },
          ],
          status: "read",
          created_at: "2025-10-15T11:48:21Z",
        },
        unread_count: 0,
        updated_at: "2025-10-15T11:48:21Z",
      },
      {
        conversation_id: "c5x9z8",
        is_group: true,
        title: "SmartAgro Dev Team",
        participants: [
          {
            user_id: "1",
            name: "Aisha Bello",
            avatar: "hassy.jpg",
          },
          {
            user_id: "u303",
            name: "Ngozi Nkem",
            avatar: "https://cdn.example.com/avatars/u303.jpg",
          },
          {
            user_id: "u404",
            name: "Chidi Umeh",
            avatar: "https://cdn.example.com/avatars/u404.jpg",
          },
        ],
        last_message: {
          message_id: 58,
          sender_id: "u303",
          sender_name: "Ngozi Nkem",
          body: "Please review the new ML model for pest detection 🐛.",
          attachments: [],
          status: "delivered",
          created_at: "2025-10-15T10:10:42Z",
        },
        unread_count: 3,
        updated_at: "2025-10-15T10:10:42Z",
      },
      {
        conversation_id: "c7y5k2",
        is_group: false,
        participants: [
          {
            user_id: "1",
            name: "Aisha Bello",
            avatar: "hassy.jpg",
          },
          {
            user_id: "u505",
            name: "Dr. Musa Ahmed",
            avatar: "hassy.jsp",
          },
        ],
        last_message: {
          message_id: 12,
          sender_id: "u505",
          sender_name: "Dr. Musa Ahmed",
          body: "Remember to submit your yield report today 🌾.",
          attachments: [],
          status: "delivered",
          created_at: "2025-10-15T09:55:14Z",
        },
        unread_count: 1,
        updated_at: "2025-10-15T09:55:14Z",
      },
    ],
    pagination: {
      has_more: false,
      next_cursor: null,
    },
  };
  const chatPreviews = conversationsList.conversations.map((conv) => {
    const otherUser = conv.participants.find(
      (p) => p.user_id !== currentUser.id
    );

    return {
      conversation_id: conv.conversation_id,
      sender_name: conv.is_group ? conv?.title : otherUser.name,
      body: conv.last_message?.body || "No messages yet",
      avatar: otherUser?.avatar || "hassy.jpg",
      timestamp: new Date(conv.last_message?.created_at || Date.now()),
      unread_count: conv.unread_count || 0,
      is_online: otherUser?.is_online || false,
      last_message_status: conv.last_message?.status || "sent",
      is_typing: conv.is_typing || false,
    };
  });
  const handleOpenConversation = (conversation_id) => {
    const selectedConv = conversationsList.conversations.find(
      (conv) => conv.conversation_id === conversation_id
    );
    if (selectedConv) {
      setOpenedConversation(selectedConv);
      setActiveConversation(conversation_id);
    }
    console.log(conversation_id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden $`}>
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-xl text-gray-900">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chatPreviews.map((chat, index) => (
                <ConversationCard
                  conversation={chat}
                  key={index}
                  isActive={activeConversation === chat.conversation_id}
                  onClick={() => handleOpenConversation(chat.conversation_id)}
                />
              ))}
            </div>
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
                            ? openedConversation.participants[0]?.avatar
                            : openedConversation.participants.find(
                                (p) => p.user_id !== currentUser.id
                              )?.avatar
                        }
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900">
                        {openedConversation.is_group
                          ? openedConversation.title
                          : openedConversation.participants.find(
                              (p) => p.user_id !== currentUser.id
                            )?.name}
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
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-3">
                    {openedConversation?.messages?.map((msg) => (
                      <div
                        key={msg.message_id}
                        className={`flex ${
                          msg.sender_id === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_id === currentUser.id
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}

            {/* Message Input */}
            {openedConversation && (
              <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-200">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
