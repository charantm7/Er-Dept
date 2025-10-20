import React, { useState, useEffect } from "react";

import { Search, Filter, DollarSign, Calendar, User, Download, RefreshCw } from "lucide-react";
import { supabaseclient } from "../Config/supabase";
import { useAuth } from "../Auth/Authprovider";
import { useNavigate } from "react-router-dom";

const ROLE_CONFIG = {
  admin: {
    canViewAllAnalytics: true,
    canDownloadReceipt: true,
  },
  doctor: {
    canViewAllAnalytics: false,
    canDownloadReceipt: true,
  },
  nurse: {
    canViewAllAnalytics: false,
    canDownloadReceipt: true,
  },
};

export default function PatientBillingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billings, setBillings] = useState([]);
  const [filteredBillings, setFilteredBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  const roleConfig = ROLE_CONFIG[user?.user_metadata?.role] || ROLE_CONFIG.nurse;

  // Fetch billing data from Supabase
  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseclient
        .from("billing_transactions")
        .select("*, patient_mrno(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBillings(data || []);
      setFilteredBillings(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching billings:", error);
      // Demo data for testing
      const demoData = [
        {
          id: 1,
          patient_name: "John Doe",
          patient_id: "PT001",
          amount: 1250.0,
          status: "paid",
          invoice_number: "INV-2024-001",
          date: "2024-10-10",
          service: "General Consultation",
        },
        {
          id: 2,
          patient_name: "Sarah Smith",
          patient_id: "PT002",
          amount: 850.5,
          status: "pending",
          invoice_number: "INV-2024-002",
          date: "2024-10-12",
          service: "Lab Tests",
        },
        {
          id: 3,
          patient_name: "Michael Johnson",
          patient_id: "PT003",
          amount: 2100.0,
          status: "overdue",
          invoice_number: "INV-2024-003",
          date: "2024-09-25",
          service: "Surgery",
        },
        {
          id: 4,
          patient_name: "Emily Davis",
          patient_id: "PT004",
          amount: 450.0,
          status: "paid",
          invoice_number: "INV-2024-004",
          date: "2024-10-11",
          service: "X-Ray",
        },
        {
          id: 5,
          patient_name: "David Wilson",
          patient_id: "PT005",
          amount: 1800.0,
          status: "pending",
          invoice_number: "INV-2024-005",
          date: "2024-10-13",
          service: "Physical Therapy",
        },
      ];
      setBillings(demoData);
      setFilteredBillings(demoData);
      calculateStats(demoData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const paid = data
      .filter((b) => b.status === "paid")
      .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const pending = data
      .filter((b) => b.status === "pending")
      .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    const overdue = data
      .filter((b) => b.status === "overdue")
      .reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);

    setStats({ total, paid, pending, overdue });
  };

  // Filter billings based on search and status
  useEffect(() => {
    let filtered = billings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (bill) =>
          bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((bill) => bill.status === statusFilter);
    }

    setFilteredBillings(filtered);
  }, [searchTerm, statusFilter, billings]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Patient Billing</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and track all patient billing records</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer border border-gray-300 hover:border-blue-500 px-3 py-1 rounded-sm bg-gray-100 shadow-2xl"
          >
            Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        {roleConfig.canViewAllAnalytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
                </div>
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Paid</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(stats.paid)}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.pending)}
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Overdue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.overdue)}
                  </p>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search patient, ID, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <button
              onClick={fetchBillings}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBillings.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-gray-500 text-base sm:text-lg">No billing records found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBillings.map((billing) => (
                      <tr key={billing.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{billing.patient_mrno.mrno}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {billing.patient_mrno.name}
                              </div>
                              <div className="text-sm text-gray-500">{billing.patient_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{billing.service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(billing.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(billing.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              billing.status
                            )}`}
                          >
                            {billing.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredBillings.map((billing) => (
                  <div key={billing.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm sm:text-base font-medium text-gray-900">
                            {billing.patient_name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">{billing.patient_id}</div>
                        </div>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          billing.status
                        )}`}
                      >
                        {billing.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Invoice:</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {billing.invoice_number}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Service:</span>
                        <span className="text-xs sm:text-sm text-gray-900">{billing.service}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Date:</span>
                        <span className="text-xs sm:text-sm text-gray-900 flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                          {formatDate(billing.date)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-sm sm:text-base font-semibold text-gray-900">Amount:</span>
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(billing.amount)}
                        </span>
                      </div>
                    </div>

                    <button className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-900 font-medium flex items-center justify-center gap-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
          Showing {filteredBillings.length} of {billings.length} billing records
        </div>
      </div>
    </div>
  );
}
