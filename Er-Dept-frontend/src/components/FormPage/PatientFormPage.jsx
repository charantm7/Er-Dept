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
import { supabaseclient } from "../Config/supabase";

const PatientFormPage = () => {
  const { mrno } = useParams();
  const navigate = useNavigate();
  const { success, errorToast: showError, info } = useToast();

  const [patient] = useState({
    name: "John Smith",
    mrno: mrno,
    phone: "+916362218372",
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#0000ff");
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [points, setPoints] = useState([]);

  const presetColors = ["#000000", "#0000ff", "#ff0000", "#00ff00"];
  const [selectedForms, setSelectedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);

  // Setup form list
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
      "CONSENT FOR SURGERY & PROCEDURES (1)",
      "ER DOCTOR INITIAL ASSESSMENT (1)",
      "NURSES NOTES",
      "TPR CHART (1)",
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

    // Set actual resolution based on image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    setCtx(context);

    const initialState = context.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryStep(0);
  };

  // Utility
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches[0]) {
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

  const startDrawing = (e) => {
    if (!ctx) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);

    // Configure drawing style
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = lineWidth * 5;
      ctx.globalAlpha = 1.0;
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

    ctx.beginPath();
    ctx.moveTo(x, y);
    setPoints([{ x, y }]);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing || !ctx) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const newPoints = [...points, { x, y }];

    // Smooth line drawing
    ctx.beginPath();
    if (newPoints.length < 3) {
      const start = newPoints[0];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(x, y);
    } else {
      const lastTwo = newPoints.slice(-3);
      const [p1, p2, p3] = lastTwo;
      const midX = (p2.x + p3.x) / 2;
      const midY = (p2.y + p3.y) / 2;
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p2.x, p2.y, midX, midY);
    }
    ctx.stroke();

    setPoints(newPoints);
  };

  const stopDrawing = () => {
    if (!drawing) return;
    ctx.closePath();
    setDrawing(false);
    setPoints([]); // clear stored points
    saveHistory();
  };

  const getCanvasState = () => {
    if (!ctx || !canvasRef.current) return null;
    return ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveHistory = () => {
    const state = getCanvasState();
    if (!state) return;
    const updated = history.slice(0, historyStep + 1);
    setHistory([...updated, state]);
    setHistoryStep((prev) => prev + 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const step = historyStep - 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
    info("Undo");
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const step = historyStep + 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
    info("Redo");
  };

  const clearCanvas = () => {
    if (!ctx) return;
    if (!window.confirm("Clear all drawings?")) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
    success("Canvas cleared!");
  };

  // Merge background + canvas
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

  /** ---------- Supabase Save Logic ---------- */
  const saveToSupabase = async () => {
    if (!activeForm) return showError("Please select a form first");
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const blob = await new Promise((resolve) => mergedCanvas.toBlob(resolve, "image/png"));
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${mrno}/${activeForm.name.replace(/\s+/g, "_")}_${timestamp}.png`;

      const { error: uploadError } = await supabaseclient.storage.from("er-forms").upload(fileName, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/png",
      });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseclient.storage.from("er-forms").getPublicUrl(fileName);

      const { error: dbError } = await supabaseclient.from("patient_er_forms").insert([
        {
          patient_mrno: mrno,
          form_name: activeForm.name,
          form_url: urlData.publicUrl,
          file_path: fileName,
          file_size: blob.size,
          created_at: new Date().toISOString(),
        },
      ]);
      if (dbError) throw dbError;

      success("Form saved to Supabase successfully!");
      return urlData.publicUrl;
    } catch (err) {
      showError(`Save failed: ${err.message}`);
      console.error(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Export / Print / WhatsApp same as before...
  const saveAsPNG = async () => {
    try {
      const mergedCanvas = mergeCanvasWithImage();
      const link = document.createElement("a");
      link.download = `${patient.name}_${activeForm.name}.png`;
      link.href = mergedCanvas.toDataURL("image/png");
      link.click();
      success("Saved as PNG!");
    } catch (err) {
      showError("Failed to save PNG");
    }
  };

  const printForm = () => {
    const mergedCanvas = mergeCanvasWithImage();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>${activeForm.name}</title>
      <style>body{margin:0;padding:20px;}img{max-width:100%;}</style>
      </head><body>
      <h2>${activeForm.name}</h2>
      <p><b>${patient.name}</b> • MR No: ${patient.mrno}</p>
      <img src="${mergedCanvas.toDataURL()}" />
      <script>window.print();window.close();</script>
      </body></html>
    `);
  };

  /** ---------- UI ---------- */
  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/patient/${mrno}`)} className="p-1.5 hover:bg-slate-100 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Medical Forms</h1>
            <p className="text-xs text-slate-500">
              {patient.name} • {patient.mrno}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={saveToSupabase} disabled={saving} className="p-2 hover:bg-teal-100 rounded">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={printForm} className="p-2 hover:bg-slate-100 rounded">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={saveAsPNG} className="p-2 hover:bg-slate-100 rounded">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Selector */}
      <div className="bg-white border-b border-slate-200 px-4 py-2">
        <select
          className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          value={activeForm?.name || ""}
          onChange={(e) => {
            const form = selectedForms.find((f) => f.name === e.target.value);
            if (form) {
              setActiveForm(form);
              setImageLoaded(false);
              ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }}
        >
          <option value="">Select Form</option>
          {selectedForms.map((form) => (
            <option key={form.name} value={form.name}>
              {form.name}
            </option>
          ))}
        </select>
      </div>

      {/* Toolbar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-2xl border border-slate-200 px-3 py-2 flex items-center gap-2">
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
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${
                color === c ? "border-slate-900" : "border-slate-300"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="range"
            min={1}
            max={10}
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-slate-600 w-6">{lineWidth}</span>
          <button onClick={undo} className="p-2 rounded-full disabled:opacity-30">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={redo} className="p-2 rounded-full disabled:opacity-30">
            <Redo className="w-4 h-4" />
          </button>
          <button onClick={clearCanvas} className="p-2 rounded-full text-red-600 disabled:opacity-30">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-200 p-4">
        {activeForm ? (
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden relative">
            <img
              ref={imageRef}
              src={activeForm.url}
              alt={activeForm.name}
              className="block w-full h-auto select-none"
              draggable="false"
              onLoad={() => setImageLoaded(true)}
              onError={() => showError(`Failed to load: ${activeForm.name}`)}
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
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No form selected</div>
        )}
      </div>
    </div>
  );
};

export default PatientFormPage;
