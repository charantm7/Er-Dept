import React, { useRef, useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { useParams } from "react-router-dom";

const forms = [
  { name: "Consultation Form", url: "/forms/consultation.jpg" },
  { name: "Lab Request Form", url: "/forms/lab.jpg" },
];

const PatientFormPage = ({ forms }) => {
  const canvasRef = useRef(null);
  const { mrno } = useParams();
  const [selectedForm, setSelectedForm] = useState(forms[0]); // default form
  const [ctx, setCtx] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ff0000");
  const [lineWidth, setLineWidth] = useState(3);
  const [eraser, setEraser] = useState(false);

  // For undo/redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const context = canvas.getContext("2d");
    setCtx(context);
    // Reset history on new form load
    setHistory([]);
    setHistoryStep(-1);
  }, [selectedForm]);

  const saveHistory = () => {
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const updatedHistory = history.slice(0, historyStep + 1);
    setHistory([...updatedHistory, imageData]);
    setHistoryStep((prev) => prev + 1);
  };

  const startDrawing = (e) => {
    if (!ctx) return;
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = eraser ? "#fff" : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
  };

  const draw = (e) => {
    if (!drawing || !ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (drawing) saveHistory();
    setDrawing(false);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const step = historyStep - 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const step = historyStep + 1;
    ctx.putImageData(history[step], 0, 0);
    setHistoryStep(step);
  };

  const clearCanvas = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  };

  // Save as PNG
  const saveAsPNG = () => {
    const link = document.createElement("a");
    link.download = `${patient.name}_${selectedForm.name}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Save as PDF
  const saveAsPDF = () => {
    const pdf = new jsPDF();
    const imgData = canvasRef.current.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // A4 size
    pdf.save(`${patient.name}_${selectedForm.name}.pdf`);
  };

  return (
    <div className="p-5">
      {/* Form Dropdown */}
      <div className="mb-4 flex gap-2">
        {forms.map((form, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedForm(form)}
            className={`px-3 py-1 rounded ${
              selectedForm === form ? "bg-teal-500 text-white" : "bg-gray-200"
            }`}
          >
            {form.name}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-2 flex items-center gap-3">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input
          type="range"
          min={1}
          max={10}
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
        />
        <button
          onClick={() => setEraser(!eraser)}
          className={`px-3 py-1 rounded ${eraser ? "bg-gray-500 text-white" : "bg-gray-200"}`}
        >
          {eraser ? "Eraser On" : "Eraser Off"}
        </button>
        <button onClick={undo} className="px-3 py-1 rounded bg-yellow-400">
          Undo
        </button>
        <button onClick={redo} className="px-3 py-1 rounded bg-yellow-400">
          Redo
        </button>
        <button onClick={clearCanvas} className="px-3 py-1 rounded bg-red-500 text-white">
          Clear
        </button>
        <button onClick={saveAsPNG} className="px-3 py-1 rounded bg-green-500 text-white">
          Save PNG
        </button>
        <button onClick={saveAsPDF} className="px-3 py-1 rounded bg-blue-500 text-white">
          Save PDF
        </button>
      </div>

      {/* Form + Canvas */}
      <div className="relative w-full border">
        <img src={selectedForm.url} alt="Patient Form" className="w-full block" />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default PatientFormPage;
