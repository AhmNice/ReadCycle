import React, { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  Circle,
  ShoppingBag
} from "lucide-react";

const UpdateStatusModal = ({ isOpen, onClose, book, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(book?.book_status || "active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Status options with descriptions
  const statusOptions = [
    {
      value: "active",
      label: "Available",
      description: "Book is available for sale, swap, or rent",
      icon: <Circle className="h-4 w-4 text-green-600 fill-green-600" />,
      color: "bg-green-100 text-green-800"
    },
    {
      value: "sold",
      label: "Sold",
      description: "Book has been sold to a buyer",
      icon: <ShoppingBag className="h-4 w-4 text-gray-600" />,
      color: "bg-gray-100 text-gray-800"
    },
    {
      value: "swap",
      label: "Swapped",
      description: "Book has been exchanged with another book",
      icon: <RefreshCw className="h-4 w-4 text-purple-600" />,
      color: "bg-purple-100 text-purple-800"
    },
    {
      value: "rented",
      label: "Rented",
      description: "Book has been rented to someone",
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      color: "bg-blue-100 text-blue-800"
    }
  ];

  const getCurrentStatus = () => {
    return statusOptions.find(option => option.value === book?.book_status) || statusOptions[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError("Please select a status");
      return;
    }

    if (selectedStatus === book?.book_status) {
      setError("This is already the current status");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Call the update function passed from parent
      await onUpdateStatus(book.book_id, selectedStatus);

      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(book?.book_status || "active");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-50 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Update Book Status
                </h3>
                <p className="text-xs text-gray-500">
                  Change the current status of your book
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Book Info */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-start space-x-3">
              <img
                src={book?.book_cover || "default_book.jpg"}
                alt={book?.book_title}
                className="w-10 h-14 object-cover rounded border"
                onError={(e) => {
                  e.target.src = "default_book.jpg";
                }}
              />
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {book?.book_title}
                </h4>
                <p className="text-xs text-gray-600 truncate">{book?.book_author}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getCurrentStatus().color}`}>
                    Current: {getCurrentStatus().label}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {book?.book_for?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select new status
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={`flex items-start p-3 border rounded-md cursor-pointer transition-all ${
                          selectedStatus === option.value
                            ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="radio"
                            id={`status-${option.value}`}
                            name="book_status"
                            value={option.value}
                            checked={selectedStatus === option.value}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-3.5 w-3.5 text-green-600 border-gray-300 focus:ring-green-400"
                          />
                        </div>
                        <div className="ml-2.5 flex-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor={`status-${option.value}`}
                              className="flex items-center gap-1.5 font-medium text-gray-900 text-sm"
                            >
                              <span className="flex items-center justify-center w-5 h-5">
                                {option.icon}
                              </span>
                              {option.label}
                            </label>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${option.color}`}>
                              {option.value.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-600">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning Message for Status Changes */}
                {(selectedStatus === "sold" || selectedStatus === "swap" || selectedStatus === "rented") && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-yellow-800">
                          Important Note
                        </p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                          Marking as {selectedStatus} will make this book unavailable for other actions.
                          You can change it back to "Available" anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedStatus === book?.book_status}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 ${
                  isSubmitting || selectedStatus === book?.book_status
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;