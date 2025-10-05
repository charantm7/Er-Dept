// src/pages/AppointmentsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  Clock,
  Stethoscope,
  Users,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { success, info } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: Fetch from Supabase
    // const fetchAppointments = async () => {
    //   const { data, error } = await supabase
    //     .from('appointments')
    //     .select('*, patients(*), doctors(*)')
    //     .order('date', { ascending: true });
    //   if (!error) setAppointments(data);
    // };

    // Mock data
    setAppointments([
      {
        id: 1,
        patient: "John Doe",
        mrno: "MR001234",
        time: "09:00 AM",
        date: "2025-10-05",
        doctor: "Dr. Sarah Johnson",
        dept: "Cardiology",
        status: "completed",
        payment: "paid",
      },
      {
        id: 2,
        patient: "Jane Smith",
        mrno: "MR001235",
        time: "10:30 AM",
        date: "2025-10-05",
        doctor: "Dr. Robert Wilson",
        dept: "Emergency",
        status: "in-progress",
        payment: "pending",
      },
      {
        id: 3,
        patient: "Mike Brown",
        mrno: "MR001236",
        time: "11:00 AM",
        date: "2025-10-05",
        doctor: "Dr. James Taylor",
        dept: "Neurology",
        status: "scheduled",
        payment: "pending",
      },
      {
        id: 4,
        patient: "Sarah Davis",
        mrno: "MR001237",
        time: "02:00 PM",
        date: "2025-10-05",
        doctor: "Dr. Sarah Johnson",
        dept: "Cardiology",
        status: "scheduled",
        payment: "pending",
      },
      {
        id: 5,
        patient: "Tom Wilson",
        mrno: "MR001238",
        time: "03:30 PM",
        date: "2025-10-05",
        doctor: "Dr. Priya Sharma",
        dept: "Pediatrics",
        status: "cancelled",
        payment: "refunded",
      },
    ]);
  }, []);

  const handleCheckIn = (appointmentId) => {
    success("Patient checked in successfully!");
    // TODO: Update in Supabase
  };

  const handleCancel = (appointmentId) => {
    info("Appointment cancelled");
    // TODO: Update in Supabase
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "scheduled":
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "scheduled":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.mrno.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Appointments Management</h1>
              <p className="text-slate-600">View and manage all patient appointments</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => info("Exporting appointments...")}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={() => success("Refreshed!")}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
            <button
              onClick={() => navigate("/appointments/new")}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Appointment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name or MR number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100">
            <p className="text-sm text-slate-600 mb-1">Total Appointments</p>
            <p className="text-2xl font-bold text-slate-900">{filteredAppointments.length}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl shadow-md border border-emerald-100">
            <p className="text-sm text-emerald-700 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-900">
              {filteredAppointments.filter((a) => a.status === "completed").length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-100">
            <p className="text-sm text-blue-700 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-900">
              {filteredAppointments.filter((a) => a.status === "in-progress").length}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl shadow-md border border-amber-100">
            <p className="text-sm text-amber-700 mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-amber-900">
              {filteredAppointments.filter((a) => a.status === "scheduled").length}
            </p>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{appointment.patient}</p>
                          <p className="text-xs text-slate-500">{appointment.mrno}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{appointment.doctor}</p>
                          <p className="text-xs text-slate-500">{appointment.dept}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">{appointment.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(appointment.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          appointment.payment === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : appointment.payment === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {appointment.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === "scheduled" && (
                          <button
                            onClick={() => handleCheckIn(appointment.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        {(appointment.status === "scheduled" || appointment.status === "in-progress") && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/patient/${appointment.mrno}`)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
