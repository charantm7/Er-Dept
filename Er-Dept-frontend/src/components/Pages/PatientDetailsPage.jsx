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
  History,
  Eye,
  Pencil,
  X,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";
import { supabaseclient } from "../Config/supabase";
import { useAuth } from "../Auth/Authprovider";

const ROLE_CONFIG = {
  admin: {
    canViewAll: true,
    canOverwriteFormHistory: true,
    canEditPatientDetails: true,
    canViewFormHistory: true,
    CanEditDetails: true,
    canManageUsers: true,
    canManageBilling: true,
    canViewReports: true,
    options: ["medicalforms", "billing", "labresults", "appointments"],
  },
  doctor: {
    canViewAll: false,
    canEditPatientDetails: true,
    canOverwriteFormHistory: false,
    canViewFormHistory: true,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: true,
    options: ["medicalforms", "billing", "labresults", "appointments"],
  },
  nurse: {
    canViewAll: false,
    canEditPatientDetails: true,
    canOverwriteFormHistory: false,
    canViewFormHistory: true,
    canManageUsers: false,
    canManageBilling: false,
    canViewReports: false,
    options: ["medicalforms", "billing", "labresults", "appointments"],
  },
};

const PatientDetailsPage = () => {
  const { mrno } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { success, errorToast: showError, info } = useToast();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showHistory, setShowHistory] = useState(false);
  const [formHistory, setFormHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formAction, setFormAction] = useState(null);

  const roleConfig = ROLE_CONFIG[user?.user_metadata?.role] || ROLE_CONFIG.nurse;

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabaseclient.from("users").select("*").eq("mrno", mrno).single();
      if (!error) setPatient(data);
    };
    fetchPatient();
  }, [mrno]);

  useEffect(() => {
    if (mrno) fetchFormHistory();
  }, [mrno]);

  const fetchFormHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabaseclient
        .from("patient_er_forms")
        .select("*")
        .eq("patient_mrno", mrno)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFormHistory(data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      showError("Failed to load form history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setFormAction("view");
    setShowFormModal(true);
  };

  const handleOverwriteForm = (form) => {
    setSelectedForm(form);
    setFormAction("overwrite");
    setShowFormModal(true);
  };

  const handleFormSave = async (formData) => {
    if (!selectedForm) return;

    try {
      info("Saving form...");

      // Create new version with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${mrno}/${selectedForm.form_name.replace(/\s+/g, "_")}_v${timestamp}.html`;

      // Create HTML content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0066cc; text-align: center;">${selectedForm.form_name}</h1>
          <h2 style="color: #0066cc; text-align: center;">CURA HOSPITALS</h2>
          <hr>
          <div style="white-space: pre-wrap;">${JSON.stringify(formData, null, 2)}</div>
        </div>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });

      // Upload new version
      const { error: uploadError } = await supabaseclient.storage.from("er_forms").upload(fileName, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "text/html",
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseclient.storage.from("er_forms").getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabaseclient.from("patient_er_forms").insert([
        {
          patient_mrno: mrno,
          form_name: selectedForm.form_name,
          file_url: urlData.publicUrl,
          file_path: fileName,
          file_type: "text/html",
          file_size: blob.size,
          parent_form_id: selectedForm.id, // Link to original form
        },
      ]);

      if (dbError) throw dbError;

      success("Form saved successfully!");
      setShowFormModal(false);
      fetchFormHistory();
    } catch (err) {
      showError(`Failed to save: ${err.message}`);
    }
  };

  const downloadForm = async (form) => {
    try {
      const response = await fetch(form.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.form_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showError("Download failed");
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 p-6">
      <div className="max-w-8xl mx-auto flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patients")}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
                <p className="text-slate-600">MR Number: {patient.mrno}</p>
              </div>
            </div>
            <div className="flex gap-3">
              {roleConfig.canViewFormHistory && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                    showHistory
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <History className="w-5 h-5" />
                  Form History
                </button>
              )}
              {roleConfig.canEditPatientDetails && (
                <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Details
                </button>
              )}
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
              {["overview"].map((tab) => (
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

        {/* History Sidebar */}
        <div
          className={`bg-white shadow-lg rounded-xl border border-slate-200 transition-all duration-300 ${
            showHistory ? "w-96" : "w-0"
          } overflow-hidden`}
        >
          {showHistory && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-900">Form History</h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-scroll max-h-[95vh] p-4">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-teal-500" size={24} />
                    <span className="ml-2 text-slate-500">Loading...</span>
                  </div>
                ) : formHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No forms saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 ">
                    {formHistory.map((form) => (
                      <div
                        key={form.id}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-slate-900 truncate">{form.form_name}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(form.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {(form.file_size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {roleConfig.canViewFormHistory && (
                            <button
                              onClick={() => handleViewForm(form)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                              <Eye size={12} />
                              View
                            </button>
                          )}
                          {roleConfig.canOverwriteFormHistory && (
                            <button
                              onClick={() => handleOverwriteForm(form)}
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-teal-600 text-white px-2 py-1 rounded hover:bg-teal-700 transition-colors"
                            >
                              <Pencil size={12} />
                              Overwrite
                            </button>
                          )}

                          <button
                            onClick={() => downloadForm(form)}
                            className="flex items-center justify-center gap-1 text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {formAction === "view" ? "View Form" : "Overwrite Form"}
                </h2>
                <p className="text-sm text-slate-500">{selectedForm.form_name}</p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {formAction === "view" ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Form Details</h3>
                    <p>
                      <strong>Created:</strong> {new Date(selectedForm.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Size:</strong> {(selectedForm.file_size / 1024).toFixed(0)} KB
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedForm.file_type}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.open(selectedForm.file_url, "_blank")}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => downloadForm(selectedForm)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Overwrite Form</h3>
                    <p className="text-sm text-amber-700">
                      This will create a new version of the form. The original will be preserved in history.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        console.log("Selected form for overwrite:", selectedForm);
                        console.log("MRNO:", mrno);
                        console.log("Form ID:", selectedForm?.id);
                        console.log("Form Name:", selectedForm?.form_name);

                        if (!selectedForm?.id || !selectedForm?.form_name) {
                          showError("Form data is incomplete. Cannot proceed with overwrite.");
                          return;
                        }

                        // Store overwrite data in localStorage for reliable passing
                        const overwriteData = {
                          formId: selectedForm.id,
                          formName: selectedForm.form_name,
                          timestamp: Date.now(),
                        };

                        localStorage.setItem("overwriteFormData", JSON.stringify(overwriteData));
                        console.log("Stored overwrite data:", overwriteData);

                        setShowFormModal(false);
                        navigate(`/patient/${mrno}/forms`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Pencil size={16} />
                      Open Form Editor
                    </button>
                    <button
                      onClick={() => setShowFormModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;
