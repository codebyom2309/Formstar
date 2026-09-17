import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  X,
  Layers,
  Code2,
  FileQuestion,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { ParsedFormResult } from "../../types";

export const SchemaInspectorModal: React.FC = () => {
  const {
    isInspectorModalOpen,
    setIsInspectorModalOpen,
    parseFormUrl,
    createForm,
  } = useDashboardStore();

  const [url, setUrl] = useState(
    "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/viewform"
  );
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ParsedFormResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "stepper" | "json">("questions");
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isInspectorModalOpen) return null;

  const handleParse = async () => {
    if (!url.trim()) return;
    setErrorMessage(null);
    setImportSuccess(false);
    setIsParsing(true);

    const data = await parseFormUrl(url.trim());
    setIsParsing(false);

    if (!data.success) {
      setErrorMessage(data.error || "Failed to parse Google Form schema.");
      setResult(data.isUploadInterception ? data : null);
    } else {
      setResult(data);
    }
  };

  const handleCopyJson = () => {
    if (!result?.config) return;
    navigator.clipboard.writeText(JSON.stringify(result.config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportToDatabase = async () => {
    if (!result || !result.success) return;
    setIsImporting(true);
    const createRes = await createForm(result.meta.title, url, result.config);
    setIsImporting(false);
    if (createRes.success) {
      setImportSuccess(true);
      setTimeout(() => {
        setIsInspectorModalOpen(false);
      }, 1500);
    } else {
      setErrorMessage(createRes.error || "Failed to save into database.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Google Form Schema & Ingestion Inspector
                </h3>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-md">
                  Phase 2 Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect raw Google Form payload extraction, field entry codes, and Stepper normalization
              </p>
            </div>
          </div>
          <button
            id="btn-close-inspector-modal"
            onClick={() => setIsInspectorModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter public Google Form URL (https://docs.google.com/forms/d/e/.../viewform)"
                className="w-full pl-3.5 pr-9 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              id="btn-run-inspector-parse"
              onClick={handleParse}
              disabled={isParsing || !url.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 shrink-0 shadow-xs"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Schema...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Extract Schema</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error / Upload Interception Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="leading-relaxed">
              <p className="font-semibold">Ingestion Engine Notice</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!result && !isParsing && (
            <div className="text-center py-16 text-slate-400">
              <FileQuestion className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No schema extracted yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Enter any public Google Form URL above and click "Extract Schema" to inspect the live extraction process.
              </p>
            </div>
          )}

          {result && result.success && (
            <div className="space-y-4">
              {/* Meta Stats Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{result.meta.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-md">
                    Target: {result.meta.targetActionUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg">
                    {result.stats.totalSteps} Steps
                  </span>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                    {result.stats.totalCards} Cards
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                    {result.stats.totalFields} Fields ({result.stats.requiredFields} required)
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeTab === "questions"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Extracted Fields ({result.flatFields.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("stepper")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeTab === "stepper"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Stepper Hierarchy ({result.config.steps.length} Steps)
                  </button>
                  <button
                    onClick={() => setActiveTab("json")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activeTab === "json"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Normalized JSON Tree
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy Schema JSON"}</span>
                  </button>

                  <button
                    onClick={handleImportToDatabase}
                    disabled={isImporting || importSuccess}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isImporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : importSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{importSuccess ? "Saved to TiDB!" : "Import to TiDB"}</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Questions List */}
              {activeTab === "questions" && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5">Field / Question</th>
                        <th className="px-3 py-2.5">Mapped Type</th>
                        <th className="px-3 py-2.5">Google Entry Code</th>
                        <th className="px-3 py-2.5">Choices</th>
                        <th className="px-3 py-2.5 text-center">Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {result.flatFields.map((field, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="px-4 py-2.5 font-medium text-slate-900">
                            {field.label}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-md font-semibold">
                              {field.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-purple-700 font-semibold text-[11px]">
                            {field.entryCode}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                            {field.options ? `${field.options.length} options` : "-"}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {field.required ? (
                              <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded">
                                Yes
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Stepper Hierarchy */}
              {activeTab === "stepper" && (
                <div className="space-y-3">
                  {result.config.steps.map((step, sIdx) => (
                    <div key={step.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center">
                            {sIdx + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {step.cards.length} card{step.cards.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-8">
                        {step.cards.map((card) => (
                          <div key={card.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <p className="font-semibold text-slate-800">{card.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {card.fields.length} question{card.fields.length > 1 ? "s" : ""}
                            </p>
                            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                              {card.fields.slice(0, 3).map((f) => (
                                <li key={f.id} className="truncate">
                                  • {f.label} ({f.entryCode})
                                </li>
                              ))}
                              {card.fields.length > 3 && (
                                <li className="text-[10px] text-slate-400 italic">
                                  + {card.fields.length - 3} more questions
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Normalized JSON */}
              {activeTab === "json" && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-[11px] text-slate-200 max-h-96 overflow-y-auto">
                  <pre>{JSON.stringify(result.config, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={() => setIsInspectorModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
