// src/pages/PatientsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Users, Heart, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../Auth/Authprovider";
import { supabaseclient } from "../Config/supabase";
import { useToast } from "../Context/ToastContext";

const PatientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info, errorToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [sortOption, setSortOption] = useState("recent");
  const [filterWard, setFilterWard] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  console.log("patient list", patients);

  useEffect(() => {
    // TODO: Replace with Supabase query
    const fetchPatients = async () => {
      setLoading(true);
      const { data, error } = await supabaseclient
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) {
        setPatients(data);
        setLoading(false);
      } else {
        console.error("Unable to fetch patients!");
        errorToast("Unable to fetch patients!");
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name?.toLowerCase().includes(q) || p.mrno?.toLowerCase().includes(q));
    }

    if (filterWard != "all") {
      result = result.filter((p) => p.room_no === filterWard);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return new Date(b.admission_date) - new Date(a.admission_date);

        case "name":
          return (a.name || "").localeCompare(b.name || "");

        case "room_no":
          return (a.room_no || "").localeCompare(b.room_no || "");

        case "blood_group":
          return (a.blood_group || "").localeCompare(b.blood_group || "");

        case "condition":
          return (a.condition || "").localeCompare(b.condition || "");

        case "department":
          return (a.department || "").localeCompare(b.department || "");

        case "doctor":
          return (a.admitting_doctor || "").localeCompare(b.admitted_doctor || "");

        case "diagnosis":
          return (a.diagnosis || "").localeCompare(b.diagnosis || "");

        case "admission_date":
          return new Date(a.admission_date) - new Date(b.admission_date);

        default:
          return 0;
      }
    });
    return result;
  }, [patients, sortOption, filterWard, searchQuery]);

  const wards = ["all", "ICU-2", "ER-5", "ER-3", "ER-1", "Trauma Bay"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

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
                  placeholder="Search by name"
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
                <option value="recent">Sort by Recent</option>
                <option value="name">Name (A-Z)</option>
                <option value="room_np">Room No</option>
                <option value="condition">Condition</option>
                <option value="department">Department</option>
                <option value="doctor">Assigned Doctor</option>
                <option value="blood_group">Blood Group</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="admission_date">Admission Date</option>
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
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient, idx) => (
              <div
                key={patient.mrno || idx}
                onClick={() => navigate(`/patient/${patient.mrno}`)}
                className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-100 hover:scale-105"
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1 ">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-900">{patient.name}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          patient.condition?.toLowerCase() === "critical"
                            ? "bg-red-100 text-red-700"
                            : patient.condition?.toLowerCase() === "stable"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {patient.condition || "Undefined"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p className="truncate max-w-[200px]" title={patient.mrno}>
                        <span className="font-medium">MRNO:</span>{" "}
                        {patient.mrno?.length > 20 ? `${patient.mrno.slice(0, 18)}...` : patient.mrno}
                      </p>
                      <div className="flex items-center gap-3">
                        <p>
                          <span className="font-medium">Room No:</span> {patient.room_no || "NA"}
                        </p>
                        <p>
                          <span className="font-medium">Bed No:</span> {patient.bed_no || "NA"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p>
                          <span className="font-medium">Condition:</span> {patient.condition || "NA"}
                        </p>
                        <p>
                          <span className="font-medium">Blood Group:</span> {patient.blood_group || "NA"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">No patients found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
