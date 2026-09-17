import React, { useState } from "react";
import { RegistrationFormData, LeaderDetails } from "../types";
import { UserCheck, Mail, Phone, Building2, GraduationCap, Github, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import {
  validateStep,
  focusAndHighlightField,
  normalizeEmail,
  normalizePhone,
  normalizeGithub,
} from "../lib/stepValidation";

interface LeaderDetailsFormProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const POPULAR_COLLEGES = [
  "VNIT",
  "IIIT",
  "PCE",
  "RCOEM",
  "GHRCE",
  "YCCE",
];

export const LeaderDetailsForm: React.FC<LeaderDetailsFormProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  const leader = data.leader;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateLeader = (field: keyof LeaderDetails, value: string) => {
    let normalizedValue = value;
    if (field === "email") {
      normalizedValue = normalizeEmail(value);
    } else if (field === "phone") {
      normalizedValue = normalizePhone(value);
    } else if (field === "github") {
      normalizedValue = normalizeGithub(value);
    }

    const oldLeaderCollege = leader.college;
    const updatedLeader = {
      ...leader,
      [field]: normalizedValue,
    };

    // If updating college, automatically propagate to members if their college is empty or matches old leader college
    let updatedMembers = data.members;
    if (field === "college") {
      updatedMembers = data.members.map((member) => {
        if (!member.college || member.college.trim() === "" || member.college === oldLeaderCollege) {
          return { ...member, college: normalizedValue };
        }
        return member;
      });
    }

    setErrorMessage(null);
    onChange({
      leader: updatedLeader,
      members: updatedMembers,
    });
  };

  const handleProceed = () => {
    const validation = validateStep(2, data);
    if (!validation.isValid) {
      setErrorMessage(validation.message || "Please complete all required leader details.");
      if (validation.firstErrorFieldId) {
        focusAndHighlightField(validation.firstErrorFieldId);
      }
      return;
    }
    setErrorMessage(null);
    onNext();
  };

  return (
    <div id="leader-details-card" className="w-full bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs transition-colors">
      {/* Header */}
      <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2.5 border border-cyan-200 dark:border-cyan-800/70">
          <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
          Primary Point of Contact
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Step 2: Team Leader Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Leader information is recorded for team coordination, hackathon schedules, and competition passes.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {/* Leader Email */}
        <div className="p-4 bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-2xl">
          <label htmlFor="leaderEmail" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            Leader Official Email <span className="text-rose-500">*</span>
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
              (Primary communication channel)
            </span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="leaderEmail"
              placeholder="e.g. leader@example.com"
              value={leader.email}
              onChange={(e) => updateLeader("email", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* 2-Column Grid: Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leaderName" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="leaderName"
                placeholder="e.g. Alex Chen"
                value={leader.name}
                onChange={(e) => updateLeader("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="leaderPhone" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
              <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">(10 digits)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                id="leaderPhone"
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={leader.phone}
                onChange={(e) => updateLeader("phone", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* College & Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="leaderCollege" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              College / Institute / Organization <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-cyan-800 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/70 font-medium">
              Autofills for teammates
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="leaderCollege"
              placeholder="e.g. VNIT, IIIT, PCE, RCOEM, etc."
              value={leader.college}
              onChange={(e) => updateLeader("college", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
          {/* Quick institute suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Popular institutes:</span>
            {POPULAR_COLLEGES.map((college) => (
              <button
                type="button"
                key={college}
                onClick={() => updateLeader("college", college)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {college}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Year/Branch & GitHub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="leaderYearBranch" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Year / Branch / Specialization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <GraduationCap className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="leaderYearBranch"
                placeholder="e.g. CSE - 3rd Year"
                value={leader.yearBranch}
                onChange={(e) => updateLeader("yearBranch", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="leaderGithub" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              GitHub Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="leaderGithub"
                placeholder="username (without @ or URL)"
                value={leader.github}
                onChange={(e) => updateLeader("github", e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="back-to-step-1-btn"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Team Basics
          </button>

          <button
            type="button"
            id="proceed-to-step-3-btn"
            onClick={handleProceed}
            className="px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white shadow-md shadow-cyan-500/20"
          >
            <span>Members</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
