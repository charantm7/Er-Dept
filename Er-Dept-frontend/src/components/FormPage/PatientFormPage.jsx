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

  // Available forms
  const forms = [
    {
      id: 1,
      name: "ACTIVITY CHART FOR BILLING(1 of 10)",
      url: "Forms/ACTIVITY CHART FOR BILLING(1 of 10).jpg",
      category: "General",
    },
    {
      id: 2,
      name: "ACTIVITY CHART FOR BILLING(2 of 10)",
      url: "Forms/ACTIVITY CHART FOR BILLING(2 of 10).jpg",
      category: "Laboratory",
    },
    { id: 3, name: "Prescription Form", url: "/forms/prescription.jpg", category: "Pharmacy" },
    { id: 4, name: "Consent Form", url: "/forms/consent.jpg", category: "Legal" },
    { id: 5, name: "Discharge Summary", url: "/forms/discharge.jpg", category: "Administrative" },
  ];

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
  const [selectedForm, setSelectedForm] = useState(forms[0]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 p-6">
      <div className="max-w-7xl mx-auto">
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
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Form Template</label>
          <div className="flex gap-2 flex-wrap">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => {
                  setSelectedForm(form);
                  setImageLoaded(false);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedForm.id === form.id
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {form.name}
              </button>
            ))}
          </div>
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
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
          <div className="relative w-full overflow-auto" style={{ maxHeight: "70vh" }}>
            <div className="relative inline-block">
              <img
                ref={imageRef}
                src={selectedForm.url}
                alt={selectedForm.name}
                className="block max-w-full"
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
                  const mouseEvent = new MouseEvent("mousedown", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent("mousemove", {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const mouseEvent = new MouseEvent("mouseup", {});
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
              />
            </div>
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
