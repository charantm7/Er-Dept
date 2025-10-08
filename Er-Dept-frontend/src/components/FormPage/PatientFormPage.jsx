import React, { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Send,
  Undo,
  Redo,
  Eraser,
  Pen,
  Trash2,
  FileText,
  Printer,
  Paintbrush,
  Save,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";

import { useAuth } from "../Auth/Authprovider";

const PatientFormPage = () => {
  const { mrno } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, errorToast: showError, info } = useToast();
  console.log(user);
  const [patient] = useState({
    name: "John Smith",
    mrno: mrno,
    phone: "+916362218372",
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#0000ff");
  const [lineWidth, setLineWidth] = useState(2);

  // For ultra-smooth curves
  const pointsRef = useRef([]);

  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const presetColors = ["#000000", "#0000ff", "#ff0000", "#00ff00"];

  const [selectedForms, setSelectedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const allForms = [
      "ACTIVITY CHART FOR BILLING(1 of 10)",
      "ACTIVITY CHART FOR BILLING(2 of 10)",
      "ACTIVITY CHART FOR BILLING(3 of 10)",
      "ACTIVITY CHART FOR BILLING(4 of 10)",
      "ACTIVITY CHART FOR BILLING(5 of 10)",
      "ACTIVITY CHART FOR BILLING(6 of 10)",
      "ACTIVITY CHART FOR BILLING(7 of 10)",
      "ACTIVITY CHART FOR BILLING(8 of 10)",
      "ACTIVITY CHART FOR BILLING(9 of 10)",
      "ACTIVITY CHART FOR BILLING(10 of 10)",
      "ADMISSION CONSENT",
      "ADMISSION CONSENT KANNADA",
      "CARE BUNDLE CHECK LIST (1)",
      "CATHLAB HIGH RISK CONSENT FORM (2)",
      "CONSENT FOR ADMISSION TO ICU & NICU & PICU",
      "CONSENT FOR ANESTHESIA & SEDATION",
      "CONSENT FOR ANESTHESIA & SEDATION KANNADA",
      "CONSENT FOR CAG (1)",
      "CONSENT FOR CAG (2)",
      "CONSENT FOR CAG (PART B) -3",
      "CONSENT FOR CAG (PART B) -4",
      "CONSENT FOR HAEMODIALYSIS",
      "CONSENT FOR HAEMODIALYSIS KANNADA",
      "CONSENT FOR HIV TESTING",
      "CONSENT FOR HIV TESTING KANNADA",
      "CONSENT FOR RADIOLOGY - CT SCAN",
      "CONSENT FOR RADIOLOGY - CT SCAN KANNADA",
      "CONSENT FOR REFUSAL TREATMENT",
      "CONSENT FOR REFUSAL TREATMENT KANNADA",
      "CONSENT FOR SURGERY & PROCEDURES (1)",
      "CONSENT FOR SURGERY & PROCEDURES (2)",
      "CONSENT FORM FOR MTP",
      "CONSENT FORM FOR MTP KANNADA",
      "DIABETIC MONITORING CHART",
      "ER DEPARTMENT INITIAL ASSESSMENT",
      "ER DOCTOR INITIAL ASSESSMENT (1)",
      "ER DOCTOR INITIAL ASSESSMENT (2)",
      "HIGH RISK CONSENT",
      "HIGH RISK CONSENT FORM (CARDIAC)",
      "HIGH RISK CONSENT FORM (CARDIAC) KANNADA",
      "INFORMED CONSENT FOR SURGERY & PROCEDURE (1 OF 2)",
      "INFORMED CONSENT FOR SURGERY & PROCEDURE (2 OF 2)",
      "INTAKE OUTPUT CHART",
      "LAB INVESTIGATION CHART",
      "LAPROSCOPY CONSENT",
      "LAPROSCOPY CONSENT KANNADA",
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

    const formFiles = allForms.map((name) => ({ name, url: `/Forms/${name}.jpg` }));
    setSelectedForms(formFiles);
    setActiveForm(formFiles[0]);
  }, []);

  useEffect(() => {
    if (imageLoaded && activeForm) setupCanvas();
  }, [activeForm, imageLoaded]);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!image || !canvas) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const context = canvas.getContext("2d");

    // Ultra-smooth drawing settings
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = lineWidth;
    context.strokeStyle = color;

    setCtx(context);

    const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryStep(0);
  };

  const getCanvasState = () => {
    if (!ctx || !canvasRef.current) return null;
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

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Catmull-Rom spline for ultra-smooth curves
  const drawSmoothLine = (points) => {
    if (!ctx || points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }

      // For the last segment
      const last = points.length - 1;
      ctx.quadraticCurveTo(points[last - 1].x, points[last - 1].y, points[last].x, points[last].y);
    }

    ctx.stroke();
  };

  const startDrawing = (e) => {
    if (!ctx) return;
    e.preventDefault();
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);
    pointsRef.current = [{ x, y }];

    // Set tool properties
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 5;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 6;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);
    pointsRef.current.push({ x, y });

    // Redraw the entire path for smoothness
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Restore the history
    if (history[historyStep]) {
      ctx.putImageData(history[historyStep], 0, 0);
    }

    // Reset tool properties before drawing
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth * 5;
    } else if (tool === "highlighter") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 6;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    drawSmoothLine(pointsRef.current);
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();

    setIsDrawing(false);
    saveHistory();
    pointsRef.current = [];
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
    if (!ctx || !window.confirm("Clear all? This cannot be undone.")) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
    success("Canvas cleared");
  };

  const mergeCanvasWithImage = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) throw new Error("Image or canvas not found");

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(image, 0, 0);
    tempCtx.drawImage(canvas, 0, 0);
    return tempCanvas;
  };

  const saveToSupabase = async () => {
    if (!activeForm) return showError("Please select a form first");

    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();

      const blob = await new Promise((resolve) => mergedCanvas.toBlob(resolve, "image/png"));

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${mrno}/${activeForm.name.replace(/\s+/g, "_")}_${timestamp}.png`;

      const { data: uploadData, error: uploadError } = await supabaseclient.storage
        .from("er_forms")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/png",
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseclient.storage.from("er_forms").getPublicUrl(fileName);

      const { data: dbData, error: dbError } = await supabaseclient
        .from("patient_er_forms")
        .insert([
          {
            patient_mrno: mrno,
            form_name: activeForm.name,
            file_url: urlData.publicUrl,

            file_path: fileName,
            file_size: blob.size,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (dbError) throw dbError;

      success("Form saved successfully!");
      return urlData.publicUrl;
    } catch (err) {
      showError(`Failed to save: ${err.message}`);
      console.error(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveAsPNG = async () => {
    if (!activeForm) return showError("Please select a form first");
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const link = document.createElement("a");
      link.download = `${patient.name.replace(/\s+/g, "_")}_${activeForm.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = mergedCanvas.toDataURL("image/png");
      link.click();
      success("Form saved as PNG!");
    } catch (err) {
      showError("Failed to save PNG");
    } finally {
      setSaving(false);
    }
  };

  const saveAsPDF = async () => {
    if (!activeForm) return showError("Please select a form first");
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const imgData = mergedCanvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (mergedCanvas.height * imgWidth) / mergedCanvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.setFontSize(10);
      pdf.text(`Patient: ${patient.name}`, 10, imgHeight + 10);
      pdf.text(`MR No: ${patient.mrno}`, 10, imgHeight + 15);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, imgHeight + 20);
      pdf.save(`${patient.name.replace(/\s+/g, "_")}_${activeForm.name.replace(/\s+/g, "_")}.pdf`);
      success("Form saved as PDF!");
    } catch (err) {
      showError("Failed to save PDF");
    } finally {
      setSaving(false);
    }
  };

  const sendToWhatsApp = async () => {
    if (!activeForm) return showError("Please select a form first");
    try {
      info("Saving to database...");
      const publicUrl = await saveToSupabase();
      if (publicUrl) {
        const message = `Hi ${patient.name}, your ${activeForm.name} is ready.\n\nView: ${publicUrl}\n\nMR: ${patient.mrno}`;
        window.open(
          `https://wa.me/${patient.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        success("Sent to WhatsApp!");
      }
    } catch (err) {
      showError("Failed to send");
    }
  };

  const printForm = () => {
    if (!activeForm) return showError("Please select a form first");
    const mergedCanvas = mergeCanvasWithImage();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>${activeForm.name}</title>
      <style>body{margin:0;padding:20px;}img{max-width:100%;}</style>
      </head><body><h2>${activeForm.name}</h2><p><b>Patient:</b> ${patient.name}</p>
      <p><b>MR:</b> ${patient.mrno}</p><p><b>Date:</b> ${new Date().toLocaleDateString()}</p>
      <img src="${mergedCanvas.toDataURL()}" /><script>window.print();window.close();</script></body></html>
    `);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <div className="bg-white border-b border-[#00000045] px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/patient/${mrno}`)} className="p-1.5 hover:bg-slate-100 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Medical Forms</h1>
            <p className="text-xs text-slate-500">
              {patient.name} • {patient.mrno}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={saveToSupabase}
            disabled={saving || !activeForm}
            className="p-2 hover:bg-teal-50 rounded text-teal-600"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={printForm}
            disabled={!activeForm}
            className="p-2 hover:bg-slate-100 rounded"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={saveAsPNG}
            disabled={saving || !activeForm}
            className="p-2 hover:bg-slate-100 rounded"
            title="PNG"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={saveAsPDF}
            disabled={saving || !activeForm}
            className="p-2 hover:bg-slate-100 rounded"
            title="PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={sendToWhatsApp}
            disabled={saving || !activeForm}
            className="p-2 hover:bg-slate-100 rounded"
            title="WhatsApp"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#00000045] px-4 py-2">
        <select
          className="w-full p-2 text-sm border border-[#00000045] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          value={activeForm?.name || ""}
          onChange={(e) => {
            const form = selectedForms.find((f) => f.name === e.target.value);
            if (form) {
              setActiveForm(form);
              setImageLoaded(false);
              if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                setHistory([]);
                setHistoryStep(-1);
              }
            }
          }}
        >
          <option value="">Select Form ({selectedForms.length})</option>
          {selectedForms.map((form) => (
            <option key={form.name} value={form.name}>
              {form.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-2xl border px-3 py-2 flex items-center gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-full ${tool === "pen" ? "bg-teal-100" : ""}`}
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("highlighter")}
            className={`p-2 rounded-full ${tool === "highlighter" ? "bg-yellow-100" : ""}`}
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-full ${tool === "eraser" ? "bg-red-100" : ""}`}
          >
            <Eraser className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-300"></div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer"
          />
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-black" : "border-slate-300"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="w-px h-6 bg-slate-300"></div>
          <input
            type="range"
            min={1}
            max={10}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs w-6">{lineWidth}</span>
          <div className="w-px h-6 bg-slate-300"></div>
          <button onClick={undo} disabled={historyStep <= 0} className="p-2 rounded-full disabled:opacity-30">
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-2 rounded-full disabled:opacity-30"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            disabled={!ctx}
            className="p-2 rounded-full text-red-600 disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-200 p-4">
        {activeForm ? (
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="relative">
              <img
                ref={imageRef}
                src={activeForm.url}
                alt={activeForm.name}
                className="block w-full h-auto select-none pointer-events-none"
                draggable="false"
                onLoad={() => setImageLoaded(true)}
                onError={() => showError(`Failed to load form`)}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                style={{ touchAction: "none" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Form Selected</h3>
              <p className="text-sm text-slate-500">Select a form above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientFormPage;
