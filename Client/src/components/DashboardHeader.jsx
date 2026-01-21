// components/DashboardHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, LogOut, Settings, Moon, Sun, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import NotificationCard from "./NotificationCard";
import { toast } from "react-toastify";
import axios from "axios";

const DashboardHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, logOut } = useAuthStore();

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications function
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/notification/all-user-notification/${
          user.user_id
        }`
      );
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Check if mobile on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check initially
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const unreadCount = notifications?.filter((n) => n.unread).length;

  // Handle notification dropdown toggle
  const handleNotificationsToggle = () => {
    if (!showNotifications) {
      // Refresh notifications when opening dropdown
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, unread: false }))
      );

      // API call to mark all as read
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/notification/mark-all-read/${user.user_id}`
      );
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
      toast.error("Failed to mark notifications as read");
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      const response = await logOut();

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      console.log("Error sending request:", error.message);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        {/* Search Bar - Hidden on mobile */}
        

        {/* Right Section */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Search Button for Mobile */}
          {isMobile && (
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200">
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsToggle}
              disabled={notificationsLoading}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {notificationsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-2 h-2 rounded-full"></span>
                  )}
                </>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <NotificationCard
                isLoading={notificationsLoading}
                notifications={notifications}
                markAllAsRead={handleMarkAllAsRead}
              />
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <img
                src={user.avatar || "/hassy.jpg"}
                alt={user.full_name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-900 hidden sm:block">
                {user.full_name}
              </span>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">
                    {user.full_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                </div>
                <div className="p-1 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;