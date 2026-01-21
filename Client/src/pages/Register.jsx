// components/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Book,
  School,
  Loader2,
} from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    major: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [majors, setMajors] = useState([]);
  const { registerUser, userError, loadingUser } = useAuthStore();
  useEffect(() => {
    const fetchUniversitiesData = async () => {
      try {
        const fetchUni = async () => {
          const uni_response = await fetch("/data/uni.json");
          if (!uni_response.ok)
            throw new Error("Failed to fetch university data");
          return uni_response.json();
        };

        const fetchCourse = async () => {
          const course_response = await fetch("/data/courses.json");
          if (!course_response.ok) throw new Error("Failed to fetch courses");
          return course_response.json();
        };

        // ✅ Call both functions in Promise.all
        const [uniData, courseData] = await Promise.all([
          fetchUni(),
          fetchCourse(),
        ]);

        setUniversities(uniData);
        setMajors(courseData);
      } catch (error) {
        console.error("Error fetching universities or courses:", error.message);
      }
    };

    fetchUniversitiesData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the terms and conditions");
      return;
    }
    const payload = {
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
      university: formData.university,
      major: formData.major,
    };

    // Simulate API call
    const response = await registerUser(payload);
    if (response?.success) {
      toast.success(response.message);

      navigate("/verify-otp", { state: { email: formData.email } });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        university: "",
        major: "",
      });
      setAcceptTerms(false);
    } else {
      toast.error(response?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Already have an account? "
      subtitleLink={
        <Link
          to="/login"
          className="font-medium text-green-600 hover:text-green-500"
        >
          Sign in here
        </Link>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                placeholder="First name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name
            </label>
            <div className="mt-1 relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                placeholder="Last name"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="university"
              className="block text-sm font-medium text-gray-700"
            >
              University
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="university"
                list="universities"
                name="university"
                required
                value={formData.university}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-200 appearance-none bg-white"
              />
              <datalist id="universities">
                {universities.map((uni, index) => (
                  <option key={index} value={uni.name}>
                    {uni.name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label
              htmlFor="major"
              className="block text-sm font-medium text-gray-700"
            >
              Major
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Book className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="major"
                name="major"
                list="majors"
                required
                value={formData.major}
                onChange={handleChange}
                className="block w-full outline-none pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 appearance-none bg-white"
              />
              <datalist id="majors">
                {majors.map((major, index) => (
                  <option key={index} value={major}>
                    {major}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 outline-none rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with a number and special character
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 outline-none rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="accept-terms"
            name="accept-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="accept-terms"
            className="ml-2 block text-sm text-gray-900"
          >
            I agree to the{" "}
            <a href="#" className="text-green-600 hover:text-green-500">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={loadingUser}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loadingUser ? (
              <div className="flex items-center">
                <Loader2 className="text-white animate-spin" />
                Creating account...
              </div>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>
      <p className="mt-2 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a
          href="login"
          className="font-medium text-green-600 hover:text-green-500"
        >
          Sign up
        </a>
      </p>
    </AuthLayout>
  );
};

export default Register;
