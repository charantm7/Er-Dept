import React, { useEffect, useState } from "react";
import { supabaseclient } from "../Config/supabase";
import {
  Search,
  Filter,
  ArrowLeft,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  Download,
  Calendar,
  User,
  Clock,
  ChevronDown,
  Eye,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LabReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFilter, setDateFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
  });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseclient
          .from("lab_reports")
          .select(
            `
          *,
          mrno (*),
          test_id (*),
          appointment_id (*),
          ordered_by (*)
        `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        setReports(data);
        setFilteredReports(data);

        // Calculate stats
        const statsData = {
          total: data.length,
          completed: data.filter((r) => r.status === "Completed").length,
          pending: data.filter((r) => r.status === "Pending").length,
          inProgress: data.filter((r) => r.status === "In Progress").length,
        };
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const refreshReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseclient
        .from("lab_reports")
        .select(
          `
          *,
          mrno (*),
          test_id (*),
          appointment_id (*),
          ordered_by (*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data);
      setFilteredReports(data);

      const statsData = {
        total: data.length,
        completed: data.filter((r) => r.status === "Completed").length,
        pending: data.filter((r) => r.status === "Pending").length,
        inProgress: data.filter((r) => r.status === "In Progress").length,
      };
      setStats(statsData);
    } catch (err) {
      console.error("Error refreshing reports:", err);
      setError("Failed to refresh reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...reports];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (r) =>
          (r.mrno?.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.test_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.ordered_by?.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "All") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((r) => {
        const reportDate = new Date(r.created_at);
        const reportDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());

        switch (dateFilter) {
          case "Today":
            return reportDay.getTime() === today.getTime();
          case "This Week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return reportDay >= weekAgo;
          case "This Month":
            return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "patient_name":
          aValue = a.mrno?.name || "";
          bValue = b.mrno?.name || "";
          break;
        case "test_name":
          aValue = a.test_name || "";
          bValue = b.test_name || "";
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "created_at":
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [statusFilter, search, reports, dateFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const downloadReport = async (report) => {
    if (report.report_url) {
      try {
        const response = await fetch(report.report_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.mrno?.name || "report"}_${report.test_name || "lab_report"}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-blue-100 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={28} /> Lab Reports
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by patient, test, or doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={18} />
                Filters
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </button>

              {/* Refresh */}
              <button
                onClick={refreshReports}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText size={24} className="text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <TrendingUp size={24} className="text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock size={24} className="text-yellow-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <TrendingDown size={24} className="text-purple-200" />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <option value="All">All Time</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    >
                      <option value="created_at">Date</option>
                      <option value="patient_name">Patient</option>
                      <option value="test_name">Test</option>
                      <option value="status">Status</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-2xl border border-blue-100">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="ml-3 text-gray-600">Fetching lab reports...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-center text-red-600 bg-red-50 border border-red-200 py-4 rounded-lg m-6">
              <AlertCircle className="mr-2" /> {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredReports.length === 0 && (
            <div className="text-center py-20">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No lab reports found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Report Grid */}
          {!loading && filteredReports.length > 0 && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {filteredReports.length} of {reports.length} reports
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {report.mrno?.name || "Unknown Patient"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{report.test_name || "Unknown Test"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              report.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : report.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>
                            {new Date(report.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span>{report.ordered_by?.name || "N/A"}</span>
                        </div>
                        {report.remarks && (
                          <div className="flex items-start gap-2">
                            <FileText size={14} className="text-gray-400 mt-0.5" />
                            <span className="text-xs text-gray-500 line-clamp-2">{report.remarks}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {report.report_url && (
                        <>
                          <button
                            onClick={() => viewReport(report)}
                            className="flex-1 flex items-center justify-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition-colors"
                          >
                            <Eye size={16} /> View
                          </button>
                          <button
                            onClick={() => downloadReport(report)}
                            className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-3 transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      )}
                      {!report.report_url && (
                        <div className="flex-1 text-center text-sm text-gray-400 py-2">
                          No report available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Report Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedReport.mrno?.name || "Unknown Patient"}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedReport.test_name}</p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {selectedReport.report_url ? (
                  <iframe
                    src={selectedReport.report_url}
                    className="w-full h-96 border border-gray-200 rounded-lg"
                    title="Lab Report"
                  />
                ) : (
                  <div className="text-center py-20">
                    <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No report available</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedReport.report_url && (
                  <button
                    onClick={() => downloadReport(selectedReport)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} /> Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReports;
