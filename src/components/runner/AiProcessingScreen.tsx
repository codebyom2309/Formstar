import React, { useState, useEffect } from "react";
import {
  FileText,
  Brain,
  Layers,
  Palette,
  Sparkles,
  CheckCircle2,
  Loader2,
  Zap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

interface AiProcessingScreenProps {
  formTitle?: string;
}

const STAGES = [
  { icon: FileText, label: "Reading form structure", detail: "Parsing questions, options, and metadata" },
  { icon: Brain, label: "Understanding form purpose", detail: "Classifying category and target audience" },
  { icon: Layers, label: "Extracting existing guidelines", detail: "Preserving instructions and descriptions" },
  { icon: LayoutDashboard, label: "Grouping into sections", detail: "Creating logical question flow" },
  { icon: Palette, label: "Designing the experience", detail: "Selecting theme, layout, and personality" },
  { icon: Sparkles, label: "Generating website content", detail: "Building hero, metrics, and info cards" },
  { icon: ShieldCheck, label: "Validating & finalizing", detail: "Ensuring accuracy and completeness" },
];

export const AiProcessingScreen: React.FC<AiProcessingScreenProps> = ({
  formTitle,
}) => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev; // Stay on last stage
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.round(((activeStage + 1) / STAGES.length) * 100);

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Main glassmorphic card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-7 h-7" style={{ animation: "pulse 2s ease-in-out infinite" }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                AI is Crafting Your Experience
              </h2>
              {formTitle && (
                <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[280px] mx-auto">
                  {formTitle}
                </p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Processing</span>
              <span className="text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                style={{
                  width: `${progressPercent}%`,
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          </div>

          {/* Stages list */}
          <div className="space-y-1.5">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === activeStage;
              const isDone = idx < activeStage;
              const isPending = idx > activeStage;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-indigo-50/80 border border-indigo-200/60 shadow-xs"
                      : isDone
                      ? "bg-emerald-50/40 border border-transparent"
                      : "border border-transparent opacity-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isDone
                        ? "bg-emerald-100 text-emerald-600"
                        : isActive
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs font-bold block transition-colors duration-300 ${
                        isDone
                          ? "text-emerald-800"
                          : isActive
                          ? "text-indigo-900"
                          : "text-slate-500"
                      }`}
                    >
                      {stage.label}
                    </span>
                    {(isActive || isDone) && (
                      <span
                        className={`text-[10px] block mt-0.5 ${
                          isDone ? "text-emerald-600" : "text-indigo-500"
                        }`}
                      >
                        {isDone ? "Complete" : stage.detail}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-400 font-medium">
              <Sparkles className="w-3 h-3 inline-block mr-1 text-violet-400" />
              Powered by NextForm AI Intelligence Engine
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
