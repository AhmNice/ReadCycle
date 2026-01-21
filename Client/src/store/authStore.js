import axios from "axios";
import { create } from "zustand";
axios.defaults.withCredentials = true;

const initialState = {
  user: null,
  userError: null,
  loadingUser: false,
  checkingAuth: true,
  isAuthenticated: false,
  user_success: false,
};
const SERVER_URL = `${import.meta.env.VITE_SERVER_URL}`;
export const useAuthStore = create((set, get) => ({
  ...initialState,

  // ✅ REGISTER USER
  registerUser: async (payload) => {
    const register_endpoint = `${
      import.meta.env.VITE_SERVER_URL
    }/auth/register`;

    set({ loadingUser: true, userError: null, user_success: false });

    try {
      // ✅ Await axios response
      const { data } = await axios.post(register_endpoint, payload);

      if (!data.success) {
        set({
          user: null,
          userError: data.message,
          loadingUser: false,
          user_success: false,
        });
        return { success: false, message: data.message };
      }

      // ✅ Success — update store
      set({
        user: data.user,
        user_success: true,
        loadingUser: false,
        userError: null,
      });

      return { success: true, message: data.message };
    } catch (error) {
      console.error("❌ Error registering user:", error.message);

      // ✅ Proper error handling
      set({
        loadingUser: false,
        userError:
          error.response?.data?.message ||
          "Error while trying to register user",
        user_success: false,
      });

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error while trying to register user",
      };
    }
  },

  // ✅ LOGIN USER
  loginUser: async (payload) => {
    const login_endpoint = `${import.meta.env.VITE_SERVER_URL}/auth/login`;

    set({ loadingUser: true, userError: null, user_success: false });

    try {
      const { data } = await axios.post(login_endpoint, payload);

      if (!data.success) {
        set({
          user: null,
          userError: data.message,
          loadingUser: false,
          user_success: false,
        });
        return { success: false, message: data.message };
      }
      set({
        user: data.user,
        user_success: true,
        loadingUser: false,
        userError: null,
      });

      return { success: true, message: data.message };
    } catch (error) {
      console.error("❌ Error logging in user:", error.message);
      set({
        loadingUser: false,
        userError:
          error.response?.data?.message || "Error while trying to log in",
        user_success: false,
      });
      return {
        success: false,
        message:
          error.response?.data?.message || "Error while trying to log in",
      };
    }
  },
  //  OTP VERIFICATION
  verifyOTP: async (payload) => {
    set({ loadingUser: true, userError: null, user_success: null });
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/auth/verify-account`,
        payload
      );

      if (!data.success) {
        set({
          userError: data.message,
          user_success: null,
          loadingUser: false,
        });

        // Include expires_at in case OTP expired
        return {
          success: false,
          message: data.message,
          expires_at: data.expires_at || null,
        };
      }

      set({
        user: data.user,
        userError: null,
        user_success: data.message,
        loadingUser: false,
      });

      return {
        success: true,
        message: data.message,
        user: data.user,
      };
    } catch (error) {
      console.log(
        "Error verify user:",
        error.response?.data?.message || error.message
      );

      const message = error.response?.data?.message || "An error occurred";
      const expires_at = error.response?.data?.expires_at || null;

      set({
        userError: message,
        user_success: null,
        loadingUser: false,
      });

      return {
        success: false,
        message,
        expires_at,
      };
    }
  },
  // RESEND OTP
  resendOTP: async (payload) => {
    set({ loadingUser: true, userError: null, user_success: null });
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/auth/resend-otp`,
        payload
      );

      if (!data.success) {
        set({
          userError: data.message,
          user_success: null,
          loadingUser: false,
        });
        return {
          success: false,
          message: data.message,
        };
      }
      set({ userError: null, user_success: data.message, loadingUser: false });
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log(
        "Error while requesting otp: ",
        error?.response?.data?.message
      );
      return {
        success: false,
        message: error?.response?.data?.message,
      };
    }
  },
  // ACCOUNT UPDATE
  updateUserAccount: async (payload) => {
    const updateEndpoint = `${
      import.meta.env.VITE_SERVER_URL
    }/auth/update-user`;

    set({ loadingUser: true, user_success: null, userError: null });
    try {
      const { data } = await axios.post(updateEndpoint, payload);

      if (!data.success) {
        set({
          loadingUser: false,
          user_success: null,
          userError: data.message,
        });
        return { success: false, message: data.message };
      }
      set({
        user: data.user,
        loadingUser: false,
        user_success: data.message,
        userError: null,
      });
      return { success: true, message: data.message };
    } catch (error) {
      console.log("Error updating account: ", error?.data?.message);
      return {
        success: false,
        message: error?.data?.message || "An error occurred ",
      };
    }
  },
  logOut: async () => {
    const LogoutEndpoint = `${import.meta.env.VITE_SERVER_URL}/auth/logout`;
    set({
      loadingUser: true,
      userError: null,
      user_success: null,
    });
    try {
      const { data } = await axios.get(LogoutEndpoint);
      if (!data.success) {
        set({
          loadingUser: false,
          userError: data.message,
          user_success: null,
        });

        return {
          success: false,
          message: data.message,
        };
      }
      set({
        user: null,
        userError: null,
        loadingUser: false,
        checkingAuth: false,
        isAuthenticated: false,
        user_success: false,
      });
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log(
        "Error trying to logout user: ",
        error?.response?.data?.message
      );
      return {
        success: false,
        message: error?.response?.data?.message || "An error occurred",
      };
    }
  },
  changePassword: async (payload) => {
    set({ loadingUser: true, userError: null, user_success: null });

    try {
      // ✅ Await axios
      const { data } = await axios.post(
        `${SERVER_URL}/auth/change-password`,
        payload
      );

      if (!data.success) {
        set({
          loadingUser: false,
          user_success: null,
          userError: data.message,
        });
        return {
          success: false,
          message: data.message,
        };
      }

      // ✅ Password changed successfully
      set({
        loadingUser: false,
        userError: null,
        user_success: data.message,
      });

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.log("Error changing password: ", error?.response?.data?.message);
      return {
        success: false,
        message: error?.response?.data?.message || "An error occurred",
      };
    }
  },
  uploadProfilePic: async (formData) => {
    // Start loading
    set({ loadingUser: true, userError: null, user_success: null });

    try {
      const { data } = await axios.post(
        `${SERVER_URL}/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!data.success) {
        // ❌ Backend responded but upload failed
        set({
          loadingUser: false,
          userError: data.message || "Failed to upload image",
          user_success: null,
        });
        return {
          success: false,
          message: data.message || "Failed to upload image",
        };
      }

      // ✅ Success response
      set({
        loadingUser: false,
        userError: null,
        user_success: data.message || "Profile picture updated successfully",
        user: data.user,
      });
      console.log(data);

      return {
        success: true,
        message: data.message || "Profile picture updated successfully",
      };
    } catch (error) {
      console.log("Error uploading picture: ", error?.response?.data?.message);

      // ❗ Catch network or backend error
      set({
        loadingUser: false,
        userError:
          error?.response?.data?.message ||
          "Something went wrong while uploading the image",
        user_success: null,
      });

      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Something went wrong while uploading the image",
      };
    }
  },

  //   CHECK USER AUTHENTICATION
  checkAuth: async () => {
    const authentication_endpoint = `${
      import.meta.env.VITE_SERVER_URL
    }/auth/check-auth`;

    // ✅ Set checkingAuth true at the start
    set({ checkingAuth: true });

    try {
      const { data } = await axios.get(authentication_endpoint);

      if (!data.success) {
        set({
          user: null,
          userError: data.message,
          checkingAuth: false,
          user_success: false,
        });
        return { success: false, message: data.message };
      }

      // ✅ Success — update store
      set({
        user: data.user,
        userError: null,
        checkingAuth: false,
        user_success: true,
        isAuthenticated: true,
      });

      return { success: true, message: data.message };
    } catch (error) {
      set({
        user: null,
        userError:
          error.response?.data?.message || "Error while verifying session",
        checkingAuth: false,
        user_success: false,
        isAuthenticated: false,
      });

      return {
        success: false,
        message:
          error.response?.data?.message || "Error while verifying session",
      };
    }
  },
}));
