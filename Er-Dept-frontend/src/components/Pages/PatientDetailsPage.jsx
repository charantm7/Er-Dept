// src/pages/PatientDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Activity,
  FileText,
  DollarSign,
  Printer,
  Save,
  Edit,
  Phone,
  Calendar,
  Clock,
  Users,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";

const PatientDetailsPage = () => {
  const { mrno } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // TODO: Fetch patient from Supabase
    // const fetchPatient = async () => {
    //   const { data, error } = await supabase
    //     .from('patients')
    //     .select('*')
    //     .eq('mrno', mrno)
    //     .single();
    //   if (!error) setPatient(data);
    // };
    // fetchPatient();

    // Mock data for now
    setPatient({
      name: "John Smith",
      mrno: mrno,
      ward: "ICU-2",
      status: "critical",
      condition: "Cardiac Arrest",
      assignedTo: "Dr. Sarah Johnson",
    });
  }, [mrno]);

  if (!patient) {
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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-slate-600">MR Number: {patient.mrno}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Details
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => navigate(`/patient/${mrno}/forms`)}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100 hover:scale-105"
          >
            <FileText className="w-8 h-8 text-teal-600 mb-2 mx-auto" />
            <p className="font-semibold text-slate-900">Medical Forms</p>
          </button>
          <button
            onClick={() => navigate(`/patient/${mrno}/billing`)}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100 hover:scale-105"
          >
            <DollarSign className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
            <p className="font-semibold text-slate-900">Billing</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100 hover:scale-105">
            <Activity className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
            <p className="font-semibold text-slate-900">Lab Results</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100 hover:scale-105">
            <Calendar className="w-8 h-8 text-amber-600 mb-2 mx-auto" />
            <p className="font-semibold text-slate-900">Appointments</p>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl shadow-md border-b border-slate-200">
          <div className="flex gap-4 px-6 pt-4">
            {["overview", "medical-history", "vitals", "medications"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-xl shadow-md p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-teal-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Patient Name</label>
                      <p className="text-slate-900 font-semibold">{patient.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">MR Number</label>
                      <p className="text-slate-900 font-semibold">{patient.mrno}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Ward/Location</label>
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

                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    Medical Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Condition</label>
                      <p className="text-slate-900 font-semibold">{patient.condition}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Assigned Doctor</label>
                      <p className="text-slate-900 font-semibold">{patient.assignedTo}</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Admission Date</label>
                      <p className="text-slate-900">Oct 5, 2025 - 09:30 AM</p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 font-medium">Blood Group</label>
                      <p className="text-slate-900">O+</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Latest Vitals</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-slate-900">120/80</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Heart Rate</p>
                    <p className="text-xl font-bold text-slate-900">72 bpm</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Temperature</p>
                    <p className="text-xl font-bold text-slate-900">98.6°F</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">SpO2</p>
                    <p className="text-xl font-bold text-slate-900">98%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
