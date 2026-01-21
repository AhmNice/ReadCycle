import { DollarSign, Eye, MessageCircle } from "lucide-react";
import React from "react";

const Book = ({ book, isExpanded, onBookClick }) => {
  const statusConfig = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    sold: "bg-gray-100 text-gray-800",
  };

  const conditionConfig = {
    "Like New": "bg-green-50 text-green-600",
    Good: "bg-blue-50 text-blue-600",
    Fair: "bg-orange-50 text-orange-600",
  };

  const handleClick = () => {
    onBookClick?.(book);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md transition duration-200"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        {/* Book Image */}
        <div className="relative">
          <img
            src={book?.book_cover || "default_book.jpg"}
            alt={book.book_title}
            className="w-16 h-20 object-cover rounded"
          />
          <div
            className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs ${
              statusConfig[book?.status]
            }`}
          >
            {book?.status}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {book.book_title}
          </h3>
          <p className="text-sm text-gray-600">{book?.book_author}</p>
          <p className="text-sm text-gray-700 font-medium">{book?.course}</p>

          {/* Price and Condition */}
          <div className="flex items-center space-x-4 mt-2">
            {book?.book_price ? (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">{book?.book_price}</span>
              </div>
            ) : (
              <span className="font-semibold">{book?.book_swap_with}</span>
            )}
            <div
              className={`px-2 py-1 rounded text-xs ${
                conditionConfig[book?.book_condition]
              }`}
            >
              {book?.book_condition}
            </div>
          </div>

          {/* Stats */}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">{book?.book_description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Posted {book?.created_at}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;
