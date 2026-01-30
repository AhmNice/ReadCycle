import React, { useState } from "react";
import {
  CheckCircle,
  Eye,
  MapPin,
  MessageCircle,
  DollarSign
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import UpdateStatusModal from "../modal/UpdateBookStatus";
import axios from "axios";
import { useBookStore } from "../../store/bookStore";


const Book = ({ book, isExpanded, onBookClick, onUpdateStatus }) => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if current user is the book owner
  const isOwner = user?.user_id === book.book_owner;

  // Status configuration with colors
  const statusConfig = {
    active: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Available"
    },
    sold: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: "Sold"
    },
    swap: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Swapped"
    },
    rented: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Rented"
    }
  };

  // Condition configuration
  const conditionConfig = {
    "like new": { bg: "bg-green-50", text: "text-green-600" },
    "good": { bg: "bg-blue-50", text: "text-blue-600" },
    "fair": { bg: "bg-orange-50", text: "text-orange-600" },
    "poor": { bg: "bg-red-50", text: "text-red-600" }
  };

  // Get current book status
  const currentStatus = book?.book_status?.toLowerCase() || "active";
  const statusInfo = statusConfig[currentStatus] || statusConfig.active;

  // Get current condition
  const currentCondition = book?.book_condition?.toLowerCase() || "good";
  const conditionInfo = conditionConfig[currentCondition] || conditionConfig.good;

  // Handle book click
  const handleClick = (e) => {
    if (!e.target.closest('.status-update-button')) {
      onBookClick?.(book);
    }
  };

  // Handle update status button click
  const handleUpdateStatusClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle status update from modal

const {updateBook} = useBookStore()
const handleStatusUpdate = async (bookId, newStatus) => {
  try {
    const response = await updateBook({
      book_id: bookId,
      newStatus: newStatus,
    });

    console.log("✅ Status updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating status:",
      error.response?.data || error.message
    );
  }
};


  // Format price
  const formatPrice = (price) => {
    if (!price) return null;
    const numberPrice = parseFloat(price);
    if (isNaN(numberPrice)) return "Invalid price";

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(numberPrice);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch {
      return "Invalid date";
    }
  };

  // Get type display
  const getTypeDisplay = () => {
    switch (book.book_for) {
      case 'sale':
        return { text: 'For Sale', color: 'text-green-600', bg: 'bg-green-50' };
      case 'swap':
        return { text: 'For Swap', color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'rent':
        return { text: 'For Rent', color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { text: 'For Sale', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const typeDisplay = getTypeDisplay();

  return (
    <>
      <div
        className="bg-white border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition-all duration-200 relative group"
        onClick={handleClick}
      >
        {/* Update Status Button - Only show for owner */}
        {isOwner && (
          <button
            onClick={handleUpdateStatusClick}
            className="status-update-button absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md text-xs font-medium transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            title="Update Book Status"
            aria-label="Update book status"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Update Status
          </button>
        )}

        <div className="flex items-start space-x-4">
          {/* Book Image */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-20 bg-gray-100 rounded border border-gray-200 overflow-hidden">
              <img
                src={book?.book_cover}
                alt={book.book_title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "default_book.jpg";
                  e.target.className = "w-full h-full object-contain p-2";
                }}
              />
            </div>
            <div
              className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}
            >
              {statusInfo.label}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {book.book_title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {book.book_author || "Unknown Author"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${typeDisplay.bg} ${typeDisplay.color}`}>
                    {typeDisplay.text}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {book.book_course || "No Course"}
                  </span>
                </div>
              </div>

              {/* Owner Badge */}
              {isOwner && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Your Book
                </span>
              )}
            </div>

            {/* Price, Condition, and Location */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Price or Swap/Rental Info */}
              {book.book_for === "sale" && book.book_price && (
                <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span className="font-semibold text-green-700">
                    {formatPrice(book.book_price)}
                  </span>
                </div>
              )}

              {book.book_for === "swap" && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${typeDisplay.bg} ${typeDisplay.color}`}>
                  Swap: {book.book_swap_with || "Any Book"}
                </div>
              )}

              {book.book_for === "rent" && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${typeDisplay.bg} ${typeDisplay.color}`}>
                  Rent: {book.book_rental_period || "Flexible"}
                </div>
              )}

              {/* Condition Badge */}
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${conditionInfo.bg} ${conditionInfo.text}`}
              >
                {currentCondition.toUpperCase()}
              </div>

              {/* Location */}
              {book.book_location && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  <MapPin className="h-3 w-3" />
                  <span>{book.book_location}</span>
                </div>
              )}
            </div>



            {/* Owner Status Info */}
            {isOwner && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-700 font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <button
                    onClick={handleUpdateStatusClick}
                    className="status-update-button text-xs text-green-600 hover:text-green-800 font-medium underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded"
                  >
                    Change Status
                  </button>
                </div>
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Description</h4>
                  {isOwner && (
                    <button
                      onClick={handleUpdateStatusClick}
                      className="status-update-button flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Update Status
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {book.book_description || "No description available."}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Book ID:</span>
                      <p className="text-gray-600 text-xs font-mono mt-0.5">{book.book_id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Owner:</span>
                      <p className="text-gray-600 mt-0.5">
                        {isOwner ? (
                          <span className="text-green-600 font-medium">You</span>
                        ) : (
                          `User ${book.book_owner?.slice(0, 8)}...`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className={`mt-0.5 ${typeDisplay.color} font-medium`}>
                        {typeDisplay.text.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-700">Posted:</span>
                        <p className="text-gray-600 mt-0.5">{formatDate(book.created_at)}</p>
                      </div>
                      {book.updated_at && (
                        <div>
                          <span className="font-medium text-gray-700">Updated:</span>
                          <p className="text-gray-600 mt-0.5">{formatDate(book.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        book={book}
        onUpdateStatus={handleStatusUpdate}
      />
    </>
  );
};

export default Book;