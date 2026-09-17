import React, { useEffect } from "react";
import { FormConfig } from "../../types";
import { CanonicalExperienceSchema } from "../../types/canonicalExperience";
import { convertConfigToExperience } from "../../lib/experienceAdapter";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  Cpu,
} from "lucide-react";

interface OverviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: FormConfig;
}

export const OverviewDrawer: React.FC<OverviewDrawerProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const meta = config.meta || { title: "Form", description: "", targetActionUrl: "" };
  const rawExperience: CanonicalExperienceSchema | undefined =
    config.aiExperience || (config as any).jsonConfig?.aiExperience;

  // Use AI Experience if present, otherwise derive clean normalized experience
  const exp: CanonicalExperienceSchema =
    rawExperience || convertConfigToExperience(config);

  const overview = exp.overview;
  const isHackathon = exp.form.category === "hackathon";
  const isQuiz = exp.form.category === "quiz" || exp.form.category === "assessment";

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rulesHeading = overview?.rulesLabel || (isQuiz ? "Assessment Instructions" : isHackathon ? "Registration Guidelines" : "Overview & Instructions");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Dialog Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 max-h-[88vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isQuiz ? "bg-amber-100 text-amber-700" : isHackathon ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-600"
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {rulesHeading}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Official guidelines &amp; submission details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Identity & Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-extrabold tracking-wider uppercase rounded-lg max-w-full truncate">
                {overview.title || meta.title || "Form"}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" />
                <span className="uppercase">{exp.form.category}</span>
              </span>

              {/* AI Badge with Model & Latency */}
              {exp.aiMetadata && (
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-mono font-bold rounded-lg flex items-center gap-1 shrink-0">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{exp.aiMetadata.model}</span>
                  <span className="text-indigo-400">•</span>
                  <span className="text-emerald-700">{exp.aiMetadata.latencyMs} ms</span>
                </span>
              )}
            </div>

            {/* Subtitle / Description */}
            {(overview.subtitle || meta.description) && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                {overview.subtitle || meta.description}
              </p>
            )}
          </div>

          {/* Key Form Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overview.estimatedCompletionTime && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Estimated Time
                  </span>
                </div>
                <p className="text-xs font-extrabold text-amber-950">{overview.estimatedCompletionTime}</p>
              </div>
            )}

            {overview.audience && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Target Audience
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">{overview.audience}</p>
              </div>
            )}
          </div>

          {/* Instructions List */}
          {overview.instructions && overview.instructions.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Instructions &amp; Steps</span>
              </h4>
              <div className="space-y-2">
                {overview.instructions.map((inst, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{inst}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements Checklist */}
          {overview.requirements && overview.requirements.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Requirements Before Starting</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {overview.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {overview.tips && overview.tips.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Tips for Best Experience</span>
              </h4>
              <div className="space-y-2">
                {overview.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hackathon specifics only if explicitly configured in overviewRules */}
          {config.overviewRules?.rounds && config.overviewRules.rounds.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>Rounds &amp; Schedule</span>
              </h4>
              <div className="space-y-2 border-l-2 border-purple-200 pl-3.5 ml-1">
                {config.overviewRules.rounds.map((round, rIdx) => (
                  <div key={rIdx} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{round.name}</span>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {round.date}
                      </span>
                    </div>
                    {round.details && <p className="text-[11px] text-slate-500">{round.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Google Form Submission Sync</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Got It, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
