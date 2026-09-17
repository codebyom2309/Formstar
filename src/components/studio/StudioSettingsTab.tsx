import React from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import {
  Settings,
  Globe,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const StudioSettingsTab: React.FC = () => {
  const { currentStudioForm, updateCurrentStudioForm } = useDashboardStore();

  if (!currentStudioForm || !currentStudioForm.jsonConfig) return null;

  const meta = currentStudioForm.jsonConfig.meta || {
    title: "",
    description: "",
    targetActionUrl: "",
  };

  const handleUpdateMeta = (patch: Partial<typeof meta>) => {
    updateCurrentStudioForm((draft) => {
      draft.jsonConfig.meta = { ...draft.jsonConfig.meta, ...patch };
      return draft;
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* URL Slug & Routing */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Globe className="w-4 h-4 text-purple-600" />
          <span>Hosted URL &amp; Slug</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Custom Public Slug</label>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100">
            <span className="px-3 text-xs font-mono text-slate-400 border-r border-slate-200 select-none">
              /f/
            </span>
            <input
              type="text"
              value={currentStudioForm.hostedSlug}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "");
                updateCurrentStudioForm((draft) => {
                  draft.hostedSlug = val;
                  return draft;
                });
              }}
              className="flex-1 px-3 py-2 text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none"
              placeholder="hackathon-registration-2026"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Public link will be accessible at <code className="font-mono text-slate-600">/f/{currentStudioForm.hostedSlug}</code>
          </p>
        </div>

        {/* Status */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Form Status</p>
            <p className="text-[11px] text-slate-500">
              When paused, respondents will see a friendly notice instead of the active stepper.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              updateCurrentStudioForm((draft) => {
                draft.status = draft.status === "active" ? "paused" : "active";
                return draft;
              });
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentStudioForm.status === "active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {currentStudioForm.status === "active" ? "Active (Accepting Responses)" : "Paused"}
          </button>
        </div>
      </div>

      {/* Google Form Target Integration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Google Form Headless Target</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Target formResponse URL</label>
          <input
            type="text"
            value={meta.targetActionUrl || ""}
            onChange={(e) => handleUpdateMeta({ targetActionUrl: e.target.value })}
            placeholder="https://docs.google.com/forms/d/e/.../formResponse"
            className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
          <p className="text-[11px] text-slate-400">
            NextForm Studio proxies client responses to this endpoint headlessly via server-side URL encoding.
          </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-slate-700">Original Source Form</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentStudioForm.originalGoogleUrl || ""}
              className="w-full text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
            />
            <a
              href={currentStudioForm.originalGoogleUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 shrink-0"
              title="Open Google Form"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Post-Submission Celebration Screen */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          <span>Submission Success Screen</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Confirmation Title</label>
          <input
            type="text"
            value={meta.confirmationTitle || ""}
            onChange={(e) => handleUpdateMeta({ confirmationTitle: e.target.value })}
            placeholder="Registration Submitted Successfully!"
            className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Confirmation Message</label>
          <textarea
            rows={2}
            value={meta.confirmationMessage || ""}
            onChange={(e) => handleUpdateMeta({ confirmationMessage: e.target.value })}
            placeholder="Thank you for registering. We look forward to seeing your project!"
            className="w-full text-xs text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-semibold text-slate-700">
              Official WhatsApp Group Invite URL
            </label>
          </div>
          <input
            type="text"
            value={meta.whatsappGroupUrl || ""}
            onChange={(e) => handleUpdateMeta({ whatsappGroupUrl: e.target.value })}
            placeholder="https://chat.whatsapp.com/..."
            className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Cloudinary & File Uploads Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Cloudinary &amp; File Uploads
              </h4>
              <p className="text-[11px] text-slate-500">
                Enable secure direct CDN file uploads (resumes, ID cards, payment screenshots) to Cloudinary.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              checked={!!currentStudioForm.jsonConfig?.cloudinary?.enabled}
              onChange={(e) => {
                const checked = e.target.checked;
                updateCurrentStudioForm((draft) => {
                  if (!draft.jsonConfig.cloudinary) {
                    draft.jsonConfig.cloudinary = { enabled: false };
                  }
                  draft.jsonConfig.cloudinary.enabled = checked;
                  return draft;
                });
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {currentStudioForm.jsonConfig?.cloudinary?.enabled && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Cloud Name</label>
                <input
                  type="text"
                  value={currentStudioForm.jsonConfig.cloudinary.cloudName || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentStudioForm((draft) => {
                      draft.jsonConfig.cloudinary!.cloudName = val;
                      return draft;
                    });
                  }}
                  placeholder="e.g. my-cloud-name"
                  className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Upload Preset (Unsigned)</label>
                <input
                  type="text"
                  value={currentStudioForm.jsonConfig.cloudinary.uploadPreset || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentStudioForm((draft) => {
                      draft.jsonConfig.cloudinary!.uploadPreset = val;
                      return draft;
                    });
                  }}
                  placeholder="e.g. nextform_uploads"
                  className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">API Key (Optional)</label>
                <input
                  type="text"
                  value={currentStudioForm.jsonConfig.cloudinary.apiKey || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentStudioForm((draft) => {
                      draft.jsonConfig.cloudinary!.apiKey = val;
                      return draft;
                    });
                  }}
                  placeholder="e.g. 182937192837192"
                  className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Folder Path</label>
                <input
                  type="text"
                  value={currentStudioForm.jsonConfig.cloudinary.folder || "form_submissions"}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateCurrentStudioForm((draft) => {
                      draft.jsonConfig.cloudinary!.folder = val;
                      return draft;
                    });
                  }}
                  placeholder="form_submissions"
                  className="w-full text-xs font-mono text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              When respondents upload files on the live form, they are streamed to your Cloudinary storage and the secure URL is sent to the Google Form response payload.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
