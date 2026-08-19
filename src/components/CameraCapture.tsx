import React, { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, RotateCw, Sparkles, UploadCloud, Zap, ZapOff, Check, X, PencilLine } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CameraCaptureProps {
  onCapture: (base64Image: string, mimeType: string) => void;
  onOpenCanvas: () => void;
  isLoading?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onOpenCanvas,
  isLoading = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [isFlashEffect, setIsFlashEffect] = useState<boolean>(false);

  // Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isMounted = true;

    async function initCamera() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        if (isMounted) {
          setCameraError(
            "Camera access unavailable in this environment. You can upload an image or write on the scratchpad!"
          );
        }
        return;
      }

      try {
        if (isMounted) setCameraError(null);

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play?.().catch(() => {
            // Autoplay policy or pause handled gracefully
          });
        }
      } catch (err: any) {
        console.warn("Camera access warning:", err);
        if (isMounted) {
          setCameraError(
            "Camera access unavailable or permission denied. You can still upload photos or use our equation scratchpad!"
          );
        }
      }
    }

    if (!capturedImage) {
      initCamera();
    }

    return () => {
      isMounted = false;
      if (activeStream) {
        try {
          activeStream.getTracks().forEach((track) => track.stop());
        } catch {
          // ignore
        }
      }
    };
  }, [facingMode, capturedImage]);

  // Flip camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Take photo
  const takePhoto = () => {
    if (!videoRef.current) return;

    // Flash animation effect
    setIsFlashEffect(true);
    setTimeout(() => setIsFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // If front camera, flip horizontally
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCapturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm photo
  const confirmCapturedPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage, "image/jpeg");
    }
  };

  // Retake
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div id="camera-capture-container" className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/90 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              SolveStep <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Vision</span>
            </h2>
            <p className="text-[11px] text-slate-300">Align math or physics problem inside frame</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-flash"
            onClick={() => setFlashActive(!flashActive)}
            title="Toggle Flash/High Contrast"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              flashActive
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
            }`}
          >
            {flashActive ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>

          <button
            id="btn-open-scratchpad"
            onClick={onOpenCanvas}
            title="Handwrite / Draw Problem"
            className="h-9 px-3 rounded-full bg-slate-800/90 hover:bg-indigo-600/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all border border-slate-700/60"
          >
            <PencilLine className="w-3.5 h-3.5 text-indigo-400" />
            <span>Draw</span>
          </button>
        </div>
      </div>

      {/* Main Viewfinder Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {/* Flash Animation Effect */}
        <AnimatePresence>
          {isFlashEffect && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {capturedImage ? (
          /* Preview of Captured Photo */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured problem"
              className="w-full h-full object-contain max-h-[75vh]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />
          </div>
        ) : (
          /* Live Camera Stream */
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            {cameraError ? (
              <div className="p-6 text-center max-w-sm mx-auto space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Camera Standby</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload a photo from your gallery or draw handwritten equations on our interactive scratchpad.
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    id="btn-upload-camera-fallback"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Problem Image</span>
                  </button>
                  <button
                    id="btn-draw-camera-fallback"
                    onClick={onOpenCanvas}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700/60"
                  >
                    <PencilLine className="w-4 h-4 text-indigo-400" />
                    <span>Write / Draw Equations</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    flashActive ? "brightness-125 contrast-125 saturate-110" : ""
                  }`}
                />

                {/* Viewfinder Target Framing Box */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                  <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl border border-white/20 shadow-[0_0_0_9999px_rgba(2,6,23,0.65)]">
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-indigo-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-indigo-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-indigo-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-indigo-400 rounded-br-lg" />

                    {/* Laser Scan Animation Line */}
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                      animate={{
                        top: ["10%", "90%", "10%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-white/10 shadow-sm">
                        Snap equations, graphs, or word problems
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-20 px-6 py-6 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-around">
        {capturedImage ? (
          /* Confirmation Controls */
          <div className="w-full flex items-center justify-between gap-4 max-w-md mx-auto">
            <button
              id="btn-retake-photo"
              onClick={retakePhoto}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all border border-slate-700/60"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>Retake</span>
            </button>

            <button
              id="btn-confirm-photo"
              onClick={confirmCapturedPhoto}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Solve with AI</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Shutter & Capture Controls */
          <div className="w-full flex items-center justify-between max-w-sm mx-auto">
            {/* Gallery Upload Button */}
            <button
              id="btn-gallery-upload"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Upload photo from device"
            >
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            </button>

            {/* Big Shutter Button */}
            <button
              id="btn-shutter"
              onClick={takePhoto}
              className="relative group p-1 rounded-full active:scale-90 transition-transform"
              title="Snap Problem"
            >
              <div className="w-18 h-18 rounded-full border-4 border-indigo-500/40 p-1 flex items-center justify-center bg-slate-900 group-hover:border-indigo-400 transition-all shadow-xl shadow-indigo-600/20">
                <div className="w-full h-full rounded-full bg-white group-hover:bg-indigo-100 transition-colors flex items-center justify-center shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30" />
                </div>
              </div>
            </button>

            {/* Flip Camera Button */}
            <button
              id="btn-flip-camera"
              onClick={toggleFacingMode}
              className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="Switch camera"
            >
              <RotateCw className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
