// pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  User,
  Edit3,
  MapPin,
  Calendar,
  Star,
  BookOpen,
  MessageCircle,
  Shield,
  Camera,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  X,
  Plus,
  Award,
  School,
  Menu,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/SideBar";
import { toast } from "react-toastify";
import axios from "axios";
import UploadPic from "../components/modal/UploadPic";
import { useBookStore } from "../store/bookStore";

const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
 const [bio, setBio] = useState();
  const { user, updateUserAccount } = useAuthStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { userBooks, fetchUserBooks } = useBookStore();
  const [profileData, setProfileData] = useState({
    ...user,
    bio: user.bio,
  });

  useEffect(()=>{
    fetchUserBooks(true, user.user_id)
  },[])
  const stats = [
    { icon: BookOpen, label: "Books Listed", value: userBooks?.length || 0, color: "blue" },
    {
      icon: CheckCircle,
      label: "Completed Trades",
      value: "1",
      color: "green",
    },

  ];

  const recentActivity = [
    {
      id: 1,
      type: "sale",
      title: 'Sold "Introduction to Algorithms"',
      description: "To Sarah Chen for $35",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 3,
      type: "message",
      title: "New book inquiry",
      description: "About Organic Chemistry textbook",
      time: "2 days ago",
      icon: MessageCircle,
      color: "text-blue-500",
    },
  ];


  const handleUploadModalOpen = () => {
    setShowUploadModal((prev) => !prev);
  };


  const handleSave = async () => {
    // In real app, this would save to backend
    console.log("Saving profile:", profileData);
    const payload = {
      user_id: user.user_id,
      bio: profileData.bio,
    };
    try {
      const response = await updateUserAccount(payload);
      toast.success(response.message);
    } catch (error) {
      console.log("error updating bio: ", error.message);
      toast.error(error.message);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(user);
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {showUploadModal && <UploadPic onClose={handleUploadModalOpen} />}
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto">
          {/* Cover Photo */}
          <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-500 to-green-500">
            <img
              src={profileData.coverImage || "coverPhoto.jpg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 bg-opacity-30"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
              <div className="relative">
                <img
                  src={profileData.avatar || "hassy.jpg"}
                  alt={profileData.full_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button
                  onClick={() => {
                    handleUploadModalOpen();
                  }}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-green-500 text-white p-1 sm:p-2 rounded-full hover:bg-green-600 transition duration-200"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 sm:pt-20 pl-0 sm:pl-40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                    {profileData.full_name}
                  </h1>

                  {/* Mobile University and Major - Stacked */}
                  <div className="sm:hidden mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-gray-600">
                      <School className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm break-words">
                        {profileData.university}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm break-words">
                        {profileData.major}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        Joined{" "}
                        {new Date(profileData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Desktop University and Major - Inline */}
                  <div className="hidden sm:flex items-center gap-4 mt-2 text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm md:text-base">
                        {profileData.major}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <School className="h-4 w-4" />
                      <span className="text-sm md:text-base">
                        {profileData.university}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm md:text-base">
                        Joined{" "}
                        {new Date(profileData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  {isEditing ? "Editing..." : "Edit Bio"}
                </button>
              </div>

              {/* Bio */}
              {isEditing ? (
                <div className="mt-4">
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }));
                    }}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-2 mt-2 flex-col sm:flex-row">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-gray-600 text-sm sm:text-base break-words">
                  {profileData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="sm:hidden border-b border-gray-200 px-4">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="overview">Overview</option>
                <option value="books">My Books</option>
                <option value="activity">Notifications</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden sm:block border-b border-gray-200 px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "books", label: "My Books" },
                { id: "activity", label: "Activity" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 md:p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {stat.label}
                          </p>
                        </div>
                        <div
                          className={`p-2 sm:p-3 rounded-full ${
                            stat.color === "blue"
                              ? "bg-blue-100"
                              : stat.color === "green"
                              ? "bg-green-100"
                              : stat.color === "yellow"
                              ? "bg-yellow-100"
                              : "bg-purple-100"
                          }`}
                        >
                          <stat.icon
                            className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                              stat.color === "blue"
                                ? "text-blue-600"
                                : stat.color === "green"
                                ? "text-green-600"
                                : stat.color === "yellow"
                                ? "text-yellow-600"
                                : "text-purple-600"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition duration-200"
                      >
                        <div
                          className={`p-2 rounded-full bg-gray-100 ${activity.color} flex-shrink-0`}
                        >
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "books" && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    My Book Listings
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {userBooks.length > 0 ? (
                      userBooks.map((book) => (
                        <div
                          key={book.book_id}
                          className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition duration-200"
                        >
                          <img
                            src={book.book_cover || `/default_book.jpg`}
                            alt={book.book_title}
                            className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {book.book_title}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {book.book_author}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-green-600 text-sm sm:text-base">
                              ${book.book_price}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                book.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {book.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>You have no books</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition duration-200"
                    >
                      <div
                        className={`p-2 rounded-full bg-gray-100 ${activity.color} flex-shrink-0`}
                      >
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
