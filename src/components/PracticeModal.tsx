import React, { useState } from "react";
import { PracticeProblemData } from "../types";
import { LatexRenderer } from "./LatexRenderer";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Lightbulb,
  Repeat,
  Sparkles,
  Trophy,
  X,
  BookOpen,
  ArrowRight,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

interface PracticeModalProps {
  practice: PracticeProblemData;
  onClose: () => void;
  onGenerateAnother: () => void;
  isLoadingAnother?: boolean;
}

export const PracticeModal: React.FC<PracticeModalProps> = ({
  practice,
  onClose,
  onGenerateAnother,
  isLoadingAnother = false,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [userAnswerInput, setUserAnswerInput] = useState<string>("");
  const [feedback, setFeedback] = useState<"correct" | "review" | null>(null);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleCheckAnswer = () => {
    if (!userAnswerInput.trim()) return;

    // Check if input roughly matches final answer text/latex numbers
    const cleanUser = userAnswerInput.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanExpected = (practice.finalAnswer.text || practice.finalAnswer.latex)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (cleanExpected.includes(cleanUser) || cleanUser.includes(cleanExpected)) {
      setFeedback("correct");
      triggerConfetti();
    } else {
      setFeedback("review");
    }
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
    if (!showSolution) {
      triggerConfetti();
    }
  };

  return (
    <div id="practice-similar-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 my-8"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Practice Similar Problem</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Targeted Variant
                </span>
              </div>
              <p className="text-xs text-slate-400">Master the technique with fresh numbers and conditions</p>
            </div>
          </div>

          <button
            id="btn-close-practice"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Practice Problem Statement */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Practice Challenge
          </span>
          <div className="text-base text-slate-100 leading-relaxed">
            <LatexRenderer content={practice.problemStatement} />
          </div>
        </div>

        {/* Hint Toggle */}
        <div className="space-y-2">
          <button
            id="btn-toggle-hint"
            onClick={() => setShowHint(!showHint)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>{showHint ? "Hide Strategy Hint" : "Need a Hint?"}</span>
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 leading-relaxed"
              >
                <LatexRenderer content={practice.hint} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Self-Check Answer Input */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            Try Working It Out First:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userAnswerInput}
              onChange={(e) => setUserAnswerInput(e.target.value)}
              placeholder="Enter your final value or expression..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheckAnswer();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              id="btn-check-practice-answer"
              onClick={handleCheckAnswer}
              disabled={!userAnswerInput.trim()}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Check</span>
            </button>
          </div>

          {feedback === "correct" && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300">
              <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Spot on! Great work solving this practice problem.</span>
            </div>
          )}

          {feedback === "review" && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center gap-2 text-xs text-amber-300">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Close! Reveal the step-by-step solution below to compare your derivations.</span>
            </div>
          )}
        </div>

        {/* HIDDEN SOLUTION TOGGLE (Prompt requirement) */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <button
            id="btn-toggle-hidden-solution"
            onClick={toggleSolution}
            className={`w-full py-3.5 px-5 rounded-2xl text-sm font-bold flex items-center justify-between transition-all border ${
              showSolution
                ? "bg-slate-800 text-white border-slate-700 shadow-md"
                : "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 text-indigo-200 border-indigo-500/40"
            }`}
          >
            <div className="flex items-center gap-2">
              {showSolution ? (
                <EyeOff className="w-4 h-4 text-indigo-400" />
              ) : (
                <Eye className="w-4 h-4 text-indigo-400" />
              )}
              <span>{showSolution ? "Hide Step-by-Step Solution" : "Reveal Step-by-Step Solution"}</span>
            </div>

            {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Expanded Hidden Solution */}
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Practice Solution Steps:</span>
                  </div>

                  {practice.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h5 className="text-xs font-bold text-white">{step.title}</h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <LatexRenderer content={step.explanation} />
                      </p>
                      {step.mathLatex && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-center overflow-x-auto text-indigo-300">
                          <LatexRenderer content={step.mathLatex} block />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Answer */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Final Answer:</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-300 text-center overflow-x-auto">
                    <LatexRenderer content={practice.finalAnswer.latex || practice.finalAnswer.text} block />
                  </div>
                </div>

                {/* Key Takeaway */}
                {practice.keyTakeaway && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <strong className="text-indigo-300 font-semibold">Key Takeaway: </strong>
                    {practice.keyTakeaway}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            id="btn-generate-another-practice"
            onClick={onGenerateAnother}
            disabled={isLoadingAnother}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700/60"
          >
            <Repeat className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isLoadingAnother ? "Generating..." : "Try Another Variant"}</span>
          </button>

          <button
            id="btn-done-practice"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            Done Practicing
          </button>
        </div>
      </motion.div>
    </div>
  );
};
