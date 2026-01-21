// pages/OTPVerification.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, failed
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuthStore();

  // Get email from location state or use default
  const email = location.state?.email;

  useEffect(() => {
    // Start countdown timer
    if (timeLeft > 0 && verificationStatus === "pending") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, verificationStatus]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").split("").slice(0, 6);

    if (pastedNumbers.length === 6) {
      const newOtp = [...otp];
      pastedNumbers.forEach((num, index) => {
        newOtp[index] = num;
      });
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");


    try {
      const response = await resendOTP({ email });
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(300);
      setVerificationStatus("pending");
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
     
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    const payload = {
      email: email,
      otp: otpString,
    };
    try {
      setLoading(true);
      const response = await verifyOTP(payload);
      if (!response.success) {
        toast.error(response.message);
        // setTimeLeft(0);
        return;
      }
      setVerificationStatus("verified");
      toast.success(response.message);
      navigate("/dashboard");
      return;
    } catch (error) {
      setVerificationStatus("failed");
      setError(err.message || "Invalid verification code");
      // Clear OTP on failure
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-xl sm:px-10">
          {/* Verification Status */}
          {verificationStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-800 font-medium">
                Verification successful! Redirecting...
              </span>
            </div>
          )}

          {verificationStatus === "failed" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-800 font-medium">
                Verification failed. Please try again.
              </span>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter verification code
            </label>

            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || verificationStatus === "success"}
                  className={`
                    w-12 h-12 text-center text-xl font-semibold outline-none border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500
                    ${error ? "border-red-300 bg-red-50" : "border-gray-300"}
                    ${
                      verificationStatus === "success"
                        ? "border-green-300 bg-green-50"
                        : ""
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                />
              ))}
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              Code expires in {formatTime(timeLeft)}
            </div>

            {timeLeft === 0 && (
              <p className="text-sm text-red-600 mb-2">
                Code has expired. Please request a new one.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleVerify}
              disabled={
                loading ||
                !isOtpComplete ||
                verificationStatus === "success" ||
                timeLeft === 0
              }
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOtp}
                disabled={loading || timeLeft > 0}
                className="text-sm text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{" "}
            <a
              href="mailto:support@readcycle.com"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
