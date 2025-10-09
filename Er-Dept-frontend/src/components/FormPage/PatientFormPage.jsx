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
  History,
  X,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../Context/ToastContext";
import { supabaseclient } from "../Config/supabase";
import { PencilLine } from "lucide-react";

const PatientFormPage = () => {
  const { mrno } = useParams();
  const navigate = useNavigate();
  const { success, errorToast: showError, info } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#0000ff");
  const [lineWidth, setLineWidth] = useState(2);

  const [history, setHistory] = useState([]); // stores ImageBitmap snapshots for fast undo/redo
  const [historyStep, setHistoryStep] = useState(-1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // History sidebar
  const [showHistory, setShowHistory] = useState(false);
  const [formHistory, setFormHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const presetColors = ["#000000", "#0000ff", "#ff0000", "#00ff00"];
  const [selectedForms, setSelectedForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);

  // Optimized drawing for mobile/tablet
  const lastPointRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);
  const activePointerIdRef = useRef(null);
  console.log(patient);
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

    const formFiles = allForms.map((name) => ({
      name,
      url: `/Forms/${name}.jpg`,
    }));
    setSelectedForms(formFiles);
    if (formFiles.length > 0) {
      setActiveForm(formFiles[0]);
    }
  }, []);

  useEffect(() => {
    const loadPatient = async () => {
      if (!mrno) return;
      setLoadingPatient(true);
      try {
        const { data, error } = await supabaseclient.from("users").select("*").eq("mrno", mrno).single();
        if (error) throw error;
        setPatient(data);
      } catch (err) {
        showError("Failed to load patient");
        setPatient({ name: "Unknown", mrno, phone: "" });
      } finally {
        setLoadingPatient(false);
      }
    };
    loadPatient();
  }, [mrno]);

  useEffect(() => {
    if (imageLoaded && activeForm) {
      // Add a small delay to ensure image is fully rendered
      const timer = setTimeout(() => {
        setupCanvas();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeForm, imageLoaded]);

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
      showError("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!image || !canvas) return;

    // Ensure image is loaded
    if (!image.complete || image.naturalWidth === 0) {
      image.onload = setupCanvas;
      return;
    }

    // Use next frame to ensure layout stability
    requestAnimationFrame(() => {
      const rect = image.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = Math.max(1, Math.floor(rect.width));
      const displayH = Math.max(1, Math.floor(rect.height));

      // Match canvas to image display size
      canvas.width = Math.floor(displayW * dpr);
      canvas.height = Math.floor(displayH * dpr);
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;

      // Create context (no experimental flags)
      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.lineJoin = "round";
      context.scale(dpr, dpr);

      // Draw image as background (mobile-safe)
      context.clearRect(0, 0, displayW, displayH);
      context.drawImage(image, 0, 0, displayW, displayH);

      setCtx(context);

      // Save initial snapshot for undo
      createImageBitmap(canvas)
        .then((bitmap) => {
          setHistory([bitmap]);
          setHistoryStep(0);
        })
        .catch(() => {
          setHistory([]);
          setHistoryStep(-1);
        });
    });
  };

  const saveHistory = async () => {
    if (!canvasRef.current || !ctx) return;
    try {
      const snapshot = await createImageBitmap(canvasRef.current);
      const updatedHistory = history.slice(0, historyStep + 1);
      const capped = [...updatedHistory, snapshot].slice(-25); // cap history to 25
      setHistory(capped);
      setHistoryStep(capped.length - 1);
    } catch (_) {}
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scaleX = canvas.width / dpr / rect.width;
    const scaleY = canvas.height / dpr / rect.height;

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

  // Resize observer to keep canvas in sync with displayed image size
  useEffect(() => {
    if (!imageRef.current || !imageLoaded) return;

    const ro = new ResizeObserver(() => {
      if (imageLoaded) {
        // Debounce resize events
        clearTimeout(ro.timeoutId);
        ro.timeoutId = setTimeout(() => setupCanvas(), 150);
      }
    });
    ro.observe(imageRef.current);

    const onWindowResize = () => {
      if (imageLoaded) {
        clearTimeout(onWindowResize.timeoutId);
        onWindowResize.timeoutId = setTimeout(() => setupCanvas(), 150);
      }
    };

    window.addEventListener("orientationchange", onWindowResize);
    window.addEventListener("resize", onWindowResize);

    return () => {
      ro.disconnect();
      clearTimeout(ro.timeoutId);
      clearTimeout(onWindowResize.timeoutId);
      window.removeEventListener("orientationchange", onWindowResize);
      window.removeEventListener("resize", onWindowResize);
    };
  }, [imageLoaded, activeForm]);

  const startDrawing = (e) => {
    if (!ctx) return;
    if (e.preventDefault) e.preventDefault();
    if (e.pointerId != null) {
      activePointerIdRef.current = e.pointerId;
      if (canvasRef.current && canvasRef.current.setPointerCapture) {
        try {
          canvasRef.current.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    }
    setIsDrawing(true);

    const { x, y } = getCoordinates(e);
    lastPointRef.current = { x, y };

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

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    if (e.preventDefault) e.preventDefault();
    if (
      e.pointerId != null &&
      activePointerIdRef.current != null &&
      e.pointerId !== activePointerIdRef.current
    ) {
      return; // ignore other pointers
    }

    if (rafIdRef.current) return; // Skip if already processing

    rafIdRef.current = requestAnimationFrame(() => {
      const { x, y } = getCoordinates(e);
      const lastPoint = lastPointRef.current;

      // Interpolate for smoothness
      const midX = (lastPoint.x + x) / 2;
      const midY = (lastPoint.y + y) / 2;

      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
      ctx.stroke();

      lastPointRef.current = { x, y };
      rafIdRef.current = null;
    });
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    if (e && e.preventDefault) e.preventDefault();

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    ctx.closePath();
    setIsDrawing(false);
    saveHistory();
    if (activePointerIdRef.current != null && canvasRef.current && canvasRef.current.releasePointerCapture) {
      try {
        canvasRef.current.releasePointerCapture(activePointerIdRef.current);
      } catch (_) {}
    }
    activePointerIdRef.current = null;
  };

  const undo = () => {
    if (historyStep <= 0 || !ctx || !canvasRef.current) return;
    const step = historyStep - 1;
    const snapshot = history[step];
    if (snapshot) {
      // Clear canvas and restore from snapshot with proper scaling
      const image = imageRef.current;
      if (image) {
        const rect = image.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Clear and redraw background
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(image, 0, 0, rect.width, rect.height);

        // Restore drawing from snapshot
        ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
      }
      setHistoryStep(step);
      info("Undone");
    }
  };

  const redo = () => {
    if (historyStep >= history.length - 1 || !ctx || !canvasRef.current) return;
    const step = historyStep + 1;
    const snapshot = history[step];
    if (snapshot) {
      // Clear canvas and restore from snapshot with proper scaling
      const image = imageRef.current;
      if (image) {
        const rect = image.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Clear and redraw background
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(image, 0, 0, rect.width, rect.height);

        // Restore drawing from snapshot
        ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
      }
      setHistoryStep(step);
      info("Redone");
    }
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current || !window.confirm("Clear all?")) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Redraw the background image after clearing
    const image = imageRef.current;
    if (image) {
      const rect = image.getBoundingClientRect();
      ctx.drawImage(image, 0, 0, rect.width, rect.height);
    }
    saveHistory();
    success("Canvas cleared");
  };

  const mergeCanvasWithImage = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) throw new Error("Image or canvas not found");

    // Create a high-resolution canvas for export
    const tempCanvas = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = image.getBoundingClientRect();

    // Use natural image size for high quality export
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    const tempCtx = tempCanvas.getContext("2d");

    // Draw the original image
    tempCtx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

    // Scale and draw the canvas overlay
    const scaleX = image.naturalWidth / rect.width;
    const scaleY = image.naturalHeight / rect.height;
    tempCtx.drawImage(canvas, 0, 0, rect.width, rect.height, 0, 0, image.naturalWidth, image.naturalHeight);

    return tempCanvas;
  };

  const downscaleCanvas = (sourceCanvas, maxWidth = 1600, maxHeight = 2200) => {
    const { width, height } = sourceCanvas;
    let targetW = width;
    let targetH = height;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    targetW = Math.round(width * ratio);
    targetH = Math.round(height * ratio);
    if (ratio === 1) return sourceCanvas;
    const off = document.createElement("canvas");
    off.width = targetW;
    off.height = targetH;
    const offCtx = off.getContext("2d");
    offCtx.imageSmoothingQuality = "high";
    offCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
    return off;
  };

  const saveToSupabase = async () => {
    if (!activeForm) return showError("Please select a form first");

    try {
      info("Saving to supabase...");
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const scaled = downscaleCanvas(mergedCanvas);
      // Prefer WEBP for smaller uploads, fallback to PNG
      const preferType = "image/webp";
      let blob = await new Promise((resolve) => scaled.toBlob(resolve, preferType, 0.8));
      let ext = "webp";
      let mime = preferType;
      if (!blob) {
        blob = await new Promise((resolve) => scaled.toBlob(resolve, "image/png"));
        ext = "png";
        mime = "image/png";
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${mrno}/${activeForm.name.replace(/\s+/g, "_")}_${timestamp}.${ext}`;

      const { error: uploadError } = await supabaseclient.storage.from("er_forms").upload(fileName, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: mime,
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseclient.storage.from("er_forms").getPublicUrl(fileName);

      const { error: dbError } = await supabaseclient.from("patient_er_forms").insert([
        {
          patient_mrno: mrno,
          form_name: activeForm.name,
          file_url: urlData.publicUrl,
          file_path: fileName,
          file_type: mime,
          file_size: blob.size,
        },
      ]);

      if (dbError) throw dbError;

      success("Form saved successfully!");
      fetchFormHistory(); // Refresh history
      return urlData.publicUrl;
    } catch (err) {
      showError(`Failed: ${err.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveAsPNG = async () => {
    if (!activeForm) return showError("Select a form first");
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const link = document.createElement("a");
      link.download = `${patient.name.replace(/\s+/g, "_")}_${activeForm.name.replace(/\s+/g, "_")}.png`;
      link.href = mergedCanvas.toDataURL("image/png");
      link.click();
      success("Saved as PNG!");
    } finally {
      setSaving(false);
    }
  };

  const saveAsPDF = async () => {
    if (!activeForm) return showError("Select a form first");
    try {
      setSaving(true);
      const mergedCanvas = mergeCanvasWithImage();
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (mergedCanvas.height * imgWidth) / mergedCanvas.width;
      pdf.addImage(mergedCanvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `${(patient?.name || "patient").replace(/\s+/g, "_")}_${activeForm.name.replace(/\s+/g, "_")}.pdf`
      );
      success("Saved as PDF!");
    } finally {
      setSaving(false);
    }
  };

  const sendToWhatsApp = async () => {
    if (!activeForm) return showError("Select a form first");
    info("Saving...");
    const publicUrl = await saveToSupabase();
    if (publicUrl) {
      const message = `Hi ${patient?.name || "patient"}, your ${
        activeForm.name
      } is ready.\n\nView: ${publicUrl}\n\nMR: ${patient?.mrno || mrno}`;
      window.open(
        `https://wa.me/${patient.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
      success("Sent!");
    }
  };

  const printForm = () => {
    if (!activeForm) return showError("Select a form first");
    const mergedCanvas = mergeCanvasWithImage();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html><head><title>${
        activeForm.name
      }</title><style>body{margin:0;padding:20px;}img{max-width:100%;}</style>
      </head><body><h2>${activeForm.name}</h2><p><b>Patient:</b> ${patient?.name || ""}</p><p><b>MR:</b> ${
      patient?.mrno || mrno
    }</p>
      <img src="${mergedCanvas.toDataURL()}" /><script>window.print();window.close();</script></body></html>
    `);
  };

  const viewHistoryForm = (formUrl) => {
    window.open(formUrl, "_blank");
  };

  // Attachments state and handlers
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const attachments = formHistory.filter(
    (f) => typeof f.file_path === "string" && f.file_path.includes("/attachments/")
  );

  const uploadAttachment = async () => {
    if (!attachmentFile) return showError("Choose a file to upload");
    try {
      setUploadingAttachment(true);
      const baseName = (attachmentName || attachmentFile.name).replace(/\s+/g, "_");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const path = `${mrno}/attachments/${baseName}_${timestamp}`;
      const { error: uploadError } = await supabaseclient.storage
        .from("er_forms")
        .upload(path, attachmentFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: attachmentFile.type || undefined,
        });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabaseclient.storage.from("er_forms").getPublicUrl(path);
      const { error: dbError } = await supabaseclient.from("patient_er_forms").insert([
        {
          patient_mrno: mrno,
          form_name: attachmentName || attachmentFile.name,
          file_url: urlData.publicUrl,
          file_path: path,
          file_type: attachmentFile.type || "application/octet-stream",
          file_size: attachmentFile.size,
        },
      ]);
      if (dbError) throw dbError;
      success("Attachment uploaded");
      setAttachmentFile(null);
      setAttachmentName("");
      fetchFormHistory();
    } catch (err) {
      showError(`Upload failed: ${err.message}`);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const renameAttachment = async (id) => {
    if (!renameValue.trim()) return showError("Enter a name");
    try {
      const { error: dbError } = await supabaseclient
        .from("patient_er_forms")
        .update({ form_name: renameValue.trim() })
        .eq("id", id);
      if (dbError) throw dbError;
      success("Renamed");
      setRenamingId(null);
      setRenameValue("");
      fetchFormHistory();
    } catch (err) {
      showError(`Rename failed: ${err.message}`);
    }
  };

  const deleteAttachment = async (row) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const { error: storageError } = await supabaseclient.storage.from("er_forms").remove([row.file_path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabaseclient.from("patient_er_forms").delete().eq("id", row.id);
      if (dbError) throw dbError;
      success("Deleted");
      fetchFormHistory();
    } catch (err) {
      showError(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="h-screen flex bg-slate-100">
      {/* History Sidebar */}
      <div
        className={`bg-white border-r border-[#00000037] transition-all duration-300 ${
          showHistory ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-[#00000037] flex items-center justify-between">
            <h2 className="font-bold text-lg">Form History</h2>
            <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loadingHistory ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : formHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No forms saved yet</div>
            ) : (
              <div className="space-y-3">
                {formHistory.map((form) => (
                  <div
                    key={form.id}
                    className="bg-slate-50 p-3 rounded-lg border-[#00000037] border hover:border-teal-500 transition-all cursor-pointer"
                    onClick={() => viewHistoryForm(form.file_url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{form.form_name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(form.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{(form.file_size / 1024).toFixed(0)} KB</p>
                      </div>
                      <Eye className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-b border-1 border-[#00000053] p-4">
            <div className="flex items-center gap-2 mb-2">
              <PencilLine className="text-sm" />
              <p className="font-medium">Attachments</p>
            </div>
            <div className="space-y-2">
              <input
                type="file"
                onChange={(e) =>
                  setAttachmentFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                }
                className="block w-full text-sm"
                accept="image/*,application/pdf"
              />
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Attachment name (optional)"
                className="w-full p-2 text-sm border border-[#00000037] rounded"
              />
              <button
                onClick={uploadAttachment}
                disabled={uploadingAttachment || !attachmentFile}
                className="w-full py-2 text-sm bg-teal-600 text-white rounded disabled:opacity-50"
              >
                {uploadingAttachment ? "Uploading..." : "Upload"}
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500">Uploaded attachments</p>
                {attachments.map((row) => (
                  <div key={row.id} className="p-2 rounded border border-[#00000025]">
                    {renamingId === row.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="flex-1 p-1 text-sm border border-[#00000037] rounded"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                        />
                        <button
                          className="text-xs px-2 py-1 bg-teal-600 text-white rounded"
                          onClick={() => renameAttachment(row.id)}
                        >
                          Save
                        </button>
                        <button
                          className="text-xs px-2 py-1"
                          onClick={() => {
                            setRenamingId(null);
                            setRenameValue("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm truncate">{row.form_name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {row.file_type} • {(row.file_size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            className="text-xs text-teal-700"
                            onClick={() => viewHistoryForm(row.file_url)}
                          >
                            View
                          </button>
                          <button
                            className="text-xs"
                            onClick={() => {
                              setRenamingId(row.id);
                              setRenameValue(row.form_name);
                            }}
                          >
                            Rename
                          </button>
                          <button className="text-xs text-red-600" onClick={() => deleteAttachment(row)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-[#00000037] px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/patient/${mrno}`)} className="p-1.5 hover:bg-slate-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded ${showHistory ? "bg-teal-100 text-teal-600" : "hover:bg-slate-100"}`}
              title="History"
            >
              <History className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Medical Forms</h1>
              <p className="text-xs text-slate-500">
                {patient?.name} • {patient?.mrno}
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
            <button onClick={printForm} disabled={!activeForm} className="p-2 hover:bg-slate-100 rounded">
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={saveAsPNG}
              disabled={saving || !activeForm}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={saveAsPDF}
              disabled={saving || !activeForm}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={sendToWhatsApp}
              disabled={saving || !activeForm}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-[#00000037] px-4 py-2">
          <select
            className="w-full p-2  text-sm border border-[#00000037] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
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
                className={`w-6 h-6 rounded-full border-2 ${
                  color === c ? "border-black" : "border-slate-300"
                }`}
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
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className="p-2 rounded-full disabled:opacity-30"
            >
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
                  onLoad={() => {
                    setImageLoaded(true);
                    // Force a re-render to ensure proper sizing
                    setTimeout(() => {
                      if (imageRef.current) {
                        const event = new Event("resize");
                        window.dispatchEvent(event);
                      }
                    }, 200);
                  }}
                  onError={() => {
                    console.error("Failed to load form image:", activeForm.url);
                    setImageLoaded(false);
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                  style={{ touchAction: "none" }}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  onPointerLeave={stopDrawing}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Form Selected</h3>
                <p className="text-sm text-slate-500">Select above</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientFormPage;
