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
  Edit,
  Trash2,
  Download,
  Send,
  Eye,
  Save,
  XCircle,
  Upload,
  Printer,
} from "lucide-react";
import { useAuth } from "../Auth/Authprovider";
import { useToast } from "../Context/ToastContext";

// Modal Components
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

// Patient Details Modal
const PatientDetailsModal = ({ isOpen, onClose, patient, onOpenForms, onOpenBilling }) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Details" size="large">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <button
            onClick={() => onOpenForms(patient)}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Medical Forms
          </button>
          <button
            onClick={() => onOpenBilling(patient)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Billing & Receipt
          </button>
          <button className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <Printer className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
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

          {/* Medical Info */}
          <div className="bg-slate-50 rounded-xl p-6 space-y-4">
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

        {/* Treatment History */}
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Treatment History</h3>
          <div className="space-y-3">
            {[
              {
                date: "Oct 5, 2025 10:30 AM",
                treatment: "Emergency care administered",
                doctor: "Dr. Sarah Johnson",
              },
              {
                date: "Oct 5, 2025 09:45 AM",
                treatment: "Initial assessment completed",
                doctor: "Dr. Sarah Johnson",
              },
              { date: "Oct 5, 2025 09:30 AM", treatment: "Patient admitted to ER", doctor: "Triage Nurse" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-lg flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{item.treatment}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.date} • {item.doctor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Medical Forms Modal
const MedicalFormsModal = ({ isOpen, onClose, patient }) => {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    notes: "",
  });

  const handleSave = () => {
    success("Medical form saved successfully!");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Medical Forms - ${patient?.name}`} size="large">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Diagnosis</label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter diagnosis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
            <input
              type="text"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Enter symptoms"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Treatment Plan</label>
          <textarea
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            placeholder="Describe treatment plan..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Medications</label>
          <textarea
            value={formData.medications}
            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            placeholder="List medications..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Form
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Billing Modal
const BillingModal = ({ isOpen, onClose, patient }) => {
  const { success } = useToast();
  const [billingItems, setBillingItems] = useState([
    { id: 1, item: "Emergency Consultation", amount: 1500, qty: 1 },
    { id: 2, item: "ECG Test", amount: 800, qty: 1 },
    { id: 3, item: "Medications", amount: 2500, qty: 1 },
  ]);

  const total = billingItems.reduce((sum, item) => sum + item.amount * item.qty, 0);

  const handlePrint = () => {
    success("Generating receipt...");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Billing - ${patient?.name}`} size="large">
      <div className="space-y-6">
        {/* Patient Info */}
        <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500">Patient Name</p>
            <p className="font-semibold text-slate-900">{patient?.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">MR Number</p>
            <p className="font-semibold text-slate-900">{patient?.mrno}</p>
          </div>
        </div>

        {/* Billing Items */}
        <div>
          <h3 className="font-bold text-slate-900 mb-3">Billing Items</h3>
          <div className="space-y-2">
            {billingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.item}</p>
                  <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                </div>
                <p className="font-bold text-slate-900">₹{item.amount * item.qty}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600">Subtotal</p>
            <p className="font-semibold text-slate-900">₹{total}</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600">Tax (5%)</p>
            <p className="font-semibold text-slate-900">₹{(total * 0.05).toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <p className="text-lg font-bold text-slate-900">Total Amount</p>
            <p className="text-2xl font-bold text-teal-600">₹{(total * 1.05).toFixed(2)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Receipt
          </button>
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            Send to Patient
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Appointments Modal
const AppointmentsModal = ({ isOpen, onClose }) => {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "John Doe",
      mrno: "MR001234",
      time: "09:00 AM",
      doctor: "Dr. Sarah Johnson",
      status: "completed",
    },
    {
      id: 2,
      patient: "Jane Smith",
      mrno: "MR001235",
      time: "10:30 AM",
      doctor: "Dr. Robert Wilson",
      status: "in-progress",
    },
    {
      id: 3,
      patient: "Mike Brown",
      mrno: "MR001236",
      time: "11:00 AM",
      doctor: "Dr. James Taylor",
      status: "scheduled",
    },
    {
      id: 4,
      patient: "Sarah Davis",
      mrno: "MR001237",
      time: "02:00 PM",
      doctor: "Dr. Sarah Johnson",
      status: "scheduled",
    },
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Today's Appointments" size="large">
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-slate-900">{apt.patient}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      apt.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : apt.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {apt.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {apt.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />
                    {apt.doctor}
                  </span>
                  <span>MR: {apt.mrno}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// Patients List Modal with Sorting
const PatientsListModal = ({ isOpen, onClose, onSelectPatient }) => {
  const [patients, setPatients] = useState(MOCK_SEARCH_DATA.filter((p) => p.type === "patient"));
  const [sortOption, setSortOption] = useState("recent");
  const [filterWard, setFilterWard] = useState("all");

  const wards = ["all", "ICU-2", "ER-5", "ER-3", "ER-1"];

  const sortedPatients = [...patients]
    .sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "status") return a.status.localeCompare(b.status);
      return 0; // recent
    })
    .filter((p) => filterWard === "all" || p.ward === filterWard);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="All Patients" size="xlarge">
      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Sort By</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Filter by Ward</label>
          <select
            value={filterWard}
            onChange={(e) => setFilterWard(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward === "all" ? "All Wards" : ward}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => {
              onSelectPatient(patient);
              onClose();
            }}
            className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Heart className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-slate-900">{patient.name}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    <span className="font-medium">MR:</span> {patient.mrno}
                  </p>
                  <p>
                    <span className="font-medium">Ward:</span> {patient.ward}
                  </p>
                  <p>
                    <span className="font-medium">Condition:</span> {patient.condition}
                  </p>
                  <p className="text-xs text-teal-600 mt-2">
                    <span className="font-medium">Assigned:</span> {patient.assignedTo}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// Doctors List Modal
const DoctorsListModal = ({ isOpen, onClose }) => {
  const [doctors] = useState(MOCK_SEARCH_DATA.filter((d) => d.type === "doctor"));
  const [filterDept, setFilterDept] = useState("all");

  const departments = ["all", "Emergency Medicine", "Cardiology", "Neurology"];
  const filteredDoctors = filterDept === "all" ? doctors : doctors.filter((d) => d.dept === filterDept);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Staff - Doctors" size="large">
      {/* Filter */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-slate-600 mb-2">Filter by Department</label>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === "all" ? "All Departments" : dept}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{doctor.name}</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>
                      <span className="font-medium">Department:</span> {doctor.dept}
                    </p>
                    <p>
                      <span className="font-medium">Specialization:</span> {doctor.specialization}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        {doctor.patients} patients
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          doctor.shift === "On Duty"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {doctor.shift}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// Mock Data
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
    name: "Dr. Robert Wilson",
    type: "doctor",
    dept: "Cardiology",
    shift: "On Call",
    specialization: "Cardiac Surgery",
    patients: 8,
  },
  {
    id: 6,
    name: "Anna Martinez",
    type: "patient",
    ward: "ER-3",
    condition: "Asthma Attack",
    status: "moderate",
    mrno: "MR001236",
    assignedTo: "Dr. James Taylor",
  },
  {
    id: 7,
    name: "Lisa Anderson",
    type: "nurse",
    dept: "ICU",
    shift: "Day Shift",
    station: "ICU-1",
    patients: 6,
  },
  {
    id: 8,
    name: "Dr. James Taylor",
    type: "doctor",
    dept: "Neurology",
    shift: "On Duty",
    specialization: "Neurosurgery",
    patients: 10,
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
];

// Role-based permissions
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

const UnifiedDashboard = () => {
  const { user, logout } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(EMERGENCY_ALERTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sortBy, setSortBy] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showFormsModal, setShowFormsModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showPatientsListModal, setShowPatientsListModal] = useState(false);
  const [showDoctorsListModal, setShowDoctorsListModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const searchRef = useRef(null);
  const sortRef = useRef(null);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.nurse;
  user?.role || ROLE_CONFIG.nurse;

  // Update clock every second
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

      // Apply role-based filtering
      if (!roleConfig.canViewAll) {
        results = results.filter((item) => {
          if (item.type === "patient") {
            return item.assignedTo === user?.name;
          }
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success("Dashboard refreshed!");
    setLoading(false);
  };

  const handleAcknowledgeAlert = (id) => {
    setActiveAlerts((prev) => prev.filter((alert) => alert.id !== id));
    success("Emergency alert acknowledged");
  };

  const handleNewEmergency = () => {
    info("Opening new emergency case form...");
    // Navigate to form or open modal
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
    setShowSearchResults(false);
  };

  const handleOpenForms = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(false);
    setShowFormsModal(true);
  };

  const handleOpenBilling = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(false);
    setShowBillingModal(true);
  };

  const handleStatCardClick = (statType) => {
    if (statType === "appointments") {
      setShowAppointmentsModal(true);
    } else if (statType === "patients") {
      setShowPatientsListModal(true);
    } else {
      info(`Opening ${statType} details...`);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "patients":
        setShowPatientsListModal(true);
        break;
      case "doctors":
        setShowDoctorsListModal(true);
        break;
      case "appointments":
        setShowAppointmentsModal(true);
        break;
      default:
        info(`Opening ${action}...`);
    }
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

  const getStatsForRole = () => {
    const allStats = {
      admin: [
        {
          title: "Total Patients",
          value: "1,245",
          icon: Users,
          color: "teal",
          trend: "+12%",
          sublabel: "This month",
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
          title: "Pending Bills",
          value: "₹2.4M",
          icon: DollarSign,
          color: "amber",
          trend: "23 pending",
          sublabel: "Outstanding",
        },
        {
          title: "Active Emergencies",
          value: "8",
          icon: AlertTriangle,
          color: "red",
          trend: "+2",
          sublabel: "Critical cases",
        },
        {
          title: "Available Beds",
          value: "12/50",
          icon: Bed,
          color: "emerald",
          trend: "24%",
          sublabel: "Occupancy",
        },
        {
          title: "Staff On Duty",
          value: "48",
          icon: UserCog,
          color: "purple",
          trend: "100%",
          sublabel: "Full capacity",
        },
      ],
      doctor: [
        {
          title: "My Patients",
          value: "24",
          icon: Users,
          color: "teal",
          trend: "+3",
          sublabel: "Active cases",
        },
        {
          title: "Today's Schedule",
          value: "12",
          icon: Calendar,
          color: "blue",
          trend: "7 done",
          sublabel: "Appointments",
        },
        {
          title: "Pending Reports",
          value: "8",
          icon: ClipboardList,
          color: "amber",
          trend: "2 urgent",
          sublabel: "To review",
        },
        {
          title: "Emergency Cases",
          value: "3",
          icon: AlertTriangle,
          color: "red",
          trend: "1 critical",
          sublabel: "Assigned",
        },
      ],
      nurse: [
        {
          title: "Assigned Patients",
          value: "15",
          icon: Users,
          color: "teal",
          trend: "+2",
          sublabel: "Active",
        },
        {
          title: "Today's Tasks",
          value: "28",
          icon: ClipboardList,
          color: "blue",
          trend: "18 done",
          sublabel: "Remaining 10",
        },
        {
          title: "Vitals Pending",
          value: "6",
          icon: Activity,
          color: "amber",
          trend: "2 overdue",
          sublabel: "To check",
        },
        {
          title: "Emergency Alerts",
          value: "2",
          icon: AlertTriangle,
          color: "red",
          trend: "Active",
          sublabel: "Requires attention",
        },
      ],
    };
    return allStats[user?.role] || allStats.nurse;
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

  const statsCards = getStatsForRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-sm ">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Menu */}
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
                  placeholder="Search patients, doctors, staff... (min 2 chars)"
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
                        onClick={() => handleViewPatient(result)}
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
                                  MR No: {result.mrno} • Ward: {result.ward}
                                </p>
                                <p className="text-xs mt-0.5">Condition: {result.condition}</p>
                                <p className="text-xs mt-0.5 text-teal-600">Assigned: {result.assignedTo}</p>
                              </div>
                            )}
                            {result.type === "doctor" && (
                              <div className="mt-1 text-sm text-slate-600">
                                <p>
                                  {result.dept} • {result.specialization}
                                </p>
                                <p className="text-xs mt-0.5">
                                  {result.shift} • {result.patients} patients
                                </p>
                              </div>
                            )}
                            {result.type === "nurse" && (
                              <div className="mt-1 text-sm text-slate-600">
                                <p>
                                  {result.dept} • Station: {result.station}
                                </p>
                                <p className="text-xs mt-0.5">
                                  {result.shift} • {result.patients} patients
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

              {showSearchResults && filteredSearchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50">
                  <p className="text-center text-slate-500">No results found for "{searchQuery}"</p>
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
                  onClick={handleLogout}
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

        {/* Emergency Alerts Section */}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {activeAlerts.map((alert) => (
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
                  <p className="text-sm text-slate-600 mb-2">MR No: {alert.mrno}</p>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            const colors = {
              teal: "from-teal-500 to-teal-600",
              blue: "from-blue-500 to-blue-600",
              emerald: "from-emerald-500 to-emerald-600",
              purple: "from-purple-500 to-purple-600",
              amber: "from-amber-500 to-amber-600",
              red: "from-red-500 to-red-600",
            };

            return (
              <div
                key={index}
                onClick={() =>
                  handleStatCardClick(
                    card.title.toLowerCase().includes("appointment") ? "appointments" : "patients"
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

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors">
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {roleConfig.canManageUsers && (
                <button
                  onClick={() => info("Opening user management...")}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <UserCog className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Manage Staff</p>
                      <p className="text-xs text-slate-500">View and edit users</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleQuickAction("appointments")}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">View Appointments</p>
                    <p className="text-xs text-slate-500">Today's schedule</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction("patients")}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">All Patients</p>
                    <p className="text-xs text-slate-500">Browse & filter</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction("doctors")}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Medical Staff</p>
                    <p className="text-xs text-slate-500">Doctors & nurses</p>
                  </div>
                </div>
              </button>

              {roleConfig.canViewReports && (
                <button
                  onClick={() => info("Generating reports...")}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">View Reports</p>
                      <p className="text-xs text-slate-500">Analytics & insights</p>
                    </div>
                  </div>
                </button>
              )}

              {roleConfig.canManageBilling && (
                <button
                  onClick={() => info("Opening billing system...")}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Billing</p>
                      <p className="text-xs text-slate-500">Manage payments</p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={handleNewEmergency}
                className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Emergency Case
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section - Role Based */}
        {roleConfig.canViewAll && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Overview */}
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

            {/* Today's Statistics */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Performance</h3>
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
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PatientDetailsModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patient={selectedPatient}
        onOpenForms={handleOpenForms}
        onOpenBilling={handleOpenBilling}
      />

      <MedicalFormsModal
        isOpen={showFormsModal}
        onClose={() => setShowFormsModal(false)}
        patient={selectedPatient}
      />

      <BillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        patient={selectedPatient}
      />

      <AppointmentsModal isOpen={showAppointmentsModal} onClose={() => setShowAppointmentsModal(false)} />

      <PatientsListModal
        isOpen={showPatientsListModal}
        onClose={() => setShowPatientsListModal(false)}
        onSelectPatient={handleViewPatient}
      />

      <DoctorsListModal isOpen={showDoctorsListModal} onClose={() => setShowDoctorsListModal(false)} />

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
    </div>
  );
};

export default UnifiedDashboard;
