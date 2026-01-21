// components/BookListings.jsx
import React, { useEffect, useState } from "react";
import {
  BookOpen,
  DollarSign,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Star,
  Clock,
  Tag,
  MapPin,
  MessageCircle,
  Share2,
  Archive,
  Trash2,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Book from "./cards/Book";
import { useBookStore } from "../store/bookStore";
import { useAuthStore } from "../store/authStore";

const BookListings = ({ onBookClick, onAddBook, showFilters = true }) => {
  const { fetchUserBooks, userBooks, loadingBooks, booksError } = useBookStore();
  const { user }= useAuthStore()

  useEffect(() => {
    fetchUserBooks(false, user.user_id);
  }, []);

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [expandedBook, setExpandedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { key: "all", label: "All Listings", count: userBooks.length },
    {
      key: "active",
      label: "Active",
      count: userBooks.filter((b) => b.status === "active").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: userBooks.filter((b) => b.status === "pending").length,
    },
    {
      key: "sold",
      label: "Sold",
      count: userBooks.filter((b) => b.status === "sold").length,
    },
  ];

  const sortOptions = [
    { key: "recent", label: "Most Recent" },
    { key: "views", label: "Most Views" },
    { key: "price-high", label: "Price: High to Low" },
    { key: "price-low", label: "Price: Low to High" },
  ];

  const filteredBooks = userBooks
    .filter((book) => {
      const matchesFilter = filter === "all" || book.status === filter;
      const matchesSearch =
        book?.book_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book?.course?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "recent":
        default:
          return new Date(b.postedDate) - new Date(a.created_at);
      }
    });

  return (
    <div className="bg-white w-full rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Book Listings
              </h2>
              <p className="text-sm text-gray-600">
                {filteredBooks.length} book
                {filteredBooks.length !== 1 ? "s" : ""} listed
              </p>
            </div>
          </div>
          <button
            onClick={onAddBook}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Filters and Search */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Filter Tabs */}
            <div className="flex space-x-1 overflow-x-auto">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  onClick={() => setFilter(filterItem.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition duration-200 ${
                    filter === filterItem.key
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{filterItem.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      filter === filterItem.key
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {filterItem.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Books List */}
      <div className="p-6">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 ">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No books found</p>
            <p className="text-sm text-gray-400 mb-6">
              Try adjusting your filters or add a new book
            </p>
            <button
              onClick={onAddBook}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 md:gap-6">
            {filteredBooks.map((book) => (
              <Book book={book} expandedBook={expandedBook} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {/* {filteredBooks.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>
                Total value:{" "}
                <strong>
                  ${userBooks.reduce((sum, book) => sum + book.price, 0)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Potential savings:{" "}
                <strong>
                  $
                  {userBooks.reduce(
                    (sum, book) => sum + (book.originalPrice - book.price),
                    0
                  )}
                </strong>
              </span>
            </div>
            <span>
              {filteredBooks.length} of {userBooks.length} books
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default BookListings;
