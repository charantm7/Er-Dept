import React, { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Download,
  Send,
  Undo,
  Redo,
  Eraser,
  Pen,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Share2,
  Printer,
  Check,
  X,
  Paintbrush,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";

const PatientFormPage = () => {
  const { mrno } = useParams();
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();

  // Patient data - Replace with actual API call
  const [patient, setPatient] = useState({
    name: "John Smith",
    mrno: mrno,
    phone: "+919876543210",
    age: 45,
    gender: "Male",
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, eraser, highlighter
  const [color, setColor] = useState("#ff0000");
  const [lineWidth, setLineWidth] = useState(3);
  const [zoom, setZoom] = useState(1);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // UI States
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Preset colors
  const presetColors = [
    "#000000",
    "#ff0000",
    "#0000ff",
    "#00ff00",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ff8800",
  ];

  const [selectedForm, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    async function loadForms() {
      try {
        let formFiles = [];
        const allForms = [
          "ACTIVITY CHART FOR BILLING(1 of 10)",
          "ACTIVITY CHART FOR BILLING(10 of 10)",
          "ACTIVITY CHART FOR BILLING(2 of 10)",
          "ACTIVITY CHART FOR BILLING(3 of 10)",
          "ACTIVITY CHART FOR BILLING(4 of 10)",
          "ACTIVITY CHART FOR BILLING(5 of 10)",
          "ACTIVITY CHART FOR BILLING(6 of 10)",
          "ACTIVITY CHART FOR BILLING(7 of 10)",
          "ACTIVITY CHART FOR BILLING(8 of 10)",
          "ACTIVITY CHART FOR BILLING(9 of 10)",
          "ADMISSION CONSENT KANNADA",
          "ADMISSION CONSENT",
          "CARE BUNDLE CHECK LIST (1)",
          "CATHLAB HIGH RISK CONSENT FORM (2)",
          "CONSENT FOR ADMISSION TO ICU & NICU & PICU",
          "CONSENT FOR ANESTHESIA & SEDATION KANNADA",
          "CONSENT FOR ANESTHESIA & SEDATION",
          "CONSENT FOR CAG (1)",
          "CONSENT FOR CAG (2)",
          "CONSENT FOR CAG (PART B) -3",
          "CONSENT FOR CAG (PART B) -4",
          "CONSENT FOR HAEMODIALYSIS KANNADA",
          "CONSENT FOR HAEMODIALYSIS",
          "CONSENT FOR HIV TESTING KANNADA",
          "CONSENT FOR HIV TESTING",
          "CONSENT FOR RADIOLOGY - CT SCAN KANNADA",
          "CONSENT FOR RADIOLOGY - CT SCAN",
          "CONSENT FOR REFUSAL TREATMENT KANNADA",
          "CONSENT FOR REFUSAL TREATMENT",
          "CONSENT FOR SURGERY & PROCEDURES (1)",
          "CONSENT FOR SURGERY & PROCEDURES (2)",
          "CONSENT FORM FOR MTP KANNADA",
          "CONSENT FORM FOR MTP",
          "DIABETIC MONITORING CHART",
          "ER DEPARTMENT INITIAL ASSESSMENT",
          "ER DOCTOR INITIAL ASSESSMENT (1)",
          "ER DOCTOR INITIAL ASSESSMENT (2)",
          "HIGH RISK CONSENT FORM (CARDIAC) KANNADA",
          "HIGH RISK CONSENT FORM (CARDIAC)",
          "HIGH RISK CONSENT",
          "INFORMED CONSENT FOR SURGERY & PROCEDURE (1 OF 2)",
          "INFORMED CONSENT FOR SURGERY & PROCEDURE (2 OF 2)",
          "INTAKE OUTPUT CHART",
          "LAB INVESTIGATION CHART",
          "LAPROSCOPY CONSENT KANNADA",
          "LAPROSCOPY CONSENT",
          "MEDICATION CHART (1)",
          "MEDICATION CHART (2)",
          "NURSES NOTES",
          "PRE-OPERATIVE CHECK LIST FOR NURSES",
          "SURGERY CONSENT PROCEDURE (1 OF 3) KANNADA",
          "SURGERY CONSENT PROCEDURE (2 OF 3) KANNADA",
          "SURGERY CONSENT PROCEDURE (3 OF 3) KANNADA",
          "TPR CHART (1)",
          "TPR CHART (2)",
          "TPR CHART (3)",
        ];
        formFiles = allForms.map((formName) => ({
          name: formName,
          url: `/Forms/${formName}.jpg`,
        }));

        setForms(formFiles);

        const defaultForm =
          formFiles.find((f) => f.name.includes("ACTIVITY CHART FOR BILLING(1 of 10)")) || formFiles[0];

        setActiveForm(defaultForm);
      } catch (error) {
        console.error("Error loading forms:", error);
      }
    }

    loadForms();
  }, []);

  const openForm = (form) => {
    window.open(form.url, "_blank", "noopener,noreferrer");
  };

  // Initialize canvas when form changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (image && image.complete) {
      setupCanvas();
    }
  }, [selectedForm, imageLoaded]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!image || !image.complete) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    setCtx(context);

    // Reset history
    setHistory([getCanvasState()]);
    setHistoryStep(0);
  };

  const getCanvasState = () => {
    if (!ctx) return null;
    return ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveHistory = () => {
    const state = getCanvasState();
    if (!state) return;

    const updatedHistory = history.slice(0, historyStep + 1);
    setHistory([...updatedHistory, state]);
    setHistoryStep((prev) => prev + 1);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (!ctx) return;
    setDrawing(true);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = lineWidth * 3;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e) => {
    if (!drawing || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (drawing) {
      ctx.closePath();
      saveHistory();
    }
    setDrawing(false);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const step = historyStep - 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
    info("Undone");
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const step = historyStep + 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
    info("Redone");
  };

  const clearCanvas = () => {
    if (!ctx) return;
    if (window.confirm("Clear all annotations? This cannot be undone.")) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveHistory();
      success("Canvas cleared");
    }
  };

  const mergeCanvasWithImage = () => {
    const tempCanvas = document.createElement("canvas");
    const image = imageRef.current;

    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw form image
    tempCtx.drawImage(image, 0, 0);

    // Draw annotations
    tempCtx.drawImage(canvasRef.current, 0, 0);

    return tempCanvas;
  };

  const saveAsPNG = async () => {
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const link = document.createElement("a");
      const fileName = `${patient.name.replace(/\s+/g, "_")}_${selectedForm.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.download = fileName;
      link.href = mergedCanvas.toDataURL("image/png");
      link.click();

      success("Form saved as PNG!");
      // TODO: Save to Supabase storage
      // const { data, error } = await supabase.storage
      //   .from('medical-forms')
      //   .upload(`${mrno}/${fileName}`, blob);
    } catch (err) {
      showError("Failed to save PNG");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveAsPDF = async () => {
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const imgData = mergedCanvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (mergedCanvas.height * imgWidth) / mergedCanvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Add patient details as text
      pdf.setFontSize(10);
      pdf.text(`Patient: ${patient.name}`, 10, imgHeight + 10);
      pdf.text(`MR No: ${patient.mrno}`, 10, imgHeight + 15);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, imgHeight + 20);

      const fileName = `${patient.name.replace(/\s+/g, "_")}_${selectedForm.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      success("Form saved as PDF!");
      // TODO: Save to Supabase
    } catch (err) {
      showError("Failed to save PDF");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getTouchCoordinates = (touch) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (!ctx) return;
    setDrawing(true);
    const { x, y } = getTouchCoordinates(e.touches[0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!drawing || !ctx) return;
    const { x, y } = getTouchCoordinates(e.touches[0]);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!ctx) return;
    if (drawing) {
      ctx.closePath();
      saveHistory();
    }
    setDrawing(false);
  };

  const sendToWhatsApp = async () => {
    try {
      setSaving(true);

      // Create blob from canvas
      const mergedCanvas = mergeCanvasWithImage();
      const blob = await new Promise((resolve) => mergedCanvas.toBlob(resolve, "image/png"));

      // TODO: Upload to Supabase storage and get public URL
      // const { data, error } = await supabase.storage
      //   .from('medical-forms')
      //   .upload(`temp/${Date.now()}.png`, blob);
      // const publicUrl = supabase.storage.from('medical-forms').getPublicUrl(data.path).data.publicUrl;

      // For now, use WhatsApp Web API
      const message = `Hi ${patient.name}, your ${selectedForm.name} is ready. MR No: ${patient.mrno}`;
      const whatsappUrl = `https://wa.me/${patient.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
      success("Opening WhatsApp...");
    } catch (err) {
      showError("Failed to send to WhatsApp");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const printForm = () => {
    const mergedCanvas = mergeCanvasWithImage();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedForm.name} - ${patient.name}</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
            .info { margin-bottom: 20px; font-family: Arial; }
          </style>
        </head>
        <body>
          <div class="info">
            <h2>${selectedForm.name}</h2>
            <p><strong>Patient:</strong> ${patient.name}</p>
            <p><strong>MR No:</strong> ${patient.mrno}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <img src="${mergedCanvas.toDataURL()}" />
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br overflow-hidden from-slate-50 via-blue-50/30 to-teal-50/20 py-6">
      <div className="w-full mx-auto px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/patient/${mrno}`)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medical Forms</h1>
              <p className="text-slate-600">
                {patient.name} • MR No: {patient.mrno}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={printForm}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={saveAsPNG}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Save PNG
            </button>
            <button
              onClick={saveAsPDF}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              Save PDF
            </button>
            <button
              onClick={sendToWhatsApp}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Form Selection */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Form Template</label>
          <select
            className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={activeForm?.name || ""}
            onChange={(e) => {
              const form = selectedForm.find((f) => f.name === e.target.value);
              setActiveForm(form);
              setImageLoaded(false);
            }}
          >
            <option value="" disabled>
              -- Select a form --
            </option>
            {selectedForm.map((form) => (
              <option key={form.name} value={form.name}>
                {form.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drawing Tools */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-slate-100">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Tool Selection */}
            <div className="flex gap-2 border-r border-slate-200 pr-4">
              <button
                onClick={() => setTool("pen")}
                className={`p-3 rounded-lg transition-all ${
                  tool === "pen" ? "bg-teal-100 text-teal-700" : "bg-slate-100 hover:bg-slate-200"
                }`}
                title="Pen"
              >
                <Pen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool("highlighter")}
                className={`p-3 rounded-lg transition-all ${
                  tool === "highlighter" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 hover:bg-slate-200"
                }`}
                title="Highlighter"
              >
                <Paintbrush className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`p-3 rounded-lg transition-all ${
                  tool === "eraser" ? "bg-red-100 text-red-700" : "bg-slate-100 hover:bg-slate-200"
                }`}
                title="Eraser"
              >
                <Eraser className="w-5 h-5" />
              </button>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <span className="text-sm font-medium text-slate-700">Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex gap-1">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      color === c ? "border-slate-900 scale-110" : "border-slate-300"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Line Width */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <span className="text-sm font-medium text-slate-700">Size:</span>
              <input
                type="range"
                min={1}
                max={20}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-slate-600 w-8">{lineWidth}px</span>
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-2 border-r border-slate-200 pr-4">
              <button
                onClick={undo}
                disabled={historyStep <= 0}
                className="p-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="p-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={clearCanvas}
              className="p-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-100 flex justify-center">
          <div className="relative">
            <img
              ref={imageRef}
              src={activeForm?.url}
              alt={activeForm?.name}
              className="block w-full h-auto"
              onLoad={() => {
                setImageLoaded(true);
                setupCanvas();
              }}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                const x = (touch.clientX - rect.left) * (canvasRef.current.width / rect.width);
                const y = (touch.clientY - rect.top) * (canvasRef.current.height / rect.height);
                startDrawing({ clientX: x, clientY: y });
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvasRef.current.getBoundingClientRect();
                const x = (touch.clientX - rect.left) * (canvasRef.current.width / rect.width);
                const y = (touch.clientY - rect.top) * (canvasRef.current.height / rect.height);
                draw({ clientX: x, clientY: y });
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Select a form template from the dropdown above</li>
            <li>• Use the pen tool to write or draw on the form</li>
            <li>• Use the highlighter to emphasize important sections</li>
            <li>• Use the eraser to remove annotations</li>
            <li>• Save your work as PNG or PDF</li>
            <li>• Send directly to patient via WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatientFormPage;
