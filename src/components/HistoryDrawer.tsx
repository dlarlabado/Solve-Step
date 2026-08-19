import React from "react";
import { HistoryRecord } from "../types";
import { Clock, Trash2, X, ChevronRight, Calculator, Atom } from "lucide-react";
import { LatexRenderer } from "./LatexRenderer";

interface HistoryDrawerProps {
  history: HistoryRecord[];
  onSelect: (record: HistoryRecord) => void;
  onClear: () => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelect,
  onClear,
  onClose,
}) => {
  return (
    <div id="history-drawer" className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Solution History</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={onClear}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-close-history"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-500">
              <Clock className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No saved solutions yet. Snap or write a problem to begin!</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.subject?.toLowerCase().includes("physic")
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {item.subject?.toLowerCase().includes("physic") ? (
                      <Atom className="w-3 h-3" />
                    ) : (
                      <Calculator className="w-3 h-3" />
                    )}
                    {item.topic || "Problem"}
                  </span>

                  <span className="text-[10px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="text-xs text-slate-200 line-clamp-2">
                  <LatexRenderer content={item.solution.detectedText} />
                </div>

                <div className="flex items-center justify-between text-[11px] text-indigo-400 pt-1 group-hover:text-indigo-300 font-medium">
                  <span>View Breakdown ({item.solution.steps.length} steps)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
