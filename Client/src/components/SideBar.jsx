// components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";

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
  User,
  Book,
  ChevronDown,
  Recycle,
  Calendar,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";
import defaultAvatar from "/defaultAvatar.png";

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  currentUser = null,
  onNavigate,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const userMenuRef = useRef(null);
  const { user, logOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close user menu when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setShowUserMenu(false);
    }
  }, [isCollapsed]);

  // Menu items structure
  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", link: "/dashboard" },
    {
      id: "my-books",
      icon: BookOpen,
      label: "Books",
      link: "/my-books",
      children: [
        { id: "my-listings", label: "My Listings", icon: Book, link: "/my-books" },
        { id: "all-books", label: "All Books", icon: ShoppingCart, link: "/buy-books" },
      ],
    },
    {
      id: "sell-books",
      icon: DollarSign,
      label: "Upload Book For Sell",
      link: "/sell-books",
    },
    {
      id: "rent-books",
      icon: Calendar,
      label: "Upload Book For Rent",
      link: "/rent-books",
    },
    {
      id: "swap-books",
      icon: Recycle,
      label: "Upload Book For Swap",
      link: "/swap-books",
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
      if (!response?.success) {
        toast.error(response?.message || "Logout failed");
        return;
      }
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
      console.error("Logout error:", error);
    }
  };

  const toggleSubMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const getActiveItem = (itemLink) => {
    if (itemLink === "/chat") {
      return location.pathname.startsWith("/chat");
    }
    return location.pathname === itemLink ||
           (itemLink !== "/" && location.pathname.startsWith(itemLink));
  };

  const isSubMenuActive = (children) => {
    return children?.some(child => location.pathname === child.link);
  };

  // Render menu item with optional children
  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = getActiveItem(item.link);
    const isExpanded = expandedMenus[item.id];
    const showSubMenu = hasChildren && !isCollapsed && isExpanded;

    return (
      <li key={item.id}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleSubMenu(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition duration-200 group ${
                isActive || isSubMenuActive(item.children)
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`h-5 w-5 ${isCollapsed ? "mx-auto" : ""} ${
                    isActive || isSubMenuActive(item.children)
                      ? "text-green-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
              </div>
              {!isCollapsed && (
                <>
                  <span className="ml-3 flex-1 text-left font-medium text-sm">
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {/* Submenu */}
            {showSubMenu && (
              <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-100">
                {item.children.map((child) => {
                  const isChildActive = location.pathname === child.link;
                  return (
                    <li key={child.id}>
                      <NavLink
                        to={child.link}
                        onClick={() => handleItemClick(child.id)}
                        className={({ isActive }) =>
                          `w-full flex items-center p-2 pl-4 rounded-lg transition duration-200 group ${
                            isActive || isChildActive
                              ? "text-green-600 bg-green-50"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`
                        }
                      >
                        <child.icon className="h-4 w-4 mr-3" />
                        <span className="font-medium text-sm">{child.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <NavLink
            to={item.link}
            onClick={() => handleItemClick(item.id)}
            className={({ isActive }) =>
              `w-full flex items-center p-3 rounded-xl transition duration-200 group relative ${
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
                <span className="ml-3 flex-1 font-medium text-sm">
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {isCollapsed && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        )}
      </li>
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
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="relative">
              <BookOpen className="h-7 w-7 text-green-600" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              ReadCycle
            </span>
          </div>
        ) : (
          <div className="relative mx-auto">
            <BookOpen className="h-7 w-7 text-green-600" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-gray-500" />
          ) : (
            <ChevronLeft size={18} className="text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Main Menu */}
        <div className="mb-6">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Main Menu
            </p>
          )}
          <ul className="space-y-2">
            {menuItems.map(renderMenuItem)}
          </ul>
        </div>

        {/* Secondary Menu */}
        <div>
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Preferences
            </p>
          )}
          <ul className="space-y-2">
            {secondaryMenuItems.map((item) => {
              const isActive = getActiveItem(item.link);
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.link}
                    onClick={() => handleItemClick(item.id)}
                    className={({ isActive }) =>
                      `w-full flex items-center p-3 rounded-xl transition duration-200 group ${
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
      <div className="border-t border-gray-100 p-4 bg-gray-50" ref={userMenuRef}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full rounded-lg p-2 hover:bg-white transition duration-200 ${
              showUserMenu ? "bg-white shadow-sm" : ""
            }`}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <img
              src={user?.avatar || defaultAvatar}
              alt={user?.full_name || "User avatar"}
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            {!isCollapsed && user && (
              <div className="ml-3 text-left flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.major || "Student"}
                </p>
              </div>
            )}
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && !isCollapsed && user && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.university || "University"}
                </p>
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

        {/* Quick Logout Button - Only show when collapsed */}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 mt-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};



export default Sidebar;