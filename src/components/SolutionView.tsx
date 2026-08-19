import React, { useState } from "react";
import { SolutionData } from "../types";
import { LatexRenderer } from "./LatexRenderer";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Flame,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Repeat,
  Share2,
  Sparkles,
  Volume2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SolutionViewProps {
  solution: SolutionData;
  sourceImage?: string | null;
  onPracticeSimilar: () => void;
  onNewProblem: () => void;
  isPracticingLoading?: boolean;
}

export const SolutionView: React.FC<SolutionViewProps> = ({
  solution,
  sourceImage,
  onPracticeSimilar,
  onNewProblem,
  isPracticingLoading = false,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>(
    solution.steps.map((s) => s.stepNumber)
  );
  const [copiedLatex, setCopiedLatex] = useState<string | null>(null);
  const [activeDoubtStep, setActiveDoubtStep] = useState<number | null>(null);
  const [doubtQuestion, setDoubtQuestion] = useState<string>("");
  const [doubtAnswer, setDoubtAnswer] = useState<string | null>(null);
  const [isDoubtLoading, setIsDoubtLoading] = useState<boolean>(false);
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);

  // Toggle single step
  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  // Expand / collapse all
  const toggleAllSteps = () => {
    if (expandedSteps.length === solution.steps.length) {
      setExpandedSteps([]);
    } else {
      setExpandedSteps(solution.steps.map((s) => s.stepNumber));
    }
  };

  // Copy LaTeX helper
  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedLatex(id);
          setTimeout(() => setCopiedLatex(null), 2000);
        })
        .catch(() => {
          // Fallback or ignore clipboard error in restricted iframes
        });
    }
  };

  // Text to speech for step
  const speakStep = (stepNumber: number, title: string, explanation: string) => {
    try {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      if (speakingStep === stepNumber) {
        window.speechSynthesis.cancel();
        setSpeakingStep(null);
        return;
      }

      window.speechSynthesis.cancel();
      // Strip latex syntax for clean speech
      const cleanText = `${title}. ${explanation.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2").replace(/[$_^\\{}]/g, "")}`;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingStep(null);
      utterance.onerror = () => setSpeakingStep(null);

      setSpeakingStep(stepNumber);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingStep(null);
    }
  };

  // Ask doubt handler
  const handleAskDoubt = async (stepNumber: number, stepTitle: string, mathLatex: string) => {
    if (!doubtQuestion.trim()) return;

    try {
      setIsDoubtLoading(true);
      setDoubtAnswer(null);

      const response = await fetch("/api/ask-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: solution.detectedText,
          stepTitle,
          stepMath: mathLatex,
          userQuestion: doubtQuestion,
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        setDoubtAnswer(resData.answer);
      } else {
        setDoubtAnswer("Could not explain step right now. Please try rephrasing your question.");
      }
    } catch {
      setDoubtAnswer("Network error. Please try again.");
    } finally {
      setIsDoubtLoading(false);
    }
  };

  return (
    <div id="solution-view" className="w-full min-h-full pb-28 px-4 md:px-6 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                solution.subject.toLowerCase().includes("physic")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {solution.subject || "Math & Physics"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
              {solution.topic || "Analysis"}
            </span>

            {solution.difficulty && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {solution.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-full-problem"
              onClick={() => copyToClipboard(solution.detectedText, "problem")}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1.5 border border-slate-700/60"
              title="Copy problem statement"
            >
              {copiedLatex === "problem" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4">
          <div className="flex items-start gap-3">
            {sourceImage && (
              <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm hidden sm:block">
                <img
                  src={sourceImage}
                  alt="Original Problem Source"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-1">
                Detected Problem
              </span>
              <div className="text-slate-100 text-base leading-relaxed">
                <LatexRenderer content={solution.detectedText} />
              </div>
            </div>
          </div>
        </div>

        {/* High-Level Summary Roadmap */}
        {solution.summary && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200 leading-relaxed">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-indigo-300 font-semibold">Strategy: </strong>
              <span>{solution.summary}</span>
            </div>
          </div>
        )}
      </div>

      {/* Concept Breakdown Section */}
      {solution.concepts && solution.concepts.length > 0 && (
        <div id="concepts-breakdown" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
              Underlying Concepts &amp; Key Theorems
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {solution.concepts.map((concept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {concept.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Rule #{index + 1}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {concept.description}
                </p>

                {concept.formulaLatex && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center overflow-x-auto text-indigo-300">
                    <LatexRenderer content={concept.formulaLatex} block />
                  </div>
                )}

                {concept.whyItApplies && (
                  <p className="mt-2.5 text-[11px] text-slate-400 italic">
                    <span className="text-slate-300 font-medium">Why it applies: </span>
                    {concept.whyItApplies}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Solution Breakdown */}
      <div id="step-by-step-solution" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
              Step-by-Step Solution ({solution.steps.length} Steps)
            </h3>
          </div>

          <button
            id="btn-toggle-all-steps"
            onClick={toggleAllSteps}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {expandedSteps.length === solution.steps.length ? "Collapse All" : "Expand All"}
          </button>
        </div>

        <div className="space-y-3">
          {solution.steps.map((step, index) => {
            const isExpanded = expandedSteps.includes(step.stepNumber);
            const isDoubtOpen = activeDoubtStep === step.stepNumber;

            return (
              <motion.div
                key={step.stepNumber}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? "bg-slate-900/90 border-slate-700/80 shadow-lg shadow-black/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Step Header */}
                <div
                  onClick={() => toggleStep(step.stepNumber)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      {step.stepNumber}
                    </div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {step.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakStep(step.stepNumber, step.title, step.explanation);
                      }}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        speakingStep === step.stepNumber
                          ? "bg-indigo-600 text-white animate-pulse"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      title="Read step aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Step Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 space-y-3 border-t border-slate-800/80 pt-3"
                    >
                      {/* Plain Language Explanation */}
                      <p className="text-sm text-slate-200 leading-relaxed">
                        <LatexRenderer content={step.explanation} />
                      </p>

                      {/* Math LaTeX Equation Box */}
                      {step.mathLatex && (
                        <div className="relative group/math p-4 rounded-xl bg-slate-950 border border-slate-800 text-center overflow-x-auto shadow-inner">
                          <LatexRenderer content={step.mathLatex} block />

                          <button
                            onClick={() => copyToClipboard(step.mathLatex, `step-${step.stepNumber}`)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white opacity-0 group-hover/math:opacity-100 transition-all text-xs flex items-center gap-1"
                            title="Copy formula"
                          >
                            {copiedLatex === `step-${step.stepNumber}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Key Insight Badge */}
                      {step.keyInsight && (
                        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-xs text-amber-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-300 font-semibold">Key Rule: </strong>
                            <span>{step.keyInsight}</span>
                          </div>
                        </div>
                      )}

                      {/* Ask Doubt / Step Question Button */}
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            setActiveDoubtStep(isDoubtOpen ? null : step.stepNumber);
                            setDoubtAnswer(null);
                          }}
                          className="text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Confused by this step? Ask AI tutor</span>
                        </button>

                        {/* Interactive Doubt Box */}
                        {isDoubtOpen && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-900/50 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={doubtQuestion}
                                onChange={(e) => setDoubtQuestion(e.target.value)}
                                placeholder="e.g. Why did we substitute u = 3x here?"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAskDoubt(step.stepNumber, step.title, step.mathLatex);
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={() => handleAskDoubt(step.stepNumber, step.title, step.mathLatex)}
                                disabled={isDoubtLoading || !doubtQuestion.trim()}
                                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                              >
                                {isDoubtLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {doubtAnswer && (
                              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-100 leading-relaxed space-y-1">
                                <div className="font-semibold text-indigo-300 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-300" />
                                  <span>Tutor Explanation:</span>
                                </div>
                                <div>
                                  <LatexRenderer content={doubtAnswer} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Final Answer Banner Card */}
      <div id="final-answer-card" className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Result
              </span>
              <h3 className="text-base font-bold text-white">Final Solution</h3>
            </div>
          </div>

          <button
            id="btn-copy-final-answer"
            onClick={() => copyToClipboard(solution.finalAnswer.latex || solution.finalAnswer.text, "final-answer")}
            className="p-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copiedLatex === "final-answer" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Answer</span>
              </>
            )}
          </button>
        </div>

        {/* Big Highlighted LaTeX Expression */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 text-center overflow-x-auto">
          <div className="text-xl md:text-2xl font-bold text-emerald-300 py-1">
            <LatexRenderer content={solution.finalAnswer.latex} block />
          </div>
          {solution.finalAnswer.units && (
            <span className="inline-block mt-2 text-xs font-semibold text-slate-300 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
              Units: {solution.finalAnswer.units}
            </span>
          )}
        </div>

        {/* Verification Check */}
        {solution.verificationCheck && (
          <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-semibold">Verification Check: </strong>
              <span>{solution.verificationCheck}</span>
            </div>
          </div>
        )}
      </div>

      {/* Common Pitfalls & Traps */}
      {solution.commonPitfalls && solution.commonPitfalls.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Common Pitfalls to Avoid</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300">
            {solution.commonPitfalls.map((pitfall, i) => (
              <li key={i} className="leading-relaxed">
                <LatexRenderer content={pitfall} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prominent "Practice Similar" Action Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-indigo-950/90 border-2 border-indigo-500/50 shadow-xl shadow-indigo-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Reinforce Your Mastery</span>
          </div>
          <h4 className="text-base font-bold text-white">Test Yourself with a Similar Problem</h4>
          <p className="text-xs text-indigo-200">
            Gemini generates a targeted variation with hidden step-by-step solutions to practice active recall.
          </p>
        </div>

        <button
          id="btn-practice-similar"
          onClick={onPracticeSimilar}
          disabled={isPracticingLoading}
          className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          {isPracticingLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Generating Problem...</span>
            </>
          ) : (
            <>
              <Repeat className="w-4 h-4 text-indigo-600" />
              <span>Practice Similar</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </>
          )}
        </button>
      </div>

      {/* Floating Bottom Nav Buttons */}
      <div className="fixed bottom-4 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 shadow-2xl pointer-events-auto">
          <button
            id="btn-new-solve"
            onClick={onNewProblem}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Scan Another</span>
          </button>

          <button
            id="btn-practice-floating"
            onClick={onPracticeSimilar}
            disabled={isPracticingLoading}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Repeat className="w-4 h-4 text-amber-300" />
            <span>Practice Similar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
