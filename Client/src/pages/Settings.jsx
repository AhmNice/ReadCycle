// pages/Settings.jsx
import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Eye,
  Globe,
  MessageCircle,
  Mail,
  Smartphone,
  Lock,
  User,
  BookOpen,
  Trash2,
  Download,
  Save,
  X,
  Check,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import Sidebar from "../components/SideBar";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteAccountModal from "../components/modal/DeleteAccountModal";

const Settings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("account");
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, changePassword } = useAuthStore();
  const { updateUserAccount } = useAuthStore();

  const [firstName, lastName] = user?.full_name.split(" ");

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    user_id: user.user_id,
    firstName: firstName,
    lastName: lastName,
    email: user?.email,
    phone_number: user?.phone_number,
    university: user.university,
    major: user?.major,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    loginAlerts: true,
    deviceManagement: true,
  });
  // Add this to your component's state
  const [passwordData, setPasswordData] = useState({
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Add this function to handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setSaving(true);

    try {
      // Call your API to change password
      const response = await changePassword({
        email: user.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
      if(!response.success){
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };
  const handleSaveSettings = async (section) => {
    setSaving(true);
    try {
      const response = await updateUserAccount(accountSettings);
      console.log(accountSettings);
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      toast.success(response.message);
      return;
    } catch (error) {
      console.log("Error updating setting: ", error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
const [ isDeleteModalOpen , setIsDeleteModalOpen ]= useState(false)
 

  const handleOnclickDeleteAccount = () => {
    setIsDeleteModalOpen(prev => !prev)
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={accountSettings.firstName}
            onChange={(e) =>
              setAccountSettings((prev) => ({
                ...prev,
                firstName: e.target.value,
              }))
            }
            className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={accountSettings.lastName}
            onChange={(e) =>
              setAccountSettings((prev) => ({
                ...prev,
                lastName: e.target.value,
              }))
            }
            className="w-full outline-none border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={accountSettings.email}
          onChange={(e) =>
            setAccountSettings((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={accountSettings.phone_number}
          onChange={(e) =>
            setAccountSettings((prev) => ({
              ...prev,
              phone_number: e.target.value,
            }))
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            University
          </label>
          <input
            type="text"
            value={accountSettings.university}
            onChange={(e) =>
              setAccountSettings((prev) => ({
                ...prev,
                university: e.target.value,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major
          </label>
          <input
            type="text"
            value={accountSettings.major}
            onChange={(e) =>
              setAccountSettings((prev) => ({ ...prev, major: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSaveSettings("account")}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Change Password Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border outline-none border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your current password"
          />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Enter new password"
          />
          {passwordData.newPassword && (
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters with uppercase, lowercase,
              number, and special character
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Confirm new password"
          />
          {passwordData.confirmPassword &&
            passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
        </div>
      </div>

      {/* Security Features Section */}
      {/* <div className="space-y-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-700">Security Features</h3>
      {[
        {
          key: "loginAlerts",
          label: "Login Alerts",
          description: "Get notified of new sign-ins",
        },
        {
          key: "deviceManagement",
          label: "Device Management",
          description: "Review and manage connected devices",
        },
      ].map((setting) => (
        <div
          key={setting.key}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div>
            <p className="font-medium text-gray-900">{setting.label}</p>
            <p className="text-sm text-gray-500">{setting.description}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings[setting.key]}
              onChange={(e) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  [setting.key]: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      ))}
    </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => {
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={() => handleChangePassword()}
          disabled={
            saving ||
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
          }
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? <span className="flex gap-2 items-center justify-center">
            <Loader2 className=" animate-spin text-white" size={14}/>
            Updating...
          </span> : "Update Password"}
        </button>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
      <p className="text-red-700 mb-4">
        These actions are irreversible. Please proceed with caution.
      </p>

      <div className="space-y-4">
       

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-red-900">Delete Account</p>
            <p className="text-sm text-red-700">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            onClick={handleOnclickDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={handleOnclickDeleteAccount}/>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
      />

      <div className={`flex-1 flex flex-col overflow-hidden `}>
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-gray-600">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:w-64 flex-shrink-0">
                <nav className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition duration-200 ${
                          activeSection === section.id
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <section.icon className="h-4 w-4" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 capitalize">
                    {sections.find((s) => s.id === activeSection)?.label}{" "}
                    Settings
                  </h2>

                  {activeSection === "account" && renderAccountSettings()}
                  {activeSection === "security" && renderSecuritySettings()}
                  {activeSection === "appearance" && renderAppearanceSettings()}
                  {activeSection === "preferences" && renderPreferences()}
                </div>

                {/* Danger Zone - Always visible */}
                {renderDangerZone()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
