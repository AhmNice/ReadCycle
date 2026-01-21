import React from "react";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageCircle,
  ShoppingCart,
  Settings,
  Clock,
  ArrowRight,
  User,
  BookOpen,
  Bell,
  Loader2,
} from "lucide-react";

const NotificationCard = ({
  notifications = [],
  markAllAsRead,
  isLoading = false,
}) => {
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (isNaN(date.getTime())) return "Invalid date";

    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${
        Math.floor(diffDays / 7) > 1 ? "s" : ""
      } ago`;
    if (diffDays < 365)
      return `${Math.floor(diffDays / 30)} month${
        Math.floor(diffDays / 30) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diffDays / 365)} year${
      Math.floor(diffDays / 365) > 1 ? "s" : ""
    } ago`;
  };
  const getIcon = (type) => {
    const iconStyles = {
      info: "text-blue-600 bg-blue-100",
      success: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      error: "text-red-600 bg-red-100",
      message: "text-purple-600 bg-purple-100",
      sale: "text-emerald-600 bg-emerald-100",
      system: "text-gray-600 bg-gray-100",
      user: "text-indigo-600 bg-indigo-100",
      book: "text-orange-600 bg-orange-100",
    };

    const iconMap = {
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      error: <XCircle className="h-4 w-4" />,
      message: <MessageCircle className="h-4 w-4" />,
      sale: <ShoppingCart className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
      user: <User className="h-4 w-4" />,
      book: <BookOpen className="h-4 w-4" />,
    };

    return {
      icon: iconMap[type] || <Bell className="h-4 w-4" />,
      styles: iconStyles[type] || "text-gray-600 bg-gray-100",
    };
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 transform transition-all duration-200 ease-in-out">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {!isLoading && (
                <p className="text-xs text-gray-500">
                  {notifications.filter((n) => n.unread).length} unread
                </p>
              )}
            </div>
          </div>
          {!isLoading && notifications.filter((n) => n.unread).length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 hover:bg-green-50 rounded transition duration-150"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Loading notifications
              </p>
              <p className="text-xs text-gray-500 mt-1">Please wait...</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && (
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll notify you when something arrives
              </p>
            </div>
          ) : (
            notifications.slice(0,3).map((notification) => {
              const { icon, styles } = getIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`group p-4 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:bg-gray-50 ${
                    notification.unread
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`p-2 rounded-full flex-shrink-0 ${styles}`}>
                      {icon}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p
                          className={`text-sm font-medium ${
                            notification.unread
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2 leading-relaxed truncate">
                        {notification.body}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getDaysAgo(notification.created_at)}
                          </span>

                          {notification.priority === "high" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Important
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      {/* {!isLoading && notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium py-2 hover:bg-green-50 rounded-lg transition duration-150 flex items-center justify-center space-x-1">
            <span>View All Notifications</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )} */}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default NotificationCard;
