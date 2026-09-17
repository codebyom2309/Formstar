import React, { useState } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  ArrowLeft,
  Save,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

export const StudioHeader: React.FC = () => {
  const {
    currentStudioForm,
    updateCurrentStudioForm,
    saveCurrentStudioForm,
    isSaving,
    isDirty,
    exitStudio,
    previewViewport,
    setPreviewViewport,
    openRunner,
  } = useDashboardStore();

  const [savedToast, setSavedToast] = useState(false);

  if (!currentStudioForm) return null;

  const handleSave = async () => {
    const success = await saveCurrentStudioForm();
    if (success) {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (!confirm("You have unsaved changes. Are you sure you want to exit without saving to TiDB?")) {
        return;
      }
    }
    exitStudio();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Back + Form Name */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-studio-back"
            onClick={handleBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <input
                type="text"
                value={currentStudioForm.title}
                onChange={(e) => {
                  const val = e.target.value;
                  updateCurrentStudioForm((draft) => {
                    draft.title = val;
                    if (draft.jsonConfig?.meta) {
                      draft.jsonConfig.meta.title = val;
                    }
                    return draft;
                  });
                }}
                className="text-sm font-bold text-slate-900 bg-transparent hover:bg-slate-100/80 focus:bg-white px-2 py-0.5 rounded-md border border-transparent hover:border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all truncate"
                placeholder="Form Title..."
              />
            </div>

            {/* Sync State Badge */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {isSaving ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 px-2 py-0.5 rounded-md bg-blue-50">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving to TiDB...
                </span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 px-2 py-0.5 rounded-md bg-amber-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Unsaved Changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50">
                  <Check className="w-3 h-3" />
                  TiDB Synced
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Viewport Controls */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            id="vp-desktop"
            onClick={() => setPreviewViewport("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              previewViewport === "desktop"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            id="vp-tablet"
            onClick={() => setPreviewViewport("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              previewViewport === "tablet"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            id="vp-mobile"
            onClick={() => setPreviewViewport("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              previewViewport === "mobile"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Open Public Live Form */}
          <button
            id="btn-studio-preview-runner"
            onClick={() => openRunner(currentStudioForm.hostedSlug)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Open Hosted Form Runner"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Public Form</span>
          </button>

          {/* Save to TiDB button */}
          <button
            id="btn-studio-save"
            disabled={isSaving}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all ${
              savedToast
                ? "bg-emerald-600 text-white"
                : isDirty
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : savedToast ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{savedToast ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
