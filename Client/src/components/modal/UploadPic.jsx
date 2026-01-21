import React, { useState } from "react";
import { X, Upload, Camera, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";

const UploadPic = ({ onClose, onUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user, uploadProfilePic } = useAuthStore();

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview and store file
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Create preview and store file
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          file,
          preview: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage?.file) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploading(true);

    const payload = new FormData();
    payload.append("profile_pic", selectedImage.file);
    payload.append("user_id", user.user_id);

    try {
      const response = await uploadProfilePic(payload);
      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      onClose();
      
      // Refresh the page or update parent component state
      if (onUpload) {
        onUpload(response.data); // Pass the response data if needed
      } else {
        // Default behavior: reload the page to show new profile picture
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong during upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Get the image source for preview
  const getImageSrc = () => {
    if (selectedImage?.preview) {
      return selectedImage.preview;
    }
    return user.avatar || "/defaultAvatar.png";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Update Profile Picture
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview with Uploading Overlay */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-32 h-32 rounded-full border-4 border-green-100 overflow-hidden mb-4 relative">
              <img
                src={getImageSrc()}
                alt="Selected profile"
                className="w-full h-full object-cover"
              />
              {/* Uploading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 text-center">
              {isUploading ? "Uploading..." : selectedImage ? "Your new profile picture preview" : "Current profile picture"}
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition duration-200 ${
              isDragging && !isUploading
                ? "border-green-500 bg-green-50"
                : isUploading
                ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                : "border-gray-300 hover:border-green-400 hover:bg-green-50"
            }`}
            onDragOver={!isUploading ? handleDragOver : undefined}
            onDragLeave={!isUploading ? handleDragLeave : undefined}
            onDrop={!isUploading ? handleDrop : undefined}
            onClick={!isUploading ? () => document.getElementById("file-input").click() : undefined}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                <p className="text-sm text-gray-600 mb-1">Uploading image...</p>
                <p className="text-xs text-gray-500">Please wait</p>
              </div>
            ) : (
              <>
                <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-green-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isUploading}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedImage || isUploading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
                </>
              )}
            </button>
          </div>

          {/* Upload Progress Indicator  */}
          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Processing your profile picture...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPic;