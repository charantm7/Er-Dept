import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Activity,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  Heart,
  Stethoscope,
  Ambulance,
  UserCheck,
  FileText,
  Phone,
  MapPin,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  ChevronDown,
  Bed,
  ClipboardList,
  DollarSign,
  UserCog,
  Building2,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../Auth/Authprovider";
import { useToast } from "../Context/ToastContext";

// Mock Data - Replace with Supabase queries
const MOCK_SEARCH_DATA = [
  {
    id: 1,
    name: "John Smith",
    type: "patient",
    ward: "ICU-2",
    condition: "Cardiac Arrest",
    status: "critical",
    mrno: "MR001234",
    assignedTo: "Dr. Sarah Johnson",
  },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    type: "doctor",
    dept: "Emergency Medicine",
    shift: "On Duty",
    specialization: "Trauma",
    patients: 12,
  },
  {
    id: 3,
    name: "Emily Davis",
    type: "nurse",
    dept: "Emergency",
    shift: "Night Shift",
    station: "Triage",
    patients: 8,
  },
  {
    id: 4,
    name: "Michael Brown",
    type: "patient",
    ward: "ER-5",
    condition: "Fracture",
    status: "stable",
    mrno: "MR001235",
    assignedTo: "Dr. Robert Wilson",
  },
  {
    id: 5,
    name: "Anna Martinez",
    type: "patient",
    ward: "ER-3",
    condition: "Asthma Attack",
    status: "moderate",
    mrno: "MR001236",
    assignedTo: "Dr. James Taylor",
  },
];

const EMERGENCY_ALERTS = [
  {
    id: 1,
    patient: "Jane Doe",
    mrno: "MR001240",
    severity: "critical",
    time: "2 min ago",
    condition: "Cardiac Arrest",
    location: "ER-1",
    assignedTo: "Dr. Sarah Johnson",
  },
  {
    id: 2,
    patient: "Tom Hardy",
    mrno: "MR001241",
    severity: "high",
    time: "15 min ago",
    condition: "Severe Trauma",
    location: "Trauma Bay",
    assignedTo: "Dr. Robert Wilson",
  },
  {
    id: 3,
    patient: "Mary Johnson",
    mrno: "MR001242",
    severity: "medium",
    time: "45 min ago",
    condition: "Respiratory Distress",
    location: "ER-4",
    assignedTo: "Dr. James Taylor",
  },
  {
    id: 4,
    patient: "Sarah Lee",
    mrno: "MR001243",
    severity: "high",
    time: "1 hour ago",
    condition: "Stroke",
    location: "ER-2",
    assignedTo: "Dr. Sarah Johnson",
  },
  {
    id: 5,
    patient: "Mike Wilson",
    mrno: "MR001244",
    severity: "medium",
    time: "2 hours ago",
    condition: "Chest Pain",
    location: "ER-6",
    assignedTo: "Dr. Robert Wilson",
  },
  {
    id: 6,
    patient: "Emma Davis",
    mrno: "MR001245",
    severity: "critical",
    time: "2 hours ago",
    condition: "Severe Bleeding",
    location: "Trauma Bay",
    assignedTo: "Dr. James Taylor",
  },
];

const ROLE_CONFIG = {
  admin: {
    canViewAll: true,
    canManageUsers: true,
    canManageBilling: true,
    canViewReports: true,
    showStats: ["patients", "appointments", "billing", "staff", "beds", "emergencies"],
  },
  doctor: {
    canViewAll: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: true,
    showStats: ["myPatients", "appointments", "emergencies", "pendingReports"],
  },
  nurse: {
    canViewAll: false,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: false,
    showStats: ["assignedPatients", "appointments", "emergencies", "vitals"],
  },
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "medium" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    xlarge: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div
          className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden animate-modal-in`}
        >
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Patient Quick Details Modal
const PatientQuickModal = ({ isOpen, onClose, patient, onViewFull }) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Quick View" size="medium">
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium">Patient Name</label>
              <p className="text-slate-900 font-semibold">{patient.name}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">MR Number</label>
              <p className="text-slate-900 font-semibold">{patient.mrno}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Ward</label>
              <p className="text-slate-900 font-semibold">{patient.ward}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  patient.status === "critical"
                    ? "bg-red-100 text-red-700"
                    : patient.status === "moderate"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {patient.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="font-semibold text-slate-900 mb-2">Condition</h4>
          <p className="text-slate-700">{patient.condition}</p>
          <p className="text-sm text-slate-500 mt-2">Assigned: {patient.assignedTo}</p>
        </div>

        <button
          onClick={() => onViewFull(patient)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          View Full Details
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </Modal>
  );
};

const UnifiedDashboard = () => {
  const { user, logout } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(EMERGENCY_ALERTS);
  const [alertsPage, setAlertsPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sortBy, setSortBy] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);

  const searchRef = useRef(null);
  const sortRef = useRef(null);
  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.nurse;

  const alertsPerPage = 3;
  const totalPages = Math.ceil(activeAlerts.length / alertsPerPage);
  const paginatedAlerts = activeAlerts.slice((alertsPage - 1) * alertsPerPage, alertsPage * alertsPerPage);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.length >= 2) {
      let results = MOCK_SEARCH_DATA.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (!roleConfig.canViewAll) {
        results = results.filter((item) => {
          if (item.type === "patient") return item.assignedTo === user?.name;
          return true;
        });
      }

      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, roleConfig.canViewAll, user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    success("Logged out successfully! 👋");
    navigate("/login");
  };

  const handleRefresh = async () => {
    setLoading(true);
    info("Refreshing dashboard data...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success("Dashboard refreshed!");
    setLoading(false);
  };

  const handleAcknowledgeAlert = (id) => {
    setActiveAlerts((prev) => prev.filter((alert) => alert.id !== id));
    success("Emergency alert acknowledged");
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowQuickModal(true);
    setShowSearchResults(false);
  };

  const handleViewFullPatient = (patient) => {
    setShowQuickModal(false);
    navigate(`/patient/${patient.mrno}`);
  };

  const handleQuickAccess = (page) => {
    navigate(`/${page}`);
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case "patient":
        return <Heart className="w-4 h-4" />;
      case "doctor":
        return <Stethoscope className="w-4 h-4" />;
      case "nurse":
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "moderate":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "stable":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 animate-pulse";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-amber-500";
      default:
        return "bg-teal-500";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredSearchResults =
    sortBy === "all" ? searchResults : searchResults.filter((r) => r.type === sortBy);

  const statsCards = [
    {
      title: "Total Patients",
      value: "1,245",
      icon: Users,
      color: "teal",
      trend: "+12%",
      sublabel: "Active",
    },
    {
      title: "Today's Appointments",
      value: "48",
      icon: Calendar,
      color: "blue",
      trend: "+5",
      sublabel: "Scheduled",
    },
    {
      title: "Active Emergencies",
      value: "8",
      icon: AlertTriangle,
      color: "red",
      trend: "+2",
      sublabel: "Critical",
    },
    {
      title: "Available Beds",
      value: "12/50",
      icon: Bed,
      color: "emerald",
      trend: "24%",
      sublabel: "Occupancy",
    },
  ];

  const quickAccessItems = [
    { title: "Patients", icon: Users, color: "teal", route: "patients", description: "View all patients" },
    {
      title: "Appointments",
      icon: Calendar,
      color: "blue",
      route: "appointments",
      description: "Manage schedule",
    },
    {
      title: "Lab Results",
      icon: Activity,
      color: "purple",
      route: "labreport",
      description: "View reports",
    },
    { title: "Billing", icon: DollarSign, color: "amber", route: "billing", description: "Payment records" },
    { title: "Staff", icon: UserCog, color: "indigo", route: "staff", description: "Manage staff" },
    { title: "Reports", icon: BarChart3, color: "pink", route: "reports", description: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-sm ">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Emergency Dept</h1>
                  <p className="text-xs text-slate-500">Hospital Management System</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients, doctors, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-white"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && filteredSearchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <span className="text-sm font-semibold text-slate-700">
                      Found {filteredSearchResults.length} results
                    </span>
                    <div className="relative" ref={sortRef}>
                      <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        {sortBy === "all" ? "All" : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {showSortMenu && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                          {["all", "patient", "doctor", "nurse"].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSortBy(option);
                                setShowSortMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors capitalize"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {filteredSearchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => result.type === "patient" && handleViewPatient(result)}
                        className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              result.type === "patient"
                                ? "bg-teal-100 text-teal-600"
                                : result.type === "doctor"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {getSearchIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900">{result.name}</p>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full capitalize">
                                {result.type}
                              </span>
                              {result.status && (
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full border capitalize ${getStatusColor(
                                    result.status
                                  )}`}
                                >
                                  {result.status}
                                </span>
                              )}
                            </div>
                            {result.type === "patient" && (
                              <div className="mt-1 text-sm text-slate-600">
                                <p>
                                  MR: {result.mrno} • Ward: {result.ward}
                                </p>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-700 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-700" />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <div className="h-8 w-px bg-slate-300"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || "Staff"}</p>
                </div>
                <button
                  onClick={() => setLogoutModal(true)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-slate-700 group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        {/* Date & Time Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user?.name || "User"}!</h2>
            <p className="text-slate-600">{formatDate(currentTime)}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200">
            <Clock className="w-5 h-5 text-teal-600" />
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900 font-mono">{formatTime(currentTime)}</p>
              <p className="text-xs text-slate-500">Live Time</p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-teal-600" />
              Quick Access
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              const colors = {
                teal: "from-teal-500 to-teal-600",
                blue: "from-blue-500 to-blue-600",
                purple: "from-purple-500 to-purple-600",
                amber: "from-amber-500 to-amber-600",
                indigo: "from-indigo-500 to-indigo-600",
                pink: "from-pink-500 to-pink-600",
              };

              return (
                <button
                  key={index}
                  onClick={() => handleQuickAccess(item.route)}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:scale-105 group"
                >
                  <div
                    className={`bg-gradient-to-br ${
                      colors[item.color]
                    } p-3 rounded-lg mb-3 mx-auto w-fit group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Alerts Section with Pagination */}
        {activeAlerts.length > 0 && roleConfig.showStats.includes("emergencies") && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Active Emergency Alerts</h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  {activeAlerts.length} Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAlertsPage((prev) => Math.max(1, prev - 1))}
                  disabled={alertsPage === 1}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {alertsPage} of {totalPages}
                </span>
                <button
                  onClick={() => setAlertsPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={alertsPage === totalPages}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg text-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {paginatedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white border-l-4 border-red-500 rounded-xl shadow-md hover:shadow-lg transition-all p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">{alert.severity}</span>
                    </div>
                    <span className="text-xs text-slate-500">{alert.time}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1">{alert.patient}</h3>
                  <p className="text-sm text-slate-600 mb-2">MR: {alert.mrno}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-red-500" />
                      <span className="text-slate-700">{alert.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 text-teal-500" />
                      <span className="text-slate-600">{alert.assignedTo}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            const colors = {
              teal: "from-teal-500 to-teal-600",
              blue: "from-blue-500 to-blue-600",
              emerald: "from-emerald-500 to-emerald-600",
              red: "from-red-500 to-red-600",
            };

            return (
              <div
                key={index}
                onClick={() =>
                  handleQuickAccess(
                    card.title.toLowerCase().includes("patient") ? "patients" : "appointments"
                  )
                }
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-slate-100 cursor-pointer hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-br ${colors[card.color]} p-3 rounded-xl shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {card.trend}
                  </span>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{card.sublabel}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Today's Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <button
                onClick={() => navigate("/activity")}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  action: "New patient admitted",
                  detail: "John Doe - ER-5",
                  time: "5 min ago",
                  icon: UserCheck,
                  color: "teal",
                },
                {
                  action: "Surgery completed",
                  detail: "Patient MR001234",
                  time: "12 min ago",
                  icon: Activity,
                  color: "emerald",
                },
                {
                  action: "Critical alert cleared",
                  detail: "ICU-2",
                  time: "25 min ago",
                  icon: AlertTriangle,
                  color: "amber",
                },
                {
                  action: "Lab results uploaded",
                  detail: "Patient MR001235",
                  time: "45 min ago",
                  icon: FileText,
                  color: "blue",
                },
                {
                  action: "Patient discharged",
                  detail: "Mary Smith - ER-3",
                  time: "1 hour ago",
                  icon: Users,
                  color: "slate",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className={`p-2 bg-${activity.color}-100 rounded-lg`}>
                    <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{activity.action}</p>
                    <p className="text-xs text-slate-500 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-slate-700">Avg Wait Time</span>
                </div>
                <span className="text-lg font-bold text-teal-600">18 min</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Patients Treated</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">42</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">Waiting Room</span>
                </div>
                <span className="text-lg font-bold text-amber-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Bed Occupancy</span>
                </div>
                <span className="text-lg font-bold text-blue-600">76%</span>
              </div>
              <button
                onClick={() => navigate("/emergency/new")}
                className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Emergency Case
              </button>
            </div>
          </div>
        </div>

        {/* Department Overview - Admin Only */}
        {roleConfig.canViewAll && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Department Overview</h3>
              <div className="space-y-3">
                {[
                  { dept: "Emergency Medicine", patients: 24, staff: 8, color: "teal" },
                  { dept: "ICU", patients: 12, staff: 6, color: "red" },
                  { dept: "Cardiology", patients: 18, staff: 5, color: "blue" },
                  { dept: "Neurology", patients: 15, staff: 4, color: "purple" },
                ].map((dept, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/department/${dept.dept.toLowerCase().replace(" ", "-")}`)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-${dept.color}-500`}></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{dept.dept}</p>
                        <p className="text-xs text-slate-500">{dept.staff} staff members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{dept.patients}</p>
                      <p className="text-xs text-slate-500">Patients</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-medium text-slate-700">Avg Response Time</span>
                  </div>
                  <span className="text-lg font-bold text-teal-600">6 min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">Resolved Cases</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">38</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-700">Pending Cases</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Efficiency Rate</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">94%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick View Modal */}
      <PatientQuickModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        patient={selectedPatient}
        onViewFull={handleViewFullPatient}
      />

      <style>{`
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      `}</style>

      {logoutModal && (
        <div
          id="overlay"
          className="fixed inset-0 bg-[#00000085] backdrop-blur-[2px] flex items-center justify-center z-50"
        >
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-2">Logout</h2>
            <p className="text-sm text-gray-300 mb-4">Are you sure, Do you want to logout?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLogoutModal(false)}
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button className="px-3 py-1 rounded bg-red-600 hover:bg-red-500">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboard;
