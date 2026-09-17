import React, { useState } from "react";
import { CanonicalExperienceSchema, WebsiteContent, DynamicInfoSection, HeroMetric } from "../../types/canonicalExperience";
import { FormConfig } from "../../types";
import { FormRunner } from "./FormRunner";
import { OverviewDrawer } from "./OverviewDrawer";
import { extractRichDescriptionData } from "../../lib/descriptionExtractor";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Award,
  Star,
  Lightbulb,
  HelpCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  Zap,
  Target,
  Info,
  Lock,
  List,
  BarChart3,
  MessageSquare,
} from "lucide-react";

interface FormWebsiteProps {
  config: FormConfig;
  experience: CanonicalExperienceSchema;
  hostedSlug?: string;
  isSandbox?: boolean;
  onSimulateSubmit?: (responses: Record<string, any>) => void;
  onExitRunner?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "book-open": <BookOpen className="w-4 h-4" />,
  "shield-check": <ShieldCheck className="w-4 h-4" />,
  "check-circle": <CheckCircle2 className="w-4 h-4" />,
  "alert-circle": <AlertCircle className="w-4 h-4" />,
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

// Section type to color theme mapping
const SECTION_COLORS: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  overview: { bg: "bg-blue-50/70", border: "border-blue-200/80", icon: "text-blue-600", text: "text-blue-900" },
  instructions: { bg: "bg-indigo-50/70", border: "border-indigo-200/80", icon: "text-indigo-600", text: "text-indigo-900" },
  eligibility: { bg: "bg-violet-50/70", border: "border-violet-200/80", icon: "text-violet-600", text: "text-violet-900" },
  dates: { bg: "bg-amber-50/70", border: "border-amber-200/80", icon: "text-amber-600", text: "text-amber-900" },
  rating_guide: { bg: "bg-yellow-50/70", border: "border-yellow-200/80", icon: "text-yellow-600", text: "text-yellow-900" },
  steps: { bg: "bg-cyan-50/70", border: "border-cyan-200/80", icon: "text-cyan-600", text: "text-cyan-900" },
  tips: { bg: "bg-emerald-50/70", border: "border-emerald-200/80", icon: "text-emerald-600", text: "text-emerald-900" },
  contacts: { bg: "bg-rose-50/70", border: "border-rose-200/80", icon: "text-rose-600", text: "text-rose-900" },
  privacy: { bg: "bg-slate-50/80", border: "border-slate-200/80", icon: "text-slate-600", text: "text-slate-900" },
  guidelines: { bg: "bg-teal-50/70", border: "border-teal-200/80", icon: "text-teal-600", text: "text-teal-900" },
  scoring: { bg: "bg-orange-50/70", border: "border-orange-200/80", icon: "text-orange-600", text: "text-orange-900" },
  faq: { bg: "bg-purple-50/70", border: "border-purple-200/80", icon: "text-purple-600", text: "text-purple-900" },
  resources: { bg: "bg-sky-50/70", border: "border-sky-200/80", icon: "text-sky-600", text: "text-sky-900" },
  custom: { bg: "bg-slate-50/70", border: "border-slate-200/80", icon: "text-slate-600", text: "text-slate-900" },
};

