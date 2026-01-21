import React from "react";
import {
  MapPin,
  Star,
  Eye,
  MessageCircle,
  Calendar,
  DollarSign,
  BookOpen,
  User,
  Clock,
} from "lucide-react";
import MessageSellerButton from "../buttons/MessageSellerBtn";

const Book2 = ({ book, viewMode, onMessageSeller }) => {
  const getListingTypeColor = (type) => {
    switch (type) {
      case "sale":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "rent":
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white";
      case "swap":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Like New":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Good":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Fair":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Poor":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getDaysAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return "Invalid date";

  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`;
};


  const calculateSavings = (price, originalPrice) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleMessageSeller = () => {
    if (onMessageSeller) {
      onMessageSeller(book);
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl  ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      {/* Book Image with Overlay */}
      <div
        className={`relative ${
          viewMode === "list" ? "w-48 flex-shrink-0" : "w-full"
        }`}
      >
        <img
          src={book.image || "default_book.jpg"}
          alt={book.title}
          className={`object-cover transition-transform duration-300  ${
            viewMode === "list" ? "h-full w-48" : "h-46 w-full"
          }`}
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-black/50 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />

        {/* Listing Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getListingTypeColor(
              book.listingType
            )}`}
          >
            {getListingTypeLabel(book.listingType)}
          </span>
        </div>

        {/* Savings Badge */}
        {book.originalPrice && book.originalPrice > book.price && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
              Save {calculateSavings(book.price, book.originalPrice)}%
            </span>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">

        </div>
      </div>

      {/* Book Details */}
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-base mb-2 leading-tight group-hover:text-green-600 transition-colors duration-200">
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 mb-1 flex items-center">
              <BookOpen className="h-3 w-3 mr-1.5" />
              by {book.author}
            </p>
            <p className="text-xs text-gray-700 font-medium bg-gray-50 rounded-lg px-2 py-1 inline-block">
              {book.course}
            </p>

            <p>{book.description}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{getDaysAgo(book.postedDate)}</span>
          </div>
        </div>

        {/* Price and Condition */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {book.price ? (            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xl font-bold text-gray-900">
                {book.price}
              </span>

            </div>
): (
              <div className="flex items-center space-x-2">
                <p>Swap with: </p>
              <span className="text-xl font-bold text-gray-900">
                {book.swap}
              </span>

            </div>

)}
          </div>
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(
              book.condition
            )}`}
          >
            {book.condition}
          </span>
        </div>

        {/* Rating and Time */}

        {/* Location and Seller */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="font-medium">{book.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm">
              <img
                src={book.seller.avatar || "defaultAvatar.png"}
                alt={book.seller.name}
                className="w-5 h-5 rounded-full border-2 border-green-500"
              />
              <span className="text-xs font-medium text-gray-900">
                {book.seller.name}
              </span>
            </div>
          </div>
        </div>

        {/* Message Seller Button */}
        <MessageSellerButton sellerId={book.seller?.user_id} />
      </div>
    </div>
  );

  function getListingTypeLabel(type) {
    switch (type) {
      case "sale":
        return "For Sale";
      case "rent":
        return "For Rent";
      case "swap":
        return "For Swap";
      default:
        return type;
    }
  }
};

export default Book2;
