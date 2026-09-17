import React, { useState, useRef, useEffect } from "react";
import { RegistrationFormData, TRACK_OPTIONS, THEME_OPTIONS, TEAM_SIZE_OPTIONS, TeamSize, THEME_METADATA_MAP } from "../types";
import { Sparkles, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { focusAndHighlightField } from "../lib/stepValidation";

interface TeamBasicsFormProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
}

export const TeamBasicsForm: React.FC<TeamBasicsFormProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showThemePopover, setShowThemePopover] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const themePopoverRef = useRef<HTMLDivElement>(null);
  const themeInfoButtonRef = useRef<HTMLButtonElement>(null);

  // Dismiss info popovers on outside click/tap
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        infoButtonRef.current &&
        !infoButtonRef.current.contains(target)
      ) {
        setShowInfoPopover(false);
      }

      if (
        themePopoverRef.current &&
        !themePopoverRef.current.contains(target) &&
        themeInfoButtonRef.current &&
        !themeInfoButtonRef.current.contains(target)
      ) {
        setShowThemePopover(false);
      }
    };

    if (showInfoPopover || showThemePopover) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [showInfoPopover, showThemePopover]);

  const handleSizeSelect = (size: TeamSize) => {
    const count = parseInt(size.match(/\d+/)?.[0] || "2", 10);
    const neededMembers = count - 1;

    // Adjust members array size dynamically and inherit leader's college if available
    let updatedMembers = [...data.members];
    if (updatedMembers.length < neededMembers) {
      const toAdd = neededMembers - updatedMembers.length;
      for (let i = 0; i < toAdd; i++) {
        updatedMembers.push({
          name: "",
          email: "",
          phone: "",
          college: data.leader.college || "",
          roles: ["Frontend"],
        });
      }
    } else if (updatedMembers.length > neededMembers) {
      updatedMembers = updatedMembers.slice(0, neededMembers);
    }

    onChange({
      teamSize: size,
      members: updatedMembers,
    });
  };

  const handleProceed = () => {
    if (!data.teamName.trim()) {
      focusAndHighlightField("teamName");
      return;
    }
    onNext();
  };

  return (
    <div
      id="team-basics-card"
      className="w-full bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs transition-colors"
    >
      {/* Header section with HackX 2026 badge */}
      <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2.5 border border-cyan-200 dark:border-cyan-800/70">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          HackX 2026
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Step 1: Team Basics &amp; Theme
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your squad identity, hackathon theme, and total team size.
        </p>
      </div>

      {/* Main Form Fields */}
      <div className="mt-6 space-y-6">
        {/* Team Name Input */}
        <div>
          <label htmlFor="teamName" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Team Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="teamName"
              placeholder="e.g. CodeWarriors, ByteForge, NexusAI"
              value={data.teamName}
              onChange={(e) => onChange({ teamName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Hackathon Theme Selection with Inline Info Popover */}
        <div id="hackathon-theme-section">
          <div className="flex items-center gap-2 mb-2 relative">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Hackathon Theme <span className="text-rose-500">*</span>
            </label>

            {/* Subtle Lucide Info Icon & iOS-Style Frosted Popover */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                ref={themeInfoButtonRef}
                id="theme-info-popover-trigger"
                onClick={() => setShowThemePopover((prev) => !prev)}
                onMouseEnter={() => setShowThemePopover(true)}
                className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
                aria-label="Hackathon theme info"
              >
                <Info className="w-4 h-4" />
              </button>

              {showThemePopover && (
                <div
                  ref={themePopoverRef}
                  id="theme-info-popover"
                  className="absolute left-6 -top-2 z-30 w-72 sm:w-80 rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl p-3.5 text-xs text-slate-600 dark:text-slate-300 transition-all pointer-events-auto ring-1 ring-black/5"
                >
                  <p className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    Flexible Theme Choice
                  </p>
                  <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Irrespective of selected theme, you can choose any problem statement once statements are officially revealed.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = data.track === theme;
              const meta = THEME_METADATA_MAP[theme];
              return (
                <button
                  type="button"
                  key={theme}
                  id={`theme-select-${theme.toLowerCase().replace(/\s+|\//g, "-")}`}
                  onClick={() => onChange({ track: theme })}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-[0.98] ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-sm ring-2 ring-cyan-500/20 font-bold"
                      : "bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-cyan-500/40"
                  }`}
                >
                  <span>{theme}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimalist Team Size Selector with Info Popover */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3 relative">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Total Team Size <span className="text-rose-500">*</span>
            </label>

            {/* Info Icon Button & Floating Popover Bubble */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                ref={infoButtonRef}
                onClick={() => setShowInfoPopover((prev) => !prev)}
                onMouseEnter={() => setShowInfoPopover(true)}
                className="p-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
                aria-label="Team size info"
              >
                <Info className="w-4 h-4" />
              </button>

              {showInfoPopover && (
                <div
                  ref={popoverRef}
                  id="team-size-info-popover"
                  className="absolute left-6 -top-2 z-30 w-64 rounded-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg p-2.5 text-xs text-slate-600 dark:text-slate-300 transition-all pointer-events-auto"
                >
                  <p className="font-medium text-slate-900 dark:text-white mb-0.5">
                    Includes team leader (2–5 members total)
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your squad consists of 1 Leader plus the selected number of teammates.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Segmented Cards: Prominent Numeral & High-Density Minimalist Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEAM_SIZE_OPTIONS.map((size) => {
              const isSelected = data.teamSize === size;
              const count = parseInt(size.match(/\d+/)?.[0] || "2", 10);
              return (
                <button
                  type="button"
                  key={size}
                  id={`team-size-option-${count}`}
                  onClick={() => handleSizeSelect(size)}
                  className={`p-3.5 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center active:scale-[0.98] ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 shadow-xs ring-1 ring-cyan-500/30"
                      : "border-slate-200 dark:border-slate-800/90 bg-slate-50/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isSelected ? "text-cyan-600 dark:text-cyan-400" : "text-slate-800 dark:text-slate-200"
                  }`}>
                    {count}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    Total Members
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="proceed-to-step-2-btn"
            onClick={handleProceed}
            className="px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white active:scale-[0.98] shadow-md shadow-cyan-500/20"
          >
            <span>Leader Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
