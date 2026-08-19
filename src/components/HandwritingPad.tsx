import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pen, RotateCcw, Trash2, Check, Sparkles, ArrowLeft } from "lucide-react";

interface HandwritingPadProps {
  onConfirm: (base64Image: string, mimeType: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const HandwritingPad: React.FC<HandwritingPadProps> = ({
  onConfirm,
  onBack,
  isLoading = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [color, setColor] = useState<string>("#ffffff");
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasContent, setHasContent] = useState<boolean>(false);

  // Initialize canvas size and grid
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawBackground(ctx, width, height);

    // Save initial blank state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
  }, []);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill dark background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, width, height);

    // Draw subtle math grid lines (dotted)
    ctx.strokeStyle = "rgba(71, 85, 105, 0.25)";
    ctx.lineWidth = 1;
    const gridSize = 28;

    for (let x = gridSize; x < width; x += gridSize) {
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(100, 116, 139, 0.35)";
        ctx.fill();
      }
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setHasContent(true);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
    ctx.strokeStyle = tool === "eraser" ? "#090d16" : color;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentState]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
    if (newHistory.length <= 1) setHasContent(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawBackground(ctx, canvas.width, canvas.height);
    ctx.restore();

    const blankState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blankState]);
    setHasContent(false);
  };

  const submitHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onConfirm(dataUrl, "image/png");
  };

  return (
    <div id="handwriting-scratchpad" className="relative w-full h-full flex flex-col bg-slate-950 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-10">
        <button
          id="btn-scratchpad-back"
          onClick={onBack}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Camera</span>
        </button>

        <div className="text-center">
          <h3 className="text-xs font-bold text-white tracking-wide">Equation Scratchpad</h3>
          <p className="text-[10px] text-slate-400">Write numbers, integrals, vectors or symbols</p>
        </div>

        <button
          id="btn-scratchpad-clear"
          onClick={clearCanvas}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            id="tool-pen"
            onClick={() => setTool("pen")}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-medium transition-all ${
              tool === "pen"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>

          <button
            id="tool-eraser"
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-medium transition-all ${
              tool === "eraser"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <div className="h-5 w-px bg-slate-700/60 mx-1" />

          {/* Color Palette */}
          {["#ffffff", "#818cf8", "#38bdf8", "#34d399", "#fbbf24"].map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full transition-transform ${
                color === c && tool === "pen"
                  ? "ring-2 ring-indigo-400 scale-110"
                  : "opacity-75 hover:opacity-100"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1">
            {[2, 4, 6].map((size) => (
              <button
                key={size}
                onClick={() => setStrokeWidth(size)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                  strokeWidth === size ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {size}px
              </button>
            ))}
          </div>

          <button
            id="btn-scratchpad-undo"
            onClick={undo}
            disabled={history.length <= 1}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Drawing Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full touch-none overflow-hidden cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0"
        />

        {!hasContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600 space-y-2">
            <Pen className="w-8 h-8 opacity-30" />
            <p className="text-xs tracking-wide">Write math equations, integrals, or physics formulas here</p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Handwritten symbols will be recognized and solved by Gemini
        </span>

        <button
          id="btn-scratchpad-submit"
          onClick={submitHandwriting}
          disabled={!hasContent || isLoading}
          className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-violet-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Solve Handwritten Math</span>
        </button>
      </div>
    </div>
  );
};
