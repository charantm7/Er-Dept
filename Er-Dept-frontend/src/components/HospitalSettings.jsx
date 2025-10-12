import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Building2,
  Palette,
  Globe,
  Database,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save,
  X,
  Check,
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function HospitalSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [saveStatus, setSaveStatus] = useState(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@curahealth.com",
    phone: "+1 (555) 123-4567",
    role: "Chief Medical Officer",
    department: "Emergency Medicine",
    employeeId: "EMP-2024-1234",
    bio: "Experienced emergency medicine specialist with over 15 years of clinical experience.",
  });

  // Hospital Settings State
  const [hospitalData, setHospitalData] = useState({
    name: "CuraHealth Medical Center",
    address: "123 Medical Drive, Healthcare City",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 987-6543",
    email: "info@curahealth.com",
    website: "www.curahealth.com",
    licenseNumber: "HOSP-NY-2024-5678",
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    emergencyAlerts: true,
    appointmentReminders: true,
    patientUpdates: true,
    systemUpdates: false,
    weeklyReports: true,
  });

  // Security Settings State
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  // Appearance Settings State
  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    timezone: "America/New_York",
  });

  // Data & Privacy State
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    activityLog: true,
    dataRetention: "2years",
  });

  const handleSave = (section) => {
    setSaveStatus("saving");
    // Simulate API call
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSaveStatus("error");
      return;
    }
    if (securityData.newPassword.length < 8) {
      setSaveStatus("error");
      return;
    }
    handleSave("security");
    setSecurityData({
      ...securityData,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "hospital", label: "Hospital Info", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Data & Privacy", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and system preferences</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 hover:border-blue-600 hover:border-2 rounded-md text-sm bg-white shadow font-medium border border-[#0000000b]"
          >
            Dashboard
          </button>
        </div>

        {/* Save Status Alert */}
        {saveStatus && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              saveStatus === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : saveStatus === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {saveStatus === "success" && <CheckCircle2 className="h-5 w-5" />}
            {saveStatus === "error" && <AlertCircle className="h-5 w-5" />}
            {saveStatus === "saving" && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            <span className="font-medium">
              {saveStatus === "success"
                ? "Settings saved successfully!"
                : saveStatus === "error"
                ? "Error: Please check your inputs"
                : "Saving changes..."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600 mt-1">Update your personal information</p>
                  </div>

                  {/* Profile Photo */}
                  <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {profileData.firstName[0]}
                        {profileData.lastName[0]}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition">
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-600 mt-1">Upload a new profile picture</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={profileData.role}
                        onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option>Emergency Medicine</option>
                        <option>Cardiology</option>
                        <option>Neurology</option>
                        <option>Pediatrics</option>
                        <option>Radiology</option>
                        <option>Surgery</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("profile")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                    <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Hospital Info */}
              {activeTab === "hospital" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hospital Information</h2>
                    <p className="text-gray-600 mt-1">Manage your organization details</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                      <input
                        type="text"
                        value={hospitalData.name}
                        onChange={(e) => setHospitalData({ ...hospitalData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={hospitalData.address}
                        onChange={(e) => setHospitalData({ ...hospitalData, address: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={hospitalData.city}
                        onChange={(e) => setHospitalData({ ...hospitalData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={hospitalData.state}
                        onChange={(e) => setHospitalData({ ...hospitalData, state: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={hospitalData.zipCode}
                        onChange={(e) => setHospitalData({ ...hospitalData, zipCode: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={hospitalData.country}
                        onChange={(e) => setHospitalData({ ...hospitalData, country: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={hospitalData.phone}
                        onChange={(e) => setHospitalData({ ...hospitalData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={hospitalData.email}
                        onChange={(e) => setHospitalData({ ...hospitalData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="text"
                        value={hospitalData.website}
                        onChange={(e) => setHospitalData({ ...hospitalData, website: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                      <input
                        type="text"
                        value={hospitalData.licenseNumber}
                        onChange={(e) => setHospitalData({ ...hospitalData, licenseNumber: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("hospital")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                    <p className="text-gray-600 mt-1">Choose how you want to be notified</p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {key === "emailNotifications" && "Receive notifications via email"}
                            {key === "smsNotifications" && "Get text message alerts"}
                            {key === "pushNotifications" && "Browser push notifications"}
                            {key === "emergencyAlerts" && "Critical emergency notifications"}
                            {key === "appointmentReminders" && "Upcoming appointment alerts"}
                            {key === "patientUpdates" && "Patient status changes"}
                            {key === "systemUpdates" && "System maintenance alerts"}
                            {key === "weeklyReports" && "Weekly summary reports"}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            value ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              value ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("notifications")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                    <p className="text-gray-600 mt-1">Manage your account security</p>
                  </div>

                  {/* Change Password */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={securityData.oldPassword}
                            onChange={(e) =>
                              setSecurityData({ ...securityData, oldPassword: e.target.value })
                            }
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={securityData.newPassword}
                            onChange={(e) =>
                              setSecurityData({ ...securityData, newPassword: e.target.value })
                            }
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={securityData.confirmPassword}
                            onChange={(e) =>
                              setSecurityData({ ...securityData, confirmPassword: e.target.value })
                            }
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Add an extra layer of security</p>
                      </div>
                      <button
                        onClick={() =>
                          setSecurityData({ ...securityData, twoFactorAuth: !securityData.twoFactorAuth })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          securityData.twoFactorAuth ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            securityData.twoFactorAuth ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">Session Timeout</h3>
                      <select
                        value={securityData.sessionTimeout}
                        onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Login Alerts</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Get notified of new login attempts</p>
                      </div>
                      <button
                        onClick={() =>
                          setSecurityData({ ...securityData, loginAlerts: !securityData.loginAlerts })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          securityData.loginAlerts ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            securityData.loginAlerts ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("security")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Security Settings
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
                    <p className="text-gray-600 mt-1">Customize how the system looks</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {["light", "dark", "auto"].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setAppearance({ ...appearance, theme })}
                            className={`p-4 rounded-lg border-2 transition ${
                              appearance.theme === theme
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div
                              className={`h-16 rounded mb-2 ${
                                theme === "light"
                                  ? "bg-white border border-gray-300"
                                  : theme === "dark"
                                  ? "bg-gray-900"
                                  : "bg-gradient-to-r from-white to-gray-900"
                              }`}
                            ></div>
                            <p className="font-medium text-gray-900 capitalize">{theme}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={appearance.language}
                        onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                      <select
                        value={appearance.dateFormat}
                        onChange={(e) => setAppearance({ ...appearance, dateFormat: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                      <select
                        value={appearance.timeFormat}
                        onChange={(e) => setAppearance({ ...appearance, timeFormat: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="12h">12 Hour (AM/PM)</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={appearance.timezone}
                        onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("appearance")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Data & Privacy */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Data & Privacy</h2>
                    <p className="text-gray-600 mt-1">Control your data and privacy settings</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Data Sharing</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Share anonymized data for research</p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, dataSharing: !privacy.dataSharing })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          privacy.dataSharing ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            privacy.dataSharing ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Help improve our services with usage data
                        </p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, analytics: !privacy.analytics })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          privacy.analytics ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            privacy.analytics ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">Activity Log</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Track your account activity</p>
                      </div>
                      <button
                        onClick={() => setPrivacy({ ...privacy, activityLog: !privacy.activityLog })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          privacy.activityLog ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            privacy.activityLog ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-2">Data Retention Period</h3>
                      <select
                        value={privacy.dataRetention}
                        onChange={(e) => setPrivacy({ ...privacy, dataRetention: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1year">1 Year</option>
                        <option value="2years">2 Years</option>
                        <option value="5years">5 Years</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                    <div className="space-y-3">
                      <button className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2">
                        <FileText className="h-5 w-5" />
                        Download My Data
                      </button>
                      <button className="w-full px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Delete My Account
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleSave("privacy")}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
                    >
                      <Save className="h-4 w-4" />
                      Save Privacy Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalSettings;
