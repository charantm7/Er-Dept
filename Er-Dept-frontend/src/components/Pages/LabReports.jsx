import React, { useEffect, useState } from "react";
import { supabaseclient } from "../Config/supabase";
import { Search, Filter, ArrowLeft, FileText, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LabReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  // ✅ Fetch data from Supabase
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
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ✅ Filter and Search logic
  useEffect(() => {
    let filtered = [...reports];

    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          r.test_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [statusFilter, search, reports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 sm:p-6">
      <div className="mx-auto bg-white shadow-lg rounded-2xl p-6 border border-blue-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-5">
            <ArrowLeft onClick={() => navigate(-1)} />
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
                placeholder="Search by patient or test..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none appearance-none"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="ml-3 text-gray-600">Fetching lab reports...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center text-red-600 bg-red-50 border border-red-200 py-4 rounded-lg">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredReports.length === 0 && (
          <p className="text-center text-gray-500 py-10">No lab reports found.</p>
        )}

        {/* Report Grid */}
        {!loading && filteredReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{report.mrno.name}</h2>
                  <p className="text-sm text-gray-500">{report.test_name}</p>

                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {report.ordered_by.name || "N/A"}
                    </p>
                    <p className="truncate">
                      <strong>Remarks:</strong> {report.remarks || "—"}
                    </p>
                  </div>

                  <span
                    className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${
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

                {report.report_url && (
                  <button
                    onClick={() => window.open(report.report_url, "_blank")}
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition"
                  >
                    <ExternalLink size={16} /> View Report
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReports;
