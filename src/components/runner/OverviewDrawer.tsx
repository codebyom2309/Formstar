import React, { useEffect } from "react";
import { FormConfig } from "../../types";
import { CanonicalExperienceSchema, DynamicInfoSection } from "../../types/canonicalExperience";
import { convertConfigToExperience } from "../../lib/experienceAdapter";
import { extractRichDescriptionData } from "../../lib/descriptionExtractor";
import {
  X,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  Star,
  Award,
  HelpCircle,
  Target,
  Lock,
  List,
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Info,
} from "lucide-react";

interface OverviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: FormConfig;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "book-open": <BookOpen className="w-4 h-4" />,
  "shield-check": <ShieldCheck className="w-4 h-4" />,
  "check-circle": <CheckCircle2 className="w-4 h-4" />,
  "alert-triangle": <AlertTriangle className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  award: <Award className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
  lightbulb: <Lightbulb className="w-4 h-4" />,
  "help-circle": <HelpCircle className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  mail: <Mail className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  "map-pin": <MapPin className="w-4 h-4" />,
  "file-text": <FileText className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  target: <Target className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
  list: <List className="w-4 h-4" />,
  "bar-chart": <BarChart3 className="w-4 h-4" />,
  "message-square": <MessageSquare className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
};

function getIcon(name?: string): React.ReactNode {
  if (!name) return <FileText className="w-4 h-4" />;
  return ICON_MAP[name] || ICON_MAP[name.replace(/_/g, "-")] || <FileText className="w-4 h-4" />;
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
  const isQuiz = exp.form.category === "quiz" || exp.form.category === "assessment";
  const isHackathon = exp.form.category === "hackathon";

  const richDesc = extractRichDescriptionData(meta.description || exp.form.description);

  // Dynamic info sections from AI websiteContent merged with extracted rich sections
  const dynamicSections: DynamicInfoSection[] = (() => {
    const rawList = exp.websiteContent?.dynamicInfoSections && exp.websiteContent.dynamicInfoSections.length > 0
      ? [...exp.websiteContent.dynamicInfoSections]
      : [...richDesc.dynamicSections];

    for (const rSec of richDesc.dynamicSections) {
      const match = rawList.find(s =>
        s.type === rSec.type ||
        (rSec.type === "resources" && (s.type === "contacts" || /resource|dignit|faculty|speaker/i.test(s.title))) ||
        (rSec.type === "rating_guide" && /rating|scale/i.test(s.title)) ||
        (rSec.type === "dates" && /date|schedule/i.test(s.title))
      );
      if (!match) {
        rawList.push(rSec);
      } else if (rSec.type === "rating_guide" && richDesc.ratingScaleItems.length > 0) {
        match.items = rSec.items;
        match.title = rSec.title;
        match.type = "rating_guide";
      } else if (rSec.type === "resources" && rSec.items.length > 0) {
        match.items = rSec.items;
        match.title = rSec.title;
        match.type = "resources";
      }
    }

    const seen = new Set<string>();
    const deduplicated: DynamicInfoSection[] = [];
    for (const sec of rawList) {
      const key = sec.type === "contacts" ? "resources" : sec.type;
      if (seen.has(key)) continue;
      seen.add(key);
      deduplicated.push(sec);
    }
    return deduplicated;
  })();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rulesHeading = overview?.rulesLabel || (isQuiz ? "Assessment Instructions" : isHackathon ? "Registration Guidelines" : "Overview & Instructions");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Drawer Dialog Container */}
      <div
        className="relative w-full sm:max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 max-h-[88dvh] sm:max-h-[85dvh] flex flex-col overflow-hidden z-10"
        style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isQuiz ? "bg-amber-100 text-amber-700" : isHackathon ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-600"
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                {rulesHeading}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                {exp.form.category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} • {overview?.estimatedCompletionTime || "~5 min"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            title="Close Overview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Identity & Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-extrabold tracking-wider uppercase rounded-lg max-w-full truncate">
                {overview.title || meta.title || "Form"}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" />
                <span className="uppercase">{exp.form.category.replace(/_/g, " ")}</span>
              </span>

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
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
              {richDesc.cleanSubtitle || (overview.subtitle || meta.description || "")
                .replace(/^FORM\s+DESCRIPTION\s*:?/i, "")
                .replace(/^FORM\s+DETAILS\s*:?/i, "")
                .replace(/^DESCRIPTION\s*:?/i, "")
                .trim()}
            </p>
          </div>

          {/* Key Form Metadata Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {overview.estimatedCompletionTime && (
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Est. Time</span>
                </div>
                <p className="text-xs font-extrabold text-amber-950">{overview.estimatedCompletionTime}</p>
              </div>
            )}
            {overview.audience && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Audience</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{overview.audience}</p>
              </div>
            )}
          </div>

          {/* ═══════════ DYNAMIC AI-GENERATED SECTIONS ═══════════ */}
          {dynamicSections.length > 0 ? (
            // Render AI dynamic sections
            dynamicSections.map((section) => (
              <div key={section.id} className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="text-indigo-500">{getIcon(section.icon)}</span>
                  <span>{section.title}</span>
                </h4>
                <div className={`space-y-2 ${section.items.length > 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-2 space-y-0" : ""}`}>
                  {section.items.map((item, idx) => {
                    const isResource = section.type === "resources";
                    const initials = item.title
                      .replace(/^Dr\.\s*|^Prof\.\s*|^Mr\.\s*|^Ms\.\s*/i, "")
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w: string) => w[0]?.toUpperCase())
                      .join("") || "RP";

                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed"
                      >
                        {isResource ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            {initials}
                          </div>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                          <span className="text-slate-600 block mt-0.5">{item.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // Fallback: render standard overview sections
            <>
              {/* Instructions List */}
              {overview.instructions && overview.instructions.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>Instructions & Steps</span>
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
                    <span>Requirements</span>
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

              {/* Tips */}
              {overview.tips && overview.tips.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tips</span>
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
            </>
          )}

          {/* Warnings (always show if present) */}
          {overview.warnings && overview.warnings.length > 0 && (
            <div className="space-y-2">
              {overview.warnings.map((warn, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50/60 border border-red-200/70 text-xs text-red-900 leading-relaxed"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Official Google Form Sync</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Got It, Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 640px) {
          @keyframes slideUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
};
