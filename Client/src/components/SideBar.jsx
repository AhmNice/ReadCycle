// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  ShoppingCart,
  DollarSign,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  User,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  currentUser = null,
  onNavigate,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", link: "/dashboard" },
    { id: "my-books", icon: BookOpen, label: "My Books", link: "/my-books" },
    {
      id: "buy-books",
      icon: ShoppingCart,
      label: "Buy Books",
      link: "/buy-books",
    },
    {
      id: "sell-books",
      icon: DollarSign,
      label: "Sell Books",
      link: "/sell-books",
    },
    {
      id: "messages",
      icon: MessageCircle,
      label: "Messages",
      link: "/chat",
    },
  ];

  const secondaryMenuItems = [
    { id: "settings", icon: Settings, label: "Settings", link: "/settings" },
  ];

  const handleItemClick = (itemId) => {
    onNavigate?.(itemId);
    if (itemId === "messages") {
      setUnreadMessages(0);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await logOut();
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    if (isCollapsed) {
      setShowUserMenu(false);
    }
  }, [isCollapsed]);

  const getActiveItem = (itemLink) => {
    if (itemLink === "/chat") {
      return location.pathname.startsWith("/chat");
    }
    return (
      location.pathname === itemLink ||
      (itemLink !== "/" && location.pathname.startsWith(itemLink))
    );
  };

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 flex flex-col relative ${
        isCollapsed ? "w-20" : "w-64"
      } h-screen`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="relative">
              <BookOpen className="h-7 w-7 text-green-600" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              ReadCycle
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="relative mx-auto">
            <BookOpen className="h-7 w-7 text-green-600" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-gray-500" />
          ) : (
            <ChevronLeft size={18} className="text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Menu */}
        <div className="mb-6">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Main Menu
            </p>
          )}
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = getActiveItem(item.link);
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.link}
                    onClick={() => handleItemClick(item.id)}
                    className={({ isActive }) =>
                      `w-full flex items-center p-3 rounded-xl transition duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-r-2 border-green-500"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <div className="relative">
                      <item.icon
                        className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""} ${
                          isActive
                            ? "text-green-600"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 font-medium text-sm">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Secondary Menu */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Preferences
            </p>
          )}
          <ul className="space-y-2  flex flex-col gap-2">
            {secondaryMenuItems.map((item) => {
              const isActive = getActiveItem(item.link);
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.link}
                    onClick={() => handleItemClick(item.id)}
                    className={({ isActive }) =>
                      `w-full flex items-center  py-3 rounded-xl transition duration-200 group ${
                        isActive
                          ? "bg-gray-50 text-gray-900"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon
                      className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""} ${
                        isActive
                          ? "text-gray-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium text-sm">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : ""
          } relative`}
        >
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full rounded-lg p-2 hover:bg-white transition duration-200 ${
              showUserMenu ? "bg-white shadow-sm" : ""
            }`}
          >
            <img
              src={user.avatar || "hassy.jpg"}
              alt={user.full_name}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
            />
            {!isCollapsed && (
              <div className="ml-3 text-left flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.major}</p>
              </div>
            )}
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && !isCollapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500">{user.university}</p>
              </div>
              <NavLink
                to="/profile"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="h-4 w-4 mr-3 text-gray-400" />
                View Profile
              </NavLink>
              <NavLink
                to="/settings"
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400" />
                Account Settings
              </NavLink>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button - Only show when collapsed */}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 mt-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;
