import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Layout from "./root/Layout";
import ReadCycleLanding from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/ChatPage";
import NotFound from "./components/NotFound";
import SellBook from "./pages/SellBook";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./hook/ProtectedRoute";
import OTPVerification from "./pages/OtpPage";
import GuestRoute from "./hook/GuestRoute";
import Books from "./pages/Books";
import AllBooks from "./pages/AllBooks";
import VerifyRoute from "./hook/VerifyRoute";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<ReadCycleLanding />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="request-password" element={<ForgotPassword />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="verify-otp"
          element={
            <VerifyRoute>
              <OTPVerification />
            </VerifyRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="sell-books"
          element={
            <ProtectedRoute>
              <SellBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="buy-books"
          element={
            <ProtectedRoute>
              <AllBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
