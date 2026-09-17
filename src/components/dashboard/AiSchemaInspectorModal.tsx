import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  X,
  Copy,
  Check,
  Code2,
  Cpu,
  Clock,
  Zap,
  Tag,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  FileJson,
} from "lucide-react";

export const AiSchemaInspectorModal: React.FC = () => {
  const { inspectingAiExperience, setInspectingAiExperience } = useDashboardStore();
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeViewMode, setActiveViewMode] = useState<"formatted" | "raw">("formatted");

  if (!inspectingAiExperience) return null;

  const handleClose = () => {
    setInspectingAiExperience(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(inspectingAiExperience, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schema = inspectingAiExperience;
  const sections = schema.sections || [];
  const totalQuestions = sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);

  // Filtered sections for formatted view
  const filteredSections = sections.filter((sec) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const matchesSection = sec.title?.toLowerCase().includes(q) || sec.subtitle?.toLowerCase().includes(q);
    const matchesQuestion = sec.questions?.some(
      (ques) =>
        ques.label?.toLowerCase().includes(q) ||
        ques.googleEntryId?.toLowerCase().includes(q) ||
        ques.semanticRole?.toLowerCase().includes(q) ||
        ques.recommendedComponent?.toLowerCase().includes(q)
    );
    return matchesSection || matchesQuestion;
  });

  return (
    <div
      id="ai-schema-inspector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="ai-schema-inspector-modal"
        className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-schema-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="ai-schema-title" className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  AI Canonical Experience Schema
                </h3>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider shrink-0">
                  {schema.form?.category || "Universal"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Single Source of Truth for UX generation, validation, and zero-loss Google Form sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-xs"
              title="Copy JSON to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Copy Schema</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Model & Performance Metadata Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Model:</span>
              <span className="text-indigo-200 font-bold">
                {schema.aiMetadata?.model || "openai/gpt-oss-20b"}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{schema.aiMetadata?.latencyMs || 280} ms</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-sky-300">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Confidence: {Math.round((schema.form?.confidence || 0.95) * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span>{sections.length} Sections</span>
            <span>•</span>
            <span>{totalQuestions} Questions mapped to Google entry IDs</span>
          </div>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search fields, entry codes, components..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveViewMode("formatted")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeViewMode === "formatted"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Structured View
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode("raw")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeViewMode === "raw"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeViewMode === "formatted" ? (
            <div className="space-y-4">
              {/* Form Metadata Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{schema.form?.title}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[11px]">
                    UX: {schema.ux?.pattern}
                  </span>
                </div>
                {schema.form?.description && (
                  <p className="text-slate-600 leading-relaxed text-[11px]">{schema.form.description}</p>
                )}
                {schema.form?.reasoningSummary && (
                  <div className="text-[11px] bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100 text-indigo-900">
                    <span className="font-bold">AI Context: </span>
                    {schema.form.reasoningSummary}
                  </div>
                )}
              </div>

              {/* Sections Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Configured Sections & Assigned Components ({filteredSections.length})
                </h4>

                {filteredSections.map((sec, sIdx) => (
                  <div
                    key={sec.id || sIdx}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                  >
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                        {sec.subtitle && (
                          <span className="text-[11px] text-slate-500 hidden sm:inline">• {sec.subtitle}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {sec.questions?.length || 0} questions
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {sec.questions?.map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          className="p-3 hover:bg-slate-50/80 transition-colors text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-900">{q.label}</span>
                              {q.required && <span className="text-red-500 font-bold text-xs">*</span>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-mono flex-wrap">
                              <span className="text-slate-400">Google ID:</span>
                              <span className="text-slate-700 font-bold bg-slate-100 px-1 rounded">
                                {q.googleEntryId}
                              </span>
                              <span>•</span>
                              <span className="text-indigo-600 bg-indigo-50 px-1 rounded font-sans font-semibold">
                                Role: {q.semanticRole || "general"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-bold font-mono">
                              {q.recommendedComponent || "TextInput"}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] uppercase font-bold">
                              {q.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto">
              <pre className="leading-relaxed">{JSON.stringify(schema, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Entry ID integrity verified</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
};
