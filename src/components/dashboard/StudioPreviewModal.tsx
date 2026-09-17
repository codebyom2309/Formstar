import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { X, Wrench, Sparkles, Layers, Code, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export const StudioPreviewModal: React.FC = () => {
  const { selectedFormForStudio, setSelectedFormForStudio } = useDashboardStore();
  const [showRawJson, setShowRawJson] = useState(false);

  if (!selectedFormForStudio) return null;

  const config = selectedFormForStudio.jsonConfig;
  const steps = config?.steps || [];
  const totalFields = steps.reduce(
    (acc, s) => acc + s.cards.reduce((cAcc, c) => cAcc + c.fields.length, 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedFormForStudio.title}</h3>
              <p className="text-xs text-slate-500 font-mono">
                /f/{selectedFormForStudio.hostedSlug}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFormForStudio(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Phase 2 Verified &bull; Stepper Schema Stored in TiDB</span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              This form was parsed with our Phase 2 ingestion engine. All field mappings, options, and entry IDs are safely stored in your TiDB Serverless database.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Ingested Structure
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                {steps.length} Steps &bull; {totalFields} Fields
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[280px]">
                    {idx + 1}. {step.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {step.cards.reduce((acc, c) => acc + c.fields.length, 0)} questions
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? "Hide Raw Database JSON" : "View Raw Database JSON"}</span>
              {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showRawJson && (
              <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] max-h-48 overflow-y-auto border border-slate-800">
                {JSON.stringify(config, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={() => setSelectedFormForStudio(null)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
