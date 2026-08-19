import React from "react";
import { SAMPLE_PROBLEMS } from "../data/sampleProblems";
import { SampleProblem } from "../types";
import { LatexRenderer } from "./LatexRenderer";
import { Atom, Calculator, ChevronRight, Compass, Sparkles } from "lucide-react";

interface SampleProblemsProps {
  onSelectProblem: (problem: SampleProblem) => void;
  isLoading?: boolean;
}

export const SampleProblems: React.FC<SampleProblemsProps> = ({
  onSelectProblem,
  isLoading = false,
}) => {
  return (
    <div id="sample-problems-section" className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Quick Try: Sample Math &amp; Physics Problems
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">Tap to solve instantly</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SAMPLE_PROBLEMS.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectProblem(sample)}
            disabled={isLoading}
            className="text-left p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md group flex flex-col justify-between space-y-3 cursor-pointer active:scale-98"
          >
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    sample.subject === "Physics"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {sample.subject === "Physics" ? (
                    <Atom className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Calculator className="w-3 h-3 text-indigo-400" />
                  )}
                  {sample.badge}
                </span>

                <span className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                  {sample.topic}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {sample.title}
              </h4>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </div>

            {/* Formula Preview Box */}
            <div className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center overflow-x-auto text-xs text-indigo-300 group-hover:border-indigo-500/30 transition-colors">
              <LatexRenderer content={sample.previewLatex} block />
            </div>

            <div className="w-full flex items-center justify-between pt-1 text-slate-400 group-hover:text-indigo-300 text-xs font-semibold">
              <span>Solve with Gemini</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