export const FormWebsite: React.FC<FormWebsiteProps> = ({
  config,
  experience,
  hostedSlug,
  isSandbox = false,
  onSimulateSubmit,
  onExitRunner,
}) => {
  // Page navigation state: "landing" = mini-website, "form" = dedicated form next page
  const [viewMode, setViewMode] = useState<"landing" | "form">("landing");
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const rawDesc = config?.meta?.description || experience.form.description || "";
  const richDesc = extractRichDescriptionData(rawDesc);

  const wc: WebsiteContent = experience.websiteContent || {
    heroTitle: experience.form.title,
    heroSubtitle: richDesc.cleanSubtitle || experience.form.description || "Complete this form",
    ctaLabel: "Share Feedback",
  };

  const meta = config?.meta || {
    title: experience.form.title,
    description: experience.form.description,
    targetActionUrl: experience.source?.targetActionUrl || "",
  };

  const category = experience.form.category;
  const personality = experience.theme?.personality || "professional";

  // Personality-based gradient accents
  const gradientMap: Record<string, string> = {
    academic: "from-indigo-600 via-blue-600 to-violet-600",
    energetic: "from-violet-600 via-fuchsia-600 to-pink-600",
    technical: "from-cyan-600 via-blue-600 to-indigo-600",
    friendly: "from-blue-600 via-indigo-600 to-violet-600",
    minimal: "from-slate-700 via-slate-800 to-zinc-900",
    professional: "from-blue-600 via-indigo-600 to-violet-600",
    creative: "from-pink-600 via-rose-600 to-orange-600",
    formal: "from-slate-800 via-slate-900 to-zinc-900",
    event: "from-cyan-600 via-blue-600 to-indigo-600",
    neutral: "from-slate-600 via-slate-700 to-slate-800",
  };
  const gradient = gradientMap[personality] || gradientMap.professional;

  // Clean, comprehensive subtitle that prioritizes the full extracted text from the form description
  const cleanSubtitle = (() => {
    if (richDesc.cleanSubtitle && richDesc.cleanSubtitle.length >= 80) {
      return richDesc.cleanSubtitle;
    }
    const rawSubCandidate = wc.heroSubtitle || richDesc.cleanSubtitle || experience.form.description || "";
    return rawSubCandidate
      .replace(/^FORM\s+DESCRIPTION\s*:?/i, "")
      .replace(/^FORM\s+DETAILS\s*:?/i, "")
      .replace(/^DESCRIPTION\s*:?/i, "")
      .trim();
  })();

  // Switch to the dedicated form page
  const navigateToFormPage = () => {
    setViewMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Return to the event landing page
  const navigateToLandingPage = () => {
    setViewMode("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Combine and strictly deduplicate dynamic sections
  const dynamicSections: DynamicInfoSection[] = (() => {
    const rawList = wc.dynamicInfoSections && wc.dynamicInfoSections.length > 0
      ? [...wc.dynamicInfoSections]
      : [...richDesc.dynamicSections];

    // Merge rich extracted sections
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

    // Deduplicate by semantic key
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

  // Hero metric cards
  const metrics: HeroMetric[] = (() => {
    const list = wc.heroMetrics && wc.heroMetrics.length > 0 ? [...wc.heroMetrics] : [...richDesc.heroMetrics];
    if (richDesc.extractedDate && !list.some(m => m.label.toLowerCase().includes("date"))) {
      list.unshift({ label: "Event Date", value: richDesc.extractedDate, detail: "Installation session" });
    }
    return list;
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 2: DEDICATED FORM PAGE (NEXT PAGE)
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewMode === "form") {
    return (
      <div className="min-h-[100dvh] bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 animate-in fade-in duration-200">
        {/* Sticky Form Navigation Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            {/* Back to Event Overview */}
            <button
              type="button"
              onClick={navigateToLandingPage}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all active:scale-[0.97]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>

            {/* Form Title */}
            <div className="flex items-center gap-2 min-w-0 max-w-[180px] sm:max-w-md">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {meta.title || "Feedback Form"}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase shrink-0">
                {category.replace(/_/g, " ")}
              </span>
            </div>

            {/* View Guidelines Drawer Button */}
            <button
              type="button"
              onClick={() => setIsOverviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">{experience.overview?.rulesLabel || "Guidelines"}</span>
            </button>
          </div>
        </header>

        {/* Dedicated Form Body */}
        <main className="flex-1 py-6 sm:py-10 px-2.5 sm:px-4 md:px-6 max-w-4xl w-full mx-auto">
          <FormRunner
            config={config}
            hostedSlug={hostedSlug}
            isSandbox={isSandbox}
            onSimulateSubmit={onSimulateSubmit}
            onExitRunner={navigateToLandingPage}
          />
        </main>

        <OverviewDrawer
          isOpen={isOverviewOpen}
          onClose={() => setIsOverviewOpen(false)}
          config={config}
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 1: COMPLETE EVENT MINI-WEBSITE (LANDING PAGE)
  // ═══════════════════════════════════════════════════════════════════════════
  const organizationDisplay = richDesc.extractedOrganization || wc.footerOrganization || "IETE Student Forum • Department of ETC";

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 animate-in fade-in duration-150">
      {/* ═══════════════════════ STICKY NAVBAR ═══════════════════════ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo monogram */}
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm shrink-0`}>
              {(meta.title || "NF")
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w: string) => w[0]?.toUpperCase())
                .join("") || "NF"}
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                {meta.title || "NextForm"}
              </span>
              <span className="text-[10px] text-slate-500 truncate block font-medium">
                {organizationDisplay}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsOverviewOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{experience.overview?.rulesLabel || "Overview"}</span>
            </button>
            <button
              type="button"
              onClick={navigateToFormPage}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r ${gradient} hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.97]`}
            >
              <span>{wc.ctaLabel || "Share Feedback"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════ HERO BANNER SECTION ═══════════════════════ */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 sm:pb-16 border-b border-slate-200/80 bg-radial-[at_top_right] from-indigo-500/10 via-transparent to-transparent">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.08]"
            style={{ background: "radial-gradient(circle at top right, rgba(99,102,241,0.5) 0%, transparent 60%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.05]"
            style={{ background: "radial-gradient(circle at bottom left, rgba(6,182,212,0.5) 0%, transparent 60%)" }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl space-y-5 sm:space-y-6">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/25 text-indigo-800 text-xs font-bold"
                style={{ background: "rgba(99,102,241,0.08)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{wc.heroBadge || (category === "feedback" ? "Official Event Feedback" : "Evaluation Portal")}</span>
              </div>

              {richDesc.extractedDate && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Date: {richDesc.extractedDate}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Submissions Open</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-[1.15]">
              {wc.heroTitle}
            </h1>

            {/* Subtitle / Purpose (Clean, Complete Paragraph) */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {cleanSubtitle}
            </p>

            {/* Quick Metrics Bar (HackX style) */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                {metrics.slice(0, 4).map((metric: HeroMetric, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-2xs space-y-1 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {metric.label}
                    </span>
                    <span className="text-base sm:text-lg font-black text-slate-900 block truncate">
                      {metric.value}
                    </span>
                    {metric.detail && (
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        {metric.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons: Navigate to Form Page or Open Overview */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={navigateToFormPage}
                className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0`}
              >
                <span>{wc.ctaLabel || "Share Feedback Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOverviewOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-all shadow-xs"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>{experience.overview?.rulesLabel || "View Event Guidelines"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ DYNAMIC INFO SECTIONS ═══════════════════════ */}
      {dynamicSections.length > 0 && (
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8 sm:space-y-10">
          {dynamicSections.map((section: DynamicInfoSection) => {
            const colors = SECTION_COLORS[section.type] || SECTION_COLORS.custom;
            const isResource = section.type === "resources";
            const isRatingGuide = section.type === "rating_guide";

            return (
              <section
                key={section.id}
                className={`rounded-2xl sm:rounded-3xl border ${colors.border} ${colors.bg} backdrop-blur-md p-5 sm:p-7 space-y-4 shadow-xs`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.icon} shadow-xs`}>
                      {getIcon(section.icon)}
                    </div>
                    <div>
                      <h2 className={`text-base sm:text-lg font-bold ${colors.text}`}>
                        {section.title}
                      </h2>
                      {isResource && (
                        <p className="text-xs text-slate-500">
                          Key faculty leads, organizers, and dignitaries for this installation
                        </p>
                      )}
                      {isRatingGuide && (
                        <p className="text-xs text-slate-500">
                          Use the criteria below when evaluating each statement in the form
                        </p>
                      )}
                    </div>
                  </div>

                  {section.items && section.items.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600">
                      {section.items.length} {isResource ? "Dignitaries" : isRatingGuide ? "Levels" : "Points"}
                    </span>
                  )}
                </div>

                {/* Section Items Grid */}
                {section.items && section.items.length > 0 && (
                  <div className={`grid gap-3 ${isRatingGuide ? "sm:grid-cols-3" : section.items.length > 2 ? "sm:grid-cols-2" : ""}`}>
                    {section.items.map((item, itemIdx) => {
                      const initials = item.title
                        .replace(/^Dr\.\s*|^Prof\.\s*|^Mr\.\s*|^Ms\.\s*/i, "")
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w: string) => w[0]?.toUpperCase())
                        .join("") || "RP";

                      return (
                        <div
                          key={itemIdx}
                          className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs flex items-start gap-3 hover:border-indigo-200 hover:shadow-xs transition-all"
                        >
                          {isResource ? (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                              {initials}
                            </div>
                          ) : isRatingGuide ? (
                            <div className="w-9 h-9 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                              {item.title.slice(0, 2)}
                            </div>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/60">
                              {itemIdx + 1}
                            </span>
                          )}

                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="text-[11px] sm:text-xs text-slate-600 leading-relaxed block mt-1 font-medium">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </main>
      )}

      {/* ═══════════════════════ BOTTOM CTA BANNER (HACKX STYLE) ═══════════════════════ */}
      <section className="max-w-5xl w-full mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-bold inline-block">
              {category === "feedback" ? "Your Voice Matters" : "Ready to Start"}
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              {category === "feedback" ? "Ready to Share Your Feedback?" : "Complete Your Submission"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              It takes approximately {experience.overview?.estimatedCompletionTime || "3–5 minutes"}. Your honest ratings and suggestions directly shape future student forum events and workshops.
            </p>
          </div>

          <button
            type="button"
            onClick={navigateToFormPage}
            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm shadow-lg transition-all active:scale-[0.97] shrink-0`}
          >
            <span>{wc.ctaLabel || "Start Form Now"}</span>
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold text-[10px] shadow-sm`}>
                {(meta.title || "NF")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w: string) => w[0]?.toUpperCase())
                  .join("") || "NF"}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">{meta.title || "NextForm"}</span>
                <span className="text-[11px] text-slate-500 block">{organizationDisplay}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{wc.footerTagline || `Powered by NextForm AI — ${meta.title}`}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Overview Drawer (opens from navbar or buttons) */}
      <OverviewDrawer
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        config={config}
      />
    </div>
  );
};
