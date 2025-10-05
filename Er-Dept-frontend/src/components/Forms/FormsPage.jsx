import React, { useMemo, useState, useEffect, useRef } from "react";

// Import all assets in this directory (images/PDFs)
const loadForms = () => {
  try {
    const ctx = require.context("./", false, /\.(png|jpe?g|webp|pdf)$/i);
    const items = ctx.keys().map((key) => {
      const url = ctx(key);
      const fileName = key.replace("./", "");
      const name = fileName.replace(/\.[^.]+$/, "");
      return { name, url };
    });
    return items.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    return [];
  }
};

const FormsPage = () => {
  const forms = useMemo(() => loadForms(), []);
  const [current, setCurrent] = useState(forms[0] || null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const pdfFrameRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // 'pen' | 'text' | 'erase'
  const [strokeColor, setStrokeColor] = useState("#e11d48");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [eraseRadius, setEraseRadius] = useState(10);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [formHistories, setFormHistories] = useState({}); // name -> history
  const [savedAt, setSavedAt] = useState({}); // name -> timestamp
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState([]); // {id,name,date,dataUrl}
  const [isNarrow, setIsNarrow] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!current && forms.length > 0) {
      setCurrent(forms[0]);
    }
  }, [forms, current]);

  const onChange = (e) => {
    const name = e.target.value;
    const found = forms.find((f) => f.name === name);
    if (found) {
      setImageLoaded(false);
      setCurrent(found);
    }
  };

  const markDone = () => {
    if (!current) return;
    setFormHistories((prev) => ({ ...prev, [current.name]: history }));
    setSavedAt((prev) => ({ ...prev, [current.name]: Date.now() }));
  };

  // Load persisted history (last 5 PDFs) from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("forms_pdf_history");
      if (raw) setHistoryItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persistHistory = (items) => {
    try {
      localStorage.setItem("forms_pdf_history", JSON.stringify(items));
    } catch {}
  };

  const addHistoryItem = (name, dataUrl) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      date: new Date().toISOString(),
      dataUrl,
    };
    const next = [...historyItems, item].slice(-5); // keep last 5
    setHistoryItems(next);
    persistHistory(next);
  };

  const dataUrlToBlob = (dataUrl) => {
    try {
      const parts = dataUrl.split(",");
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      return new Blob([u8], { type: mime });
    } catch {
      return null;
    }
  };

  const openHistoryItem = (item) => {
    const blob = dataUrlToBlob(item.dataUrl);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const resizeCanvasToViewer = () => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * pixelRatio);
    canvas.height = Math.floor(rect.height * pixelRatio);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(pixelRatio, pixelRatio);
    redrawFromHistory();
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvasToViewer);
    return () => window.removeEventListener("resize", resizeCanvasToViewer);
  }, []);

  // Detect portrait or narrow width to switch to top toolbar
  useEffect(() => {
    const detect = () => {
      const portrait = window.matchMedia && window.matchMedia("(orientation: portrait)").matches;
      setIsNarrow(portrait || window.innerWidth < 1024);
    };
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  useEffect(() => {
    // reset drawings on new form
    const stored = current ? formHistories[current.name] || [] : [];
    setHistory(stored);
    setRedoStack([]);
    // defer canvas size until image loads
  }, [current]);

  // persist per-form history whenever it changes
  useEffect(() => {
    if (!current) return;
    setFormHistories((prev) => ({ ...prev, [current.name]: history }));
  }, [history, current]);

  // When image is loaded or history changes after load, size canvas and redraw
  useEffect(() => {
    if (!imageLoaded) return;
    resizeCanvasToViewer();
    redrawFromHistory();
  }, [imageLoaded, history]);

  const editedCount = useMemo(() => {
    return Object.values(formHistories).filter((h) => Array.isArray(h) && h.length > 0).length;
  }, [formHistories]);

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getCanvasPos(e);
    if (tool === "pen") {
      setIsDrawing(true);
      const stroke = {
        type: "path",
        color: strokeColor,
        width: strokeWidth,
        points: [{ x: pos.x, y: pos.y }],
      };
      setHistory((h) => [...h, stroke]);
      setRedoStack([]);
    } else if (tool === "erase") {
      setIsDrawing(true); // Enable drawing mode for eraser
      eraseAtPoint(pos.x, pos.y);
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e);
    if (isDrawing && tool === "pen") {
      const copy = history.slice();
      const last = copy[copy.length - 1];
      if (last && last.type === "path") {
        last.points = [...last.points, { x: pos.x, y: pos.y }];
      }
      setHistory(copy);
      redrawFromHistory(copy);
    } else if (isDrawing && tool === "erase") {
      eraseAtPoint(pos.x, pos.y);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const addTextAt = (x, y) => {
    const value = prompt("Enter text");
    if (!value) return;
    const next = [...history, { type: "text", x, y, color: strokeColor, value }];
    setHistory(next);
    setRedoStack([]);
    redrawFromHistory(next);
  };

  const handleCanvasClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getCanvasPos(e);
    if (tool === "text") {
      addTextAt(x, y);
    }
    // Remove duplicate erase handling from click - it's handled in pointer events
  };

  const eraseAtPoint = (x, y) => {
    const r = eraseRadius;
    const r2 = r * r;
    const within = (px, py) => (px - x) * (px - x) + (py - y) * (py - y) <= r2;

    const rebuilt = [];
    for (const item of history) {
      if (item.type === "path") {
        // Split the path into segments, removing points near eraser
        let segment = [];
        const segments = [];
        for (let i = 0; i < item.points.length; i++) {
          const p = item.points[i];
          if (within(p.x, p.y)) {
            if (segment.length > 1) {
              segments.push(segment);
            }
            segment = [];
          } else {
            segment.push({ x: p.x, y: p.y });
          }
        }
        if (segment.length > 1) segments.push(segment);
        if (segments.length === 0) {
          // Entire stroke removed → nothing added
        } else if (segments.length === 1 && segments[0].length === item.points.length) {
          // Unaffected → keep original
          rebuilt.push(item);
        } else {
          // Replace with remaining sub-strokes
          for (const seg of segments) {
            rebuilt.push({ type: "path", color: item.color, width: item.width, points: seg });
          }
        }
      } else if (item.type === "text") {
        // approximate text bounds
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.font = "16px sans-serif";
        const w = ctx.measureText(item.value).width;
        const h = 18; // approx line height
        const left = item.x;
        const top = item.y - h;
        const hit = x >= left - r && x <= left + w + r && y >= top - r && y <= top + h + r;
        if (!hit) rebuilt.push(item);
      } else {
        rebuilt.push(item);
      }
    }

    if (rebuilt.length !== history.length) {
      setHistory(rebuilt);
      setRedoStack([]);
      redrawFromHistory(rebuilt);
    }
  };

  const redrawFromHistory = (h = history) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw every item
    for (const item of h) {
      if (item.type === "path") {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        item.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (item.type === "text") {
        ctx.fillStyle = item.color;
        ctx.font = "16px sans-serif";
        ctx.fillText(item.value, item.x, item.y);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const copy = history.slice();
    const popped = copy.pop();
    setHistory(copy);
    setRedoStack((r) => [...r, popped]);
    redrawFromHistory(copy);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const copy = redoStack.slice();
    const restored = copy.pop();
    setRedoStack(copy);
    const next = [...history, restored];
    setHistory(next);
    redrawFromHistory(next);
  };

  const clearAll = () => {
    if (!window.confirm("Clear all annotations?")) return;
    setHistory([]);
    setRedoStack([]);
    redrawFromHistory();
  };

  const savePNG = () => {
    const viewer = document.getElementById("forms-viewer");
    const vw = viewer.clientWidth;
    const vh = viewer.clientHeight;
    const isImage = imgRef.current && current && !/\.pdf$/i.test(current.url);

    if (isImage) {
      const imgEl = imgRef.current;
      const iw = imgEl.naturalWidth;
      const ih = imgEl.naturalHeight;
      const scale = Math.min(vw / iw, vh / ih);
      const dw = Math.floor(iw * scale);
      const dh = Math.floor(ih * scale);
      const dx = (vw - dw) / 2;
      const dy = (vh - dh) / 2;

      // export at higher pixel density for clarity
      const scaleFactor = 2;
      const out = document.createElement("canvas");
      out.width = dw * scaleFactor;
      out.height = dh * scaleFactor;
      const ctx = out.getContext("2d");
      ctx.drawImage(imgEl, 0, 0, out.width, out.height);

      // draw annotations transformed from viewer coords → image coords
      const ratioX = (dw * scaleFactor) / vw;
      const ratioY = (dh * scaleFactor) / vh;
      const ann = canvasRef.current;
      if (ann) {
        // ensure latest drawing is on the canvas
        redrawFromHistory();
        ctx.drawImage(ann, -dx * ratioX, -dy * ratioY, vw * ratioX, vh * ratioY);
      }

      const dataUrl = out.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${current?.name || "form"}.png`;
      a.click();
      // Re-sync canvas after export
      setTimeout(() => {
        try {
          resizeCanvasToViewer();
          redrawFromHistory();
        } catch {}
      }, 0);
    } else {
      // fallback to full viewer (PDF base cannot be rasterized)
      const tempCanvas = document.createElement("canvas");
      const pixelRatio = window.devicePixelRatio || 1;
      tempCanvas.width = Math.floor(vw * pixelRatio);
      tempCanvas.height = Math.floor(vh * pixelRatio);
      const tctx = tempCanvas.getContext("2d");
      tctx.scale(pixelRatio, pixelRatio);
      const ann = canvasRef.current;
      if (ann) tctx.drawImage(ann, 0, 0, vw, vh);
      const dataUrl = tempCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${current?.name || "form"}.png`;
      a.click();
      setTimeout(() => {
        try {
          resizeCanvasToViewer();
          redrawFromHistory();
        } catch {}
      }, 0);
    }
  };

  const savePDF = async () => {
    // Try to use jsPDF via CDN if available
    const ensureJspdf = () =>
      new Promise((resolve) => {
        if (window.jspdf || window.jsPDF) return resolve();
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    await ensureJspdf();

    const viewer = document.getElementById("forms-viewer");
    const vw = viewer.clientWidth;
    const vh = viewer.clientHeight;

    let dataUrl;
    let exportW = vw;
    let exportH = vh;
    if (imgRef.current && current && !/\.pdf$/i.test(current.url)) {
      // export cropped to image bounds
      const imgEl = imgRef.current;
      const iw = imgEl.naturalWidth;
      const ih = imgEl.naturalHeight;
      const scale = Math.min(vw / iw, vh / ih);
      const dw = Math.floor(iw * scale);
      const dh = Math.floor(ih * scale);
      const dx = (vw - dw) / 2;
      const dy = (vh - dh) / 2;
      const scaleFactor = 2;
      const out = document.createElement("canvas");
      out.width = dw * scaleFactor;
      out.height = dh * scaleFactor;
      const ctx = out.getContext("2d");
      ctx.drawImage(imgEl, 0, 0, out.width, out.height);
      const ratioX = (dw * scaleFactor) / vw;
      const ratioY = (dh * scaleFactor) / vh;
      const ann = canvasRef.current;
      if (ann) {
        ctx.drawImage(ann, -dx * ratioX, -dy * ratioY, vw * ratioX, vh * ratioY);
      }
      dataUrl = out.toDataURL("image/png");
      exportW = out.width;
      exportH = out.height;
    } else {
      // fallback: annotations only full viewport
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = vw;
      tmpCanvas.height = vh;
      const tctx = tmpCanvas.getContext("2d");
      const ann = canvasRef.current;
      if (ann) tctx.drawImage(ann, 0, 0, vw, vh);
      dataUrl = tmpCanvas.toDataURL("image/png");
      exportW = vw;
      exportH = vh;
    }
    if (window.jspdf || window.jsPDF) {
      const { jsPDF } = window.jspdf || window;
      const orientation = exportW > exportH ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [exportW, exportH] });
      pdf.addImage(dataUrl, "PNG", 0, 0, exportW, exportH);
      const pdfBlob = pdf.output("blob");
      const r = new FileReader();
      r.onloadend = () => {
        addHistoryItem(current?.name || "form", r.result);
      };
      r.readAsDataURL(pdfBlob);
      pdf.save(`${current?.name || "form"}.pdf`);
      // After save, re-sync canvas so drawing continues smoothly
      setTimeout(() => {
        try {
          resizeCanvasToViewer();
          redrawFromHistory();
        } catch {}
      }, 0);
    } else {
      // Fallback: open image in print dialog
      const w = window.open("about:blank", "_blank");
      if (w) {
        w.document.write(`<img src="${dataUrl}" style="width:100%">`);
        w.document.close();
        w.focus();
        w.print();
      }
      setTimeout(() => {
        try {
          resizeCanvasToViewer();
          redrawFromHistory();
        } catch {}
      }, 0);
    }
  };

  const renderFormToCanvas = (form, hist, viewerWidth, viewerHeight) =>
    new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      const drawAnnotations = () => {
        // replay items in hist on ctx
        for (const item of hist) {
          if (item.type === "path") {
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            item.points.forEach((p, i) => {
              if (i === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
          } else if (item.type === "text") {
            ctx.fillStyle = item.color;
            ctx.font = "16px sans-serif";
            ctx.fillText(item.value, item.x, item.y);
          }
        }
        resolve(canvas);
      };

      if (form.url.match(/\.pdf$/i)) {
        // cannot rasterize pdf reliably cross-origin: draw annotations only
        canvas.width = viewerWidth;
        canvas.height = viewerHeight;
        ctx = canvas.getContext("2d");
        drawAnnotations();
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const vw = viewerWidth;
          const vh = viewerHeight;
          const iw = img.naturalWidth;
          const ih = img.naturalHeight;
          const scale = Math.min(vw / iw, vh / ih);
          const dw = Math.floor(iw * scale);
          const dh = Math.floor(ih * scale);
          const dx = (vw - dw) / 2;
          const dy = (vh - dh) / 2;
          // set canvas to content size only
          canvas.width = dw;
          canvas.height = dh;
          ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, dw, dh);

          // draw annotations transformed
          const ratioX = dw / vw;
          const ratioY = dh / vh;
          const htx = ctx;
          const originalHist = hist || [];
          for (const item of originalHist) {
            if (item.type === "path") {
              htx.strokeStyle = item.color;
              htx.lineWidth = item.width;
              htx.lineCap = "round";
              htx.lineJoin = "round";
              htx.beginPath();
              item.points.forEach((p, i) => {
                const tx = (p.x - dx) * ratioX;
                const ty = (p.y - dy) * ratioY;
                if (i === 0) htx.moveTo(tx, ty);
                else htx.lineTo(tx, ty);
              });
              htx.stroke();
            } else if (item.type === "text") {
              htx.fillStyle = item.color;
              htx.font = "16px sans-serif";
              const tx = (item.x - dx) * ratioX;
              const ty = (item.y - dy) * ratioY;
              htx.fillText(item.value, tx, ty);
            }
          }
          resolve(canvas);
        };
        img.src = form.url;
      }
    });

  const saveAllPDF = async () => {
    const viewer = document.getElementById("forms-viewer");
    const vw = Math.max(800, viewer?.clientWidth || 800);
    const vh = Math.max(1000, viewer?.clientHeight || 1000);

    const ensureJspdf = () =>
      new Promise((resolve) => {
        if (window.jspdf || window.jsPDF) return resolve();
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    await ensureJspdf();

    const canvases = [];
    for (const form of forms) {
      const hist = formHistories[form.name] || [];
      if (!hist || hist.length === 0) continue; // only updated forms
      const c = await renderFormToCanvas(form, hist, vw, vh);
      canvases.push({ name: form.name, canvas: c });
    }

    if (canvases.length < 2) return; // require at least two updated forms
    const { jsPDF } = window.jspdf || window;
    // Use each page's own size and orientation
    let pdf;
    canvases.forEach((item, idx) => {
      const cw = item.canvas.width;
      const ch = item.canvas.height;
      const orientation = cw > ch ? "landscape" : "portrait";
      if (idx === 0) {
        pdf = new jsPDF({ orientation, unit: "px", format: [cw, ch] });
      } else {
        pdf.addPage([cw, ch], orientation);
      }
      pdf.addImage(item.canvas.toDataURL("image/png"), "PNG", 0, 0, cw, ch);
    });
    const blob = pdf.output("blob");
    const r = new FileReader();
    r.onloadend = () => {
      addHistoryItem("forms_combined", r.result);
    };
    r.readAsDataURL(blob);
    pdf.save("forms_combined.pdf");
    setTimeout(() => {
      try {
        resizeCanvasToViewer();
        redrawFromHistory();
      } catch {}
    }, 0);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle menu"
            onClick={() => {
              if (window.toggleSidebar) {
                window.toggleSidebar();
              } else {
                window.dispatchEvent(new Event("toggle-sidebar"));
              }
            }}
            className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
          >
            <span style={{ display: "inline-block", width: 16, height: 12 }}>
              <span
                style={{ display: "block", height: 2, background: "#111", borderRadius: 2, marginBottom: 3 }}
              ></span>
              <span
                style={{ display: "block", height: 2, background: "#111", borderRadius: 2, marginBottom: 3 }}
              ></span>
              <span style={{ display: "block", height: 2, background: "#111", borderRadius: 2 }}></span>
            </span>
          </button>
          <div className="font-semibold">Forms</div>
        </div>
        <div className="flex items-center space-x-2">
          <select className="input-field" value={current?.name || ""} onChange={onChange}>
            {forms.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
          <button className="btn-secondary" onClick={markDone}>
            Done
          </button>
          {current && savedAt[current.name] && (
            <span className="text-xs text-gray-500">
              Saved {new Date(savedAt[current.name]).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 flex pt-14">
        <div className="flex-1 flex flex-col overflow-hidden">
          {isNarrow && (
            <div className="border-b bg-white/90 backdrop-blur px-2 py-1 flex flex-wrap items-center gap-2 z-30 min-h-[36px]">
              <div className="flex items-center gap-1">
                <button
                  title="Pen"
                  className={`btn-secondary p-1 ${tool === "pen" ? "ring-2 ring-teal-500" : ""}`}
                  onClick={() => setTool("pen")}
                >
                  ✏️
                </button>
                <button
                  title="Text"
                  className={`btn-secondary p-1 ${tool === "text" ? "ring-2 ring-teal-500" : ""}`}
                  onClick={() => setTool("text")}
                >
                  A
                </button>
                <button
                  title="Erase"
                  className={`btn-secondary p-1 ${tool === "erase" ? "ring-2 ring-teal-500" : ""}`}
                  onClick={() => setTool("erase")}
                >
                  🧽
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  aria-label="Color"
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                />
                <input
                  aria-label="Width"
                  className="h-2"
                  type="range"
                  min="1"
                  max="12"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(parseInt(e.target.value) || 3)}
                />
                {tool === "erase" && (
                  <input
                    aria-label="Erase radius"
                    className="h-2"
                    type="range"
                    min="5"
                    max="40"
                    value={eraseRadius}
                    onChange={(e) => setEraseRadius(parseInt(e.target.value) || 10)}
                  />
                )}
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <button title="Undo" className="btn-secondary p-1" onClick={undo}>
                  ↶
                </button>
                <button title="Redo" className="btn-secondary p-1" onClick={redo}>
                  ↷
                </button>
                <button title="Clear" className="btn-secondary p-1" onClick={clearAll}>
                  🗑️
                </button>
                <button title="Save PNG" className="btn-primary p-1" onClick={savePNG}>
                  🖼️
                </button>
                <button title="Save PDF" className="btn-primary p-1" onClick={savePDF}>
                  📄
                </button>
                {editedCount >= 2 && (
                  <button title="Save All" className="btn-primary p-1" onClick={saveAllPDF}>
                    📚
                  </button>
                )}
              </div>
            </div>
          )}
          <div id="forms-viewer" className="flex-1 relative">
            {!current ? (
              <div className="h-full flex items-center justify-center text-gray-500">No forms found</div>
            ) : current.url.match(/\.pdf$/i) ? (
              <iframe
                ref={pdfFrameRef}
                title={current.name}
                src={current.url}
                className="w-full h-full border-0 bg-white"
              />
            ) : (
              <div className="w-full h-full flex items-start justify-center p-2 bg-white overflow-auto">
                <div style={{ position: "relative" }}>
                  <img
                    ref={imgRef}
                    src={current.url}
                    alt={current.name}
                    className="object-contain"
                    style={{ maxHeight: "80vh", maxWidth: "90vw" }}
                    onLoad={() => {
                      setImageLoaded(true);
                    }}
                    key={current?.name}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      cursor: tool === "erase" ? "crosshair" : "default",
                    }}
                    className="touch-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onClick={handleCanvasClick}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                  />
                </div>
              </div>
            )}
            {/* For PDFs keep full overlay */}
            {current?.url?.match(/\.pdf$/i) && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full touch-none"
                style={{ cursor: tool === "erase" ? "crosshair" : "default" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleCanvasClick}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
            )}
          </div>
        </div>
        {/* Right Toolbar (hidden on narrow/portrait) */}
        {!isNarrow && (
          <div className="w-64 border-l bg-white p-3 space-y-3">
            <div className="font-medium">Tools</div>
            <div className="space-x-2">
              <button
                className={`btn-secondary ${tool === "pen" ? "ring-2 ring-teal-500" : ""}`}
                onClick={() => setTool("pen")}
              >
                Pen
              </button>
              <button
                className={`btn-secondary ${tool === "text" ? "ring-2 ring-teal-500" : ""}`}
                onClick={() => setTool("text")}
              >
                Text
              </button>
              <button
                className={`btn-secondary ${tool === "erase" ? "ring-2 ring-teal-500" : ""}`}
                onClick={() => setTool("erase")}
              >
                Erase
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Color</label>
              <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Width</label>
              <input
                type="range"
                min="1"
                max="12"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value) || 3)}
              />
            </div>
            {tool === "erase" && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Erase radius</label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={eraseRadius}
                  onChange={(e) => setEraseRadius(parseInt(e.target.value) || 10)}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={undo}>
                Undo
              </button>
              <button className="btn-secondary" onClick={redo}>
                Redo
              </button>
              <button className="btn-secondary" onClick={clearAll}>
                Clear
              </button>
            </div>
            <div className="pt-2 border-t">
              <div className="font-medium mb-2">Save</div>
              <div className="flex flex-col space-y-2">
                <button className="btn-primary" onClick={savePNG}>
                  Save PNG
                </button>
                <button className="btn-primary" onClick={savePDF}>
                  Save PDF
                </button>
                {editedCount >= 2 && (
                  <button className="btn-primary" onClick={saveAllPDF}>
                    Save All (PDF)
                  </button>
                )}
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">History</div>
                <button className="btn-secondary" onClick={() => setShowHistory(!showHistory)}>
                  {showHistory ? "Hide" : "Show"}
                </button>
              </div>
              {showHistory && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {historyItems.length === 0 ? (
                    <div className="text-sm text-gray-500">No saved PDFs yet</div>
                  ) : (
                    historyItems
                      .slice()
                      .reverse()
                      .map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1"
                        >
                          <div className="truncate mr-2">
                            <div className="font-medium truncate">{h.name}</div>
                            <div className="text-gray-500 text-xs">{new Date(h.date).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <a className="btn-secondary-sm" href={h.dataUrl} download={`${h.name}.pdf`}>
                              Download
                            </a>
                            <button className="btn-secondary-sm" onClick={() => openHistoryItem(h)}>
                              Open
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsPage;
