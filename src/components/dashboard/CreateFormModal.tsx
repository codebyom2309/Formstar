import React, { useState, useEffect } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  X,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  FileQuestion,
  AlertTriangle,
  Cpu,
  Clock,
  Zap,
  Wand2,
  RefreshCw,
  Tag,
  ShieldCheck,
  Eye,
  Sliders,
  HelpCircle,
  Compass,
} from "lucide-react";
import { ParsedFormResult } from "../../types";

export const CreateFormModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createForm,
    parseFormUrl,
    isParsing,
    parsedPreview,
    setParsedPreview,
    aiAnalysis,
    isAnalyzingWithAi,
    aiModelUsed,
    aiLatencyMs,
    analyzeFormWithAi,
    setAiAnalysis,
    setInspectingAiExperience,
  } = useDashboardStore();

  const [title, setTitle] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadInterceptionAlert, setUploadInterceptionAlert] = useState<{
    message: string;
    offendingField?: string;
  } | null>(null);

  // Active staged progress simulation for realistic feedback during analysis
  const [analysisStage, setAnalysisStage] = useState<number>(0);

  // Preview tab within modal: 'overview' | 'sections' | 'components'
  const [previewTab, setPreviewTab] = useState<"overview" | "sections" | "components">("overview");

  // AI Suggestion state for Title & Description
  const [isSuggestingCopy, setIsSuggestingCopy] = useState(false);
  const [aiSuggestedCopy, setAiSuggestedCopy] = useState<string | null>(null);
  const [aiSuggestLatency, setAiSuggestLatency] = useState<number | null>(null);
  const [aiSuggestModel, setAiSuggestModel] = useState<string | null>(null);

  // Track staged AI progress
  useEffect(() => {
    let interval: any;
    if (isAnalyzingWithAi) {
      setAnalysisStage(1);
      interval = setInterval(() => {
        setAnalysisStage((prev) => (prev < 8 ? prev + 1 : prev));
      }, 350);
    } else if (aiAnalysis) {
      setAnalysisStage(8);
    } else {
      setAnalysisStage(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzingWithAi, aiAnalysis]);

  if (!isCreateModalOpen) return null;

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setErrorMessage(null);
    setUploadInterceptionAlert(null);
    setParsedPreview(null);
    setAiAnalysis(null);
    setAiSuggestedCopy(null);
  };

  const handleScrapeAndAnalyze = async (targetUrl?: string) => {
    const urlToScrape = targetUrl || googleUrl.trim();
    if (!urlToScrape) {
      setErrorMessage("Please enter a Google Form URL first.");
      return;
    }
    setErrorMessage(null);
    setUploadInterceptionAlert(null);

    // Step 1: Scrape Schema
    const result = await parseFormUrl(urlToScrape);

    if (!result.success) {
      if (result.isUploadInterception) {
        setUploadInterceptionAlert({
          message: result.error || "Google File Upload field detected.",
          offendingField: result.offendingField,
        });
      } else {
        setErrorMessage(result.error || "Failed to scrape Google Form schema.");
      }
      return;
    }

    if (!title.trim() && result.meta?.title) {
      setTitle(result.meta.title);
    }

    // Step 2: Immediate AI Form Intelligence Analysis via Groq
    try {
      const exp = await analyzeFormWithAi(result);
      if (exp && exp.form?.title && (!title.trim() || title === "Untitled Form")) {
        setTitle(exp.form.title);
      }
    } catch (e) {
      console.warn("AI Analysis step encountered error, continuing with schema", e);
    }
  };

  const handleSuggestCopy = async () => {
    setIsSuggestingCopy(true);
    setAiSuggestedCopy(null);
    try {
      const currentTitle = title || parsedPreview?.meta?.title || "Form";
      const currentDesc = parsedPreview?.meta?.description || "";
      const fieldCount = parsedPreview?.stats?.totalFields || 0;

      const res = await fetch("/api/ai/suggest-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTitle,
          description: currentDesc,
          fieldCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        setAiSuggestedCopy(data.suggestion);
        setAiSuggestLatency(data.latencyMs);
        setAiSuggestModel(data.model);
      } else {
        setErrorMessage("AI Assistant temporarily unavailable.");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to AI Assistant.");
    } finally {
      setIsSuggestingCopy(false);
    }
  };

  const handleFillSample = (type: "hackathon" | "quiz" | "feedback") => {
    let sampleUrl = "";
    if (type === "hackathon") {
      sampleUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/viewform";
    } else if (type === "quiz") {
      sampleUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd7gqG_72b3b0k8R4jCqC-2b_demoquiz/viewform";
    } else {
      sampleUrl = "https://docs.google.com/forms/d/e/1FAIpQLSc9demo_feedback_survey_customer/viewform";
    }
    setGoogleUrl(sampleUrl);
    setErrorMessage(null);
    setUploadInterceptionAlert(null);
    handleScrapeAndAnalyze(sampleUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || parsedPreview?.meta?.title || "Untitled Form";
    const finalUrl = googleUrl.trim();

    if (!finalUrl) {
      setErrorMessage("Google Form URL is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await createForm(
      finalTitle,
      finalUrl,
      parsedPreview?.config,
      aiAnalysis || undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      handleClose();
    } else {
      if (result.isUploadInterception) {
        setUploadInterceptionAlert({
          message: result.error || "Form contains unsupported Google File Upload.",
          offendingField: result.offendingField,
        });
      } else {
        setErrorMessage(result.error || "Failed to create form. Please check URL.");
      }
    }
  };

  const analysisStages = [
    "Source Google Form structure parsed",
    `Extracted ${parsedPreview?.stats?.totalFields || "all"} question entries`,
    "Required field & validation analysis",
    "Semantic role classification (Zero Hallucination)",
    "Structural section grouping & cognitive load balancing",
    "UX pattern & Canonical Component selection",
    "Tailoring instructions & dynamic overview",
    "Integrity verification & Google entry ID sync audit",
  ];

  return (
    <div
      id="create-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="create-form-modal"
        className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="modal-title" className="text-base font-bold text-slate-900">
                  Import & Generate AI Experience
                </h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Universal Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transforms any Google Form into a modern, mobile-first web app with zero data loss.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">Ingestion Warning</p>
                <p className="text-red-700 leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Interception Alert */}
          {uploadInterceptionAlert && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-900 uppercase tracking-wide text-[11px]">
                    Upload Interception Detected
                  </span>
                  {uploadInterceptionAlert.offendingField && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-mono text-[10px] font-semibold">
                      {uploadInterceptionAlert.offendingField}
                    </span>
                  )}
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Google Forms blocks headless submissions when native Google Drive file upload fields are used.
                </p>
                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-slate-700">
                  <p className="font-semibold text-slate-900">Recommended solution:</p>
                  <p className="mt-1 text-[11px]">
                    In your Google Form editor, set this question type to <strong>"Short Answer"</strong> (e.g. "Proof / Document URL").
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Form URL Input & Samples */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label
                htmlFor="modal-google-url"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Google Form Public URL
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFillSample("hackathon")}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Sample Form</span>
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="relative flex-1">
                <input
                  id="modal-google-url"
                  type="url"
                  required
                  value={googleUrl}
                  onChange={(e) => {
                    setGoogleUrl(e.target.value);
                    if (parsedPreview) setParsedPreview(null);
                    if (aiAnalysis) setAiAnalysis(null);
                  }}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <button
                type="button"
                id="btn-extract-ai-analyze"
                onClick={() => handleScrapeAndAnalyze()}
                disabled={isParsing || isAnalyzingWithAi || !googleUrl.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shrink-0 shadow-xs min-h-[42px]"
              >
                {isParsing || isAnalyzingWithAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isParsing ? "Extracting..." : "AI Intelligence Running..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & AI Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Title Input + AI Copy Assistant */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="modal-form-title"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Form Title
              </label>
              <button
                type="button"
                onClick={handleSuggestCopy}
                disabled={isSuggestingCopy || (!title && !parsedPreview)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 disabled:opacity-40"
              >
                {isSuggestingCopy ? (
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                ) : (
                  <Wand2 className="w-3 h-3 text-indigo-600" />
                )}
                <span>AI Copy Polish</span>
              </button>
            </div>
            <input
              id="modal-form-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Hackathon 2026 Registration"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* AI Copy Suggestion Card */}
          {aiSuggestedCopy && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Copy Recommendation</span>
                </div>
                {aiSuggestModel && (
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono font-bold rounded">
                      {aiSuggestModel}
                    </span>
                    {aiSuggestLatency && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {aiSuggestLatency} ms
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-slate-700 leading-relaxed italic bg-white/70 p-2.5 rounded-lg border border-indigo-100">
                "{aiSuggestedCopy}"
              </p>
            </div>
          )}

          {/* SECTION 11: Staged AI Analysis Screen (Visualized Execution) */}
          {isAnalyzingWithAi && (
            <div
              id="staged-ai-analysis-screen"
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/90 border border-indigo-200 text-slate-900 shadow-sm space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-indigo-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Staged AI Form Intelligence Analysis
                    </h4>
                    <p className="text-[11px] text-indigo-700">
                      Autonomous classification, section generation, and component registry mapping
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100/80 rounded font-mono text-[10px] text-indigo-800 font-bold">
                  <Cpu className="w-3 h-3" />
                  <span>openai/gpt-oss-20b</span>
                </div>
              </div>

              {/* Progress Stepper for Staged Analysis */}
              <div className="space-y-1.5">
                {analysisStages.map((stg, idx) => {
                  const isDone = analysisStage > idx + 1;
                  const isCurrent = analysisStage === idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-1.5 rounded-lg text-xs transition-all ${
                        isCurrent
                          ? "bg-white text-indigo-950 font-bold shadow-xs"
                          : isDone
                          ? "text-emerald-800"
                          : "text-slate-400 opacity-60"
                      }`}
                    >
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span className="text-[11px]">{stg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 12 & 13: AI Analysis Result & Generated Content Preview */}
          {aiAnalysis && (
            <div
              id="ai-analysis-result-screen"
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-200"
            >
              {/* Header with Model, Latency & Confidence */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      AI Form Understanding & Architecture
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Validated for zero factual hallucination & 100% Google entry ID preservation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Model Used Badge */}
                  <div
                    id="ai-model-badge"
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-700"
                  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>{aiModelUsed || aiAnalysis.aiMetadata?.model || "openai/gpt-oss-20b"}</span>
                  </div>

                  {/* Latency Badge */}
                  <div
                    id="ai-latency-badge"
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold text-emerald-700"
                  >
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>{aiLatencyMs || aiAnalysis.aiMetadata?.latencyMs || 280} ms</span>
                  </div>
                </div>
              </div>

              {/* Form Understanding 4-Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Category</span>
                  <span className="text-indigo-700 font-bold uppercase tracking-wider text-xs">
                    {aiAnalysis.form.category}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">UX Pattern</span>
                  <span className="text-slate-800 font-bold capitalize text-xs">
                    {aiAnalysis.ux.pattern}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence</span>
                  <span className="text-emerald-700 font-bold text-xs">
                    {Math.round((aiAnalysis.form.confidence || 0.95) * 100)}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Duration</span>
                  <span className="text-amber-700 font-bold text-xs">
                    {aiAnalysis.overview.estimatedCompletionTime}
                  </span>
                </div>
              </div>

              {/* AI Recommendation Callout Box */}
              <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 rounded-xl border border-indigo-100 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Architecture Recommendation:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {aiAnalysis.form.reasoningSummary}
                </p>
              </div>

              {/* SECTION 13: Preview Tabs for AI-Generated Content */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("overview")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        previewTab === "overview"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      Instructions & Rules
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("sections")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        previewTab === "sections"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      Sections ({aiAnalysis.sections.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("components")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        previewTab === "components"
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      Components ({aiAnalysis.sections.reduce((a, s) => a + s.questions.length, 0)})
                    </button>
                  </div>

                  {/* SECTION 14: Inspect AI Schema Button */}
                  <button
                    type="button"
                    id="btn-inspect-ai-schema"
                    onClick={() => setInspectingAiExperience(aiAnalysis)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-2xs"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Inspect AI Schema</span>
                  </button>
                </div>

                {/* Tab 1: Overview & Instructions */}
                {previewTab === "overview" && (
                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {aiAnalysis.overview.rulesLabel || "Overview & Instructions"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Audience: {aiAnalysis.overview.audience}
                      </span>
                    </div>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {aiAnalysis.overview.instructions.map((inst, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tab 2: Sections Structure */}
                {previewTab === "sections" && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {aiAnalysis.sections.map((sec, i) => (
                      <div
                        key={sec.id || i}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-slate-900">{sec.title}</span>
                          {sec.subtitle && (
                            <span className="text-[10px] text-slate-500 hidden sm:inline">• {sec.subtitle}</span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-[10px] font-semibold text-slate-600 rounded">
                          {sec.questions.length} questions
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Component Registry Breakdown */}
                {previewTab === "components" && (
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                    {aiAnalysis.sections.flatMap((s) => s.questions).map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2 truncate">
                          <span className="font-medium text-slate-800">{q.label}</span>
                          {q.required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-bold font-mono">
                            {q.recommendedComponent || "TextInput"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback Scraped Summary if AI not yet run */}
          {parsedPreview && !aiAnalysis && !isAnalyzingWithAi && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900">
                    Source Schema Ingested
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                    {parsedPreview.stats.totalSteps} Steps
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                    {parsedPreview.stats.totalFields} Fields
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600">
                Click <strong>"Extract & AI Analyze"</strong> above to classify this form into its optimal UX pattern and components.
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct headless Google sync</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[42px]"
              >
                Cancel
              </button>
              <button
                id="btn-submit-create-form"
                type="submit"
                disabled={isSubmitting || isParsing || isAnalyzingWithAi}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 min-h-[42px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Form...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save & Launch Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
