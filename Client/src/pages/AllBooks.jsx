// pages/AllBooks.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  BookOpen,
  MapPin,
  DollarSign,
  Star,
  Eye,
  MessageCircle,
  Calendar,
  RefreshCw,
  X,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import Book2 from "../components/cards/Book2";
import { useBookStore } from "../store/bookStore";
import { useAuthStore } from "../store/authStore";

const AllBooks = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    category: "",
    condition: "",
    priceRange: "",
    location: "",
    listingType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Mock books data
  const { books, fetchBooks } = useBookStore();
  useEffect(() => {
    fetchBooks(true);
  }, []);

  // Filter options
  const filterOptions = {
    category: [
      "Computer Science",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Economics",
      "Psychology",
      "Business",
    ],
    condition: ["Like New", "Good", "Fair", "Poor"],
    priceRange: ["Under $10", "$10 - $25", "$25 - $50", "Over $50"],
    location: [
      "Main Library",
      "Science Building",
      "Business School",
      "Math Department",
      "Social Sciences",
      "Physics Building",
    ],
    listingType: ["For Sale", "For Rent", "For Swap"],
  };

  const books_for_sale = () => {
    return books.filter((book) => book.seller?.user_id !== user.user_id);
  };

  // Filtered books
  const filteredBooks = books_for_sale().filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      book.course?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      book.tags?.some((tag) =>
        tag?.toLowerCase().includes(searchQuery?.toLowerCase())
      );

    const matchesCategory =
      !selectedFilters.category ||
      book.tags?.some((tag) =>
        tag?.toLowerCase().includes(selectedFilters.category?.toLowerCase())
      );

    const matchesCondition =
      !selectedFilters.condition ||
      book.condition === selectedFilters.condition;
    const matchesLocation =
      !selectedFilters.location || book.location === selectedFilters.location;

    const matchesListingType =
      !selectedFilters.listingType ||
      (selectedFilters.listingType === "For Sale" &&
        book.listingType === "sale") ||
      (selectedFilters.listingType === "For Rent" &&
        book.listingType === "rent") ||
      (selectedFilters.listingType === "For Swap" &&
        book.listingType === "swap");

    // Price range filtering
    let matchesPrice = true;
    if (selectedFilters.priceRange) {
      switch (selectedFilters.priceRange) {
        case "Under $10":
          matchesPrice = book.price < 10;
          break;
        case "$10 - $25":
          matchesPrice = book.price >= 10 && book.price <= 25;
          break;
        case "$25 - $50":
          matchesPrice = book.price >= 25 && book.price <= 50;
          break;
        case "Over $50":
          matchesPrice = book.price > 50;
          break;
      }
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCondition &&
      matchesPrice &&
      matchesLocation &&
      matchesListingType
    );
  });

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value === prev[filterType] ? "" : value,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: "",
      condition: "",
      priceRange: "",
      location: "",
      listingType: "",
    });
  };

  const refreshBooks = async () => {
    setLoading(true);
    try {
      await fetchBooks(true);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = Object.values(selectedFilters).filter(
    (value) => value !== ""
  ).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Browse All Books
                </h1>
                <p className="text-gray-600">
                  Discover {filteredBooks.length} books available in the
                  community
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {/* View Mode Toggle */}
                <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition duration-200 ${
                      viewMode === "grid"
                        ? "bg-green-500 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition duration-200 ${
                      viewMode === "list"
                        ? "bg-green-500 text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refreshBooks}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search books, authors, courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center space-x-3">
                  {activeFiltersCount > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {activeFiltersCount} active filters
                      </span>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Clear all</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(filterOptions).map(
                      ([filterType, options]) => (
                        <div key={filterType}>
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {filterType}
                          </label>
                          <select
                            value={selectedFilters[filterType]}
                            onChange={(e) =>
                              handleFilterChange(filterType, e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="">All {filterType}</option>
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Books Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredBooks.map((book) => (
                <Book2 book={book} viewMode={viewMode} />
              ))}
            </div>

            {/* Empty State */}
            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters to find more books
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllBooks;
