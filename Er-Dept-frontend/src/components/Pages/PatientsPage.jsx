// src/pages/PatientsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Users, Heart, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../Auth/Authprovider";

const PatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [sortOption, setSortOption] = useState("recent");
  const [filterWard, setFilterWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // TODO: Replace with Supabase query
    // const fetchPatients = async () => {
    //   const { data, error } = await supabase
    //     .from('patients')
    //     .select('*')
    //     .order('created_at', { ascending: false });
    //   if (!error) setPatients(data);
    // };
    // fetchPatients();
  }, []);

  const wards = ["all", "ICU-2", "ER-5", "ER-3", "ER-1", "Trauma Bay"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">All Patients</h1>
              <p className="text-slate-600">Manage and view all patient records</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Patients</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, MR number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="recent">Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="status">Status</option>
                <option value="ward">Ward</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Ward</label>
              <select
                value={filterWard}
                onChange={(e) => setFilterWard(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward === "all" ? "All Wards" : ward}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TODO: Map through patients from Supabase */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              onClick={() => navigate(`/patient/MR00123${i}`)}
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-100 hover:scale-105"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Heart className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-slate-900">Patient Name {i}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      STABLE
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      <span className="font-medium">MR:</span> MR00123{i}
                    </p>
                    <p>
                      <span className="font-medium">Ward:</span> ER-{i}
                    </p>
                    <p>
                      <span className="font-medium">Condition:</span> Sample Condition
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
