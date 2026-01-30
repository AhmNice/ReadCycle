// pages/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  User,
  Edit3,
  Camera,
  GraduationCap,
  School,
  Calendar,
  BookOpen,
  CheckCircle,
  DollarSign,
  MapPin,
  RefreshCw,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../components/SideBar";
import { toast } from "react-toastify";
import UploadPic from "../components/modal/UploadPic";
import { useBookStore } from "../store/bookStore";
import Book from "../components/cards/Book";


const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [bio, setBio] = useState("");
  const { user, updateUserAccount } = useAuthStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { userBooks, fetchUserBooks } = useBookStore();
  const [profileData, setProfileData] = useState({
    ...user,
    bio: user.bio || "",
  });

  useEffect(() => {
    fetchUserBooks(true, user.user_id);
  }, []);

  // Calculate stats from userBooks
  const calculateStats = () => {
    const totalBooks = userBooks?.length || 0;
    const activeBooks = userBooks?.filter(book => book.book_status === "active").length || 0;
    const soldBooks = userBooks?.filter(book => book.book_status === "sold").length || 0;
    const swappedBooks = userBooks?.filter(book => book.book_status === "swap").length || 0;
    const rentedBooks = userBooks?.filter(book => book.book_status === "rented").length || 0;

    // Calculate total earnings from sold books
    const totalEarnings = userBooks
      ?.filter(book => book.book_status === "sold" && book.book_price)
      .reduce((sum, book) => sum + parseFloat(book.book_price || 0), 0) || 0;

    return {
      totalBooks,
      activeBooks,
      soldBooks,
      swappedBooks,
      rentedBooks,
      totalEarnings
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      icon: BookOpen,
      label: "Total Books",
      value: stats.totalBooks,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: CheckCircle,
      label: "Active Listings",
      value: stats.activeBooks,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: DollarSign,
      label: "Sold",
      value: stats.soldBooks,
      color: "gray",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600"
    },
    {
      icon: RefreshCw,
      label: "Swapped",
      value: stats.swappedBooks,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: Calendar,
      label: "Rented",
      value: stats.rentedBooks,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: DollarSign,
      label: "Total Earnings",
      value: `₦${stats.totalEarnings.toLocaleString()}`,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    }
  ];

  const handleUploadModalOpen = () => {
    setShowUploadModal((prev) => !prev);
  };

  const handleSave = async () => {
    const payload = {
      user_id: user.user_id,
      bio: profileData.bio,
    };
    try {
      const response = await updateUserAccount(payload);
      toast.success(response.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error.message);
      toast.error(error.message || "Failed to update profile");
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(user);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "books", label: "My Books" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showUploadModal && <UploadPic onClose={handleUploadModalOpen} />}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex h-screen flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto">
          {/* Cover Photo */}
          <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-green-500 to-green-600">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Header */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 sm:-top-16 md:-top-20 left-4 sm:left-6 lg:left-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={profileData.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-green-400', 'to-blue-500');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                      <User className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUploadModalOpen}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-green-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-green-700 transition duration-200 shadow-md border border-white"
                  title="Change profile picture"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 sm:pt-20 md:pt-24 pl-0 sm:pl-36 md:pl-40">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {profileData.full_name}
                    </h1>
                    {profileData.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1 sm:mt-0">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Mobile: Stacked Info */}
                  <div className="sm:hidden mt-3 space-y-2">
                    {profileData.university && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <School className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{profileData.university}</span>
                      </div>
                    )}
                    {profileData.major && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{profileData.major}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">Joined {formatDate(profileData.created_at)}</span>
                    </div>
                  </div>

                  {/* Desktop: Inline Info */}
                  <div className="hidden sm:flex items-center gap-4 mt-2 text-gray-600 flex-wrap">
                    {profileData.major && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm">{profileData.major}</span>
                      </div>
                    )}
                    {profileData.university && (
                      <div className="flex items-center gap-1.5">
                        <School className="h-4 w-4" />
                        <span className="text-sm">{profileData.university}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {formatDate(profileData.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition duration-200 text-sm font-medium w-full sm:w-auto"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? "Cancel Editing" : "Edit Bio"}
                </button>
              </div>

              {/* Bio Section */}
              <div className="mt-4 sm:mt-6">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData(prev => ({ ...prev, bio: e.target.value }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                      placeholder="Tell us about yourself, your academic interests, or what kind of books you're looking for..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {profileData.bio || "No bio added yet. Tell us about yourself!"}
                    </p>
                    {!profileData.bio && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Add a bio
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-4 sm:px-6 lg:px-8">
              <nav className="flex space-x-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Your Stats
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {stat.value}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {stat.label}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full ${stat.bgColor}`}>
                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Books Preview */}
                {stats.activeBooks > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Active Listings ({stats.activeBooks})
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        {userBooks
                          .filter(book => book.book_status === "active")
                          .slice(0, 3)
                          .map((book) => (
                            <div
                              key={book.book_id}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                            >
                              <img
                                src={book.book_cover}
                                alt={book.book_title}
                                className="w-12 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = "/default_book.jpg";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {book.book_title}
                                </h4>
                                <p className="text-xs text-gray-600 truncate">
                                  {book.book_author}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                    {book.book_status}
                                  </span>
                                  {book.book_price && (
                                    <span className="text-sm font-medium text-green-600">
                                      ₦{parseFloat(book.book_price).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        {stats.activeBooks > 3 && (
                          <button
                            onClick={() => setActiveTab("books")}
                            className="w-full text-center text-green-600 hover:text-green-700 text-sm font-medium py-2 border border-green-200 rounded-lg hover:bg-green-50 transition duration-200"
                          >
                            View all {stats.activeBooks} active listings
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "books" && (
              <div className="space-y-6">
                {/* Books Filter Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {}}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium"
                    >
                      All Books ({stats.totalBooks})
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg font-medium hover:bg-green-100"
                    >
                      Active ({stats.activeBooks})
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-100"
                    >
                      Sold ({stats.soldBooks})
                    </button>
                    <button
                      onClick={() => {}}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg font-medium hover:bg-purple-100"
                    >
                      Swapped ({stats.swappedBooks})
                    </button>
                  </div>
                </div>

                {/* Books List */}
                <div className="space-y-4">
                  {userBooks.length > 0 ? (
                    userBooks.map((book) => (
                      <div key={book.book_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <Book
                          book={book}
                          isExpanded={false}
                          onBookClick={() => {/* Handle book click */}}
                          onUpdateStatus={() => {/* Handle status update */}}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No books listed yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start by listing your first book for sale, swap, or rent.
                      </p>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
                        Add Your First Book
                      </button>
                    </div>
                  )}
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