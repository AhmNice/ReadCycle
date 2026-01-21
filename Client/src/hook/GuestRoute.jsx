import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Loader2 } from "lucide-react";

const GuestRoute = ({ children }) => {
  const { user, checkingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // verify if user is logged in
  }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="text-green-500 animate-spin" size={34} />
      </div>
    );
  }

  // If user exists, redirect to dashboard (or homepage)
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the login/register page
  return <>{children}</>;
};

export default GuestRoute;
