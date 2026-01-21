import React from "react";
import { CheckCheck, Clock, MoreVertical } from "lucide-react";

const ConversationCard = ({ conversation, isActive = false, onClick }) => {
  const {
    sender_name,
    body,
    avatar,
    timestamp,
    unread_count = 0,
    is_online = false,
    last_message_status = "sent", // sent, delivered, read
    is_typing = false,
  } = conversation;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffHours * 60);
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case "read":
  //       return <CheckCheck className="h-3 w-3 text-green-500" />;
  //     case "delivered":
  //       return <CheckCheck className="h-3 w-3 text-gray-400" />;
  //     case "sent":
  //       return <Clock className="h-3 w-3 text-gray-400" />;
  //     default:
  //       return null;
  //   }
  // };

  const truncateText = (text, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex gap-3 p-4 cursor-pointer transition-all duration-200 group
        ${
          isActive
            ? "bg-green-50 border-r-2 border-green-500"
            : "bg-white hover:bg-gray-50"
        }
        border-b border-gray-100 last:border-b-0
      `}
    >
      {/* Avatar with Online Status */}
      <div className="relative flex-shrink-0">
        <img
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          src={avatar || '/defaultAvatar.png'}
          alt={sender_name}
        />
        {is_online && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h3
            className={`
            font-semibold text-sm truncate
            ${isActive ? "text-green-700" : "text-gray-900"}
          `}
          >
            {sender_name}
          </h3>

          <div className="flex items-center space-x-2">
            {timestamp && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(timestamp)}
              </span>
            )}
            <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Preview */}
        <div className="flex items-center justify-between">
          <p
            className={`
            text-sm truncate
            ${unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-600"}
          `}
          >
            {is_typing ? (
              <span className="text-green-600 italic">typing...</span>
            ) : (
              truncateText(body)
            )}
          </p>

          {/* Status Indicators */}
          <div className="flex items-center space-x-2 ml-2">
            {/* Message Status */}
            {/* {getStatusIcon(last_message_status)} */}

            {/* Unread Count Badge */}
            {unread_count > 0 && (
              <span className="bg-green-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center">
                {unread_count > 9 ? "9+" : unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
