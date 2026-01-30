// pages/SellBook.jsx
import React, { useState } from "react";
import {
  Camera,
  RefreshCw,
  Calendar,
  BookOpen,
  MapPin,
  Info,
  X,
  Plus,
  Minus,
  Loader2,
  Star,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import { useAuthStore } from "../store/authStore";
import { useBookStore } from "../store/bookStore";
import { toast } from "react-toastify";

const SellBook = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { createBook } = useBookStore();
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState("sale"); // 'sale', 'swap', 'rent'
  const [bookCover, setBookCover] = useState(null); // Single book cover image

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    course: "",
    condition: "good",
    price: "",
    rentalPrice: "",
    rentalPeriod: "semester",
    description: "",
    location: "",
    swapWith: "", // New field for swap book
  });

  const currentUser = {
    id: 1,
    name: "John Student",
    avatar: "hassy.jpg",
  };

  const conditions = [
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  const rentalPeriods = [
    { value: "week", label: "1 Week" },
    { value: "month", label: "1 Month" },
    { value: "semester", label: "Semester" },
    { value: "year", label: "Academic Year" },
  ];

  // Handle single book cover upload
  const handleBookCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const newBookCover = {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file: file,
    };

    setBookCover(newBookCover);
  };

  // Remove book cover
  const removeBookCover = () => {
    if (bookCover) {
      URL.revokeObjectURL(bookCover.url); // Clean up object URL
    }
    setBookCover(null);
  };

  // Replace book cover
  const replaceBookCover = (e) => {
    removeBookCover();
    handleBookCoverUpload(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate book cover
    if (!bookCover) {
      toast.error("Please upload a book cover image");
      return;
    }

    // Validate swap field if listing type is swap
    if (listingType === "swap" && !formData.swapWith.trim()) {
      toast.error("Please specify what book you want to swap for");
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const payload = new FormData();
      payload.append("book_title", formData.title);
      payload.append("book_author", formData.author);
      payload.append("book_owner", user.user_id);
      payload.append("book_location", formData.location);
      payload.append("book_for", listingType);
      payload.append("book_description", formData.description);
      payload.append("book_condition", formData.condition);
      payload.append("book_course", formData.course);
      payload.append("book_cover", bookCover.file); // Append the actual file

      // Add price or swap field based on listing type
      if (listingType === "sale") {
        payload.append("book_price", formData.price);
      } else if (listingType === "rent") {
        payload.append("book_price", formData.rentalPrice);
        payload.append("book_rental_period", formData.rentalPeriod);
      } else if (listingType === "swap") {
        payload.append("book_swap_with", formData.swapWith); // Add swap field
      }

      const response = await createBook(payload);

      if (response.success) {
        toast.success(response?.message);
        // Reset form
        setFormData({
          title: "",
          author: "",
          isbn: "",
          course: "",
          condition: "good",
          price: "",
          rentalPrice: "",
          rentalPeriod: "semester",
          description: "",
          location: "",
          swapWith: "",
        });
        setBookCover(null);
      } else {
        console.log("error adding book: ", response?.message);
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getPricePlaceholder = () => {
    switch (listingType) {
      case "sale":
        return "Enter selling price";
      case "rent":
        return "Enter rental price per period";
      case "swap":
        return "What book would you like to swap for?";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                List Your Book
              </h1>
              <p className="text-gray-600">
                Share your book with the ReadCycle community
              </p>
            </div>

            {/* Listing Type Selector */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Listing Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setListingType("sale")}
                  className={`p-4 border-2 rounded-lg text-left transition duration-200 ${
                    listingType === "sale"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`h-6 w-6 mb-2 ${
                      listingType === "sale"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >₦</p>
                  <h3 className="font-semibold text-gray-900">For Sale</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sell your book for cash
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType("swap")}
                  className={`p-4 border-2 rounded-lg text-left transition duration-200 ${
                    listingType === "swap"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RefreshCw
                    className={`h-6 w-6 mb-2 ${
                      listingType === "swap"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <h3 className="font-semibold text-gray-900">For Swap</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Exchange for another book
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={`p-4 border-2 rounded-lg text-left transition duration-200 ${
                    listingType === "rent"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Calendar
                    className={`h-6 w-6 mb-2 ${
                      listingType === "rent"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <h3 className="font-semibold text-gray-900">For Rent</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Rent out for a period
                  </p>
                </button>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Book Cover Upload */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Book Cover *
                </h2>

                <div className="flex flex-col items-center justify-center">
                  {bookCover ? (
                    <div className="relative w-64 h-80 mx-auto">
                      <img
                        src={bookCover.url}
                        alt="Book cover preview"
                        className="w-full h-full object-cover rounded-lg shadow-md border"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={removeBookCover}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <label className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition duration-200 cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={replaceBookCover}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Cover Image
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg w-64 h-80 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition duration-200 bg-gray-50">
                      <Camera className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-lg font-medium text-gray-600 mb-2">
                        Upload Book Cover
                      </span>
                      <span className="text-sm text-gray-500 text-center px-4">
                        Click to select a cover image
                        <br />
                        <span className="text-xs">(JPG, PNG, max 5MB)</span>
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBookCoverUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center mt-4 flex items-center justify-center">
                  <Info className="h-4 w-4 mr-1" />
                  Upload a clear photo of the book cover. This will be the main image for your listing.
                </p>
              </div>

              {/* Book Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                  Book Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 outline-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Introduction to Algorithms"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          author: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 outline-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Thomas H. Cormen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ISBN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isbn: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="e.g., 978-0262033848"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course/Subject
                    </label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          course: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="e.g., CS 301 - Data Structures"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              {(listingType === "sale" || listingType === "rent") && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <p className="h-5 w-5 mr-2 text-green-600" >₦</p>
                    {listingType === "sale" ? "Pricing" : "Rental Details"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listingType === "sale" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <p className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " >₦</p>
                          <input
                            type="number"
                            required
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 outline-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}

                    {listingType === "rent" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rental Price *
                          </label>
                          <div className="relative">
                            <p className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " >₦</p>
                            <input
                              type="number"
                              required
                              value={formData.rentalPrice}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  rentalPrice: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rental Period *
                          </label>
                          <select
                            value={formData.rentalPeriod}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                rentalPeriod: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2  outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            {rentalPeriods.map((period) => (
                              <option key={period.value} value={period.value}>
                                {period.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Swap Section */}
              {listingType === "swap" && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
                    Swap Details
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What book would you like to swap for? *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.swapWith}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          swapWith: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Organic Chemistry 2nd Edition"
                    />
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Describe the book's condition, any highlights, notes, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Main Library, Student Union, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !bookCover || (listingType === "swap" && !formData.swapWith.trim())}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-200 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-white" size={20} />
                  ) : null}
                  List Book for{" "}
                  {listingType === "sale"
                    ? "Sale"
                    : listingType === "rent"
                    ? "Rent"
                    : "Swap"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellBook;