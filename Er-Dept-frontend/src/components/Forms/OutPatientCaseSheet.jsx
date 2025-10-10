import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

const OutPatientCaseSheet = ({
  patient,
  onSave,
  onPrint,
  overwriteData,
  overwriteFormId,
  loadingOverwriteData,
}) => {
  const [formData, setFormData] = useState({
    // Patient Information
    name: patient?.name || "",
    age: "",
    dob: "",
    sex: "",
    phId: "",
    date: new Date().toLocaleDateString(),

    // Consultation Details
    consultant: "",
    department: "",
    referringDr: "",
    consultType: "New", // New / Follow Up / Revisit

    // Vitals
    weight: "",
    height: "",
    bmi: "",
    heartRate: "",
    grbs: "",
    bloodPressure: "",
    spO2: "",

    // Clinical Information
    presentingComplaints: "",
    historyOfPresentIllness: "",
    pastMedicalHistory: "",
    examination: "",
    provisionalDiagnosis: "",
    advice: "",
    followUp: "",
    allergy: "",
    nutritionalAssessment: "Normal", // Cachectic / Thin built / Normal / Obese
    regularMedications: "",
  });

  useEffect(() => {
    if (patient) {
      setFormData((prev) => ({
        ...prev,
        name: patient.name || "",
        phId: patient.mrno || "",
      }));
    }
  }, [patient]);

  // Load overwrite data if available
  useEffect(() => {
    console.log("OutPatientCaseSheet - overwriteData received:", overwriteData);
    console.log("OutPatientCaseSheet - overwriteFormId:", overwriteFormId);
    console.log("OutPatientCaseSheet - loadingOverwriteData:", loadingOverwriteData);

    if (overwriteData) {
      console.log("Setting form data with overwrite data:", overwriteData);
      setFormData((prev) => ({
        ...prev,
        ...overwriteData,
      }));
      console.log("Form data updated with overwrite data");
    }
  }, [overwriteData, overwriteFormId, loadingOverwriteData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    if (weight && height) {
      const bmi = (weight / (height / 100) ** 2).toFixed(1);
      setFormData((prev) => ({ ...prev, bmi }));
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [formData.weight, formData.height]);

  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Header
    pdf.setFillColor(0, 102, 204);
    pdf.rect(10, 10, 190, 20, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("GENERAL", 15, 18);
    pdf.text("OUT PATIENT CASE SHEET", 15, 25);

    // Patient label
    pdf.rect(10, 30, 15, 50, "F");
    pdf.text("PATIENT", 12, 40, { angle: 90 });

    // Patient Information
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Name:", 30, 35);
    pdf.text(formData.name, 45, 35);
    pdf.text("Age / DOB:", 30, 42);
    pdf.text(`${formData.age} / ${formData.dob}`, 55, 42);
    pdf.text("Sex:", 30, 49);
    pdf.text(formData.sex, 40, 49);
    pdf.text("PH-ID:", 30, 56);
    pdf.text(formData.phId, 45, 56);
    pdf.text("Date:", 30, 63);
    pdf.text(formData.date, 45, 63);

    // Hospital Logo Area
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("CURA HOSPITALS", 150, 25);

    // Consultation Details
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Consultant:", 10, 85);
    pdf.text(formData.consultant, 35, 85);
    pdf.text("Department:", 10, 92);
    pdf.text(formData.department, 35, 92);
    pdf.text("Referring Dr/ Centre:", 10, 99);
    pdf.text(formData.referringDr, 50, 99);
    pdf.text("Type of consult:", 10, 106);
    pdf.text(formData.consultType, 50, 106);

    // Vitals Table
    const vitalsY = 115;
    const vitalsX = 10;
    const cellWidth = 25;
    const cellHeight = 8;

    const vitals = [
      { label: "Wt", value: formData.weight },
      { label: "Ht", value: formData.height },
      { label: "BMI", value: formData.bmi },
      { label: "HR", value: formData.heartRate },
      { label: "GRBS", value: formData.grbs },
      { label: "BP", value: formData.bloodPressure },
      { label: "SpO2", value: formData.spO2 },
    ];

    vitals.forEach((vital, index) => {
      const x = vitalsX + index * cellWidth;
      pdf.rect(x, vitalsY, cellWidth, cellHeight);
      pdf.text(vital.label, x + 2, vitalsY + 5);
      pdf.text(vital.value, x + 2, vitalsY + 7);
    });

    // Clinical Information - Left Column
    const clinicalY = 130;
    const leftColX = 10;
    const rightColX = 105;

    pdf.text("Presenting complaints:", leftColX, clinicalY);
    pdf.text(formData.presentingComplaints, leftColX, clinicalY + 5);

    pdf.text("History of Present Illness:", leftColX, clinicalY + 15);
    pdf.text(formData.historyOfPresentIllness, leftColX, clinicalY + 20);

    pdf.text("Past medical History: HT/DM/IHD/OTHERS:", leftColX, clinicalY + 35);
    pdf.text(formData.pastMedicalHistory, leftColX, clinicalY + 40);

    pdf.text("Examination:", leftColX, clinicalY + 55);
    pdf.text(formData.examination, leftColX, clinicalY + 60);

    pdf.text("Provisional Diagnosis:", leftColX, clinicalY + 75);
    pdf.text(formData.provisionalDiagnosis, leftColX, clinicalY + 80);

    pdf.text("Advice:", leftColX, clinicalY + 95);
    pdf.text(formData.advice, leftColX, clinicalY + 100);

    pdf.text("Follow up:", leftColX, clinicalY + 115);
    pdf.text(formData.followUp, leftColX, clinicalY + 120);

    // Clinical Information - Right Column
    pdf.text("Allergy:", rightColX, clinicalY);
    pdf.text(formData.allergy, rightColX, clinicalY + 5);

    pdf.text("Nutritional Assessment:", rightColX, clinicalY + 15);
    pdf.text(formData.nutritionalAssessment, rightColX, clinicalY + 20);

    pdf.text("Regular Medications:", rightColX, clinicalY + 35);
    pdf.text(formData.regularMedications, rightColX, clinicalY + 40);

    return pdf;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handlePrint = () => {
    const pdf = generatePDF();
    pdf.save(`${formData.name || "patient"}_outpatient_case_sheet.pdf`);
    if (onPrint) {
      onPrint(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 mb-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">GENERAL</h1>
            <h2 className="text-lg">OUT PATIENT CASE SHEET</h2>
          </div>
          <div className="text-right">
            <div className="bg-blue-700 p-2 rounded">
              <span className="text-sm">CURA HOSPITALS</span>
            </div>
          </div>
        </div>

        {loadingOverwriteData && (
          <div className="mt-2 text-sm text-blue-200 text-center">Loading existing form data...</div>
        )}
        {overwriteFormId && !loadingOverwriteData && (
          <div className="mt-2 text-sm text-blue-200 text-center">
            {overwriteData && Object.values(overwriteData).some((val) => val && val !== "")
              ? "Editing existing form - make your changes and save"
              : "Creating new version of form - fill in the details and save"}
          </div>
        )}
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Age / DOB</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sex</label>
          <select
            value={formData.sex}
            onChange={(e) => handleInputChange("sex", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PH-ID</label>
          <input
            type="text"
            value={formData.phId}
            onChange={(e) => handleInputChange("phId", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Consultation Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Consultant</label>
          <input
            type="text"
            value={formData.consultant}
            onChange={(e) => handleInputChange("consultant", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Referring Dr/ Centre</label>
          <input
            type="text"
            value={formData.referringDr}
            onChange={(e) => handleInputChange("referringDr", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type of consult</label>
          <select
            value={formData.consultType}
            onChange={(e) => handleInputChange("consultType", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="New">New</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Revisit">Revisit</option>
          </select>
        </div>
      </div>

      {/* Vitals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Vitals</h3>
        <div className="grid grid-cols-7 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">Wt (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ht (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">BMI</label>
            <input
              type="text"
              value={formData.bmi}
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">HR (bpm)</label>
            <input
              type="number"
              value={formData.heartRate}
              onChange={(e) => handleInputChange("heartRate", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">GRBS (mg/dl)</label>
            <input
              type="number"
              value={formData.grbs}
              onChange={(e) => handleInputChange("grbs", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">BP (mmHg)</label>
            <input
              type="text"
              placeholder="120/80"
              value={formData.bloodPressure}
              onChange={(e) => handleInputChange("bloodPressure", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">SpO2 (%)</label>
            <input
              type="number"
              value={formData.spO2}
              onChange={(e) => handleInputChange("spO2", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Clinical Information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Presenting complaints</label>
            <textarea
              value={formData.presentingComplaints}
              onChange={(e) => handleInputChange("presentingComplaints", e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">History of Present Illness</label>
            <textarea
              value={formData.historyOfPresentIllness}
              onChange={(e) => handleInputChange("historyOfPresentIllness", e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Past medical History: HT/DM/IHD/OTHERS</label>
            <textarea
              value={formData.pastMedicalHistory}
              onChange={(e) => handleInputChange("pastMedicalHistory", e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Examination</label>
            <textarea
              value={formData.examination}
              onChange={(e) => handleInputChange("examination", e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Provisional Diagnosis</label>
            <textarea
              value={formData.provisionalDiagnosis}
              onChange={(e) => handleInputChange("provisionalDiagnosis", e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Advice</label>
            <textarea
              value={formData.advice}
              onChange={(e) => handleInputChange("advice", e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Follow up</label>
            <textarea
              value={formData.followUp}
              onChange={(e) => handleInputChange("followUp", e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Allergy</label>
            <textarea
              value={formData.allergy}
              onChange={(e) => handleInputChange("allergy", e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nutritional Assessment</label>
            <select
              value={formData.nutritionalAssessment}
              onChange={(e) => handleInputChange("nutritionalAssessment", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Cachectic">Cachectic</option>
              <option value="Thin built">Thin built</option>
              <option value="Normal">Normal</option>
              <option value="Obese">Obese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Regular Medications</label>
            <textarea
              value={formData.regularMedications}
              onChange={(e) => handleInputChange("regularMedications", e.target.value)}
              rows={8}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex relative right-0 bottom-10 gap-4 justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Form
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Generate PDF
        </button>
      </div>
    </div>
  );
};

export default OutPatientCaseSheet;
