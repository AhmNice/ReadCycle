import React from "react";
import { useAuthStore } from "../store/authStore";

const VerifyRoute = ({ children }) => {
  const { user, checkingAuth, checkAuth } = useAuthStore();

  if (user) {
    if (user.isVerified) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <>{children}</>;
};

export default VerifyRoute;
