import React, { useState } from "react";
import { RegistrationFormData, Track, getMemberCountFromSize } from "../types";
import { Users, ChevronUp, X, Github, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TeamOverviewDrawerProps {
  data: RegistrationFormData;
}

// Category badge color mapping for selected theme
const THEME_BADGE_STYLES: Record<Track, { bg: string; text: string; border: string }> = {
  "AI/ML": {
    bg: "bg-cyan-50 dark:bg-cyan-950/70",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/80",
  },
  Web3: {
    bg: "bg-purple-50 dark:bg-purple-950/70",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/80",
  },
  "Smart Cities": {
    bg: "bg-emerald-50 dark:bg-emerald-950/70",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/80",
  },
  HealthTech: {
    bg: "bg-rose-50 dark:bg-rose-950/70",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/80",
  },
  "Open Innovation": {
    bg: "bg-amber-50 dark:bg-amber-950/70",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/80",
  },
};

export const TeamOverviewDrawer: React.FC<TeamOverviewDrawerProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const teamDisplayName = data.teamName.trim() || "Untitled Team";
  const selectedTheme = data.track || "AI/ML";
  const themeStyle =
    THEME_BADGE_STYLES[selectedTheme] || THEME_BADGE_STYLES["AI/ML"];

  const memberLimit = getMemberCountFromSize(data.teamSize);
  const teammateCount = Math.max(0, memberLimit - 1);
  const activeTeammates = data.members.slice(0, teammateCount);

  return (
    <>
      {/* Mobile Floating Pill Trigger */}
      <div className="lg:hidden fixed bottom-5 left-4 right-4 z-40 max-w-md mx-auto">
        <button
          type="button"
          id="mobile-team-overview-pill"
          onClick={() => setIsOpen(true)}
          className="w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-full px-4 py-3 flex items-center justify-between text-xs text-slate-800 dark:text-white active:scale-[0.98] transition-transform duration-150"
          aria-label="Open Team Overview"
        >
          {/* Left: Squad Icon + Name */}
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold truncate max-w-[120px] sm:max-w-[160px]">
              {teamDisplayName}
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span
              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border shrink-0 ${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}`}
            >
              {selectedTheme}
            </span>
          </div>

          {/* Right: Team Overview Trigger */}
          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-cyan-600 dark:text-cyan-400 text-[11px]">
              Team Overview
            </span>
            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <ChevronUp className="w-3 h-3" />
            </div>
          </div>
        </button>
      </div>

      {/* Desktop Floating Trigger Button */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-40">
        <button
          type="button"
          id="desktop-team-overview-trigger-btn"
          onClick={() => setIsOpen(true)}
          className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 shadow-xl rounded-full px-4 py-2.5 flex items-center gap-2.5 text-xs text-slate-800 dark:text-white active:scale-[0.98] transition-all duration-150"
          aria-label="Open Team Overview"
        >
          <div className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Users className="w-3 h-3" />
          </div>
          <span className="font-bold max-w-[130px] truncate">{teamDisplayName}</span>
          <span
            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border shrink-0 ${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}`}
          >
            {selectedTheme}
          </span>
          <span className="text-slate-300 dark:text-slate-700">&bull;</span>
          <span className="font-semibold text-cyan-600 dark:text-cyan-400 text-[11px]">
            Team Overview
          </span>
        </button>
      </div>

      {/* iOS-Style Bottom Sheet / Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg mx-auto max-h-[85dvh] bg-white dark:bg-[#0F172A] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Drawer Drag Bar & Header */}
              <div className="pt-3 pb-3 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Team Overview
                  </h3>
                </div>

                {/* Drag pill handle */}
                <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />

                <button
                  type="button"
                  id="close-team-overview-drawer-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close Team Overview drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
                {/* 1. Team Name & Selected Theme */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Team Name
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                        {teamDisplayName}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Selected Theme
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg font-bold text-xs border ${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}`}
                      >
                        {selectedTheme}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Squad Configuration</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {data.teamSize} ({memberLimit} Members total)
                    </span>
                  </div>
                </div>

                {/* 2. List of Members: Leader + Teammates */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Squad Members
                  </span>

                  {/* Leader Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {data.leader.name.trim() || "Team Leader (Pending)"}
                          </span>
                        </div>
                        {data.leader.github ? (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Github className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              @{data.leader.github.replace(/^@/, "").trim()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                            No GitHub specified
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[11px] font-bold rounded-lg border border-cyan-200 dark:border-cyan-800/60 shrink-0">
                      Team Lead
                    </span>
                  </div>

                  {/* Teammates List */}
                  {activeTeammates.map((member, idx) => {
                    const memberName =
                      member.name.trim() || `Member ${idx + 2} (Pending)`;
                    const githubHandle = member.github?.replace(/^@/, "").trim();

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                            M{idx + 2}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">
                              {memberName}
                            </span>
                            {githubHandle ? (
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                <Github className="w-3 h-3 shrink-0" />
                                <span className="truncate">@{githubHandle}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                                No GitHub specified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Role Chips */}
                        <div className="flex flex-wrap gap-1 shrink-0 justify-end max-w-[120px]">
                          {member.roles && member.roles.length > 0 ? (
                            member.roles.map((role, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-md border border-slate-300/60 dark:border-slate-700"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 text-[10px] font-medium rounded-md">
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
