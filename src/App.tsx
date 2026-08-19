import React, { useState, useEffect } from "react";
import { CameraCapture } from "./components/CameraCapture";
import { HandwritingPad } from "./components/HandwritingPad";
import { SolutionView } from "./components/SolutionView";
import { PracticeModal } from "./components/PracticeModal";
import { SampleProblems } from "./components/SampleProblems";
import { KotlinSourceViewer } from "./components/KotlinSourceViewer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { SolutionData, PracticeProblemData, SampleProblem, HistoryRecord } from "./types";
import {
  Camera,
  Clock,
  Code,
  Flame,
  HelpCircle,
  PencilLine,
  RotateCw,
  Sparkles,
  Wifi,
  Battery,
  Signal,
  Atom,
  Calculator,
  ChevronLeft,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ActiveTab = "camera" | "scratchpad" | "solution";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("camera");
  const [currentSolution, setCurrentSolution] = useState<SolutionData | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Practice Similar State
  const [practiceData, setPracticeData] = useState<PracticeProblemData | null>(null);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState<boolean>(false);
  const [isPracticeLoading, setIsPracticeLoading] = useState<boolean>(false);

  // Modals & Panels
  const [isKotlinViewerOpen, setIsKotlinViewerOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("solvestep_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load history", e);
    }
  }, []);

  const saveToHistory = (solution: SolutionData, image?: string | null) => {
    const newRecord: HistoryRecord = {
      id: "hist-" + Date.now(),
      timestamp: Date.now(),
      title: solution.detectedText.slice(0, 50),
      subject: solution.subject,
      topic: solution.topic,
      imagePreview: image || undefined,
      solution,
    };

    const updated = [newRecord, ...history.slice(0, 19)];
    setHistory(updated);
    try {
      localStorage.setItem("solvestep_history", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist history", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("solvestep_history");
    } catch (e) {
      console.warn("Failed to clear history", e);
    }
  };

  // Solve from photo / canvas
  const handleSolveImage = async (imageBase64: string, mimeType: string = "image/jpeg") => {
    try {
      setIsSolving(true);
      setErrorMessage(null);
      setSourceImage(imageBase64);

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze math problem.");
      }

      setCurrentSolution(result.data);
      saveToHistory(result.data, imageBase64);
      setActiveTab("solution");
    } catch (err: any) {
      console.error("Solve error:", err);
      setErrorMessage(err.message || "Could not detect or solve equation. Please check your image clarity.");
    } finally {
      setIsSolving(false);
    }
  };

  // Solve from sample text problem
  const handleSelectSample = async (sample: SampleProblem) => {
    try {
      setIsSolving(true);
      setErrorMessage(null);
      setSourceImage(null);

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textPrompt: sample.textPrompt,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze problem.");
      }

      setCurrentSolution(result.data);
      saveToHistory(result.data, null);
      setActiveTab("solution");
    } catch (err: any) {
      console.error("Sample solve error:", err);
      setErrorMessage(err.message || "Failed to solve sample problem.");
    } finally {
      setIsSolving(false);
    }
  };

  // Trigger Gemini Practice Similar problem generation
  const handleGeneratePractice = async () => {
    if (!currentSolution) return;

    try {
      setIsPracticeLoading(true);
      setErrorMessage(null);

      const response = await fetch("/api/practice-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalProblem: currentSolution.detectedText,
          topic: currentSolution.topic,
          concepts: currentSolution.concepts,
          difficulty: currentSolution.difficulty,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate practice problem.");
      }

      setPracticeData(result.data);
      setIsPracticeModalOpen(true);
    } catch (err: any) {
      console.error("Practice generation error:", err);
      setErrorMessage(err.message || "Could not generate practice problem.");
    } finally {
      setIsPracticeLoading(false);
    }
  };

  return (
    <div id="solvestep-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased">
      {/* Mobile-Frame Container (Responsive Android Simulation Container) */}
      <div className="w-full max-w-2xl min-h-screen flex flex-col bg-slate-950 shadow-2xl relative border-x border-slate-800/80">
        
        {/* Android Status Bar Simulation */}
        <div className="w-full bg-slate-950 px-5 py-2 flex items-center justify-between text-xs text-slate-400 select-none border-b border-slate-900 z-30">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span>9:41</span>
            <span className="text-[10px] text-indigo-400 font-bold">• SolveStep</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Top App Bar (Jetpack Compose Material 3 styling) */}
        <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {activeTab !== "camera" ? (
              <button
                id="btn-nav-back"
                onClick={() => setActiveTab("camera")}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to camera"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white font-black text-sm">
                ∑
              </div>
            )}

            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>SolveStep</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Android AI
                </span>
              </h1>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              id="btn-open-kotlin-code"
              onClick={() => setIsKotlinViewerOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="View Native Kotlin & Jetpack Compose Code"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Kotlin</span>
            </button>

            <button
              id="btn-open-history"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Saved History"
            >
              <Clock className="w-4 h-4 text-slate-400 hover:text-white" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
              )}
            </button>
          </div>
        </header>

        {/* Global Loading Overlay for Gemini Multimodal Analysis */}
        <AnimatePresence>
          {isSolving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 animate-pulse">
                  <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: "6s" }} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold shadow-lg">
                  AI
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-white">Gemini Multimodal Vision Active</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Detecting handwritten equations, parsing physics laws, and preparing step-by-step LaTeX derivations...
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-indigo-300 font-mono">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Computing conceptual breakdown &amp; LaTeX steps</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Notification Toast */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="m-4 p-3.5 rounded-2xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xl z-40"
            >
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="p-1 text-rose-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary View Content Router */}
        <main className="flex-1 w-full flex flex-col">
          {activeTab === "camera" && (
            <div className="flex-1 flex flex-col">
              {/* Camera Viewfinder Component */}
              <div className="w-full h-[52vh] min-h-[340px]">
                <CameraCapture
                  onCapture={handleSolveImage}
                  onOpenCanvas={() => setActiveTab("scratchpad")}
                  isLoading={isSolving}
                />
              </div>

              {/* Sample Problems Gallery Section */}
              <div className="flex-1 p-4 bg-slate-950 overflow-y-auto">
                <SampleProblems
                  onSelectProblem={handleSelectSample}
                  isLoading={isSolving}
                />
              </div>
            </div>
          )}

          {activeTab === "scratchpad" && (
            <div className="flex-1 h-[calc(100vh-100px)]">
              <HandwritingPad
                onConfirm={handleSolveImage}
                onBack={() => setActiveTab("camera")}
                isLoading={isSolving}
              />
            </div>
          )}

          {activeTab === "solution" && currentSolution && (
            <SolutionView
              solution={currentSolution}
              sourceImage={sourceImage}
              onPracticeSimilar={handleGeneratePractice}
              onNewProblem={() => setActiveTab("camera")}
              isPracticingLoading={isPracticeLoading}
            />
          )}
        </main>

        {/* Android Bottom Navigation Bar (Persistent Material 3 Navigation) */}
        <nav className="sticky bottom-0 z-20 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-6 py-2 flex items-center justify-around">
          <button
            id="tab-camera"
            onClick={() => setActiveTab("camera")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeTab === "camera"
                ? "text-indigo-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === "camera" ? "bg-indigo-500/20" : ""}`}>
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Snap Photo</span>
          </button>

          <button
            id="tab-scratchpad"
            onClick={() => setActiveTab("scratchpad")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeTab === "scratchpad"
                ? "text-indigo-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === "scratchpad" ? "bg-indigo-500/20" : ""}`}>
              <PencilLine className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Scratchpad</span>
          </button>

          <button
            id="tab-solution"
            onClick={() => {
              if (currentSolution) setActiveTab("solution");
            }}
            disabled={!currentSolution}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              !currentSolution
                ? "opacity-30 cursor-not-allowed text-slate-600"
                : activeTab === "solution"
                ? "text-indigo-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === "solution" ? "bg-indigo-500/20" : ""}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px]">Solution</span>
          </button>
        </nav>

        {/* Practice Similar Modal (with Hidden Solution Toggle) */}
        <AnimatePresence>
          {isPracticeModalOpen && practiceData && (
            <PracticeModal
              practice={practiceData}
              onClose={() => setIsPracticeModalOpen(false)}
              onGenerateAnother={handleGeneratePractice}
              isLoadingAnother={isPracticeLoading}
            />
          )}
        </AnimatePresence>

        {/* Kotlin & Jetpack Compose Native Source Code Modal */}
        <AnimatePresence>
          {isKotlinViewerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
              <div className="relative w-full max-w-4xl my-8">
                <button
                  id="btn-close-kotlin-viewer"
                  onClick={() => setIsKotlinViewerOpen(false)}
                  className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
                <KotlinSourceViewer />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* History Drawer */}
        <AnimatePresence>
          {isHistoryOpen && (
            <HistoryDrawer
              history={history}
              onSelect={(record) => {
                setCurrentSolution(record.solution);
                setSourceImage(record.imagePreview || null);
                setActiveTab("solution");
                setIsHistoryOpen(false);
              }}
              onClear={clearHistory}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
